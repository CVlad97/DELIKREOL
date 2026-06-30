-- DELIKREOL — P0/P1 Operational Backoffice
-- Idempotent : CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, DROP POLICY IF EXISTS

-- ============================================================
-- DRIVER APPLICATIONS
-- ============================================================
create table if not exists public.driver_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  whatsapp text,
  email text,
  commune text not null,
  transport_mode text,
  zones_acceptees text[] default '{}',
  disponibilite text,
  horaires text,
  experience_livraison text,
  status text not null default 'candidat',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.driver_applications add column if not exists whatsapp text;
alter table public.driver_applications add column if not exists zones_acceptees text[] default '{}';
alter table public.driver_applications add column if not exists disponibilite text;
alter table public.driver_applications add column if not exists horaires text;
alter table public.driver_applications add column if not exists experience_livraison text;
alter table public.driver_applications add column if not exists admin_notes text;
alter table public.driver_applications add column if not exists updated_at timestamptz default now();

-- ============================================================
-- RELAY POINT APPLICATIONS
-- ============================================================
create table if not exists public.relay_point_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  manager_name text,
  phone text not null,
  whatsapp text,
  email text,
  commune text not null,
  address text,
  opening_hours text,
  capacity text,
  status text not null default 'candidat',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.relay_point_applications add column if not exists whatsapp text;
alter table public.relay_point_applications add column if not exists admin_notes text;
alter table public.relay_point_applications add column if not exists updated_at timestamptz default now();

-- ============================================================
-- INVOICES
-- ============================================================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique,
  order_id uuid references public.orders(id),
  customer_name text,
  customer_email text,
  customer_phone text,
  total_ht numeric default 0,
  total_tva numeric default 0,
  total_ttc numeric default 0,
  currency text default 'EUR',
  status text not null default 'draft',
  qonto_invoice_id text,
  pdf_url text,
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INVOICE LINES
-- ============================================================
create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  label text not null,
  quantity numeric default 1,
  unit_price_ht numeric default 0,
  tva_rate numeric default 0,
  total_ht numeric default 0,
  total_ttc numeric default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  invoice_id uuid references public.invoices(id),
  provider text,
  provider_payment_id text,
  amount numeric default 0,
  currency text default 'EUR',
  status text default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PAYOUTS
-- ============================================================
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid,
  driver_id uuid,
  order_id uuid references public.orders(id),
  amount numeric default 0,
  type text,
  status text default 'pending',
  qonto_transaction_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- COMMISSIONS
-- ============================================================
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  base_amount numeric default 0,
  commission_rate numeric default 0.15,
  commission_amount numeric default 0,
  partner_amount numeric default 0,
  driver_amount numeric default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- QONTO SYNC LOGS
-- ============================================================
create table if not exists public.qonto_sync_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  action text,
  status text,
  message text,
  qonto_id text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS — DRIVER APPLICATIONS
-- ============================================================
alter table public.driver_applications enable row level security;

drop policy if exists "Public insert driver_applications" on public.driver_applications;
create policy "Public insert driver_applications" on public.driver_applications
  for insert with check (name is not null and phone is not null and commune is not null);

drop policy if exists "Admin all driver_applications" on public.driver_applications;
create policy "Admin all driver_applications" on public.driver_applications
  for all using (is_delikreol_admin());

-- ============================================================
-- RLS — RELAY POINT APPLICATIONS
-- ============================================================
alter table public.relay_point_applications enable row level security;

drop policy if exists "Public insert relay_point_applications" on public.relay_point_applications;
create policy "Public insert relay_point_applications" on public.relay_point_applications
  for insert with check (business_name is not null and phone is not null and commune is not null);

drop policy if exists "Admin all relay_point_applications" on public.relay_point_applications;
create policy "Admin all relay_point_applications" on public.relay_point_applications
  for all using (is_delikreol_admin());

-- ============================================================
-- RLS — INVOICES / INVOICE LINES / PAYMENTS / PAYOUTS / COMMISSIONS / QONTO LOGS
-- ============================================================
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;
alter table public.payouts enable row level security;
alter table public.commissions enable row level security;
alter table public.qonto_sync_logs enable row level security;

create or replace function public.is_delikreol_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admin all invoices" on public.invoices;
create policy "Admin all invoices" on public.invoices for all using (is_delikreol_admin());

drop policy if exists "Admin all invoice_lines" on public.invoice_lines;
create policy "Admin all invoice_lines" on public.invoice_lines for all using (is_delikreol_admin());

drop policy if exists "Admin all payments" on public.payments;
create policy "Admin all payments" on public.payments for all using (is_delikreol_admin());

drop policy if exists "Admin all payouts" on public.payouts;
create policy "Admin all payouts" on public.payouts for all using (is_delikreol_admin());

drop policy if exists "Admin all commissions" on public.commissions;
create policy "Admin all commissions" on public.commissions for all using (is_delikreol_admin());

drop policy if exists "Admin all qonto_sync_logs" on public.qonto_sync_logs;
create policy "Admin all qonto_sync_logs" on public.qonto_sync_logs for all using (is_delikreol_admin());

-- ============================================================
-- VERIFICATION
-- ============================================================
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'driver_applications',
    'relay_point_applications',
    'invoices',
    'invoice_lines',
    'payments',
    'payouts',
    'commissions',
    'qonto_sync_logs'
  )
order by table_name, ordinal_position;