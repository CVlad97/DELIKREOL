-- =============================================================================
-- DELIKREOL — Admin function hardening + RLS optimization
-- Date: 2026-07-15
-- =============================================================================

-- 1. Sécuriser la fonction admin
DO $$
BEGIN
  REVOKE ALL ON FUNCTION public.is_delikreol_admin() FROM PUBLIC;
  REVOKE ALL ON FUNCTION public.is_delikreol_admin() FROM anon;
  GRANT EXECUTE ON FUNCTION public.is_delikreol_admin() TO authenticated;
EXCEPTION
  WHEN undefined_function THEN NULL;
END;
$$;

-- 2. Politiques RLS — optimisation auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()) OR public.is_delikreol_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- 3. partner_applications
DROP POLICY IF EXISTS "Applicant can view own application" ON public.partner_applications;
CREATE POLICY "Applicant can view own application" ON public.partner_applications
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_delikreol_admin());

DROP POLICY IF EXISTS "Anyone can insert application" ON public.partner_applications;
CREATE POLICY "Anyone can insert application" ON public.partner_applications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 4. contact_messages
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read contact messages" ON public.contact_messages;
CREATE POLICY "Admin can read contact messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.is_delikreol_admin());

-- 5. reviews
DROP POLICY IF EXISTS "Anyone can read public reviews" ON public.reviews;
CREATE POLICY "Anyone can read public reviews" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR public.is_delikreol_admin());

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- 6. orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (customer_id = (select auth.uid()) OR public.is_delikreol_admin());

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE customer_id = (select auth.uid())) OR public.is_delikreol_admin());

-- 7. client_requests
DROP POLICY IF EXISTS "Users can view own requests" ON public.client_requests;
CREATE POLICY "Users can view own requests" ON public.client_requests
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_delikreol_admin());

DROP POLICY IF EXISTS "Anyone can create request" ON public.client_requests;
CREATE POLICY "Anyone can create request" ON public.client_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 8. vendors
DROP POLICY IF EXISTS "Public can view active vendors" ON public.vendors;
CREATE POLICY "Public can view active vendors" ON public.vendors
  FOR SELECT TO anon, authenticated
  USING (is_public = true AND status = 'verified');

DROP POLICY IF EXISTS "Admin manages all vendors" ON public.vendors;
CREATE POLICY "Admin manages all vendors" ON public.vendors
  FOR ALL TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- 9. products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT TO anon, authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE is_public = true AND status = 'verified'));