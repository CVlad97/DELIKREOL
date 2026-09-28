-- Secure vendor order lifecycle for the launch pilot.
-- Vendors may only act on orders containing their own vendor items.
create or replace function public.vendor_transition_order(
  target_order_id uuid,
  target_status text,
  target_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  current_status text;
  current_order_number text;
  owns_order boolean := false;
  clean_reason text := left(trim(coalesce(target_reason, '')), 500);
  updated_order public.orders%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select o.status, o.order_number,
    exists (
      select 1 from public.order_items oi
      join public.vendors v on v.id = oi.vendor_id
      where oi.order_id = o.id and v.user_id = actor_id
        and v.is_active = true and v.status = 'verified'
    )
  into current_status, current_order_number, owns_order
  from public.orders o where o.id = target_order_id
  for update;

  if not found then raise exception 'Order not found' using errcode = 'P0002'; end if;
  if not owns_order then raise exception 'Vendor does not own this order' using errcode = '42501'; end if;
  if target_status not in ('confirmed', 'preparing', 'ready', 'cancelled') then raise exception 'Unsupported vendor order status'; end if;

  if not (
    (current_status = 'pending' and target_status in ('confirmed', 'cancelled')) or
    (current_status = 'confirmed' and target_status in ('preparing', 'cancelled')) or
    (current_status = 'preparing' and target_status = 'ready')
  ) then raise exception 'Invalid transition from % to %', current_status, target_status; end if;

  if target_status = 'cancelled' and length(clean_reason) < 3 then
    raise exception 'A refusal/cancellation reason is required';
  end if;

  update public.orders
  set status = target_status,
      delivery_status = case when target_status = 'cancelled' then 'cancelled' else delivery_status end,
      payment_status = case when target_status = 'cancelled' and payment_status in ('pending','processing','awaiting_payment') then 'cancelled' else payment_status end,
      updated_at = now()
  where id = target_order_id returning * into updated_order;

  insert into public.order_events(order_id, event_type, payload)
  values (target_order_id, 'vendor_order_' || target_status,
    jsonb_build_object('actor_user_id', actor_id, 'previous_status', current_status,
      'status', target_status, 'reason', nullif(clean_reason, '')));

  return jsonb_build_object('id', updated_order.id, 'order_number', current_order_number,
    'status', updated_order.status, 'payment_status', updated_order.payment_status,
    'delivery_status', updated_order.delivery_status, 'updated_at', updated_order.updated_at);
end;
$$;

revoke all on function public.vendor_transition_order(uuid, text, text) from public, anon;
grant execute on function public.vendor_transition_order(uuid, text, text) to authenticated;
