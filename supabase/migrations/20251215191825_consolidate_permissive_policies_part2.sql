/*
  # Consolidate Multiple Permissive Policies - Part 2

  1. Performance Optimization
    - Combine multiple permissive SELECT policies into single policies
    - Reduces policy evaluation overhead
    - Improves query performance

  2. Tables Updated (Part 2 of 3)
    - loyalty_points
    - orders
    - payments (complex - 4 policies)
    - products
*/

-- loyalty_points: Consolidate SELECT policies
DROP POLICY IF EXISTS "System can manage points" ON loyalty_points;
DROP POLICY IF EXISTS "Users can view their own points" ON loyalty_points;
CREATE POLICY "Users can view own points"
  ON loyalty_points
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate system management policy
CREATE POLICY "System and admins manage points"
  ON loyalty_points
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

-- orders: Consolidate SELECT policies
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Vendors can view orders with their items" ON orders;
CREATE POLICY "Customers and vendors can view orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM order_items oi
      JOIN vendors v ON oi.vendor_id = v.id
      WHERE oi.order_id = orders.id
      AND v.user_id = (select auth.uid())
    )
  );

-- payments: Consolidate SELECT policies (4 policies)
DROP POLICY IF EXISTS "Customers can view payments for own orders" ON payments;
DROP POLICY IF EXISTS "Drivers can view payments for their deliveries" ON payments;
DROP POLICY IF EXISTS "Hosts can view payments for their relay points" ON payments;
DROP POLICY IF EXISTS "Vendors can view payments for their orders" ON payments;
CREATE POLICY "Stakeholders can view related payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    -- Customer can view payments for their orders
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.customer_id = (select auth.uid())
    )
    -- Driver can view payments for their deliveries
    OR EXISTS (
      SELECT 1 FROM deliveries
      WHERE deliveries.order_id = payments.order_id
      AND deliveries.driver_id = (select auth.uid())
    )
    -- Vendor can view payments for their order items
    OR EXISTS (
      SELECT 1 FROM order_items oi
      JOIN vendors v ON oi.vendor_id = v.id
      WHERE oi.order_id = payments.order_id
      AND v.user_id = (select auth.uid())
    )
    -- Host can view payments for relay point deposits
    OR EXISTS (
      SELECT 1 FROM relay_point_deposits rpd
      JOIN relay_points rp ON rpd.relay_point_id = rp.id
      WHERE rpd.order_id = payments.order_id
      AND rp.owner_id = (select auth.uid())
    )
  );

-- products: Consolidate SELECT policies
DROP POLICY IF EXISTS "Anyone can view available products" ON products;
DROP POLICY IF EXISTS "Vendors can manage own products" ON products;
CREATE POLICY "Anyone can view available products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_available = true);

-- Recreate vendor management policy
CREATE POLICY "Vendors manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = products.vendor_id
      AND vendors.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = products.vendor_id
      AND vendors.user_id = (select auth.uid())
    )
  );
