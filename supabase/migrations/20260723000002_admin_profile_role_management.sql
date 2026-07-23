-- =============================================================================
-- DELIKREOL — Admin profile role management
-- Date: 2026-07-23
-- Objectif: permettre à l'admin de promouvoir un compte connecté en traiteur,
-- livreur ou point relais depuis l'interface admin.
-- =============================================================================

DROP POLICY IF EXISTS "profiles_admin_update_roles" ON public.profiles;
CREATE POLICY "profiles_admin_update_roles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
CREATE POLICY "profiles_admin_read_all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
