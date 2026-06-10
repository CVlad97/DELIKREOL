-- DELIKREOL — Points relais
-- Commerçants prestataires indépendants

-- Table points relais
create table if not exists relay_points (
  id uuid primary key default gen_random_uuid(),
  place_name text,
  owner_name text,
  phone text,
  email text,
  commune text not null,
  address text,
  horaires jsonb default '[]'::jsonb,
  capacity integer default 10,
  photos jsonb default '[]'::jsonb,
  insurance_status text default 'à vérifier',
  status text default 'candidat' check (status in ('candidat', 'documents reçus', 'validé', 'actif', 'suspendu')),
  contrat_signe boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table colis déposés
create table if not exists relay_packages (
  id uuid primary key default gen_random_uuid(),
  relay_point_id uuid references relay_points(id),
  order_id text,
  status text default 'en attente' check (status in ('en attente', 'déposé', 'retiré', 'retourné')),
  deposited_at timestamptz,
  picked_up_at timestamptz,
  commission_relais numeric(10,2),
  client_fee numeric(10,2),
  delikreol_fee numeric(10,2),
  created_at timestamptz default now()
);

-- RLS
alter table relay_points enable row level security;
alter table relay_packages enable row level security;

drop policy if exists "Public relay points visible" on relay_points;
create policy "Public relay points visible" on relay_points for select using (status = 'actif' or is_admin());

drop policy if exists "Admin only relay" on relay_points;
create policy "Admin only relay" on relay_points for all using (is_admin());

drop policy if exists "Admin only packages" on relay_packages;
create policy "Admin only packages" on relay_packages for all using (is_admin());

-- Index
create index if not exists idx_relay_points_commune on relay_points(commune);
create index if not exists idx_relay_points_status on relay_points(status);
create index if not exists idx_relay_packages_order_id on relay_packages(order_id);