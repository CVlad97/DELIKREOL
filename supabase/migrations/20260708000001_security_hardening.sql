-- DELIKREOL — Security hardening P0 (non-destructive)
-- Ajoute policies manquantes, restreint les over-permissives, ne supprime aucune donnée.

-- ============================================================
-- 1. MEDIA_ASSETS — policy minimale
-- ============================================================
DROP POLICY IF EXISTS "Public read media_assets" ON public.media_assets;
CREATE POLICY "Public read media_assets" ON public.media_assets
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_delikreol_admin());

DROP POLICY IF EXISTS "Admin write media_assets" ON public.media_assets;
CREATE POLICY "Admin write media_assets" ON public.media_assets
  FOR ALL TO authenticated
  USING (is_delikreol_admin())
  WITH CHECK (is_delikreol_admin());

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. PROFILES — policies ownership
-- ============================================================
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (is_delikreol_admin() OR id = auth.uid());

DROP POLICY IF EXISTS "Admin write profiles" ON public.profiles;
CREATE POLICY "Admin write profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (is_delikreol_admin())
  WITH CHECK (is_delikreol_admin());

-- ============================================================
-- 3. ORDERS — SECURITY P0 CRITIQUE
-- ============================================================
-- Suppression des policies over-permissives
DROP POLICY IF EXISTS "orders_insert_anon" ON public.orders;
DROP POLICY IF EXISTS "orders_update_anon" ON public.orders;
DROP POLICY IF EXISTS "orders_select_anon" ON public.orders;
-- NO new policy: orders INSERT must be authenticated or go through edge function with service_role
-- The checkout-order edge function (with service_role) handles order creation
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. ORDER_ITEMS — same treatment as orders
-- ============================================================
DROP POLICY IF EXISTS "order_items_insert_anon" ON public.order_items;
DROP POLICY IF EXISTS "order_items_update_anon" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_anon" ON public.order_items;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. PAYMENTS — already protected by FK to orders
-- ============================================================
DROP POLICY IF EXISTS "payments_select_anon" ON public.payments;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. STORAGE BUCKETS — éviter listing public large
-- ============================================================
-- caterer-photos : déjà durci dans rls_policy_hardening.sql
-- product-photos : ajouter si bucket existe
DO $$
BEGIN
  DROP POLICY IF EXISTS "Product photos public select" ON storage.objects;
  CREATE POLICY "Product photos public select" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'product-photos');

  DROP POLICY IF EXISTS "Product photos authenticated insert" ON storage.objects;
  CREATE POLICY "Product photos authenticated insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-photos' AND is_delikreol_admin());

  DROP POLICY IF EXISTS "Product photos authenticated update" ON storage.objects;
  CREATE POLICY "Product photos authenticated update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-photos' AND is_delikreol_admin())
    WITH CHECK (bucket_id = 'product-photos');

  DROP POLICY IF EXISTS "Product photos authenticated delete" ON storage.objects;
  CREATE POLICY "Product photos authenticated delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'product-photos' AND is_delikreol_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;