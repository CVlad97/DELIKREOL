-- ============================================
-- MIGRATION: PERFORMANCE OPTIMIZATION
-- Date: 2026-02-11
-- Objectif: Fixer 12 indexes manquants + optimiser 25 RLS policies
-- ============================================

-- ==================== PART 1: ADD MISSING INDEXES ====================
-- Fix unindexed foreign keys (12 indexes)

CREATE INDEX IF NOT EXISTS idx_client_requests_relay_point_id 
  ON public.client_requests(relay_point_id);

CREATE INDEX IF NOT EXISTS idx_client_requests_user_id 
  ON public.client_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_drivers_user_id 
  ON public.drivers(user_id);

CREATE INDEX IF NOT EXISTS idx_investment_contributions_project_id 
  ON public.investment_contributions(project_id);

CREATE INDEX IF NOT EXISTS idx_investment_contributions_user_id 
  ON public.investment_contributions(user_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_events_related_request_id 
  ON public.loyalty_events(related_request_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_events_user_id 
  ON public.loyalty_events(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_applications_user_id 
  ON public.partner_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_documents_uploaded_by 
  ON public.partner_documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_partner_documents_validated_by 
  ON public.partner_documents(validated_by);

CREATE INDEX IF NOT EXISTS idx_relay_points_user_id 
  ON public.relay_points(user_id);

CREATE INDEX IF NOT EXISTS idx_vendors_user_id 
  ON public.vendors(user_id);

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_client_requests_user_status 
  ON public.client_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_client_requests_status_created 
  ON public.client_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_drivers_active_zone 
  ON public.drivers(is_active, zone_label) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vendors_active_zone 
  ON public.vendors(is_active, zone_label) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_relay_points_active_zone 
  ON public.relay_points(is_active, zone_label) WHERE is_active = true;

-- ==================== PART 2: DROP UNUSED INDEXES ====================
DROP INDEX IF EXISTS public.idx_partner_documents_partner_id;
DROP INDEX IF EXISTS public.idx_partner_documents_status;
DROP INDEX IF EXISTS public.idx_partner_documents_type;
DROP INDEX IF EXISTS public.idx_partner_certifications_partner_id;
DROP INDEX IF EXISTS public.idx_project_owners_project_user;

-- ==================== PART 3: OPTIMIZE RLS POLICIES ====================
-- Fix auth.uid() re-evaluation issues (25 policies)
-- Replace auth.uid() with (select auth.uid()) for performance

-- profiles table (3 policies)
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- partner_applications table (2 policies)
DROP POLICY IF EXISTS partner_apps_insert_own ON public.partner_applications;
CREATE POLICY partner_apps_insert_own ON public.partner_applications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS partner_apps_select_own ON public.partner_applications;
CREATE POLICY partner_apps_select_own ON public.partner_applications
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- client_requests table (2 policies)
DROP POLICY IF EXISTS client_requests_insert_own ON public.client_requests;
CREATE POLICY client_requests_insert_own ON public.client_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS client_requests_select_own ON public.client_requests;
CREATE POLICY client_requests_select_own ON public.client_requests
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- loyalty_points table (1 policy)
DROP POLICY IF EXISTS loyalty_points_select_own ON public.loyalty_points;
CREATE POLICY loyalty_points_select_own ON public.loyalty_points
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- loyalty_events table (1 policy)
DROP POLICY IF EXISTS loyalty_events_select_own ON public.loyalty_events;
CREATE POLICY loyalty_events_select_own ON public.loyalty_events
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- investment_contributions table (1 policy)
DROP POLICY IF EXISTS investment_contrib_select_own ON public.investment_contributions;
CREATE POLICY investment_contrib_select_own ON public.investment_contributions
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- investment_preferences table (2 policies)
DROP POLICY IF EXISTS investment_prefs_insert_own ON public.investment_preferences;
CREATE POLICY investment_prefs_insert_own ON public.investment_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS investment_prefs_select_own ON public.investment_preferences;
CREATE POLICY investment_prefs_select_own ON public.investment_preferences
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- partner_documents table (5 policies)
DROP POLICY IF EXISTS "Admins can validate documents" ON public.partner_documents;
CREATE POLICY "Admins can validate documents" ON public.partner_documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all documents" ON public.partner_documents;
CREATE POLICY "Admins can view all documents" ON public.partner_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Partners can update own pending documents" ON public.partner_documents;
CREATE POLICY "Partners can update own pending documents" ON public.partner_documents
  FOR UPDATE TO authenticated
  USING (
    uploaded_by = (select auth.uid()) AND status = 'pending'
  );

DROP POLICY IF EXISTS "Partners can upload own documents" ON public.partner_documents;
CREATE POLICY "Partners can upload own documents" ON public.partner_documents
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));

DROP POLICY IF EXISTS "Partners can view own documents" ON public.partner_documents;
CREATE POLICY "Partners can view own documents" ON public.partner_documents
  FOR SELECT TO authenticated
  USING (uploaded_by = (select auth.uid()));

-- partner_certifications table (2 policies)
DROP POLICY IF EXISTS "Admins can insert certifications" ON public.partner_certifications;
CREATE POLICY "Admins can insert certifications" ON public.partner_certifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update certifications" ON public.partner_certifications;
CREATE POLICY "Admins can update certifications" ON public.partner_certifications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ==================== PART 4: CONSOLIDATE MULTIPLE PERMISSIVE POLICIES ====================
-- Fix tables with 2+ permissive policies for same role/action

-- drivers table: consolidate SELECT policies
DROP POLICY IF EXISTS drivers_all_admin ON public.drivers;
DROP POLICY IF EXISTS drivers_select_admin ON public.drivers;
DROP POLICY IF EXISTS drivers_select_own ON public.drivers;

CREATE POLICY drivers_select_unified ON public.drivers
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- drivers table: consolidate UPDATE policies
DROP POLICY IF EXISTS drivers_update_own ON public.drivers;
CREATE POLICY drivers_update_unified ON public.drivers
  FOR UPDATE TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- relay_points table: consolidate SELECT policies
DROP POLICY IF EXISTS relay_points_all_admin ON public.relay_points;
DROP POLICY IF EXISTS relay_points_select_active_public ON public.relay_points;
DROP POLICY IF EXISTS relay_points_select_admin ON public.relay_points;
DROP POLICY IF EXISTS relay_points_select_own ON public.relay_points;

CREATE POLICY relay_points_select_unified ON public.relay_points
  FOR SELECT TO authenticated
  USING (
    is_active = true OR
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- relay_points table: consolidate UPDATE policies
DROP POLICY IF EXISTS relay_points_update_own ON public.relay_points;
CREATE POLICY relay_points_update_unified ON public.relay_points
  FOR UPDATE TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- vendors table: consolidate SELECT policies
DROP POLICY IF EXISTS vendors_all_admin ON public.vendors;
DROP POLICY IF EXISTS vendors_select_active_public ON public.vendors;
DROP POLICY IF EXISTS vendors_select_admin ON public.vendors;
DROP POLICY IF EXISTS vendors_select_own ON public.vendors;

CREATE POLICY vendors_select_unified ON public.vendors
  FOR SELECT TO authenticated
  USING (
    is_active = true OR
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- vendors table: consolidate UPDATE policies
DROP POLICY IF EXISTS vendors_update_own ON public.vendors;
CREATE POLICY vendors_update_unified ON public.vendors
  FOR UPDATE TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- project_owners table: consolidate SELECT policies
DROP POLICY IF EXISTS project_owners_all_admin ON public.project_owners;
DROP POLICY IF EXISTS project_owners_select_own ON public.project_owners;

CREATE POLICY project_owners_select_unified ON public.project_owners
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ==================== VERIFICATION ====================
-- Analyze tables for query planner
ANALYZE public.client_requests;
ANALYZE public.drivers;
ANALYZE public.vendors;
ANALYZE public.relay_points;
ANALYZE public.partner_documents;
ANALYZE public.investment_contributions;
ANALYZE public.loyalty_events;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration completed successfully: 17 indexes added, 5 unused indexes dropped, 25 RLS policies optimized';
END $$;
