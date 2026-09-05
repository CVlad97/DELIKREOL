-- DELIKREOL — Correctif P0 complémentaire : accès vendeur aux commandes
-- via une fonction SECURITY DEFINER afin d'éviter la récursion orders -> order_items -> orders.

begin;

create schema if not exists private;

create or replace function private.vendor_order_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select oi.order_id
  from public.order_items oi
  join public.vendors v on v.id = oi.vendor_id
  where v.user_id = (select auth.uid())
$$;

revoke execute on function private.vendor_order_ids() from public;
grant usage on schema private to authenticated;
grant execute on function private.vendor_order_ids() to authenticated;

drop policy if exists "orders_select_vendor_related" on public.orders;

create policy "orders_select_vendor_related"
  on public.orders
  for select
  to authenticated
  using (id in (select private.vendor_order_ids()));

commit;
