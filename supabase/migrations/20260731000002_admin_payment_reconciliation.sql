-- DELIKREOL — rapprochement admin des paiements manuels.
-- Safe/non destructif : aucune suppression de commande, aucun montant historique modifié.

alter table if exists public.orders add column if not exists payment_provider text;
alter table if exists public.orders add column if not exists payment_status text default 'pending';
alter table if exists public.orders add column if not exists payment_reference text;
alter table if exists public.orders add column if not exists payment_external_id text;
alter table if exists public.orders add column if not exists payment_amount numeric;
alter table if exists public.orders add column if not exists payment_currency text default 'EUR';
alter table if exists public.orders add column if not exists payment_proof_url text;
alter table if exists public.orders add column if not exists payment_verified_at timestamptz;
alter table if exists public.orders add column if not exists payment_verified_by uuid;
alter table if exists public.orders add column if not exists payment_review_comment text;
alter table if exists public.orders add column if not exists updated_at timestamptz default now();

create table if not exists public.payment_audit_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  admin_user_id uuid,
  old_status text,
  new_status text not null,
  payment_provider text,
  payment_reference text,
  payment_external_id text,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.payment_audit_events enable row level security;

drop policy if exists "payment_audit_events_admin_all" on public.payment_audit_events;
create policy "payment_audit_events_admin_all"
  on public.payment_audit_events
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists idx_payment_audit_events_order_id on public.payment_audit_events(order_id);
create index if not exists idx_payment_audit_events_admin_user_id on public.payment_audit_events(admin_user_id);

create or replace function public.admin_review_payment(
  target_order_id uuid,
  target_status text,
  target_comment text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders%rowtype;
  updated_order public.orders%rowtype;
begin
  if not public.is_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;

  if target_status not in ('pending','proof_submitted','under_review','paid','failed','refunded','cancelled') then
    raise exception 'invalid payment status' using errcode = '22023';
  end if;

  select * into current_order from public.orders where id = target_order_id for update;
  if not found then
    raise exception 'order not found' using errcode = '02000';
  end if;

  update public.orders
  set payment_status = target_status,
      payment_verified_at = case when target_status = 'paid' then now() else payment_verified_at end,
      payment_verified_by = case when target_status = 'paid' then (select auth.uid()) else payment_verified_by end,
      payment_review_comment = target_comment,
      updated_at = now()
  where id = target_order_id
  returning * into updated_order;

  insert into public.payment_audit_events(
    order_id,
    admin_user_id,
    old_status,
    new_status,
    payment_provider,
    payment_reference,
    payment_external_id,
    comment
  ) values (
    target_order_id,
    (select auth.uid()),
    current_order.payment_status,
    target_status,
    updated_order.payment_provider,
    updated_order.payment_reference,
    updated_order.payment_external_id,
    target_comment
  );

  return updated_order;
end;
$$;

revoke all on function public.admin_review_payment(uuid, text, text) from public, anon;
grant execute on function public.admin_review_payment(uuid, text, text) to authenticated;

-- Rollback manuel :
-- drop function if exists public.admin_review_payment(uuid, text, text);
-- drop table if exists public.payment_audit_events;
-- Les colonnes orders ajoutées sont conservées par défaut pour préserver l'audit historique.
