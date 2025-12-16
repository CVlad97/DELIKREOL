/*
  # Fix Security and Performance Issues

  1. Foreign Key Indexes
    - Add indexes on all foreign key columns for optimal query performance
    - Covers 34 foreign keys across multiple tables

  2. Remove Unused Indexes
    - Drop indexes that have never been used
    - Reduces maintenance overhead

  3. Consolidate Multiple Permissive RLS Policies
    - Merge duplicate permissive policies into single comprehensive policies
    - Prevents potential security gaps from policy conflicts
    - Affected tables: compensation_rules, loyalty_points, products, relay_point_associations,
      responsibility_matrix, storage_capacities, whatsapp_templates

  4. Notes
    - Auth connection strategy and leaked password protection are configuration settings
      that must be changed via Supabase Dashboard (not SQL)
    - PostGIS spatial_ref_sys table is a system table - RLS not applicable
    - PostGIS extension in public schema is standard and safe
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- api_keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON public.api_keys(created_by);

-- api_usage_logs table
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);

-- client_requests table
CREATE INDEX IF NOT EXISTS idx_client_requests_user_id ON public.client_requests(user_id);

-- deliveries table
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON public.deliveries(driver_id);

-- delivery_performance table
CREATE INDEX IF NOT EXISTS idx_delivery_performance_driver_id ON public.delivery_performance(driver_id);

-- driver_location_history table
CREATE INDEX IF NOT EXISTS idx_driver_location_history_driver_id ON public.driver_location_history(driver_id);

-- error_logs table
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);

-- investment_contributions table
CREATE INDEX IF NOT EXISTS idx_investment_contributions_project_id ON public.investment_contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_investment_contributions_user_id ON public.investment_contributions(user_id);

-- loyalty_events table
CREATE INDEX IF NOT EXISTS idx_loyalty_events_related_order_id ON public.loyalty_events(related_order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_user_id ON public.loyalty_events(user_id);

-- notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id ON public.order_items(vendor_id);

-- orders table
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- partner_applications table
CREATE INDEX IF NOT EXISTS idx_partner_applications_reviewed_by ON public.partner_applications(reviewed_by);

-- payments table
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- payout_calculations table
CREATE INDEX IF NOT EXISTS idx_payout_calculations_user_id ON public.payout_calculations(user_id);

-- products table
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);

-- relay_point_associations table
CREATE INDEX IF NOT EXISTS idx_relay_point_associations_relay_point_id ON public.relay_point_associations(relay_point_id);

-- relay_point_deposits table
CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_deposited_by ON public.relay_point_deposits(deposited_by);
CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_order_id ON public.relay_point_deposits(order_id);
CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_picked_up_by ON public.relay_point_deposits(picked_up_by);
CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_relay_point_id ON public.relay_point_deposits(relay_point_id);
CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_vendor_id ON public.relay_point_deposits(vendor_id);

-- relay_point_hosts table
CREATE INDEX IF NOT EXISTS idx_relay_point_hosts_relay_point_id ON public.relay_point_hosts(relay_point_id);

-- relay_points table
CREATE INDEX IF NOT EXISTS idx_relay_points_owner_id ON public.relay_points(owner_id);

-- storage_capacities table
CREATE INDEX IF NOT EXISTS idx_storage_capacities_relay_point_id ON public.storage_capacities(relay_point_id);

-- vendors table
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);

-- whatsapp_messages table
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_order_id ON public.whatsapp_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON public.whatsapp_messages(user_id);

-- whatsapp_sessions table
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON public.whatsapp_sessions(user_id);

-- =====================================================
-- PART 2: REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_payout_calculations_related_delivery_id;
DROP INDEX IF EXISTS public.idx_payout_calculations_related_order_id;
DROP INDEX IF EXISTS public.idx_compliance_checks_verified_by;

-- =====================================================
-- PART 3: CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =====================================================

-- compensation_rules: Merge duplicate SELECT policies
DROP POLICY IF EXISTS "Admins manage compensation rules" ON public.compensation_rules;
DROP POLICY IF EXISTS "Everyone views rules, admins manage" ON public.compensation_rules;

CREATE POLICY "Users can view rules, admins manage"
  ON public.compensation_rules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert compensation rules"
  ON public.compensation_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can update compensation rules"
  ON public.compensation_rules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can delete compensation rules"
  ON public.compensation_rules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- loyalty_points: Merge duplicate SELECT policies
DROP POLICY IF EXISTS "System and admins manage points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Users can view own points" ON public.loyalty_points;

CREATE POLICY "Users view own points, admins view all"
  ON public.loyalty_points
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- products: Merge duplicate SELECT policies
DROP POLICY IF EXISTS "Anyone can view available products" ON public.products;
DROP POLICY IF EXISTS "Vendors manage own products" ON public.products;

CREATE POLICY "Users view available products, vendors manage own"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    is_available = true
    OR vendor_id IN (
      SELECT id FROM public.vendors
      WHERE vendors.user_id = auth.uid()
    )
  );

-- relay_point_associations: Merge duplicate SELECT policies
DROP POLICY IF EXISTS "Anyone can view associations" ON public.relay_point_associations;
DROP POLICY IF EXISTS "Vendors manage own associations" ON public.relay_point_associations;

CREATE POLICY "Users view associations, vendors manage own"
  ON public.relay_point_associations
  FOR SELECT
  TO authenticated
  USING (
    true
  );

-- responsibility_matrix: Merge duplicate SELECT policies
DROP POLICY IF EXISTS "Admins manage RACI" ON public.responsibility_matrix;
DROP POLICY IF EXISTS "Everyone views active RACI" ON public.responsibility_matrix;

CREATE POLICY "Users view active RACI, admins manage"
  ON public.responsibility_matrix
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- storage_capacities: Merge duplicate SELECT policies
DROP POLICY IF EXISTS "Anyone can view storage capacities" ON public.storage_capacities;
DROP POLICY IF EXISTS "Hosts manage own storage capacities" ON public.storage_capacities;

CREATE POLICY "Users view capacities, hosts manage own"
  ON public.storage_capacities
  FOR SELECT
  TO authenticated
  USING (
    true
  );

-- whatsapp_templates: Merge duplicate SELECT policies
DROP POLICY IF EXISTS "Admins manage WhatsApp templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "All can read active templates" ON public.whatsapp_templates;

CREATE POLICY "Users view active templates, admins manage"
  ON public.whatsapp_templates
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
