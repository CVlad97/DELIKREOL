-- DELIKREOL — Row Level Security Policies
-- Project: boihlgodmclljtckhmgz

-- Helper: is_admin function
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================
alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- VENDORS
-- ============================================================
alter table vendors enable row level security;

create policy "Published vendors visible to all"
  on vendors for select
  using (public_display_status in ('public confirmé', 'public à vérifier') OR is_admin());

create policy "Admins can manage vendors"
  on vendors for all using (is_admin());

-- ============================================================
-- PRODUCTS
-- ============================================================
alter table products enable row level security;

create policy "Public products visible to all"
  on products for select
  using (is_public = true OR is_admin());

create policy "Admins can manage products"
  on products for all using (is_admin());

-- ============================================================
-- ORDERS
-- ============================================================
alter table orders enable row level security;

create policy "Anyone can insert orders (WhatsApp-first)"
  on orders for insert with check (true);

create policy "Admins can view all orders"
  on orders for select using (is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================
alter table order_items enable row level security;

create policy "Anyone can insert order items"
  on order_items for insert with check (true);

create policy "Admins can view all order items"
  on order_items for select using (is_admin());

-- ============================================================
-- CATERING REQUESTS
-- ============================================================
alter table catering_requests enable row level security;

create policy "Anyone can insert catering requests"
  on catering_requests for insert with check (true);

create policy "Admins can view all catering requests"
  on catering_requests for select using (is_admin());

-- ============================================================
-- PARTNER APPLICATIONS
-- ============================================================
alter table partner_applications enable row level security;

create policy "Anyone can submit partner applications"
  on partner_applications for insert with check (true);

create policy "Admins can view all partner applications"
  on partner_applications for select using (is_admin());

-- ============================================================
-- DRIVER APPLICATIONS
-- ============================================================
alter table driver_applications enable row level security;

create policy "Anyone can submit driver applications"
  on driver_applications for insert with check (true);

create policy "Admins can view all driver applications"
  on driver_applications for select using (is_admin());

-- ============================================================
-- RELAY POINT APPLICATIONS
-- ============================================================
alter table relay_point_applications enable row level security;

create policy "Anyone can submit relay point applications"
  on relay_point_applications for insert with check (true);

create policy "Admins can view all relay point applications"
  on relay_point_applications for select using (is_admin());

-- ============================================================
-- DELIVERY RULES
-- ============================================================
alter table delivery_rules enable row level security;

create policy "Delivery rules visible to all"
  on delivery_rules for select using (true);

create policy "Admins can manage delivery rules"
  on delivery_rules for all using (is_admin());

-- ============================================================
-- LEADS
-- ============================================================
alter table leads enable row level security;

create policy "Anyone can insert leads"
  on leads for insert with check (true);

create policy "Admins can view all leads"
  on leads for select using (is_admin());

-- ============================================================
-- MEDIA ASSETS
-- ============================================================
alter table media_assets enable row level security;

create policy "Public media assets visible to all"
  on media_assets for select using (status = 'public' OR status = 'confirmée' OR is_admin());

create policy "Admins can manage media assets"
  on media_assets for all using (is_admin());

-- ============================================================
-- PROJECT MEMORY
-- ============================================================
alter table project_memory enable row level security;

create policy "Admins only for project memory"
  on project_memory for all using (is_admin());

-- ============================================================
-- ADMIN SETTINGS
-- ============================================================
alter table admin_settings enable row level security;

create policy "Admins only for admin settings"
  on admin_settings for all using (is_admin());