-- Restrict legacy public tables and remove anonymous wallet exposure.
-- These tables are not used by the current DELIKREOL commercial flow.
alter table public.projects enable row level security;
alter table public.wallets enable row level security;
alter table public.trips enable row level security;
alter table public.shipments enable row level security;
alter table public.matches enable row level security;
alter table public.investments enable row level security;

alter view api.managed_wallets set (security_invoker = true);
revoke all on api.managed_wallets from anon, authenticated;
