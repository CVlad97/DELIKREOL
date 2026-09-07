-- Partner invitation tokens and contact details must never be enumerable from
-- the public Data API. Invitation lookup/activation is performed by trusted
-- server-side code only.

alter table if exists public.partner_invites enable row level security;

drop policy if exists "Public open partner invite by token" on public.partner_invites;

revoke all on table public.partner_invites from anon, authenticated;
grant all on table public.partner_invites to service_role;

