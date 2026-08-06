-- DELIKREOL — Traiteurs + points relais fulfillment rules
-- Statut: migration préparée uniquement. Ne pas appliquer en production sans validation humaine.
-- Cette version est alignée sur le schéma Supabase observé le 2026-08-05.

-- ---------------------------------------------------------------------------
-- 1. Données métier manquantes uniquement
-- ---------------------------------------------------------------------------

alter table if exists public.vendors
  add column if not exists zone_id text,
  add column if not exists direct_delivery_enabled boolean not null default true,
  add column if not exists scheduled_delivery_enabled boolean not null default false,
  add column if not exists pickup_enabled boolean not null default true,
  add column if not exists relay_delivery_enabled boolean not null default false,
  add column if not exists maximum_orders_per_slot integer,
  add column if not exists hot_food_supported boolean not null default true,
  add column if not exists cold_food_supported boolean not null default true,
  add column if not exists frozen_food_supported boolean not null default false,
  add column if not exists minimum_order_amount numeric(10,2);

-- `vendors.capacity_per_slot` et `vendors.current_capacity_used` existent déjà.

alter table if exists public.products
  add column if not exists storage_type text not null default 'hot',
  add column if not exists maximum_holding_minutes integer;

alter table if exists public.relay_points
  add column if not exists relay_type text not null default 'commerce_partenaire',
  add column if not exists vendor_id uuid references public.vendors(id),
  add column if not exists zone_id text,
  add column if not exists pickup_slots jsonb not null default '[]'::jsonb,
  add column if not exists capacity_per_slot integer,
  add column if not exists accepts_hot_food boolean not null default false,
  add column if not exists accepts_cold_food boolean not null default false,
  add column if not exists accepts_frozen_food boolean not null default false,
  add column if not exists refrigerated_storage_available boolean not null default false,
  add column if not exists hot_holding_available boolean not null default false,
  add column if not exists frozen_storage_available boolean not null default false,
  add column if not exists maximum_holding_minutes integer,
  add column if not exists supported_vendor_ids uuid[],
  add column if not exists supported_zone_ids text[];

-- `relay_points.status`, `relay_points.is_active`, `relay_points.capacity`
-- et `relay_points.current_capacity_used` existent déjà et restent autoritaires.

alter table if exists public.orders
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

-- `orders.fulfillment_mode` existe déjà. La contrainte est ajoutée séparément,
-- afin qu'elle soit créée même lorsque la colonne préexiste.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_fulfillment_mode_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_fulfillment_mode_check
      check (
        fulfillment_mode is null or fulfillment_mode in (
          'livraison_directe',
          'livraison_programmee',
          'retrait_traiteur',
          'point_relais'
        )
      ) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_storage_type_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_storage_type_check
      check (storage_type in ('hot', 'cold', 'frozen', 'dry')) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'relay_points_relay_type_check'
      and conrelid = 'public.relay_points'::regclass
  ) then
    alter table public.relay_points
      add constraint relay_points_relay_type_check
      check (relay_type in (
        'commerce_partenaire',
        'traiteur_point_relais',
        'hub_logistique',
        'consigne_refrigeree',
        'point_retrait_temporaire'
      )) not valid;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. Réservations relais
-- ---------------------------------------------------------------------------

create table if not exists public.relay_reservations (
  id uuid primary key default gen_random_uuid(),
  relay_point_id uuid not null references public.relay_points(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  plan_id text not null,
  slot_id text not null,
  fulfillment_fingerprint text not null,
  units_reserved integer not null check (units_reserved > 0),
  status text not null default 'held'
    check (status in ('held', 'confirmed', 'expired', 'cancelled')),
  expires_at timestamptz not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Une même proposition ne peut consommer la capacité deux fois tant qu'elle
-- est active, qu'elle soit encore tenue ou déjà confirmée.
create unique index if not exists relay_reservations_active_plan_unique
  on public.relay_reservations (relay_point_id, plan_id, slot_id)
  where status in ('held', 'confirmed');

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

-- FK différée jusqu'à la création de relay_reservations.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_relay_reservation_id_fkey'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_relay_reservation_id_fkey
      foreign key (relay_reservation_id)
      references public.relay_reservations(id)
      on delete set null
      not valid;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 3. RLS : lecture propriétaire ou admin, écritures applicatives serveur
-- ---------------------------------------------------------------------------

alter table public.relay_reservations enable row level security;

-- Aucun INSERT direct n'est accordé aux utilisateurs authentifiés.
-- Les réservations doivent être créées atomiquement par une fonction serveur
-- utilisant le rôle serveur. `service_role` contourne RLS par conception.

drop policy if exists relay_reservations_select_own_or_admin on public.relay_reservations;
create policy relay_reservations_select_own_or_admin
  on public.relay_reservations
  for select
  to authenticated
  using (
    created_by = (select auth.uid())
    or private.is_delikreol_admin()
  );

drop policy if exists relay_reservations_update_admin on public.relay_reservations;
create policy relay_reservations_update_admin
  on public.relay_reservations
  for update
  to authenticated
  using (private.is_delikreol_admin())
  with check (private.is_delikreol_admin());

drop policy if exists relay_reservations_delete_admin on public.relay_reservations;
create policy relay_reservations_delete_admin
  on public.relay_reservations
  for delete
  to authenticated
  using (private.is_delikreol_admin());

-- ---------------------------------------------------------------------------
-- 4. Expiration contrôlée
-- ---------------------------------------------------------------------------

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
revoke all on function public.expire_relay_reservations() from anon;
revoke all on function public.expire_relay_reservations() from authenticated;
grant execute on function public.expire_relay_reservations() to service_role;

-- ---------------------------------------------------------------------------
-- 5. Diagnostics obligatoires avant application
-- ---------------------------------------------------------------------------

-- Valeurs existantes incompatibles avec la future contrainte :
-- select fulfillment_mode, count(*)
-- from public.orders
-- where fulfillment_mode is not null
--   and fulfillment_mode not in (
--     'livraison_directe','livraison_programmee','retrait_traiteur','point_relais'
--   )
-- group by fulfillment_mode;
--
-- Statut des relais :
-- select id, name, status, is_active, capacity, capacity_per_slot,
--        current_capacity_used
-- from public.relay_points
-- order by created_at desc;
--
-- Réservations actives par créneau :
-- select relay_point_id, slot_id, sum(units_reserved)
-- from public.relay_reservations
-- where status in ('held','confirmed')
--   and (status = 'confirmed' or expires_at >= now())
-- group by relay_point_id, slot_id;
--
-- Après correction éventuelle des données :
-- alter table public.orders validate constraint orders_fulfillment_mode_check;
-- alter table public.products validate constraint products_storage_type_check;
-- alter table public.relay_points validate constraint relay_points_relay_type_check;
-- alter table public.orders validate constraint orders_relay_reservation_id_fkey;

-- ---------------------------------------------------------------------------
-- 6. Rollback sans suppression automatique de données
-- ---------------------------------------------------------------------------

-- 1. Désactiver les flags applicatifs côté serveur.
-- 2. Revenir au commit applicatif précédent.
-- 3. Exporter relay_reservations avant toute suppression éventuelle.
-- 4. Ne supprimer table, colonnes, contraintes ou fonction qu'après validation.
