-- DELIKREOL — PostGIS + Géolocalisation
-- create extension if not exists postgis with schema extensions;

-- ============================================================
-- COLONNES GÉOGRAPHIQUES
-- ============================================================
alter table if exists vendors add column if not exists location geography(Point, 4326);
update vendors set location = st_makepoint(longitude, latitude)::geography where latitude is not null and longitude is not null;
create index if not exists idx_vendors_location on vendors using gist (location) where location is not null;

alter table if exists relay_points add column if not exists location geography(Point, 4326);
update relay_points set location = st_makepoint(longitude, latitude)::geography where latitude is not null and longitude is not null;
create index if not exists idx_relay_points_location on relay_points using gist (location) where location is not null;

alter table if exists drivers add column if not exists current_location geography(Point, 4326);
create index if not exists idx_drivers_location on drivers using gist (current_location) where current_location is not null;

alter table if exists orders add column if not exists customer_location geography(Point, 4326);

-- ============================================================
-- COLONNES QUALITÉ
-- ============================================================
alter table if exists vendors add column if not exists quality_score numeric(3,1) default 0;
alter table if exists vendors add column if not exists speed_score numeric(3,1) default 0;
alter table if exists vendors add column if not exists reliability_score numeric(3,1) default 0;
alter table if exists vendors add column if not exists capacity_per_slot integer default 10;
alter table if exists vendors add column if not exists current_capacity_used integer default 0;
alter table if exists vendors add column if not exists partner_status text default 'à valider' 
  check (partner_status in ('ouvert', 'occupé', 'complet', 'temporairement indisponible', 'fermé', 'à valider'));

alter table if exists drivers add column if not exists reliability_score numeric(3,1) default 0;
alter table if exists drivers add column if not exists speed_score numeric(3,1) default 0;

alter table if exists orders add column if not exists customer_commune text;
alter table if exists orders add column if not exists customer_latitude numeric(10,7);
alter table if exists orders add column if not exists customer_longitude numeric(10,7);
alter table if exists orders add column if not exists requested_delivery_at timestamptz;
alter table if exists orders add column if not exists estimated_ready_at timestamptz;
alter table if exists orders add column if not exists estimated_delivery_at timestamptz;
alter table if exists orders add column if not exists fulfillment_mode text;
alter table if exists orders add column if not exists distance_km numeric(5,2);
alter table if exists orders add column if not exists eta_min integer;
alter table if exists orders add column if not exists eta_max integer;
alter table if exists orders add column if not exists reliability_level text default 'to_confirm';

-- ============================================================
-- RPC — RECHERCHE PAR PROXIMITÉ
-- ============================================================
-- create or replace function nearby_partners(lat float, lng float, radius_km float)
-- returns table(id uuid, name text, distance_km float, eta_min int)
-- language sql stable as $$
--   select v.id, v.name,
--     st_distance(v.location, st_makepoint(lng, lat)::geography) / 1000 as distance_km,
--     15 + (st_distance(v.location, st_makepoint(lng, lat)::geography) / 1000)::int as eta_min
--   from vendors v
--   where v.location is not null
--     and v.partner_status in ('ouvert', 'occupé')
--     and st_dwithin(v.location, st_makepoint(lng, lat)::geography, radius_km * 1000)
--   order by distance_km;
-- $$;