-- =============================================================================
-- DELIKREOL — Admin function hardening + test de privilèges
-- Date: 2026-07-15
-- =============================================================================
-- REMPLACE 20260715000001 (version permissive supprimée)
-- Politiques supprimées de la version précédente : AUCUNE
-- Les politiques "Anyone can insert..." WITH CHECK (true) ne sont PAS créées.
-- Les politiques strictes existantes sont PRESERVEES.

-- 1. Tester la fonction admin (sans la recréer)
DO $$
DECLARE
  func_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_delikreol_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO func_exists;

  IF NOT func_exists THEN
    RAISE WARNING 'is_delikreol_admin() not found — run previous migration first';
  ELSE
    RAISE NOTICE 'is_delikreol_admin() exists and is accessible';
  END IF;
END;
$$;

-- 2. Vérifier les privilèges actuels de la fonction
SELECT
  p.proname AS function_name,
  CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN '⚠️ anon CAN execute' ELSE '✅ anon cannot execute' END AS anon_access,
  CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE') THEN '✅ authenticated CAN execute' ELSE '⚠️ authenticated cannot execute' END AS auth_access,
  CASE WHEN has_function_privilege('public', p.oid, 'EXECUTE') THEN '⚠️ PUBLIC CAN execute' ELSE '✅ public cannot execute' END AS public_access
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'is_delikreol_admin';

-- 3. Ajouter UNIQUEMENT les politiques admin manquantes
DO $$
BEGIN
  -- profiles: admin peut tout lire
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'admin_read_all_profiles') THEN
    CREATE POLICY "admin_read_all_profiles" ON public.profiles
      FOR SELECT TO authenticated USING (public.is_delikreol_admin());
  END IF;

  -- orders: admin peut tout voir
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'admin_read_all_orders') THEN
    CREATE POLICY "admin_read_all_orders" ON public.orders
      FOR SELECT TO authenticated USING (public.is_delikreol_admin());
  END IF;

  -- contact_messages: admin peut lire
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_messages' AND policyname = 'admin_read_contact_messages') THEN
    CREATE POLICY "admin_read_contact_messages" ON public.contact_messages
      FOR SELECT TO authenticated USING (public.is_delikreol_admin());
  END IF;

  -- partner_applications: admin peut tout voir
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'partner_applications' AND policyname = 'admin_read_all_partner_applications') THEN
    CREATE POLICY "admin_read_all_partner_applications" ON public.partner_applications
      FOR SELECT TO authenticated USING (public.is_delikreol_admin());
  END IF;

  -- client_requests: admin peut tout voir
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'client_requests' AND policyname = 'admin_read_all_client_requests') THEN
    CREATE POLICY "admin_read_all_client_requests" ON public.client_requests
      FOR SELECT TO authenticated USING (public.is_delikreol_admin());
  END IF;

  -- reviews: admin peut tout voir
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'admin_read_all_reviews') THEN
    CREATE POLICY "admin_read_all_reviews" ON public.reviews
      FOR SELECT TO authenticated USING (public.is_delikreol_admin());
  END IF;

  -- vendors: admin ALL
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vendors' AND policyname = 'admin_all_vendors') THEN
    CREATE POLICY "admin_all_vendors" ON public.vendors
      FOR ALL TO authenticated USING (public.is_delikreol_admin()) WITH CHECK (public.is_delikreol_admin());
  END IF;

  -- products: admin ALL
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'admin_all_products') THEN
    CREATE POLICY "admin_all_products" ON public.products
      FOR ALL TO authenticated USING (public.is_delikreol_admin()) WITH CHECK (public.is_delikreol_admin());
  END IF;
END;
$$;