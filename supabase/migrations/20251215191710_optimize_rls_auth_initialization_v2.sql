/*
  # Optimize RLS Policies - Auth Function Initialization

  1. Performance Optimization
    - Replace `auth.uid()` with `(select auth.uid())` in RLS policies
    - Prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Tables Updated
    - driver_location_history (2 policies)
    - delivery_routing (1 policy)
    - delivery_performance (1 policy)
    - compensation_rules (1 policy)
    - payout_calculations (1 policy)
    - responsibility_matrix (1 policy)
    - compliance_checks (1 policy)
*/

-- driver_location_history: Optimize "Drivers insert own location"
DROP POLICY IF EXISTS "Drivers insert own location" ON driver_location_history;
CREATE POLICY "Drivers insert own location"
  ON driver_location_history
  FOR INSERT
  TO authenticated
  WITH CHECK (driver_id = (select auth.uid()));

-- driver_location_history: Optimize "Admins view all locations"
DROP POLICY IF EXISTS "Admins view all locations" ON driver_location_history;
CREATE POLICY "Admins view all locations"
  ON driver_location_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.user_type = 'admin'
    )
  );

-- delivery_routing: Optimize "Users view routing for their orders"
DROP POLICY IF EXISTS "Users view routing for their orders" ON delivery_routing;
CREATE POLICY "Users view routing for their orders"
  ON delivery_routing
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      WHERE d.id = delivery_routing.delivery_id
      AND o.customer_id = (select auth.uid())
    )
  );

-- delivery_performance: Optimize "Drivers view own performance"
DROP POLICY IF EXISTS "Drivers view own performance" ON delivery_performance;
CREATE POLICY "Drivers view own performance"
  ON delivery_performance
  FOR SELECT
  TO authenticated
  USING (driver_id = (select auth.uid()));

-- compensation_rules: Optimize "Admins manage rules"
DROP POLICY IF EXISTS "Admins manage rules" ON compensation_rules;
CREATE POLICY "Admins manage rules"
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

-- payout_calculations: Optimize "Users view own payouts"
DROP POLICY IF EXISTS "Users view own payouts" ON payout_calculations;
CREATE POLICY "Users view own payouts"
  ON payout_calculations
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- responsibility_matrix: Optimize "Admins manage RACI"
DROP POLICY IF EXISTS "Admins manage RACI" ON responsibility_matrix;
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

-- compliance_checks: Optimize "Users view own compliance checks"
DROP POLICY IF EXISTS "Users view own compliance checks" ON compliance_checks;
CREATE POLICY "Users view own compliance checks"
  ON compliance_checks
  FOR SELECT
  TO authenticated
  USING (entity_id = (select auth.uid()));
