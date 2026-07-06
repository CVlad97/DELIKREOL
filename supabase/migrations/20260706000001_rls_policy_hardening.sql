-- =============================================================================
-- DELIKREOL — RLS policy hardening
-- Date: 2026-07-06
-- Objectif: remplacer les policies historiques basees sur auth.role()
-- par des policies explicites TO role, avec WITH CHECK sur les updates.
-- =============================================================================

-- Storage: caterer-photos
DROP POLICY IF EXISTS "Caterer photos are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload caterer photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update caterer photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete caterer photos" ON storage.objects;

CREATE POLICY "Caterer photos are publicly viewable"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'caterer-photos');

CREATE POLICY "Authenticated users can upload caterer photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'caterer-photos');

CREATE POLICY "Authenticated users can update caterer photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'caterer-photos')
  WITH CHECK (bucket_id = 'caterer-photos');

CREATE POLICY "Authenticated users can delete caterer photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'caterer-photos');

-- Payments / payouts: admin via helper, service role explicit only where needed.
DROP POLICY IF EXISTS "payouts_admin_all" ON public.payouts;
DROP POLICY IF EXISTS "payments_admin_all" ON public.payments;
DROP POLICY IF EXISTS "stripe_webhook_events_service" ON public.stripe_webhook_events;
DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_update_payment" ON public.orders;
DROP POLICY IF EXISTS "partners_select" ON public.partners;
DROP POLICY IF EXISTS "partners_update_own" ON public.partners;
DROP POLICY IF EXISTS "drivers_select" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_own" ON public.drivers;

CREATE POLICY "payouts_admin_all"
  ON public.payouts
  FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

CREATE POLICY "payments_admin_all"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

CREATE POLICY "stripe_webhook_events_service"
  ON public.stripe_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "orders_select"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    public.is_delikreol_admin()
    OR client_phone = (SELECT phone FROM public.profiles WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY "orders_update_payment"
  ON public.orders
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "partners_select"
  ON public.partners
  FOR SELECT
  TO authenticated
  USING (
    public.is_delikreol_admin()
    OR email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY "partners_update_own"
  ON public.partners
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid())))
  WITH CHECK (email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid())));

CREATE POLICY "drivers_select"
  ON public.drivers
  FOR SELECT
  TO authenticated
  USING (
    public.is_delikreol_admin()
    OR email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY "drivers_update_own"
  ON public.drivers
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid())))
  WITH CHECK (email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid())));

