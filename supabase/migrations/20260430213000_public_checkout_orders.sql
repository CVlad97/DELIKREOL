/*
  Public checkout intake.

  The public site can create an order and its order_items without using WhatsApp as
  the main command channel. Public clients may insert only source='public_checkout'
  orders with pending operational/payment status. Reading and admin processing stay
  governed by existing authenticated policies.
*/

alter table public.orders
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists delivery_status text not null default 'pending',
  add column if not exists source text not null default 'lite';

alter table public.order_items
  add column if not exists product_name text,
  add column if not exists vendor_name text;

drop policy if exists orders_insert_public_checkout on public.orders;
create policy orders_insert_public_checkout
  on public.orders
  for insert
  to anon, authenticated
  with check (
    source = 'public_checkout'
    and status = 'pending'
    and payment_status = 'pending'
    and delivery_status = 'pending'
    and customer_id is null
    and customer_name is not null
    and customer_phone is not null
  );

drop policy if exists order_items_insert_public_checkout on public.order_items;
create policy order_items_insert_public_checkout
  on public.order_items
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.source = 'public_checkout'
      and orders.status = 'pending'
    )
  );
