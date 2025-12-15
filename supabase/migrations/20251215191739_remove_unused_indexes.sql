/*
  # Remove Unused Indexes

  1. Performance Optimization
    - Remove 57 unused indexes identified by Supabase advisor
    - Reduces storage overhead
    - Improves write performance (INSERT/UPDATE/DELETE)
    - Reduces maintenance overhead

  2. Indexes Removed
    - Storage capacities, vendors, products, orders, order_items
    - Deliveries, relay points, relay point hosts, relay point deposits
    - Relay point associations, payments, notifications
    - API keys, API usage logs, WhatsApp messages, sessions, templates
    - Partner applications, error logs, client requests
    - Loyalty points, loyalty events, investment projects, contributions
    - Driver location history, delivery routing, delivery performance
    - Compensation rules, payout calculations, responsibility matrix, compliance checks
*/

-- Storage capacities
DROP INDEX IF EXISTS idx_storage_capacities_relay_point;

-- Vendors
DROP INDEX IF EXISTS idx_vendors_location;
DROP INDEX IF EXISTS idx_vendors_user_id;

-- Products
DROP INDEX IF EXISTS idx_products_vendor_id;

-- Orders
DROP INDEX IF EXISTS idx_orders_customer_id;

-- Order items
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_order_items_vendor_id;

-- Deliveries
DROP INDEX IF EXISTS idx_deliveries_driver_id;

-- Relay points
DROP INDEX IF EXISTS idx_relay_points_location;
DROP INDEX IF EXISTS idx_relay_points_owner_id;

-- Relay point hosts
DROP INDEX IF EXISTS idx_relay_point_hosts_relay_point_id;

-- Relay point deposits
DROP INDEX IF EXISTS idx_relay_point_deposits_relay_point;
DROP INDEX IF EXISTS idx_relay_point_deposits_order;
DROP INDEX IF EXISTS idx_relay_point_deposits_deposited_by;
DROP INDEX IF EXISTS idx_relay_point_deposits_picked_up_by;
DROP INDEX IF EXISTS idx_relay_point_deposits_vendor_id_fk;

-- Relay point associations
DROP INDEX IF EXISTS idx_relay_point_associations_relay_point_id;

-- Payments
DROP INDEX IF EXISTS idx_payments_order;

-- Notifications
DROP INDEX IF EXISTS idx_notifications_user;

-- API keys
DROP INDEX IF EXISTS idx_api_keys_service;
DROP INDEX IF EXISTS idx_api_keys_active;
DROP INDEX IF EXISTS idx_api_keys_created_by;

-- API usage logs
DROP INDEX IF EXISTS idx_api_usage_logs_service;
DROP INDEX IF EXISTS idx_api_usage_logs_created_at;
DROP INDEX IF EXISTS idx_api_usage_logs_user_id;
DROP INDEX IF EXISTS idx_api_usage_logs_api_key_id;

-- WhatsApp messages
DROP INDEX IF EXISTS idx_whatsapp_messages_user_id;
DROP INDEX IF EXISTS idx_whatsapp_messages_order_id;
DROP INDEX IF EXISTS idx_whatsapp_messages_from_number;
DROP INDEX IF EXISTS idx_whatsapp_messages_created_at;

-- WhatsApp sessions
DROP INDEX IF EXISTS idx_whatsapp_sessions_phone_number;
DROP INDEX IF EXISTS idx_whatsapp_sessions_user_id;

-- WhatsApp templates
DROP INDEX IF EXISTS idx_whatsapp_templates_type;

-- Partner applications
DROP INDEX IF EXISTS idx_partner_applications_type;
DROP INDEX IF EXISTS idx_partner_applications_status;
DROP INDEX IF EXISTS idx_partner_applications_created;
DROP INDEX IF EXISTS idx_partner_applications_reviewed_by;

-- Error logs
DROP INDEX IF EXISTS idx_error_logs_created;
DROP INDEX IF EXISTS idx_error_logs_function;
DROP INDEX IF EXISTS idx_error_logs_user_id;

-- Client requests
DROP INDEX IF EXISTS idx_client_requests_user_id;
DROP INDEX IF EXISTS idx_client_requests_status;

-- Loyalty points
DROP INDEX IF EXISTS idx_loyalty_points_user_id;

-- Loyalty events
DROP INDEX IF EXISTS idx_loyalty_events_user_id;
DROP INDEX IF EXISTS idx_loyalty_events_related_order_id;

-- Investment projects
DROP INDEX IF EXISTS idx_investment_projects_status;

-- Investment contributions
DROP INDEX IF EXISTS idx_investment_contributions_user_id;
DROP INDEX IF EXISTS idx_investment_contributions_project_id;

-- Driver location history
DROP INDEX IF EXISTS idx_driver_location_driver_time;

-- Delivery routing
DROP INDEX IF EXISTS idx_delivery_routing_delivery;

-- Delivery performance
DROP INDEX IF EXISTS idx_delivery_performance_driver;

-- Compensation rules
DROP INDEX IF EXISTS idx_compensation_rules_active;

-- Payout calculations
DROP INDEX IF EXISTS idx_payout_calculations_user_period;

-- Responsibility matrix
DROP INDEX IF EXISTS idx_responsibility_matrix_process;

-- Compliance checks
DROP INDEX IF EXISTS idx_compliance_checks_entity;
