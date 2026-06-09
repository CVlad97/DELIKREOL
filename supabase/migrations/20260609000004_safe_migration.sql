-- DELIKREOL — Safe Migration v2 (idempotent, add-only)
-- Project: boihlgodmclljtckhmgz
--
-- Ne recrée PAS les tables existantes (IF NOT EXISTS).
-- N'ajoute QUE les colonnes manquantes (ADD COLUMN IF NOT EXISTS).
-- Ne duplique PAS les données (ON CONFLICT DO NOTHING).
-- Utilise les noms de colonnes de l'ancien schéma si déjà existant.

-- ============================================================
-- 1. NOUVELLES TABLES (uniquement si elles n'existent pas)
-- ============================================================

-- Catering Requests (absente de l'ancien schema)
create table if not exists catering_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  email text,
  event_date text,
  commune text,
  guests integer,
  budget text,
  event_type text,
  message text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Driver Applications (absente de l'ancien schema)
create table if not exists driver_applications (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  email text,
  commune text,
  transport_mode text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Relay Point Applications (absente de l'ancien schema)
create table if not exists relay_point_applications (
  id uuid primary key default gen_random_uuid(),
  place_name text,
  owner_name text,
  phone text not null,
  email text,
  commune text not null,
  address text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Delivery Rules (absente de l'ancien schema)
create table if not exists delivery_rules (
  id uuid primary key default gen_random_uuid(),
  commune text not null unique,
  min_order_amount numeric(10,2) default 0,
  status text default 'active',
  message text,
  created_at timestamptz default now()
);

-- Leads (absente de l'ancien schema)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  source text,
  name text,
  phone text,
  email text,
  status text default 'new',
  created_at timestamptz default now()
);

-- Media Assets (absente de l'ancien schema)
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid,
  bucket text,
  path text not null,
  type text,
  status text default 'à confirmer',
  alt_text text,
  created_at timestamptz default now()
);

-- Admin Settings (absente de l'ancien schema)
create table if not exists admin_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Project Memory (absente de l'ancien schema)
create table if not exists project_memory (
  id uuid primary key default gen_random_uuid(),
  project text default 'DELIKREOL',
  section text,
  title text not null,
  content text,
  created_at timestamptz default now()
);

-- ============================================================
-- 2. COLONNES MANQUANTES DANS TABLES EXISTANTES
-- ============================================================
do $$ begin
  -- profiles: ajouter role si user_type existe déjà
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='role') then
    alter table profiles add column role text default 'customer';
  end if;

  -- vendors: ajouter champs DeliKreol
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='commune') then
    alter table vendors add column commune text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='story') then
    alter table vendors add column story text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='promise') then
    alter table vendors add column promise text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='specialty') then
    alter table vendors add column specialty text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='highlights') then
    alter table vendors add column highlights jsonb default '[]'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='status') then
    alter table vendors add column status text default 'public à vérifier';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='photo_status') then
    alter table vendors add column photo_status text default 'à confirmer';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='public_display_status') then
    alter table vendors add column public_display_status text default 'public à vérifier';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='hero_image') then
    alter table vendors add column hero_image text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='portrait_image') then
    alter table vendors add column portrait_image text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='gallery_images') then
    alter table vendors add column gallery_images jsonb default '[]'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='gradient') then
    alter table vendors add column gradient text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='accent') then
    alter table vendors add column accent text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='contact_confirmed') then
    alter table vendors add column contact_confirmed boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='direct_contact_allowed') then
    alter table vendors add column direct_contact_allowed boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='planifiable') then
    alter table vendors add column planifiable boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='vendors' and column_name='enterprise') then
    alter table vendors add column enterprise boolean default false;
  end if;

  -- products: ajouter champs
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='photo_status') then
    alter table products add column photo_status text default 'à confirmer';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='is_public') then
    alter table products add column is_public boolean default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='sides') then
    alter table products add column sides jsonb default '[]'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='ingredients') then
    alter table products add column ingredients text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='allergens') then
    alter table products add column allergens text;
  end if;
end $$;

-- ============================================================
-- 3. INDEX
-- ============================================================
create index if not exists idx_products_vendor_id on products(vendor_id);
create index if not exists idx_orders_phone on orders(customer_phone);
create index if not exists idx_vendors_status on vendors(status);
create index if not exists idx_catering_requests_phone on catering_requests(phone);

-- ============================================================
-- 4. RLS (politiques uniquement pour les NOUVELLES tables)
-- ============================================================
alter table if exists catering_requests enable row level security;
alter table if exists driver_applications enable row level security;
alter table if exists relay_point_applications enable row level security;
alter table if exists delivery_rules enable row level security;
alter table if exists leads enable row level security;
alter table if exists media_assets enable row level security;
alter table if exists admin_settings enable row level security;
alter table if exists project_memory enable row level security;

-- Politiques nouvelles (DROP + CREATE pour éviter doublons)
do $$ begin
  drop policy if exists "Anyone can insert catering" on catering_requests;
  drop policy if exists "Anyone can submit driver" on driver_applications;
  drop policy if exists "Anyone can submit relay" on relay_point_applications;
  drop policy if exists "Delivery rules visible" on delivery_rules;
  drop policy if exists "Anyone can insert leads" on leads;
  drop policy if exists "Admin only settings" on admin_settings;
  drop policy if exists "Admin only memory" on project_memory;
end $$;

create policy "Anyone can insert catering" on catering_requests for insert with check (true);
create policy "Anyone can submit driver" on driver_applications for insert with check (true);
create policy "Anyone can submit relay" on relay_point_applications for insert with check (true);
create policy "Delivery rules visible" on delivery_rules for select using (true);
create policy "Anyone can insert leads" on leads for insert with check (true);
create policy "Admin only settings" on admin_settings for all using (is_admin());
create policy "Admin only memory" on project_memory for all using (is_admin());

-- ============================================================
-- 5. SEED IDEMPOTENT
-- ============================================================
insert into delivery_rules (commune, min_order_amount, status, message)
values ('Martinique', 40, 'active',
  'Livraison éloignée possible à partir de 40 € de commande, selon validation du prestataire et disponibilité DeliKreol.'
) on conflict (commune) do nothing;

insert into admin_settings (key, value) values
  ('whatsapp_number', '"596696653589"'),
  ('contact_email', '"contact@delikreol.mq"'),
  ('delivery_threshold', '40'),
  ('site_name', '"DeliKreol"'),
  ('order_mode', '"whatsapp_first"'),
  ('paiement_actif', 'false')
on conflict (key) do nothing;