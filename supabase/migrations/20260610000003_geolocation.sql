-- DELIKREOL — Géolocalisation + PostGIS
-- Ajout des colonnes lat/lng aux acteurs existants
-- Nécessite : create extension if not exists postgis;

-- ============================================================
-- VENDORS (traiteurs, partenaires)
-- ============================================================
alter table if exists vendors add column if not exists latitude numeric(10,7);
alter table if exists vendors add column if not exists longitude numeric(10,7);
alter table if exists vendors add column if not exists service_radius_km integer default 10;
alter table if exists vendors add column if not exists preparation_delay_min integer default 20;
alter table if exists vendors add column if not exists pickup_enabled boolean default true;
alter table if exists vendors add column if not exists delivery_enabled boolean default false;

-- ============================================================
-- RELAY POINTS
-- ============================================================
alter table if exists relay_points add column if not exists latitude numeric(10,7);
alter table if exists relay_points add column if not exists longitude numeric(10,7);
alter table if exists relay_points add column if not exists opening_hours jsonb default '[]'::jsonb;

-- ============================================================
-- DRIVERS
-- ============================================================
alter table if exists drivers add column if not exists latitude numeric(10,7);
alter table if exists drivers add column if not exists longitude numeric(10,7);
alter table if exists drivers add column if not exists current_mission_id uuid;
alter table if exists drivers add column if not exists available_from timestamptz;
alter table if exists drivers add column if not exists max_radius_km integer default 15;
alter table if exists drivers add column if not exists status text default 'indisponible' 
  check (status in ('disponible', 'en livraison', 'bientôt disponible', 'hors zone', 'indisponible', 'pause', 'complet'));

-- ============================================================
-- DELIVERY MISSIONS
-- ============================================================
alter table if exists delivery_missions add column if not exists pickup_latitude numeric(10,7);
alter table if exists delivery_missions add column if not exists pickup_longitude numeric(10,7);
alter table if exists delivery_missions add column if not exists drop_latitude numeric(10,7);
alter table if exists delivery_missions add column if not exists drop_longitude numeric(10,7);
alter table if exists delivery_missions add column if not exists estimated_pickup_at timestamptz;
alter table if exists delivery_missions add column if not exists estimated_delivery_at timestamptz;
alter table if exists delivery_missions add column if not exists actual_pickup_at timestamptz;
alter table if exists delivery_missions add column if not exists actual_delivery_at timestamptz;

-- ============================================================
-- INDEX SPATIAL (PostGIS requis pour avancé)
-- ============================================================
-- create index if not exists idx_vendors_location on vendors using gist (st_makepoint(longitude, latitude)::geography) where latitude is not null;
-- create index if not exists idx_relay_points_location on relay_points using gist (st_makepoint(longitude, latitude)::geography) where latitude is not null;
-- create index if not exists idx_drivers_location on drivers using gist (st_makepoint(longitude, latitude)::geography) where latitude is not null;

-- Index classiques
create index if not exists idx_vendors_commune on vendors(commune);
create index if not exists idx_relay_points_commune on relay_points(commune);
create index if not exists idx_drivers_status on drivers(status);

-- ============================================================
-- ORDER EVENTS (traçabilité)
-- ============================================================
create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  event_type text not null,
  message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table order_events enable row level security;
drop policy if exists "Admin only order events" on order_events;
create policy "Admin only order events" on order_events for all using (is_admin());

create index if not exists idx_order_events_order_id on order_events(order_id);