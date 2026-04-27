/*
  # Remove All Unused Indexes - Security Audit Fix

  1. Performance & Storage Optimization
    - Remove 37 unused indexes identified by Supabase Security Advisor
    - Reduces storage overhead significantly
    - Improves write performance (INSERT/UPDATE/DELETE operations)
    - Reduces index maintenance overhead
    - Frees up RAM used for index caching

  2. Indexes to Remove
    - compliance_checks: verified_by index
    - payout_calculations: 3 indexes (related_delivery, related_order, user_id)
    - api_keys: created_by index
    - api_usage_logs: 2 indexes (api_key_id, user_id)
    - client_requests: user_id index
    - deliveries: driver_id index
    - delivery_performance: driver_id index
    - driver_location_history: driver_id index
    - error_logs: user_id index
    - investment_contributions: 2 indexes (project_id, user_id)
    - loyalty_events: 2 indexes (related_order_id, user_id)
    - notifications: user_id index
    - order_items: 3 indexes (order_id, product_id, vendor_id)
    - orders: customer_id index
    - partner_applications: reviewed_by index
    - payments: order_id index
    - products: vendor_id index
    - relay_point_associations: relay_point_id index
    - relay_point_deposits: 5 indexes
    - relay_point_hosts: relay_point_id index
    - relay_points: owner_id index
    - storage_capacities: relay_point_id index
    - vendors: user_id index
    - whatsapp_messages: 2 indexes (order_id, user_id)
    - whatsapp_sessions: user_id index

  3. Impact
    - Write operations will be faster
    - Storage usage reduced
    - No impact on query performance (indexes are not used)

  4. Safety
    - All these indexes are confirmed as unused by Supabase
    - Can be recreated later if query patterns change
    - Using IF EXISTS to avoid errors
*/

-- Compliance checks
DROP INDEX IF EXISTS idx_compliance_checks_verified_by;

-- Payout calculations (3 indexes)
DROP INDEX IF EXISTS idx_payout_calculations_related_delivery_id;
DROP INDEX IF EXISTS idx_payout_calculations_related_order_id;
DROP INDEX IF EXISTS idx_payout_calculations_user_id;

-- API keys
DROP INDEX IF EXISTS idx_api_keys_created_by;

-- API usage logs (2 indexes)
DROP INDEX IF EXISTS idx_api_usage_logs_api_key_id;
DROP INDEX IF EXISTS idx_api_usage_logs_user_id;

-- Client requests
DROP INDEX IF EXISTS idx_client_requests_user_id;

-- Deliveries
DROP INDEX IF EXISTS idx_deliveries_driver_id;

-- Delivery performance
DROP INDEX IF EXISTS idx_delivery_performance_driver_id;

-- Driver location history
DROP INDEX IF EXISTS idx_driver_location_history_driver_id;

-- Error logs
DROP INDEX IF EXISTS idx_error_logs_user_id;

-- Investment contributions (2 indexes)
DROP INDEX IF EXISTS idx_investment_contributions_project_id;
DROP INDEX IF EXISTS idx_investment_contributions_user_id;

-- Loyalty events (2 indexes)
DROP INDEX IF EXISTS idx_loyalty_events_related_order_id;
DROP INDEX IF EXISTS idx_loyalty_events_user_id;

-- Notifications
DROP INDEX IF EXISTS idx_notifications_user_id;

-- Order items (3 indexes)
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_order_items_vendor_id;

-- Orders
DROP INDEX IF EXISTS idx_orders_customer_id;

-- Partner applications
DROP INDEX IF EXISTS idx_partner_applications_reviewed_by;

-- Payments
DROP INDEX IF EXISTS idx_payments_order_id;

-- Products
DROP INDEX IF EXISTS idx_products_vendor_id;

-- Relay point associations
DROP INDEX IF EXISTS idx_relay_point_associations_relay_point_id;

-- Relay point deposits (5 indexes)
DROP INDEX IF EXISTS idx_relay_point_deposits_deposited_by;
DROP INDEX IF EXISTS idx_relay_point_deposits_order_id;
DROP INDEX IF EXISTS idx_relay_point_deposits_picked_up_by;
DROP INDEX IF EXISTS idx_relay_point_deposits_relay_point_id;
DROP INDEX IF EXISTS idx_relay_point_deposits_vendor_id;

-- Relay point hosts
DROP INDEX IF EXISTS idx_relay_point_hosts_relay_point_id;

-- Relay points
DROP INDEX IF EXISTS idx_relay_points_owner_id;

-- Storage capacities
DROP INDEX IF EXISTS idx_storage_capacities_relay_point_id;

-- Vendors
DROP INDEX IF EXISTS idx_vendors_user_id;

-- WhatsApp messages (2 indexes)
DROP INDEX IF EXISTS idx_whatsapp_messages_order_id;
DROP INDEX IF EXISTS idx_whatsapp_messages_user_id;

-- WhatsApp sessions
DROP INDEX IF EXISTS idx_whatsapp_sessions_user_id;
