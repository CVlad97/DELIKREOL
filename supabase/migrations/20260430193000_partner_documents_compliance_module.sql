/*
  Partner documentary compliance module.

  Goals:
  - document requirements by partner role
  - private storage for sensitive documents
  - public storage only for product/establishment photos
  - verification status and admin review metadata
*/

insert into storage.buckets (id, name, public)
values ('partner-documents-private', 'partner-documents-private', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do update set public = true;

alter table public.partner_documents
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists verification_status text not null default 'uploaded',
  add column if not exists expires_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text,
  add column if not exists file_path text,
  add column if not exists bucket_id text,
  add column if not exists is_sensitive boolean not null default true,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.partner_documents
  alter column partner_id drop not null;

alter table public.partner_documents
  alter column uploaded_by drop not null;

alter table public.partner_documents
  drop constraint if exists valid_document_type;

alter table public.partner_documents
  drop constraint if exists valid_partner_document_type;

alter table public.partner_documents
  add constraint valid_partner_document_type check (document_type in (
    'siret',
    'operating_address',
    'haccp',
    'product_photos',
    'establishment_photo',
    'production_capacity',
    'driving_license',
    'insurance',
    'vehicle_photo',
    'vehicle_type',
    'availability',
    'transport_capacity',
    'relay_address',
    'local_photo',
    'storage_capacity',
    'opening_hours',
    'kbis',
    'id_card',
    'hygiene_cert',
    'tax_cert',
    'license',
    'other'
  ));

alter table public.partner_documents
  drop constraint if exists valid_partner_document_verification_status;

alter table public.partner_documents
  add constraint valid_partner_document_verification_status check (verification_status in (
    'missing',
    'uploaded',
    'under_review',
    'approved',
    'rejected',
    'expired'
  ));

alter table public.partner_documents
  drop constraint if exists partner_documents_status_check;

alter table public.partner_documents
  add constraint partner_documents_status_check check (status in (
    'missing',
    'uploaded',
    'under_review',
    'approved',
    'rejected',
    'expired',
    'pending',
    'validated'
  ));

create index if not exists idx_partner_documents_user_id
  on public.partner_documents(user_id);

create index if not exists idx_partner_documents_verification_status
  on public.partner_documents(verification_status);

create index if not exists idx_partner_documents_expires_at
  on public.partner_documents(expires_at)
  where expires_at is not null;

drop policy if exists "Partner owner can view own documents by user" on public.partner_documents;
create policy "Partner owner can view own documents by user"
  on public.partner_documents
  for select
  to authenticated
  using (user_id = auth.uid() or uploaded_by = auth.uid());

drop policy if exists "Partner owner can insert own documents by user" on public.partner_documents;
create policy "Partner owner can insert own documents by user"
  on public.partner_documents
  for insert
  to authenticated
  with check (user_id = auth.uid() or uploaded_by = auth.uid());

drop policy if exists "Partner owner can update own uploaded documents" on public.partner_documents;
create policy "Partner owner can update own uploaded documents"
  on public.partner_documents
  for update
  to authenticated
  using ((user_id = auth.uid() or uploaded_by = auth.uid()) and coalesce(verification_status, status) in ('uploaded', 'rejected', 'expired'))
  with check ((user_id = auth.uid() or uploaded_by = auth.uid()) and coalesce(verification_status, status) in ('uploaded', 'under_review'));

drop policy if exists "Admins can update partner document verification" on public.partner_documents;
create policy "Admins can update partner document verification"
  on public.partner_documents
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

drop policy if exists "Partner private docs own upload" on storage.objects;
create policy "Partner private docs own upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'partner-documents-private'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Partner private docs own read" on storage.objects;
create policy "Partner private docs own read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'partner-documents-private'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    )
  );

drop policy if exists "Partner product photos own upload" on storage.objects;
create policy "Partner product photos own upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public product photos read" on storage.objects;
create policy "Public product photos read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-photos');
