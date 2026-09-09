alter table public.products
  add column if not exists menu_options jsonb;

comment on column public.products.menu_options is
  'Configuration facultative d un menu: boissons proposées et nombres de choix inclus.';

alter table public.products
  drop constraint if exists products_menu_options_is_object;

alter table public.products
  add constraint products_menu_options_is_object
  check (menu_options is null or jsonb_typeof(menu_options) = 'object');
