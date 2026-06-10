-- DELIKREOL — Livreurs et missions de livraison
-- Phase pilote : prestataires indépendants micro-entrepreneurs

-- Table livreurs
create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  siret text,
  rib text,
  vehicle_type text,
  insurance_status text default 'à vérifier',
  zones jsonb default '[]'::jsonb,
  disponibilites text,
  status text default 'candidat' check (status in ('candidat', 'documents reçus', 'validé', 'actif', 'suspendu')),
  contrat_signe boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table missions de livraison
create table if not exists delivery_missions (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  driver_id uuid references drivers(id),
  status text default 'proposée' check (status in ('proposée', 'acceptée', 'retrait', 'livraison', 'livrée', 'annulée')),
  pickup_partner text,
  pickup_address text,
  delivery_address text,
  customer_phone text,
  customer_name text,
  distance_km numeric(5,2),
  courier_payout numeric(10,2),
  delikreol_logistic_fee numeric(10,2) default 0.50,
  client_fee numeric(10,2),
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now()
);

-- RLS
alter table drivers enable row level security;
alter table delivery_missions enable row level security;

-- Admin only pour drivers
drop policy if exists "Admin only drivers" on drivers;
create policy "Admin only drivers" on drivers for all using (is_admin());

-- Admin only pour missions
drop policy if exists "Admin only missions" on delivery_missions;
create policy "Admin only missions" on delivery_missions for all using (is_admin());

-- Index
create index if not exists idx_delivery_missions_order_id on delivery_missions(order_id);
create index if not exists idx_delivery_missions_driver_id on delivery_missions(driver_id);
create index if not exists idx_delivery_missions_status on delivery_missions(status);