-- DELIKREOL — Notifications & Order Events (P0)

-- ============================================================
-- ORDER EVENTS
-- ============================================================
create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  event_type text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table order_events enable row level security;
drop policy if exists "Admin only order events" on order_events;
create policy "Admin only order events" on order_events for all using (is_admin());

create index if not exists idx_order_events_order_id on order_events(order_id);
create index if not exists idx_order_events_type on order_events(event_type);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  recipient_type text not null check (recipient_type in ('admin', 'client', 'partner', 'driver', 'relay', 'driver_needed', 'relay_needed')),
  recipient_phone text,
  channel text default 'dashboard' check (channel in ('dashboard', 'whatsapp_support', 'email', 'sms')),
  message text,
  status text default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  attempts integer default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
drop policy if exists "Admin only notifications" on notifications;
create policy "Admin only notifications" on notifications for all using (is_admin());

create index if not exists idx_notifications_order_id on notifications(order_id);
create index if not exists idx_notifications_status on notifications(status);
create index if not exists idx_notifications_recipient on notifications(recipient_type);

-- ============================================================
-- AJOUT idempotency_key + tracking_token + order_number à orders
-- ============================================================
alter table if exists orders add column if not exists idempotency_key text unique;
alter table if exists orders add column if not exists tracking_token text;
alter table if exists orders add column if not exists order_number text;
alter table if exists orders add column if not exists creneaux text;
alter table if exists orders add column if not exists address text;

-- ============================================================
-- ORDER ITEMS (si pas existante)
-- ============================================================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_name text,
  vendor_name text,
  unit_price numeric(10,2),
  quantity integer default 1,
  total numeric(10,2)
);

alter table order_items enable row level security;
drop policy if exists "Admin only order items" on order_items;
create policy "Admin only order items" on order_items for all using (is_admin());

create index if not exists idx_order_items_order_id on order_items(order_id);