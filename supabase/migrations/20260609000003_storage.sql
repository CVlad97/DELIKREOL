-- DELIKREOL — Storage Buckets Setup
-- Run after schema migration
-- Note: Storage buckets can also be created via Supabase Dashboard

-- Create storage buckets for vendor media
insert into storage.buckets (id, name, public) values
  ('vendor-media', 'vendor-media', true),
  ('product-media', 'product-media', true),
  ('private-documents', 'private-documents', false)
on conflict (id) do nothing;

-- Public read access for vendor-media
create policy "Public read vendor-media"
  on storage.objects for select
  using (bucket_id = 'vendor-media');

-- Public read access for product-media
create policy "Public read product-media"
  on storage.objects for select
  using (bucket_id = 'product-media');

-- Admin only for private-documents
create policy "Admin only private-documents"
  on storage.objects for all
  using (bucket_id = 'private-documents' and is_admin());