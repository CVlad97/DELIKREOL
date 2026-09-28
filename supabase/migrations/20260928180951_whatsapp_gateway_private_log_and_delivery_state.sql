create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  whatsapp_id text not null unique,
  vendor_id uuid references public.vendors(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  from_number text,
  to_number text,
  message_type text not null default 'text',
  message_content text,
  media_id text,
  direction text not null check (direction in ('inbound','outbound')),
  status text not null default 'received',
  provider_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_messages enable row level security;
revoke all on table public.whatsapp_messages from anon, authenticated;

create index if not exists whatsapp_messages_vendor_created_idx
  on public.whatsapp_messages(vendor_id, created_at desc);
create index if not exists whatsapp_messages_from_created_idx
  on public.whatsapp_messages(from_number, created_at desc);
create index if not exists whatsapp_messages_status_idx
  on public.whatsapp_messages(status, created_at desc);
alter table public.partner_notifications
  add column if not exists attempts integer not null default 0;
alter table public.partner_notifications
  add column if not exists last_error text;
alter table public.partner_notifications
  add column if not exists provider_message_id text;
alter table public.partner_notifications
  add column if not exists updated_at timestamptz not null default now();

grant select on table public.whatsapp_messages to authenticated;

drop policy if exists whatsapp_messages_admin_select on public.whatsapp_messages;
create policy whatsapp_messages_admin_select
on public.whatsapp_messages
for select
to authenticated
using ((select private.is_delikreol_admin()));
