/*
  # Consolidate Multiple Permissive Policies - Part 1

  1. Performance Optimization
    - Combine multiple permissive SELECT policies into single policies
    - Reduces policy evaluation overhead
    - Improves query performance

  2. Tables Updated (Part 1 of 3)
    - client_requests
    - compensation_rules
    - deliveries
    - investment_contributions
    - investment_preferences
    - investment_projects
*/

-- client_requests: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all requests" ON client_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON client_requests;
CREATE POLICY "Users and admins can view requests"
  ON client_requests
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

-- compensation_rules: Consolidate SELECT policies
DROP POLICY IF EXISTS "Everyone views active rules" ON compensation_rules;
DROP POLICY IF EXISTS "Admins manage rules" ON compensation_rules;
CREATE POLICY "Everyone views rules, admins manage"
  ON compensation_rules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Recreate admin management policy for compensation_rules
CREATE POLICY "Admins manage compensation rules"
  ON compensation_rules
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

-- deliveries: Consolidate SELECT policies
DROP POLICY IF EXISTS "Customers can view deliveries for their orders" ON deliveries;
DROP POLICY IF EXISTS "Drivers can view assigned deliveries" ON deliveries;
CREATE POLICY "Customers and drivers can view deliveries"
  ON deliveries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = deliveries.order_id
      AND orders.customer_id = (select auth.uid())
    )
    OR driver_id = (select auth.uid())
  );

-- investment_contributions: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all contributions" ON investment_contributions;
DROP POLICY IF EXISTS "Users can view their own contributions" ON investment_contributions;
CREATE POLICY "Users and admins can view contributions"
  ON investment_contributions
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

-- investment_preferences: Consolidate SELECT policies
DROP POLICY IF EXISTS "Users can manage their own preferences" ON investment_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON investment_preferences;
CREATE POLICY "Users can view and manage own preferences"
  ON investment_preferences
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- investment_projects: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all projects" ON investment_projects;
DROP POLICY IF EXISTS "Anyone can view active projects" ON investment_projects;
CREATE POLICY "Users can view active projects, admins all"
  ON investment_projects
  FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.user_type = 'admin'
    )
  );
