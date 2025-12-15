/*
  # Consolidate Multiple Permissive Policies - Part 3

  1. Performance Optimization
    - Combine multiple permissive SELECT policies into single policies
    - Reduces policy evaluation overhead
    - Improves query performance

  2. Tables Updated (Part 3 of 3)
    - relay_point_associations
    - relay_point_deposits
    - responsibility_matrix
    - storage_capacities
    - whatsapp_messages
    - whatsapp_sessions
    - whatsapp_templates
*/

-- relay_point_associations: Consolidate SELECT policies
DROP POLICY IF EXISTS "Anyone can view associations" ON relay_point_associations;
DROP POLICY IF EXISTS "Vendors can manage own associations" ON relay_point_associations;
CREATE POLICY "Anyone can view associations"
  ON relay_point_associations
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate vendor management policy
CREATE POLICY "Vendors manage own associations"
  ON relay_point_associations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = relay_point_associations.vendor_id
      AND vendors.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = relay_point_associations.vendor_id
      AND vendors.user_id = (select auth.uid())
    )
  );

-- relay_point_deposits: Consolidate SELECT policies
DROP POLICY IF EXISTS "Customers can view own deposits" ON relay_point_deposits;
DROP POLICY IF EXISTS "Hosts can view deposits at their relay points" ON relay_point_deposits;
DROP POLICY IF EXISTS "Vendors and drivers can view relevant deposits" ON relay_point_deposits;
CREATE POLICY "Stakeholders can view related deposits"
  ON relay_point_deposits
  FOR SELECT
  TO authenticated
  USING (
    -- Customer can view deposits for their orders
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = relay_point_deposits.order_id
      AND orders.customer_id = (select auth.uid())
    )
    -- Host can view deposits at their relay points
    OR EXISTS (
      SELECT 1 FROM relay_points
      WHERE relay_points.id = relay_point_deposits.relay_point_id
      AND relay_points.owner_id = (select auth.uid())
    )
    -- Vendor can view their own deposits
    OR EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = relay_point_deposits.vendor_id
      AND vendors.user_id = (select auth.uid())
    )
    -- Driver can view deposits for orders they're delivering
    OR EXISTS (
      SELECT 1 FROM deliveries
      WHERE deliveries.order_id = relay_point_deposits.order_id
      AND deliveries.driver_id = (select auth.uid())
    )
  );

-- responsibility_matrix: Consolidate SELECT policies
DROP POLICY IF EXISTS "Everyone views active RACI" ON responsibility_matrix;
DROP POLICY IF EXISTS "Admins manage RACI" ON responsibility_matrix;
CREATE POLICY "Everyone views active RACI"
  ON responsibility_matrix
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Recreate admin management policy
CREATE POLICY "Admins manage RACI"
  ON responsibility_matrix
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- storage_capacities: Consolidate SELECT policies
DROP POLICY IF EXISTS "Anyone can view storage capacities" ON storage_capacities;
DROP POLICY IF EXISTS "Hosts can manage own storage capacities" ON storage_capacities;
CREATE POLICY "Anyone can view storage capacities"
  ON storage_capacities
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate host management policy
CREATE POLICY "Hosts manage own storage capacities"
  ON storage_capacities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM relay_points
      WHERE relay_points.id = storage_capacities.relay_point_id
      AND relay_points.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM relay_points
      WHERE relay_points.id = storage_capacities.relay_point_id
      AND relay_points.owner_id = (select auth.uid())
    )
  );

-- whatsapp_messages: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all WhatsApp messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Users can view their own WhatsApp messages" ON whatsapp_messages;
CREATE POLICY "Users and admins can view WhatsApp messages"
  ON whatsapp_messages
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- whatsapp_sessions: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all WhatsApp sessions" ON whatsapp_sessions;
DROP POLICY IF EXISTS "Service can manage WhatsApp sessions" ON whatsapp_sessions;
DROP POLICY IF EXISTS "Users can view their own WhatsApp session" ON whatsapp_sessions;
CREATE POLICY "Users and admins can view WhatsApp sessions"
  ON whatsapp_sessions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- whatsapp_templates: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can manage WhatsApp templates" ON whatsapp_templates;
DROP POLICY IF EXISTS "All can read active templates" ON whatsapp_templates;
CREATE POLICY "All can read active templates"
  ON whatsapp_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Recreate admin management policy
CREATE POLICY "Admins manage WhatsApp templates"
  ON whatsapp_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.user_type = 'admin'
    )
  );
