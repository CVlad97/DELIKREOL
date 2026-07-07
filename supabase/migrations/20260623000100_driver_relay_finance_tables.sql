-- 20260623000100_driver_relay_finance_tables.sql
-- Idempotent + RLS admin via public.is_delikreol_admin()

-- 1. Tables driver_applications
CREATE TABLE IF NOT EXISTS public.driver_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  email text,
  commune text NOT NULL,
  transport_mode text,
  zones_acceptees text[] DEFAULT '{}',
  disponibilite text,
  horaires text,
  experience_livraison text,
  status text NOT NULL DEFAULT 'candidat',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS driver_applications_public_insert ON public.driver_applications;
CREATE POLICY driver_applications_public_insert
  ON public.driver_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(coalesce(name, ''))) > 0 AND
    length(trim(coalesce(phone, ''))) > 0 AND
    length(trim(coalesce(commune, ''))) > 0
  );

DROP POLICY IF EXISTS driver_applications_admin_select ON public.driver_applications;
CREATE POLICY driver_applications_admin_select
  ON public.driver_applications FOR SELECT
  TO authenticated
  USING (public.is_delikreol_admin());

DROP POLICY IF EXISTS driver_applications_admin_update ON public.driver_applications;
CREATE POLICY driver_applications_admin_update
  ON public.driver_applications FOR UPDATE
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 2. relay_point_applications
CREATE TABLE IF NOT EXISTS public.relay_point_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  manager_name text,
  phone text NOT NULL,
  whatsapp text,
  email text,
  commune text NOT NULL,
  address text,
  opening_hours text,
  capacity text,
  status text NOT NULL DEFAULT 'candidat',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.relay_point_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS relay_point_public_insert ON public.relay_point_applications;
CREATE POLICY relay_point_public_insert
  ON public.relay_point_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(coalesce(business_name, ''))) > 0 AND
    length(trim(coalesce(phone, ''))) > 0 AND
    length(trim(coalesce(commune, ''))) > 0
  );

DROP POLICY IF EXISTS relay_point_admin_select ON public.relay_point_applications;
CREATE POLICY relay_point_admin_select
  ON public.relay_point_applications FOR SELECT
  TO authenticated
  USING (public.is_delikreol_admin());

DROP POLICY IF EXISTS relay_point_admin_update ON public.relay_point_applications;
CREATE POLICY relay_point_admin_update
  ON public.relay_point_applications FOR UPDATE
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 3. invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE,
  order_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  total_ht numeric DEFAULT 0,
  total_tva numeric DEFAULT 0,
  total_ttc numeric DEFAULT 0,
  currency text DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'draft',
  qonto_invoice_id text,
  pdf_url text,
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoices_admin_all ON public.invoices;
CREATE POLICY invoices_admin_all
  ON public.invoices FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 4. invoice_lines
CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  label text NOT NULL,
  quantity numeric DEFAULT 1,
  unit_price_ht numeric DEFAULT 0,
  tva_rate numeric DEFAULT 0,
  total_ht numeric DEFAULT 0,
  total_ttc numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoice_lines_admin_all ON public.invoice_lines;
CREATE POLICY invoice_lines_admin_all
  ON public.invoice_lines FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 5. payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid,
  invoice_id uuid,
  provider text,
  provider_payment_id text,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_admin_all ON public.payments;
CREATE POLICY payments_admin_all
  ON public.payments FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 6. payouts
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid,
  driver_id uuid,
  order_id uuid,
  amount numeric DEFAULT 0,
  type text,
  status text DEFAULT 'pending',
  qonto_transaction_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payouts_admin_all ON public.payouts;
CREATE POLICY payouts_admin_all
  ON public.payouts FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 7. commissions
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid,
  base_amount numeric DEFAULT 0,
  commission_rate numeric DEFAULT 0.15,
  commission_amount numeric DEFAULT 0,
  partner_amount numeric DEFAULT 0,
  driver_amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS commissions_admin_all ON public.commissions;
CREATE POLICY commissions_admin_all
  ON public.commissions FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 8. qonto_sync_logs
CREATE TABLE IF NOT EXISTS public.qonto_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  action text,
  status text,
  message text,
  qonto_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.qonto_sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS qonto_sync_logs_admin_all ON public.qonto_sync_logs;
CREATE POLICY qonto_sync_logs_admin_all
  ON public.qonto_sync_logs FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 9. Vérification existence colonnes (information_schema)
-- À exécuter après migration pour vérifier :
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name IN ('driver_applications','relay_point_applications','invoices','invoice_lines','payments','payouts','commissions','qonto_sync_logs')
-- ORDER BY table_name, ordinal_position;