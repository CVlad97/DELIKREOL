-- DELIKREOL — Backend production hardening P0/P1
-- Scope: RLS/Auth support tables, checkout rate limiting, Stripe webhook durability, FK indexes.
-- Safe intent: non destructive data changes; policy drops are explicitly listed and replace permissive legacy access.

create table if not exists public.checkout_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null,
  attempts integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.checkout_rate_limits enable row level security;

drop policy if exists "checkout_rate_limits_service_only" on public.checkout_rate_limits;
create policy "checkout_rate_limits_service_only"
  on public.checkout_rate_limits
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.consume_checkout_rate_limit(
  target_rate_key text,
  target_window_started_at timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_attempts integer;
begin
  insert into public.checkout_rate_limits(rate_key, window_started_at, attempts, updated_at)
  values (target_rate_key, target_window_started_at, 1, now())
  on conflict (rate_key)
  do update set attempts = public.checkout_rate_limits.attempts + 1,
                updated_at = now()
  returning attempts into next_attempts;

  return next_attempts;
end;
$$;

revoke all on function public.consume_checkout_rate_limit(text, timestamptz) from public, anon, authenticated;
grant execute on function public.consume_checkout_rate_limit(text, timestamptz) to service_role;

alter table if exists public.stripe_webhook_events add column if not exists attempt_count integer not null default 0;
alter table if exists public.stripe_webhook_events add column if not exists error_message text;

create or replace function public.increment_stripe_webhook_attempt(target_event_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stripe_webhook_events
  set attempt_count = coalesce(attempt_count, 0) + 1
  where id = target_event_id;
end;
$$;

revoke all on function public.increment_stripe_webhook_attempt(text) from public, anon, authenticated;
grant execute on function public.increment_stripe_webhook_attempt(text) to service_role;

create index if not exists idx_external_payment_events_order_id
  on public.external_payment_events(order_id);
create index if not exists idx_partner_notifications_order_id
  on public.partner_notifications(order_id);
create index if not exists idx_payouts_requested_by
  on public.payouts(requested_by);
create index if not exists idx_partner_documents_reviewed_by
  on public.partner_documents(reviewed_by);
create index if not exists idx_partner_documents_validated_by
  on public.partner_documents(validated_by);
create index if not exists idx_stripe_webhook_events_attempt_count
  on public.stripe_webhook_events(attempt_count);

do $$
begin
  if not exists (
    select 1
    from public.payments
    group by order_id
    having count(*) > 1
  ) then
    create unique index if not exists idx_payments_order_id_unique
      on public.payments(order_id);
  end if;
end $$;

drop policy if exists "Allow authenticated select" on public.contact_messages;

drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_own_safe" on public.profiles;
create policy "profiles_update_own_safe"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = (
      select current_profile.role
      from public.profiles current_profile
      where current_profile.id = (select auth.uid())
    )
    and coalesce(user_type, 'customer') = coalesce((
      select current_profile.user_type
      from public.profiles current_profile
      where current_profile.id = (select auth.uid())
    ), 'customer')
  );

drop policy if exists "profiles_insert_own" on public.profiles;

drop policy if exists "orders_insert_public_checkout" on public.orders;
drop policy if exists "order_items_insert_public_checkout" on public.order_items;
drop policy if exists "Customers can create payments for own orders" on public.payments;

drop policy if exists "external_payment_events_admin_all" on public.external_payment_events;
create policy "external_payment_events_admin_all"
  on public.external_payment_events
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "partner_notifications_admin_all" on public.partner_notifications;
create policy "partner_notifications_admin_all"
  on public.partner_notifications
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "payouts_admin_all" on public.payouts;
create policy "payouts_admin_all"
  on public.payouts
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "stripe_webhook_events_admin_read" on public.stripe_webhook_events;
create policy "stripe_webhook_events_admin_read"
  on public.stripe_webhook_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );
