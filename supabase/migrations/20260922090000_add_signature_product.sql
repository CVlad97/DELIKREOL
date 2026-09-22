alter table public.products
  add column if not exists is_signature boolean not null default false;

create unique index if not exists products_one_signature_per_vendor_idx
  on public.products (vendor_id)
  where is_signature = true;

comment on column public.products.is_signature is
  'Produit phare choisi par le partenaire. Un seul produit signature par vendeur.';
