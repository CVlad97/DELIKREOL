-- =============================================================================
-- DELIKREOL — Indexes manquants pour clés étrangères et performances
-- Date: 2026-07-15
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_client_requests_relay_point ON public.client_requests(relay_point_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON public.deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_missions_driver ON public.delivery_missions(driver_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_applications_user ON public.partner_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_documents_application ON public.partner_documents(partner_application_id);
CREATE INDEX IF NOT EXISTS idx_partner_documents_driver ON public.partner_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_partner_documents_relay_point ON public.partner_documents(relay_point_id);
CREATE INDEX IF NOT EXISTS idx_relay_points_user ON public.relay_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_user ON public.loyalty_events(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_request ON public.loyalty_events(related_request_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status, is_public);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON public.reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);