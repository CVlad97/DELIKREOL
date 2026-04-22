begin;

insert into storage.buckets (id, name, public)
select 'product-photos', 'product-photos', true
where not exists (
  select 1 from storage.buckets where id = 'product-photos'
);

create table if not exists public.partner_catalog_submissions (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  product_name text not null,
  description text,
  category text,
  price numeric(10,2) default 0,
  stock_quantity integer,
  is_available boolean not null default true,
  image_url text,
  source text not null default 'public_partner_portal',
  status text not null default 'pending_review',
  created_at timestamptz not null default now()
);

alter table public.partner_catalog_submissions enable row level security;

alter table public.partner_applications
  add column if not exists contact_name text,
  add column if not exists whatsapp text,
  add column if not exists commune text,
  add column if not exists activity_type text,
  add column if not exists delivery_radius_km integer default 8,
  add column if not exists opening_hours text;

create policy if not exists partner_applications_public_insert
on public.partner_applications
for insert
to anon, authenticated
with check (true);

create policy if not exists partner_catalog_submissions_public_insert
on public.partner_catalog_submissions
for insert
to anon, authenticated
with check (true);

create policy if not exists product_photos_public_read
on storage.objects
for select
to public
using (bucket_id = 'product-photos');

create policy if not exists product_photos_public_insert
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'product-photos');

commit;
