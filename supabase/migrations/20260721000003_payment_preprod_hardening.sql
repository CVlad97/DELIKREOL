-- DELIKREOL — Paiements pré-production Stripe TEST / idempotence webhook
-- Safe, non destructive.

alter table if exists public.orders add column if not exists stripe_checkout_session_id text;
alter table if exists public.orders add column if not exists payment_method text;
alter table if exists public.orders add column if not exists payment_provider text default 'manual';
alter table if exists public.orders add column if not exists payment_error text;
alter table if exists public.orders add column if not exists paid_at timestamptz;
alter table if exists public.orders add column if not exists refunded_at timestamptz;
alter table if exists public.orders add column if not exists idempotency_key text;
alter table if exists public.orders add column if not exists customer_email text;
alter table if exists public.orders add column if not exists updated_at timestamptz default now();

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%payment_status%'
  loop
    execute format('alter table public.orders drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table if exists public.orders
  add constraint orders_payment_status_check
  check (payment_status in (
    'pending',
    'processing',
    'paid',
    'failed',
    'refunded',
    'cancelled',
    'awaiting_payment',
    'paid_external'
  )) not valid;

create unique index if not exists idx_orders_idempotency_key
  on public.orders(idempotency_key)
  where idempotency_key is not null;
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_payment_intent_id on public.orders(payment_intent_id);
create index if not exists idx_orders_stripe_checkout_session_id on public.orders(stripe_checkout_session_id);

alter table if exists public.order_items add column if not exists product_name text;
alter table if exists public.order_items add column if not exists vendor_name text;
alter table if exists public.order_items add column if not exists product_id text;
alter table if exists public.order_items add column if not exists vendor_id text;
alter table if exists public.order_items add column if not exists total numeric;
alter table if exists public.order_items add column if not exists subtotal numeric;

create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text,
  processing_status text default 'processing',
  order_id text null,
  payment_intent_id text null,
  received_at timestamptz default now(),
  processed_at timestamptz null,
  last_error text null,
  payload_hash text null
);

alter table if exists public.stripe_webhook_events add column if not exists processing_status text default 'processing';
alter table if exists public.stripe_webhook_events add column if not exists order_id text null;
alter table if exists public.stripe_webhook_events add column if not exists payment_intent_id text null;
alter table if exists public.stripe_webhook_events add column if not exists received_at timestamptz default now();
alter table if exists public.stripe_webhook_events add column if not exists processed_at timestamptz null;
alter table if exists public.stripe_webhook_events add column if not exists last_error text null;
alter table if exists public.stripe_webhook_events add column if not exists payload_hash text null;

do $$
begin
  alter table public.stripe_webhook_events
    add constraint stripe_webhook_events_status_check
    check (processing_status in ('processing', 'processed', 'failed')) not valid;
exception
  when duplicate_object then null;
end $$;

create index if not exists idx_stripe_webhook_events_status on public.stripe_webhook_events(processing_status);
create index if not exists idx_stripe_webhook_events_type on public.stripe_webhook_events(type);

alter table if exists public.stripe_webhook_events enable row level security;
drop policy if exists "stripe_webhook_events_service" on public.stripe_webhook_events;
create policy "stripe_webhook_events_service"
  on public.stripe_webhook_events
  for all
  to service_role
  using (true)
  with check (true);
