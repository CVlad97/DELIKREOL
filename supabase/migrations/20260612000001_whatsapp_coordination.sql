-- DELIKREOL — Coordination WhatsApp traiteur ↔ livreur
-- Stocke les échanges WhatsApp pour suivi et traçabilité

create table if not exists delivery_communications (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  from_type text not null check (from_type in ('partner', 'driver', 'coordinator')),
  from_name text not null,
  to_type text not null check (to_type in ('partner', 'driver', 'client')),
  to_phone text not null,
  message_type text not null check (message_type in ('driver_needed', 'pickup_ready', 'driver_confirmed', 'en_route', 'delivered', 'issue')),
  wa_link text,
  message_preview text,
  status text default 'pending' check (status in ('pending', 'sent', 'failed', 'read')),
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table delivery_communications enable row level security;
drop policy if exists "Admin only delivery_comms" on delivery_communications;
create policy "Admin only delivery_comms" on delivery_communications for all using (is_admin());

create index if not exists idx_delivery_comms_order on delivery_communications(order_number);
create index if not exists idx_delivery_comms_status on delivery_communications(status);

-- Ajouter les champs de contact aux tables existantes
alter table if exists partners add column if not exists whatsapp_phone text;
alter table if exists drivers add column if not exists whatsapp_phone text;
alter table if exists drivers add column if not exists max_radius_km numeric(4,1) default 10;
alter table if exists drivers add column if not exists available_from time;
alter table if exists drivers add column if not exists available_until time;

alter table if exists orders add column if not exists driver_phone text;
alter table if exists orders add column if not exists partner_phone text;
alter table if exists orders add column if not exists driver_assigned_at timestamptz;
alter table if exists orders add column if not exists partner_notified_at timestamptz;
alter table if exists orders add column if not exists driver_notified_at timestamptz;