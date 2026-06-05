/*
  DeliKreol — schema Supabase Free / Open Source

  Objectif : base gratuite, simple, securisee par RLS, compatible GitHub Pages.
  Aucun secret, aucun token, aucun mot de passe.
*/

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text,
  phone text,
  email text,
  user_type text default 'customer',
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  business_type text default 'traiteur',
  description text,
  zone text,
  address text,
  phone text,
  email text,
  logo_url text,
  image_url text,
  is_public boolean default true,
  is_verified boolean default false,
  status text default 'a_confirmer',
  minimum_order_local numeric(10,2),
  minimum_order_extended numeric(10,2) default 100,
  order_cutoff_time text,
  delivery_windows jsonb default '[]'::jsonb,
  contact_preference text default 'delikreol_whatsapp',
  source_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete set null,
  name text not null,
  description text,
  category text default 'plats',
  price numeric(10,2) not null default 0,
  image_url text,
  is_available boolean default true,
  is_public boolean default true,
  is_verified boolean default false,
  status text default 'a_confirmer',
  source_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  customer_email text,
  status text default 'nouvelle',
  delivery_type text default 'a_confirmer',
  delivery_address text,
  delivery_window text,
  total_amount numeric(10,2) default 0,
  notes text,
  source text default 'site',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  product_name text,
  quantity integer default 1,
  unit_price numeric(10,2) default 0,
  subtotal numeric(10,2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text,
  zone text,
  vehicle_type text,
  status text default 'candidat',
  is_verified boolean default false,
  source_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  status text default 'a_confirmer',
  pickup_address text,
  dropoff_address text,
  estimated_window text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.relay_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  zone text,
  address text,
  contact_name text,
  phone text,
  status text default 'candidature_ouverte',
  is_verified boolean default false,
  capacity integer default 0,
  opening_hours text default 'a confirmer',
  source_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.catering_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text,
  email text,
  event_type text,
  event_date date,
  commune text,
  guest_count integer,
  budget numeric(10,2),
  message text,
  status text default 'nouvelle',
  source text default 'site',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  contact_name text,
  phone text,
  email text,
  partner_type text,
  commune text,
  message text,
  status text default 'nouvelle',
  source text default 'site',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  customer_name text,
  rating integer check (rating between 1 and 5),
  comment text,
  is_public boolean default false,
  is_verified boolean default false,
  status text default 'a_verifier',
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text,
  email text,
  source text default 'site',
  status text default 'nouveau',
  interest text,
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.marketing_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  channel text default 'whatsapp',
  content text not null,
  status text default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.financial_assumptions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value numeric(12,2) default 0,
  unit text,
  scenario text default 'realiste',
  source_note text default 'hypothese modifiable',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.operational_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text default 'info',
  status text default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.project_memory (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  content text not null,
  source text default 'manual',
  confidence text default 'to_confirm',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.drivers enable row level security;
alter table public.deliveries enable row level security;
alter table public.relay_points enable row level security;
alter table public.catering_requests enable row level security;
alter table public.partner_applications enable row level security;
alter table public.reviews enable row level security;
alter table public.leads enable row level security;
alter table public.marketing_posts enable row level security;
alter table public.financial_assumptions enable row level security;
alter table public.operational_alerts enable row level security;
alter table public.project_memory enable row level security;

-- Lecture publique uniquement pour contenus publics/valides.
create policy if not exists "Public read active vendors" on public.vendors for select to anon, authenticated using (is_public = true and status in ('active','a_confirmer'));
create policy if not exists "Public read available products" on public.products for select to anon, authenticated using (is_public = true and is_available = true);
create policy if not exists "Public read verified reviews" on public.reviews for select to anon, authenticated using (is_public = true and is_verified = true);
create policy if not exists "Public read relay applications status" on public.relay_points for select to anon, authenticated using (status in ('candidature_ouverte','a_confirmer'));

-- Insertions publiques limitees aux formulaires.
create policy if not exists "Anyone can create catering request" on public.catering_requests for insert to anon, authenticated with check (true);
create policy if not exists "Anyone can create partner application" on public.partner_applications for insert to anon, authenticated with check (true);
create policy if not exists "Anyone can create lead" on public.leads for insert to anon, authenticated with check (true);
create policy if not exists "Anyone can create order draft" on public.orders for insert to anon, authenticated with check (true);
create policy if not exists "Anyone can create order items" on public.order_items for insert to anon, authenticated with check (true);

-- Memoire projet reservee aux utilisateurs authentifies.
create policy if not exists "Authenticated read project memory" on public.project_memory for select to authenticated using (true);
create policy if not exists "Authenticated insert project memory" on public.project_memory for insert to authenticated with check (true);
create policy if not exists "Authenticated update project memory" on public.project_memory for update to authenticated using (true) with check (true);

-- Seed minimal non fictif.
insert into public.vendors (business_name, business_type, description, zone, status, is_verified, source_note)
values
  ('An Tje Coco', 'traiteur', 'Traiteur local reference dans le projet DeliKreol.', 'Fort-de-France', 'a_confirmer', false, 'Donnees a confirmer avant publication complete'),
  ('Coco''s Food', 'traiteur', 'Cuisine de marche referencee dans le projet DeliKreol.', 'Riviere-Pilote', 'a_confirmer', false, 'Donnees a confirmer avant publication complete'),
  ('Saveurs d''Afrique', 'traiteur', 'Cuisine africaine referencee dans le projet DeliKreol.', 'Riviere-Salee', 'a_confirmer', false, 'Donnees a confirmer avant publication complete'),
  ('Les Delices de Ninice', 'traiteur', 'Traiteur/snacking reference dans le projet DeliKreol.', 'Dillon', 'a_confirmer', false, 'Donnees a confirmer avant publication complete'),
  ('Snack Save Peyia', 'snack', 'Nouveau snack local de Riviere-Pilote pres du Pont de Fer. Horaires, retrait et livraison a confirmer.', 'Riviere-Pilote', 'a_confirmer', false, 'Nouveau partenaire fourni par le proprietaire DeliKreol')
on conflict do nothing;

insert into public.project_memory (topic, content, source, confidence, status)
values
  ('contacts_officiels', 'WhatsApp principal DeliKreol : +596 696 65 35 89. Email principal : contact@delikreol.mq.', 'owner_instruction', 'confirmed', 'active'),
  ('points_relais', 'Reseau points relais en constitution. Ne pas afficher de faux points relais valides.', 'project_rule', 'confirmed', 'active'),
  ('livreurs', 'Ne pas afficher de faux livreurs. Utiliser candidatures ouvertes tant que le reseau n est pas valide.', 'project_rule', 'confirmed', 'active'),
  ('snack_save_peyia', 'Snack Save Peyia : Cote de porc 12 EUR, Filet de poulet 10 EUR, Crevettes grillees 14 EUR, accompagnements riz, lentilles, legumes pays, crudites. Horaires et livraison a confirmer.', 'owner_instruction', 'partially_confirmed', 'active')
on conflict do nothing;
