-- DELIKREOL — Complete Schema + RLS + Seed
-- Project: boihlgodmclljtckhmgz
-- Usage: npx supabase db push

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Profiles (linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'partner', 'driver', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vendors / Traiteurs
create table if not exists vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  legal_name text,
  commune text,
  address text,
  zone text,
  offer text,
  type text,
  availability text,
  story text,
  promise text,
  eta text,
  specialty text,
  highlights jsonb default '[]'::jsonb,
  status text default 'public à vérifier' check (status in ('public confirmé', 'public à vérifier', 'brouillon')),
  photo_status text default 'à confirmer' check (photo_status in ('confirmée', 'à confirmer', 'externe à vérifier')),
  public_display_status text default 'public à vérifier',
  contact_confirmed boolean default false,
  direct_contact_allowed boolean default false,
  portrait_image text,
  hero_image text,
  gallery_images jsonb default '[]'::jsonb,
  gradient text,
  accent text,
  instagram text,
  contact_phone text,
  contact_email text,
  planifiable boolean default false,
  enterprise boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products / Plats
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade,
  name text not null,
  slug text,
  category text not null,
  price numeric(10,2) not null,
  description text,
  ingredients text,
  allergens text,
  sides jsonb default '[]'::jsonb,
  image_url text,
  photo_status text default 'à confirmer' check (photo_status in ('confirmée', 'à confirmer', 'externe à vérifier')),
  availability_status text default 'à confirmer',
  is_available boolean default true,
  is_public boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text,
  customer_phone text not null,
  customer_email text,
  commune text,
  order_mode text default 'whatsapp',
  wanted_time text,
  notes text,
  subtotal numeric(10,2) default 0,
  status text default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  whatsapp_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  name text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  total numeric(10,2) not null
);

-- Catering Requests (devis traiteur)
create table if not exists catering_requests (
  id uuid primary key default uuid_generate_v4(),
  name text,
  phone text not null,
  email text,
  event_date text,
  location text,
  commune text,
  guests integer,
  budget text,
  event_type text,
  food_preferences text,
  allergies text,
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Partner Applications
create table if not exists partner_applications (
  id uuid primary key default uuid_generate_v4(),
  business_name text,
  owner_name text,
  phone text not null,
  email text,
  commune text,
  activity_type text,
  products_description text,
  schedule text,
  delivery_conditions text,
  photo_status text default 'à confirmer',
  status text default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Driver Applications
create table if not exists driver_applications (
  id uuid primary key default uuid_generate_v4(),
  name text,
  phone text not null,
  email text,
  commune text,
  zones text,
  transport_mode text,
  availability text,
  experience text,
  status text default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Relay Point Applications
create table if not exists relay_point_applications (
  id uuid primary key default uuid_generate_v4(),
  place_name text,
  owner_name text,
  phone text not null,
  email text,
  commune text not null,
  address text,
  schedule text,
  capacity text,
  status text default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Delivery Rules
create table if not exists delivery_rules (
  id uuid primary key default uuid_generate_v4(),
  commune text not null unique,
  min_order_amount numeric(10,2) default 0,
  status text default 'active',
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  source text,
  name text,
  phone text,
  email text,
  need text,
  project text,
  status text default 'new' check (status in ('new', 'contacted', 'converted', 'closed')),
  next_action text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Media Assets
create table if not exists media_assets (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  bucket text not null,
  path text not null,
  type text not null check (type in ('hero', 'portrait', 'gallery', 'menu', 'product')),
  status text default 'à confirmer' check (status in ('confirmée', 'à confirmer', 'externe à vérifier', 'public')),
  alt_text text,
  created_at timestamptz default now()
);

-- Project Memory (audit trail)
create table if not exists project_memory (
  id uuid primary key default uuid_generate_v4(),
  project text default 'DELIKREOL',
  section text,
  title text not null,
  content text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Admin Settings
create table if not exists admin_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);