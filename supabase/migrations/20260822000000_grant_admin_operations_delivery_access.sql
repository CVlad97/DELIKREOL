create policy "deliveries_admin_all"
on public.deliveries
for all
to authenticated
using (private.is_delikreol_admin())
with check (private.is_delikreol_admin());

create index if not exists idx_deliveries_created_at
on public.deliveries (created_at desc);
