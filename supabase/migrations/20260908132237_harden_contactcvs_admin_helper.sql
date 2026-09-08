-- Keep the public helper invoker-safe and use the hardened private helper
-- from policies on profiles to avoid recursive RLS evaluation.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.user_type, p.role) = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists profiles_admin_read_all on public.profiles;
create policy profiles_admin_read_all
  on public.profiles
  for select
  to authenticated
  using ((select private.is_delikreol_admin()));

drop policy if exists profiles_admin_update_roles on public.profiles;
create policy profiles_admin_update_roles
  on public.profiles
  for update
  to authenticated
  using ((select private.is_delikreol_admin()))
  with check ((select private.is_delikreol_admin()));
