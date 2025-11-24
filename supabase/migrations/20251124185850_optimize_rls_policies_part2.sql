/*
  # Optimize RLS Policies - Part 2 (Orders & Products)
  
  Continues RLS optimization for orders, order_items, products, and deliveries.
*/

-- products table
DROP POLICY IF EXISTS "Vendors can manage own products" ON public.products;
CREATE POLICY "Vendors can manage own products"
  ON public.products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.user_id = (select auth.uid())
    )
  );

-- orders table
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Vendors can view orders with their items" ON public.orders;
CREATE POLICY "Vendors can view orders with their items"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN vendors v ON v.id = oi.vendor_id
      WHERE oi.order_id = orders.id
      AND v.user_id = (select auth.uid())
    )
  );

-- order_items table
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
CREATE POLICY "Users can view order items for their orders"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Customers can create order items" ON public.order_items;
CREATE POLICY "Customers can create order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = (select auth.uid())
    )
  );

-- deliveries table
DROP POLICY IF EXISTS "Customers can view deliveries for their orders" ON public.deliveries;
CREATE POLICY "Customers can view deliveries for their orders"
  ON public.deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.customer_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Drivers can view assigned deliveries" ON public.deliveries;
CREATE POLICY "Drivers can view assigned deliveries"
  ON public.deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.id = deliveries.driver_id 
      AND drivers.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Drivers can update assigned deliveries" ON public.deliveries;
CREATE POLICY "Drivers can update assigned deliveries"
  ON public.deliveries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.id = deliveries.driver_id 
      AND drivers.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.id = deliveries.driver_id 
      AND drivers.user_id = (select auth.uid())
    )
  );