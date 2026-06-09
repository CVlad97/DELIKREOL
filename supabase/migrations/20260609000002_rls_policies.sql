-- DELIKREOL — Row Level Security Policies

-- Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);
create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Vendors (public = published only)
alter table vendors enable row level security;
create policy "Published vendors visible to all"
  on vendors for select using (status = 'public confirmé' OR auth.role() = 'service_role');
create policy "Admins can manage vendors"
  on vendors for all using (auth.role() = 'service_role');

-- Products (public = available only)
alter table products enable row level security;
create policy "Available products visible to all"
  on products for select using (is_available = true OR auth.role() = 'service_role');
create policy "Vendors manage their own products"
  on products for all using (
    auth.role() = 'service_role' OR
    exists (select 1 from vendors v where v.id = vendor_id and v.profile_id = auth.uid())
  );

-- Orders (customer sees own, admin sees all)
alter table orders enable row level security;
create policy "Users see own orders"
  on orders for select using (customer_phone = auth.phone() OR auth.role() = 'service_role');
create policy "Insert orders"
  on orders for insert with check (true);

-- Order items
alter table order_items enable row level security;
create policy "Order items visible with order"
  on order_items for select using (
    exists (select 1 from orders o where o.id = order_id and (o.customer_phone = auth.phone() OR auth.role() = 'service_role'))
  );
create policy "Insert order items"
  on order_items for insert with check (true);

-- Catering requests
alter table catering_requests enable row level security;
create policy "Insert catering requests"
  on catering_requests for insert with check (true);
create policy "Admins see all catering requests"
  on catering_requests for select using (auth.role() = 'service_role');

-- Partner applications
alter table partner_applications enable row level security;
create policy "Insert partner applications"
  on partner_applications for insert with check (true);
create policy "Admins see all applications"
  on partner_applications for select using (auth.role() = 'service_role');

-- Driver applications
alter table driver_applications enable row level security;
create policy "Insert driver applications"
  on driver_applications for insert with check (true);
create policy "Admins see all applications"
  on driver_applications for select using (auth.role() = 'service_role');

-- Relay point applications
alter table relay_point_applications enable row level security;
create policy "Insert relay applications"
  on relay_point_applications for insert with check (true);
create policy "Admins see all applications"
  on relay_point_applications for select using (auth.role() = 'service_role');

-- Delivery rules (public)
alter table delivery_rules enable row level security;
create policy "Delivery rules visible to all"
  on delivery_rules for select using (true);
create policy "Admins manage delivery rules"
  on delivery_rules for all using (auth.role() = 'service_role');

-- Media assets (public = confirmed)
alter table media_assets enable row level security;
create policy "Confirmed media visible to all"
  on media_assets for select using (status = 'confirmée' OR auth.role() = 'service_role');
create policy "Vendors manage their media"
  on media_assets for all using (auth.role() = 'service_role');

-- Admin settings (service_role only)
alter table admin_settings enable row level security;
create policy "Admin settings service only"
  on admin_settings for all using (auth.role() = 'service_role');