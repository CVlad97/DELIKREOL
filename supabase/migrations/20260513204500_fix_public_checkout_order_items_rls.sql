/*
  Fix public checkout: allow anon inserts into order_items for orders created
  via the public checkout intake (orders.source='public_checkout').

  Observed in production: anon can insert into orders, but order_items insert
  is rejected by RLS (42501).
*/

drop policy if exists order_items_insert_public_checkout on public.order_items;

create policy order_items_insert_public_checkout
  on public.order_items
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.source = 'public_checkout'
        and orders.status = 'pending'
        and orders.payment_status = 'pending'
        and orders.delivery_status = 'pending'
        and orders.customer_id is null
        and orders.customer_name is not null
        and orders.customer_phone is not null
    )
  );

