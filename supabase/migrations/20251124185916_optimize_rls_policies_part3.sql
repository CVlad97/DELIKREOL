/*
  # Optimize RLS Policies - Part 3 (Relay Points & Deposits)
  
  Continues RLS optimization for relay point related tables.
*/

-- storage_capacities table
DROP POLICY IF EXISTS "Hosts can manage own storage capacities" ON public.storage_capacities;
CREATE POLICY "Hosts can manage own storage capacities"
  ON public.storage_capacities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM relay_point_hosts 
      WHERE relay_point_hosts.relay_point_id = storage_capacities.relay_point_id 
      AND relay_point_hosts.user_id = (select auth.uid())
    )
  );

-- relay_point_deposits table
DROP POLICY IF EXISTS "Customers can view own deposits" ON public.relay_point_deposits;
CREATE POLICY "Customers can view own deposits"
  ON public.relay_point_deposits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = relay_point_deposits.order_id 
      AND orders.customer_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Hosts can view deposits at their relay points" ON public.relay_point_deposits;
CREATE POLICY "Hosts can view deposits at their relay points"
  ON public.relay_point_deposits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM relay_point_hosts 
      WHERE relay_point_hosts.relay_point_id = relay_point_deposits.relay_point_id 
      AND relay_point_hosts.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Hosts can update deposits at their relay points" ON public.relay_point_deposits;
CREATE POLICY "Hosts can update deposits at their relay points"
  ON public.relay_point_deposits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM relay_point_hosts 
      WHERE relay_point_hosts.relay_point_id = relay_point_deposits.relay_point_id 
      AND relay_point_hosts.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM relay_point_hosts 
      WHERE relay_point_hosts.relay_point_id = relay_point_deposits.relay_point_id 
      AND relay_point_hosts.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors and drivers can view relevant deposits" ON public.relay_point_deposits;
CREATE POLICY "Vendors and drivers can view relevant deposits"
  ON public.relay_point_deposits FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = deposited_by OR (select auth.uid()) = picked_up_by
  );

-- relay_point_associations table
DROP POLICY IF EXISTS "Vendors can manage own associations" ON public.relay_point_associations;
CREATE POLICY "Vendors can manage own associations"
  ON public.relay_point_associations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = relay_point_associations.vendor_id 
      AND vendors.user_id = (select auth.uid())
    )
  );

-- payments table
DROP POLICY IF EXISTS "Customers can view payments for own orders" ON public.payments;
CREATE POLICY "Customers can view payments for own orders"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND orders.customer_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can view payments for their orders" ON public.payments;
CREATE POLICY "Vendors can view payments for their orders"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN vendors v ON v.id = oi.vendor_id
      WHERE oi.order_id = payments.order_id
      AND v.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Drivers can view payments for their deliveries" ON public.payments;
CREATE POLICY "Drivers can view payments for their deliveries"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries d
      JOIN drivers dr ON dr.id = d.driver_id
      WHERE d.order_id = payments.order_id
      AND dr.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Hosts can view payments for their relay points" ON public.payments;
CREATE POLICY "Hosts can view payments for their relay points"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM relay_point_deposits rpd
      JOIN relay_point_hosts rph ON rph.relay_point_id = rpd.relay_point_id
      WHERE rpd.order_id = payments.order_id
      AND rph.user_id = (select auth.uid())
    )
  );