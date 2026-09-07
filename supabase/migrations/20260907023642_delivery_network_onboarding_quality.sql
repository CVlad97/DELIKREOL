-- DELIKREOL — réseau livreurs/points relais et qualité de service.
-- Additif et idempotent; ne crée ni livreur actif ni paiement.

alter table if exists public.driver_applications
  add column if not exists siret text,
  add column if not exists identity_document_ready boolean not null default false,
  add column if not exists professional_insurance_ready boolean not null default false,
  add column if not exists vehicle_insurance_ready boolean not null default false,
  add column if not exists driving_licence_ready boolean not null default false,
  add column if not exists insulated_equipment boolean not null default false,
  add column if not exists smartphone_gps boolean not null default false,
  add column if not exists accepts_independent_status boolean not null default false,
  add column if not exists accepts_service_charter boolean not null default false,
  add column if not exists consent_at timestamptz;

alter table if exists public.drivers
  add column if not exists is_available boolean not null default false,
  add column if not exists current_latitude numeric(10,7),
  add column if not exists current_longitude numeric(10,7),
  add column if not exists rating numeric(3,2) not null default 5.00,
  add column if not exists total_deliveries integer not null default 0;

alter table if exists public.relay_point_applications
  add column if not exists business_name text,
  add column if not exists manager_name text,
  add column if not exists whatsapp text,
  add column if not exists opening_hours text,
  add column if not exists capacity text,
  add column if not exists admin_notes text,
  add column if not exists siret text,
  add column if not exists identity_document_ready boolean not null default false,
  add column if not exists professional_insurance_ready boolean not null default false,
  add column if not exists food_hygiene_ready boolean not null default false,
  add column if not exists secure_storage boolean not null default false,
  add column if not exists cold_storage boolean not null default false,
  add column if not exists pmr_accessible boolean not null default false,
  add column if not exists accepts_service_charter boolean not null default false,
  add column if not exists consent_at timestamptz;

create table if not exists public.delivery_quality_events (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid references public.deliveries(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  event_type text not null check (event_type in ('late_pickup','late_delivery','damaged_order','temperature_issue','missing_item','customer_absent','address_issue','other')),
  severity text not null default 'minor' check (severity in ('minor','major','critical')),
  description text,
  resolution text,
  resolved_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.delivery_quality_events enable row level security;
drop policy if exists delivery_quality_admin_all on public.delivery_quality_events;
create policy delivery_quality_admin_all on public.delivery_quality_events for all to authenticated
  using (private.is_delikreol_admin()) with check (private.is_delikreol_admin());
create index if not exists idx_delivery_quality_delivery on public.delivery_quality_events(delivery_id);
create index if not exists idx_delivery_quality_driver_created on public.delivery_quality_events(driver_id, created_at desc);

create or replace function public.accept_delivery_mission(p_delivery_id uuid)
returns public.deliveries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_driver public.drivers;
  v_delivery public.deliveries;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into v_driver from public.drivers
  where user_id = (select auth.uid()) and is_active = true and status = 'actif' and is_available = true
  limit 1;
  if v_driver.id is null then raise exception 'Livreur actif et disponible requis'; end if;

  update public.deliveries
  set driver_id=v_driver.id, status='assigned', assigned_at=now()
  where id=p_delivery_id and status='pending' and driver_id is null
  returning * into v_delivery;
  if v_delivery.id is null then raise exception 'Mission indisponible ou deja acceptee'; end if;
  return v_delivery;
end;
$$;

revoke execute on function public.accept_delivery_mission(uuid) from public, anon;
grant execute on function public.accept_delivery_mission(uuid) to authenticated;
