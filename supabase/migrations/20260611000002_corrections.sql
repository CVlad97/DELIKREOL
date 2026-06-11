-- DELIKREOL — Correction requests + partner status

-- Demande de correction partenaire
create table if not exists partner_correction_requests (
  id uuid primary key default gen_random_uuid(),
  partner_id text,
  partner_name text,
  partner_code text,
  contact_phone text,
  correction_type text check (correction_type in ('description', 'photos', 'prix', 'composition', 'allergenes', 'horaires', 'disponibilites', 'autres')),
  message text,
  attachments jsonb default '[]'::jsonb,
  status text default 'pending' check (status in ('pending', 'applied', 'rejected')),
  created_at timestamptz default now(),
  applied_at timestamptz
);

alter table partner_correction_requests enable row level security;
drop policy if exists "Admin only correction requests" on partner_correction_requests;
create policy "Admin only correction requests" on partner_correction_requests for all using (is_admin());

-- Statut détaillé des plats
alter table if exists products add column if not exists plat_status text default 'disponible' 
  check (plat_status in ('disponible', 'bientôt disponible', 'épuisé', 'à valider', 'masqué'));
alter table if exists products add column if not exists capacity integer default 10;
alter table if exists products add column if not exists current_orders integer default 0;