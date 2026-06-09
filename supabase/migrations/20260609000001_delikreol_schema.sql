-- ============================================================
-- DELIKREOL — Supabase Schema
-- Version: 1.0.0
-- WhatsApp-first MVP with Supabase backend ready
-- ============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Profiles (users, admins, partners, drivers)
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  phone text unique not null,
  email text unique,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'partner', 'driver', 'admin')),
  avatar_url text,
  is_verified boolean default false,
  metadata jsonb default '{}'::jsonb
);

-- 2. Vendors / Traiteurs
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  profile_id uuid references profiles(id) on delete set null,
  business_name text not null,
  legal_name text,
  slug text unique not null,
  zone text not null,
  commune text,
  address text,
  phone text,
  email text,
  description text,
  story text,
  offer text,
  specialty text,
  highlights jsonb default '[]'::jsonb,
  availability text,
  eta text,
  status text default 'public à vérifier' check (status in ('public confirmé', 'public à vérifier', 'brouillon')),
  photo_status text default 'à confirmer' check (photo_status in ('confirmée', 'à confirmer', 'externe à vérifier')),
  hero_image text,
  portrait_image text,
  gallery_images jsonb default '[]'::jsonb,
  gradient text,
  accent text,
  instagram text,
  planifiable boolean default false,
  enterprise boolean default false
);

-- 3. Products
create table products (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  vendor_id uuid references vendors(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  image text,
  is_available boolean default true,
  featured boolean default false,
  sides jsonb default '[]'::jsonb,
  ingredients text,
  allergens text,
  zone text
);

-- 4. Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  customer_id uuid references profiles(id) on delete set null,
  customer_name text,
  customer_phone text not null,
  customer_email text,
  vendor_id uuid references vendors(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  total_amount numeric(10,2) not null default 0,
  delivery_type text check (delivery_type in ('home_delivery', 'pickup', 'relay_point')),
  delivery_address text,
  delivery_zone text,
  delivery_fee numeric(10,2) default 0,
  commune text,
  notes text,
  source text default 'whatsapp' check (source in ('whatsapp', 'site', 'admin')),
  whatsapp_message_sent boolean default false
);

-- 5. Order Items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null
);

-- 6. Catering Requests (devis traiteur)
create table catering_requests (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  customer_phone text not null,
  customer_name text,
  vendor_slug text,
  vendor_name text,
  event_type text,
  event_date date,
  guest_count integer,
  budget numeric(10,2),
  commune text,
  description text,
  status text default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'cancelled')),
  whatsapp_message_sent boolean default false
);

-- 7. Partner Applications
create table partner_applications (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  full_name text not null,
  phone text not null,
  email text,
  business_name text,
  business_type text,
  commune text,
  address text,
  offer text,
  message text,
  status text default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected'))
);

-- 8. Driver Applications
create table driver_applications (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  full_name text not null,
  phone text not null,
  email text,
  commune text,
  vehicle_type text,
  has_license boolean default false,
  message text,
  status text default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected'))
);

-- 9. Relay Point Applications
create table relay_point_applications (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  full_name text not null,
  phone text not null,
  business_name text,
  commune text not null,
  address text,
  message text,
  status text default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected'))
);

-- 10. Delivery Rules
create table delivery_rules (
  id uuid primary key default uuid_generate_v4(),
  commune text not null unique,
  zone_type text not null check (zone_type in ('proche', 'éloignée')),
  min_amount_free_delivery numeric(10,2) default 0,
  delivery_fee numeric(10,2) default 0,
  extended_delivery_threshold numeric(10,2),
  is_active boolean default true
);

-- 11. Leads (suivi contacts)
create table leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  source text not null,
  name text,
  phone text,
  email text,
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'converted', 'closed'))
);

-- 12. Media Assets
create table media_assets (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  vendor_id uuid references vendors(id) on delete cascade,
  type text not null check (type in ('hero', 'portrait', 'gallery', 'menu', 'product')),
  url text not null,
  alt_text text,
  credit text,
  status text default 'à confirmer' check (status in ('confirmée', 'à confirmer', 'externe à vérifier'))
);

-- 13. Admin Settings
create table admin_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 14. Project Memory (audit trail / dev notes)
create table project_memory (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  category text not null,
  title text not null,
  content text,
  tags jsonb default '[]'::jsonb
);