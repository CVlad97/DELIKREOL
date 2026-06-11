-- DELIKREOL — Scores qualité (LOT 7)

-- Scores partenaires
create table if not exists partner_scores (
  id uuid primary key default gen_random_uuid(),
  partner_id text unique,
  quality_score numeric(3,1) default 0,
  speed_score numeric(3,1) default 0,
  reliability_score numeric(3,1) default 0,
  cancel_rate numeric(3,1) default 0,
  confirm_rate numeric(3,1) default 0,
  total_orders integer default 0,
  total_delays integer default 0,
  total_disputes integer default 0,
  updated_at timestamptz default now()
);

-- Scores clients
create table if not exists customer_scores (
  id uuid primary key default gen_random_uuid(),
  phone text unique,
  location_reliable boolean default false,
  phone_validated boolean default false,
  order_frequency integer default 0,
  total_orders integer default 0,
  total_cancellations integer default 0,
  reviews_given integer default 0,
  updated_at timestamptz default now()
);

-- Metriques produits
create table if not exists product_metrics (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  views integer default 0,
  cart_adds integer default 0,
  orders integer default 0,
  updated_at timestamptz default now()
);

-- Avis
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  product_id text,
  partner_id text,
  author_phone text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  status text default 'pending' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz default now()
);

-- Favoris
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  phone text,
  product_id text,
  partner_id text,
  created_at timestamptz default now(),
  unique(phone, product_id)
);

-- RLS
alter table partner_scores enable row level security;
alter table customer_scores enable row level security;
alter table product_metrics enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;

drop policy if exists "Admin only partner_scores" on partner_scores;
create policy "Admin only partner_scores" on partner_scores for all using (is_admin());

drop policy if exists "Admin only customer_scores" on customer_scores;
create policy "Admin only customer_scores" on customer_scores for all using (is_admin());

drop policy if exists "Admin only product_metrics" on product_metrics;
create policy "Admin only product_metrics" on product_metrics for all using (is_admin());

drop policy if exists "Public read reviews" on reviews;
create policy "Public read reviews" on reviews for select using (status = 'published');
drop policy if exists "Admin all reviews" on reviews;
create policy "Admin all reviews" on reviews for all using (is_admin());

drop policy if exists "Owner favorites" on favorites;
create policy "Owner favorites" on favorites for all using (true);