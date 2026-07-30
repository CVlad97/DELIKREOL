-- =============================================================================
-- DELIKREOL — synchronisation accès admin / partenaires
-- Date: 2026-07-30
-- Objectif:
-- - éviter les comptes admin visibles côté frontend mais refusés par RLS ;
-- - garder role et user_type alignés pour les policies historiques ;
-- - ne supprimer aucune donnée et ne modifier aucun montant.
-- Rollback manuel:
-- - restaurer les définitions précédentes de public.is_admin/private.is_delikreol_admin
-- - remettre profiles.role/user_type aux valeurs historiques si nécessaire.
-- =============================================================================

create schema if not exists private;

alter table if exists public.profiles
  add column if not exists role text default 'customer';

update public.profiles
set role = coalesce(nullif(role, ''), coalesce(user_type, 'customer'))
where role is null or role = '';

update public.profiles
set user_type = 'admin',
    role = 'admin'
where lower(coalesce(email, contact_email, '')) = 'vladimir.claveau@gmail.com'
   or lower(coalesce(contact_email, email, '')) = 'vladimir.claveau@gmail.com';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and (
        coalesce(p.role, '') = 'admin'
        or coalesce(p.user_type, '') = 'admin'
        or lower(coalesce(p.email, p.contact_email, '')) = 'vladimir.claveau@gmail.com'
        or lower(coalesce(p.contact_email, p.email, '')) = 'vladimir.claveau@gmail.com'
      )
  );
$$;

create or replace function private.is_delikreol_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin();
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_delikreol_admin() to authenticated;

drop policy if exists "profiles_admin_update_roles" on public.profiles;
create policy "profiles_admin_update_roles"
  on public.profiles
  for update
  to authenticated
  using (private.is_delikreol_admin())
  with check (private.is_delikreol_admin());

drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all"
  on public.profiles
  for select
  to authenticated
  using (private.is_delikreol_admin());

drop policy if exists "profiles_update_own_safe" on public.profiles;
create policy "profiles_update_own_safe"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and coalesce(role, 'customer') = coalesce((
      select current_profile.role
      from public.profiles current_profile
      where current_profile.id = (select auth.uid())
    ), 'customer')
    and coalesce(user_type, 'customer') = coalesce((
      select current_profile.user_type
      from public.profiles current_profile
      where current_profile.id = (select auth.uid())
    ), 'customer')
  );
