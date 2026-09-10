alter table public.vendors
  add column if not exists payment_provider text,
  add column if not exists sumup_payment_link text,
  add column if not exists sumup_link_status text,
  add column if not exists sumup_link_type text,
  add column if not exists sumup_link_created_at timestamptz;

alter table public.vendors enable row level security;

comment on column public.vendors.payment_provider is 'Preferred payment provider for this vendor, e.g. sumup or stripe.';
comment on column public.vendors.sumup_payment_link is 'Public SumUp payment link for the vendor. No secret credentials are stored here.';
comment on column public.vendors.sumup_link_status is 'Operational status of the SumUp payment link.';
comment on column public.vendors.sumup_link_type is 'Type of SumUp link, e.g. open or fixed.';
