-- Add manually validated social links for public partner profiles.
-- These fields are for official profile URLs only; no unofficial scraping payloads are stored here.

alter table public.vendors
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists website_url text,
  add column if not exists social_links jsonb not null default '{}'::jsonb;

comment on column public.vendors.instagram_url is 'Public Instagram profile URL validated manually or via official API.';
comment on column public.vendors.facebook_url is 'Public Facebook page URL validated manually or via official API.';
comment on column public.vendors.website_url is 'Public partner website URL validated manually.';
comment on column public.vendors.social_links is 'Additional public social links metadata. Do not store scraped private data.';

alter table public.vendors
  add constraint vendors_instagram_url_https_chk
  check (instagram_url is null or instagram_url ~ '^https://(www\.)?instagram\.com/');

alter table public.vendors
  add constraint vendors_facebook_url_https_chk
  check (facebook_url is null or facebook_url ~ '^https://(www\.)?(facebook|fb)\.com/');

alter table public.vendors
  add constraint vendors_website_url_https_chk
  check (website_url is null or website_url ~ '^https://');
