-- DELIKREOL — Correctif P0 : supprimer la récursion RLS des commandes
-- Date : 2026-09-05
-- Le correctif remplace les policies historiques qui réévaluaient orders
-- depuis une policy orders/order_items. Les commandes d'un administrateur
-- passent par le helper SECURITY DEFINER ; un client ne voit que ses propres
-- commandes via customer_id ou son numéro de téléphone.

begin;

alter table if exists public.orders enable row level security;

drop policy if exists "orders_select" on public.orders;
drop policy if exists "admin_read_all_orders" on public.orders;
drop policy if exists "orders_admin_select" on public.orders;
drop policy if exists "orders_customer_select" on public.orders;

create policy "orders_admin_select"
  on public.orders
  for select
  to authenticated
  using (public.is_delikreol_admin());

create policy "orders_customer_select"
  on public.orders
  for select
  to authenticated
  using (
    (customer_id is not null and customer_id = (select auth.uid()))
    or (
      client_phone is not null
      and client_phone = coalesce(
        (select p.phone from public.profiles p where p.id = (select auth.uid()) limit 1),
        ''
      )
    )
  );

drop policy if exists "orders_update_payment" on public.orders;
create policy "orders_update_payment"
  on public.orders
  for update
  to service_role
  using (true)
  with check (true);

commit;
