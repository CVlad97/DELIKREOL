/*
  Fix public checkout order_items insert.

  Problem:
  - order_items_insert_public_checkout policy used a subquery on public.orders.
  - anon has no SELECT policy on public.orders, so the EXISTS subquery is filtered by RLS -> false,
    causing INSERT to be rejected even though the order row exists.

  Solution:
  - Create a SECURITY DEFINER helper that checks the order row without being blocked by RLS.
  - Use it inside the order_items INSERT policy.
*/

create or replace function public.public_checkout_order_can_accept_items(target_order_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders
    where orders.id = target_order_id
      and orders.source = 'public_checkout'
      and orders.status = 'pending'
      and orders.payment_status = 'pending'
      and orders.delivery_status = 'pending'
      and orders.customer_id is null
      and orders.customer_name is not null
      and orders.customer_phone is not null
  );
$$;

revoke all on function public.public_checkout_order_can_accept_items(uuid) from public;
grant execute on function public.public_checkout_order_can_accept_items(uuid) to anon, authenticated;

drop policy if exists order_items_insert_public_checkout on public.order_items;
create policy order_items_insert_public_checkout
  on public.order_items
  for insert
  to anon, authenticated
  with check (
    public.public_checkout_order_can_accept_items(order_items.order_id)
  );

