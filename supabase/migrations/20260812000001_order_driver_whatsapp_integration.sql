-- DELIKREOL — intégration commande -> mission livreur -> journal WhatsApp
-- Statut : migration préparée uniquement. Ne pas appliquer en production sans validation humaine.
--
-- Diagnostics obligatoires avant application :
-- select order_id, count(*) from public.deliveries group by order_id having count(*) > 1;
-- select user_id, count(*) from public.drivers where user_id is not null group by user_id having count(*) > 1;
--
-- Rollback sans suppression de données :
-- drop policy if exists "drivers_select_own_profile" on public.drivers;
-- drop policy if exists "drivers_update_own_availability" on public.drivers;
-- drop policy if exists "drivers_select_available_deliveries" on public.deliveries;
-- drop policy if exists "drivers_update_assignable_deliveries" on public.deliveries;
-- drop index if exists public.idx_deliveries_order_unique;
-- drop index if exists public.idx_drivers_user_id;
-- drop index if exists public.idx_deliveries_status_driver;
-- Les colonnes/tables sont conservées pour éviter toute perte de données.

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  driver_id uuid references public.drivers(id),
  status text not null default 'pending' check (status in ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  pickup_address text not null default '',
  pickup_latitude numeric(10,7),
  pickup_longitude numeric(10,7),
  driver_fee numeric(10,2) not null default 0,
  estimated_time integer,
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table if exists public.drivers add column if not exists user_id uuid references auth.users(id);
alter table if exists public.drivers add column if not exists is_available boolean not null default false;
alter table if exists public.drivers add column if not exists current_latitude numeric(10,7);
alter table if exists public.drivers add column if not exists current_longitude numeric(10,7);
alter table if exists public.drivers add column if not exists rating numeric(3,2) not null default 5;
alter table if exists public.drivers add column if not exists total_deliveries integer not null default 0;

alter table if exists public.deliveries add column if not exists order_id uuid references public.orders(id) on delete cascade;
alter table if exists public.deliveries add column if not exists driver_id uuid references public.drivers(id);
alter table if exists public.deliveries add column if not exists status text not null default 'pending';
alter table if exists public.deliveries add column if not exists pickup_address text not null default '';
alter table if exists public.deliveries add column if not exists pickup_latitude numeric(10,7);
alter table if exists public.deliveries add column if not exists pickup_longitude numeric(10,7);
alter table if exists public.deliveries add column if not exists driver_fee numeric(10,2) not null default 0;
alter table if exists public.deliveries add column if not exists estimated_time integer;
alter table if exists public.deliveries add column if not exists assigned_at timestamptz;
alter table if exists public.deliveries add column if not exists picked_up_at timestamptz;
alter table if exists public.deliveries add column if not exists delivered_at timestamptz;
alter table if exists public.deliveries add column if not exists created_at timestamptz not null default now();

alter table public.deliveries enable row level security;
alter table public.drivers enable row level security;

create unique index if not exists idx_deliveries_order_unique
  on public.deliveries(order_id)
  where order_id is not null;

create index if not exists idx_drivers_user_id on public.drivers(user_id);
create index if not exists idx_deliveries_status_driver on public.deliveries(status, driver_id);

drop policy if exists "drivers_select_own_profile" on public.drivers;
create policy "drivers_select_own_profile"
  on public.drivers
  for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "drivers_update_own_availability" on public.drivers;
create policy "drivers_update_own_availability"
  on public.drivers
  for update
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "drivers_select_available_deliveries" on public.deliveries;
create policy "drivers_select_available_deliveries"
  on public.deliveries
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.drivers d
      where d.user_id = (select auth.uid())
        and (
          public.deliveries.driver_id = d.id
          or (public.deliveries.driver_id is null and public.deliveries.status = 'pending')
        )
    )
  );

drop policy if exists "drivers_update_assignable_deliveries" on public.deliveries;
create policy "drivers_update_assignable_deliveries"
  on public.deliveries
  for update
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.drivers d
      where d.user_id = (select auth.uid())
        and (
          public.deliveries.driver_id = d.id
          or (public.deliveries.driver_id is null and public.deliveries.status = 'pending')
        )
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.drivers d
      where d.user_id = (select auth.uid())
        and public.deliveries.driver_id = d.id
    )
  );
