create table if not exists public.vendor_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  disabled_at timestamptz
);

create index if not exists idx_vendor_push_subscriptions_vendor_active
  on public.vendor_push_subscriptions(vendor_id)
  where disabled_at is null;

alter table public.vendor_push_subscriptions enable row level security;
revoke all on table public.vendor_push_subscriptions from anon;
grant select, insert, update, delete on table public.vendor_push_subscriptions to authenticated;
drop policy if exists "vendor_push_select_own" on public.vendor_push_subscriptions;
create policy "vendor_push_select_own"
  on public.vendor_push_subscriptions for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = (select auth.uid())
    )
  );

drop policy if exists "vendor_push_insert_own" on public.vendor_push_subscriptions;
create policy "vendor_push_insert_own"
  on public.vendor_push_subscriptions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = (select auth.uid())
    )
  );
drop policy if exists "vendor_push_update_own" on public.vendor_push_subscriptions;
create policy "vendor_push_update_own"
  on public.vendor_push_subscriptions for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = (select auth.uid())
    )
  );

drop policy if exists "vendor_push_delete_own" on public.vendor_push_subscriptions;
create policy "vendor_push_delete_own"
  on public.vendor_push_subscriptions for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = (select auth.uid())
    )
  );
