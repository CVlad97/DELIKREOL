-- DELIKREOL — Traiteurs + points relais fulfillment rules
-- Statut: préparée uniquement, ne pas appliquer en production sans validation humaine.
-- Objectif: ajouter les données minimales pour recalcul serveur, capacité relais et audit.
-- Rollback documenté en bas du fichier.

alter table if exists public.vendors
  add column if not exists zone_id text,
  add column if not exists direct_delivery_enabled boolean not null default true,
  add column if not exists scheduled_delivery_enabled boolean not null default false,
  add column if not exists pickup_enabled boolean not null default true,
  add column if not exists relay_delivery_enabled boolean not null default false,
  add column if not exists maximum_orders_per_slot integer,
  add column if not exists current_orders_per_slot integer default 0,
  add column if not exists hot_food_supported boolean not null default true,
  add column if not exists cold_food_supported boolean not null default true,
  add column if not exists frozen_food_supported boolean not null default false,
  add column if not exists minimum_order_amount numeric(10,2);

alter table if exists public.products
  add column if not exists storage_type text not null default 'hot'
    check (storage_type in ('hot', 'cold', 'frozen', 'dry')),
  add column if not exists maximum_holding_minutes integer;

alter table if exists public.relay_points
  add column if not exists relay_type text not null default 'commerce_partenaire'
    check (relay_type in ('commerce_partenaire', 'traiteur_point_relais', 'hub_logistique', 'consigne_refrigeree', 'point_retrait_temporaire')),
  add column if not exists vendor_id uuid references public.vendors(id),
  add column if not exists relay_status text not null default 'inactive'
    check (relay_status in ('active', 'inactive', 'temporarily_unavailable', 'full', 'maintenance')),
  add column if not exists zone_id text,
  add column if not exists pickup_slots jsonb not null default '[]'::jsonb,
  add column if not exists capacity_per_slot integer,
  add column if not exists current_capacity_usage integer not null default 0,
  add column if not exists accepts_hot_food boolean not null default false,
  add column if not exists accepts_cold_food boolean not null default false,
  add column if not exists accepts_frozen_food boolean not null default false,
  add column if not exists refrigerated_storage_available boolean not null default false,
  add column if not exists hot_holding_available boolean not null default false,
  add column if not exists frozen_storage_available boolean not null default false,
  add column if not exists maximum_holding_minutes integer,
  add column if not exists supported_vendor_ids uuid[],
  add column if not exists supported_zone_ids text[],
  add column if not exists active boolean not null default false;

alter table if exists public.orders
  add column if not exists fulfillment_mode text
    check (fulfillment_mode in ('livraison_directe', 'livraison_programmee', 'retrait_traiteur', 'point_relais')),
  add column if not exists fulfillment_plan_id text,
  add column if not exists fulfillment_plan_code text,
  add column if not exists fulfillment_plan_fingerprint text,
  add column if not exists fulfillment_plan_confirmed boolean not null default false,
  add column if not exists relay_point_id uuid references public.relay_points(id),
  add column if not exists relay_host_vendor_id uuid references public.vendors(id),
  add column if not exists relay_reservation_id uuid,
  add column if not exists customer_pickup_window jsonb,
  add column if not exists pickup_code_hash text,
  add column if not exists pickup_code_expires_at timestamptz,
  add column if not exists pickup_completed_at timestamptz;

create table if not exists public.relay_reservations (
  id uuid primary key default gen_random_uuid(),
  relay_point_id uuid not null references public.relay_points(id),
  order_id uuid references public.orders(id),
  plan_id text not null,
  slot_id text not null,
  fulfillment_fingerprint text not null,
  units_reserved integer not null check (units_reserved > 0),
  status text not null default 'held'
    check (status in ('held', 'confirmed', 'expired', 'cancelled')),
  expires_at timestamptz not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists relay_reservations_active_plan_unique
  on public.relay_reservations (relay_point_id, plan_id, slot_id)
  where status = 'held';

create index if not exists idx_relay_reservations_relay_slot_status
  on public.relay_reservations (relay_point_id, slot_id, status);

create index if not exists idx_relay_reservations_expires_at
  on public.relay_reservations (expires_at)
  where status = 'held';

create index if not exists idx_orders_fulfillment_relay
  on public.orders (fulfillment_mode, relay_point_id)
  where fulfillment_mode = 'point_relais';

create index if not exists idx_relay_points_vendor_id
  on public.relay_points (vendor_id)
  where vendor_id is not null;

alter table public.relay_reservations enable row level security;

drop policy if exists relay_reservations_admin_all on public.relay_reservations;
create policy relay_reservations_admin_all
  on public.relay_reservations for all
  to authenticated
  using (public.is_delikreol_admin())
  with check (public.is_delikreol_admin());

drop policy if exists relay_reservations_owner_select on public.relay_reservations;
create policy relay_reservations_owner_select
  on public.relay_reservations for select
  to authenticated
  using (created_by = (select auth.uid()) or public.is_delikreol_admin());

create or replace function public.expire_relay_reservations()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  expired_count integer;
begin
  update public.relay_reservations
  set status = 'expired', updated_at = now()
  where status = 'held'
    and expires_at < now();

  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;

revoke all on function public.expire_relay_reservations() from public;
grant execute on function public.expire_relay_reservations() to service_role;

-- Diagnostics pré-déploiement obligatoires:
-- select relay_point_id, slot_id, sum(units_reserved)
-- from public.relay_reservations
-- where status = 'held' and expires_at >= now()
-- group by relay_point_id, slot_id;
--
-- select id, name, status, relay_status, capacity, capacity_per_slot, active
-- from public.relay_points
-- order by created_at desc;

-- Rollback sans suppression de données:
-- 1. Désactiver les flags applicatifs côté serveur.
-- 2. Revenir au commit applicatif précédent.
-- 3. Ne supprimer les colonnes/tables qu'après export:
--    create table backup_relay_reservations_YYYYMMDD as select * from public.relay_reservations;
-- 4. Optionnel après validation:
--    drop function if exists public.expire_relay_reservations();
--    drop table if exists public.relay_reservations;
