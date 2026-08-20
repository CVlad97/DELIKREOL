-- DELIKREOL — Payment external_id collision P0 fix
-- Migration: 20260715000003_payment_external_id_collision.sql
-- Problème : INSERT concurrent sur payment_external_id → 500
-- Solution : Retourner 409 Conflict proprement, avec message clair

-- 1. Ajouter contrainte UNIQUE sur payment_external_id (si pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_external_id_unique'
    AND conrelid = 'public.payments'::regclass
  ) THEN
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_external_id_unique
    UNIQUE (payment_external_id);
  END IF;
END $$;

-- 2. Créer index pour lookup rapide
CREATE INDEX IF NOT EXISTS idx_payments_external_id
  ON public.payments(payment_external_id)
  WHERE payment_external_id IS NOT NULL;

-- 3. Fonction helper pour le edge function checkout-order
--    retourne 409 au lieu de 500 en cas de collision
CREATE OR REPLACE FUNCTION public.check_payment_external_id(
  target_external_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.payments
    WHERE payment_external_id = target_external_id
  ) THEN
    RETURN false; -- collision détectée
  END IF;
  RETURN true; -- ID libre
END;
$$;

REVOKE ALL ON FUNCTION public.check_payment_external_id(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_payment_external_id(text) TO service_role;

-- 4. Mise à jour de la RPC create_checkout_order_atomic
--    pour gérer la collision payment_external_id
CREATE OR REPLACE FUNCTION public.create_checkout_order_atomic(
  p_idempotency_key text,
  p_order_data jsonb,
  p_items_data jsonb,
  p_payment_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_tracking_token text;
  v_external_id text;
  v_item jsonb;
BEGIN
  -- Vérifier idempotence
  SELECT id, order_number, tracking_token
  INTO v_order_id, v_order_number, v_tracking_token
  FROM public.orders
  WHERE idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'existing', true,
      'order', jsonb_build_object(
        'id', v_order_id,
        'order_number', v_order_number,
        'tracking_token', v_tracking_token
      )
    );
  END IF;

  -- Générer tracking token
  v_tracking_token := encode(gen_random_bytes(8), 'hex');

  -- Insérer la commande
  INSERT INTO public.orders (
    idempotency_key,
    order_number,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    customer_commune,
    order_mode,
    subtotal,
    delivery_fee,
    total_amount,
    delivery_address,
    notes,
    status,
    delivery_status,
    payment_status,
    payment_provider,
    payment_method,
    tracking_token,
    external_order_reference
  )
  SELECT
    p_idempotency_key,
    (p_order_data->>'order_number')::text,
    (p_order_data->>'customer_id')::uuid,
    (p_order_data->>'customer_name')::text,
    (p_order_data->>'customer_phone')::text,
    (p_order_data->>'customer_email')::text,
    (p_order_data->>'customer_commune')::text,
    (p_order_data->>'order_mode')::text,
    (p_order_data->>'subtotal')::numeric,
    (p_order_data->>'delivery_fee')::numeric,
    (p_order_data->>'total_amount')::numeric,
    (p_order_data->>'delivery_address')::text,
    (p_order_data->>'notes')::text,
    'pending',
    'pending',
    CASE
      WHEN (p_order_data->>'payment_provider')::text = 'stripe_test'
      THEN 'awaiting_payment'
      ELSE 'pending'
    END,
    (p_order_data->>'payment_provider')::text,
    CASE
      WHEN (p_order_data->>'payment_provider')::text = 'stripe_test'
      THEN 'card'
      ELSE 'manual'
    END,
    v_tracking_token,
    (p_order_data->>'external_order_reference')::text
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Insérer les items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items_data)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal,
      vendor_id,
      vendor_name
    )
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'product_name')::text,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric,
      (v_item->>'subtotal')::numeric,
      (v_item->>'vendor_id')::text,
      (v_item->>'vendor_name')::text
    );
  END LOOP;

  -- Insérer le paiement (si payment_data fourni)
  IF p_payment_data IS NOT NULL AND p_payment_data != 'null'::jsonb THEN
    v_external_id := (p_payment_data->>'payment_external_id')::text;

    -- Vérifier collision payment_external_id AVANT insertion
    IF v_external_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.payments
      WHERE payment_external_id = v_external_id
    ) THEN
      -- Rollback implicite car exception
      RAISE EXCEPTION 'PAYMENT_EXTERNAL_ID_COLLISION'
        USING HINT = 'Ce paiement a déjà été enregistré',
              ERRCODE = '23505'; -- unique_violation
    END IF;

    INSERT INTO public.payments (
      order_id,
      payment_external_id,
      amount,
      currency,
      payment_method,
      payment_provider,
      status,
      payment_date,
      metadata
    )
    VALUES (
      v_order_id,
      v_external_id,
      (p_payment_data->>'amount')::numeric,
      (p_payment_data->>'currency')::text,
      (p_payment_data->>'payment_method')::text,
      (p_payment_data->>'payment_provider')::text,
      (p_payment_data->>'status')::text,
      (p_payment_data->>'payment_date')::timestamptz,
      (p_payment_data->>'metadata')::jsonb
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order', jsonb_build_object(
      'id', v_order_id,
      'order_number', v_order_number,
      'tracking_token', v_tracking_token,
      'status', 'pending'
    )
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Payment_external_id collision → 409
    RAISE EXCEPTION 'PAYMENT_EXTERNAL_ID_COLLISION'
      USING HINT = 'Ce paiement a déjà été enregistré. Aucune nouvelle commande créée.',
            ERRCODE = '23505';
  WHEN OTHERS THEN
    RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb) TO service_role;

-- 5. Mise à jour de l'Edge Function checkout-order pour gérer le 409
COMMENT ON FUNCTION public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb) IS
'Crée une commande de manière atomique avec gestion de collision payment_external_id.
Retourne 23505 (unique_violation) si payment_external_id déjà utilisé.
L''Edge Function doit traiter ce code comme 409 Conflict.';

-- Rollback (à exécuter uniquement si nécessaire)
-- DROP FUNCTION IF EXISTS public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb);
-- DROP FUNCTION IF EXISTS public.check_payment_external_id(text);
-- DROP INDEX IF EXISTS idx_payments_external_id;
-- ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_external_id_unique;