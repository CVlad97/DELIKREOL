/*
  # Add Missing Foreign Key Indexes
  
  Adds indexes on all foreign key columns to optimize JOIN performance.
  This resolves 18 unindexed foreign key warnings.
*/

-- api_keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by 
  ON public.api_keys(created_by);

-- api_usage_logs table
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id 
  ON public.api_usage_logs(api_key_id);

-- deliveries table
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id 
  ON public.deliveries(driver_id);

-- error_logs table
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id 
  ON public.error_logs(user_id);

-- loyalty_events table
CREATE INDEX IF NOT EXISTS idx_loyalty_events_related_order_id 
  ON public.loyalty_events(related_order_id);

-- order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id 
  ON public.order_items(vendor_id);

-- orders table
CREATE INDEX IF NOT EXISTS idx_orders_customer_id 
  ON public.orders(customer_id);

-- partner_applications table
CREATE INDEX IF NOT EXISTS idx_partner_applications_reviewed_by 
  ON public.partner_applications(reviewed_by);

-- products table
CREATE INDEX IF NOT EXISTS idx_products_vendor_id 
  ON public.products(vendor_id);

-- relay_point_associations table
CREATE INDEX IF NOT EXISTS idx_relay_point_associations_relay_point_id 
  ON public.relay_point_associations(relay_point_id);

-- relay_point_deposits table
CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_deposited_by 
  ON public.relay_point_deposits(deposited_by);

CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_picked_up_by 
  ON public.relay_point_deposits(picked_up_by);

CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_vendor_id_fk 
  ON public.relay_point_deposits(vendor_id);

-- relay_point_hosts table
CREATE INDEX IF NOT EXISTS idx_relay_point_hosts_relay_point_id 
  ON public.relay_point_hosts(relay_point_id);

-- relay_points table
CREATE INDEX IF NOT EXISTS idx_relay_points_owner_id 
  ON public.relay_points(owner_id);

-- vendors table
CREATE INDEX IF NOT EXISTS idx_vendors_user_id 
  ON public.vendors(user_id);