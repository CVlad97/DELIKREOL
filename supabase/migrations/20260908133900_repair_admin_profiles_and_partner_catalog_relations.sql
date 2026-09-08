-- Align the production schema with the admin and partner-onboarding clients.
alter table public.profiles add column if not exists contact_email text;
update public.profiles set contact_email = email where contact_email is null and email is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'partner_applications_user_id_profiles_fkey'
      and conrelid = 'public.partner_applications'::regclass
  ) then
    alter table public.partner_applications
      add constraint partner_applications_user_id_profiles_fkey
      foreign key (user_id) references public.profiles(id) on delete set null;
  end if;
end $$;

create table if not exists public.partner_catalog_files (
  id uuid primary key default gen_random_uuid(),
  partner_application_id uuid not null references public.partner_applications(id) on delete cascade,
  file_url text,
  file_path text,
  bucket_id text not null default 'partner-catalog',
  file_name text not null,
  file_size bigint,
  format text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_catalog_items (
  id uuid primary key default gen_random_uuid(),
  partner_application_id uuid not null references public.partner_applications(id) on delete cascade,
  name text not null,
  description text,
  category text,
  unit text not null,
  price numeric not null check (price >= 0),
  currency text not null default 'EUR',
  is_signature boolean not null default false,
  allergens text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_partner_catalog_files_application on public.partner_catalog_files(partner_application_id);
create index if not exists idx_partner_catalog_items_application on public.partner_catalog_items(partner_application_id);

alter table public.partner_catalog_files enable row level security;
alter table public.partner_catalog_items enable row level security;
grant select, insert, update, delete on public.partner_catalog_files to authenticated;
grant select, insert, update, delete on public.partner_catalog_items to authenticated;

drop policy if exists partner_catalog_files_admin_all on public.partner_catalog_files;
create policy partner_catalog_files_admin_all on public.partner_catalog_files for all to authenticated
using ((select private.is_delikreol_admin())) with check ((select private.is_delikreol_admin()));
drop policy if exists partner_catalog_files_owner_all on public.partner_catalog_files;
create policy partner_catalog_files_owner_all on public.partner_catalog_files for all to authenticated
using (exists (select 1 from public.partner_applications pa where pa.id=partner_application_id and pa.user_id=(select auth.uid())))
with check (exists (select 1 from public.partner_applications pa where pa.id=partner_application_id and pa.user_id=(select auth.uid())));

drop policy if exists partner_catalog_items_admin_all on public.partner_catalog_items;
create policy partner_catalog_items_admin_all on public.partner_catalog_items for all to authenticated
using ((select private.is_delikreol_admin())) with check ((select private.is_delikreol_admin()));
drop policy if exists partner_catalog_items_owner_all on public.partner_catalog_items;
create policy partner_catalog_items_owner_all on public.partner_catalog_items for all to authenticated
using (exists (select 1 from public.partner_applications pa where pa.id=partner_application_id and pa.user_id=(select auth.uid())))
with check (exists (select 1 from public.partner_applications pa where pa.id=partner_application_id and pa.user_id=(select auth.uid())));

insert into storage.buckets(id,name,public) values ('partner-catalog','partner-catalog',false)
on conflict(id) do update set public=false;

drop policy if exists partner_catalog_storage_owner_insert on storage.objects;
create policy partner_catalog_storage_owner_insert on storage.objects for insert to authenticated
with check (bucket_id='partner-catalog' and exists (
  select 1 from public.partner_applications pa
  where pa.id::text=(storage.foldername(name))[1] and pa.user_id=(select auth.uid())
));

drop policy if exists partner_catalog_storage_owner_select on storage.objects;
create policy partner_catalog_storage_owner_select on storage.objects for select to authenticated
using (bucket_id='partner-catalog' and (
  (select private.is_delikreol_admin()) or exists (
    select 1 from public.partner_applications pa
    where pa.id::text=(storage.foldername(name))[1] and pa.user_id=(select auth.uid())
  )
));
