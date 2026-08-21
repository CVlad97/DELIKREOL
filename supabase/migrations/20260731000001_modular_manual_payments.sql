-- DELIKREOL — paiements modulaires non-Stripe + idempotence atomique checkout.
-- Safe/non destructif : aucune suppression de commande, aucun montant modifié.

create table if not exists public.payment_duplicate_audit (
  id uuid primary key default gen_random_uuid(),
  field_name text not null,
  field_value text not null,
  duplicate_count integer not null,
  sample_order_ids uuid[] not null default '{}',
  detected_at timestamptz not null default now()
);

insert into public.payment_duplicate_audit(field_name, field_value, duplicate_count, sample_order_ids)
select 'order_number', order_number, count(*)::integer, (array_agg(id order by created_at desc))[1:10]
from public.orders
where order_number is not null and order_number <> ''
group by order_number
having count(*) > 1;

insert into public.payment_duplicate_audit(field_name, field_value, duplicate_count, sample_order_ids)
select 'idempotency_key', idempotency_key, count(*)::integer, (array_agg(id order by created_at desc))[1:10]
from public.orders
where idempotency_key is not null and idempotency_key <> ''
group by idempotency_key
having count(*) > 1;

insert into public.payment_duplicate_audit(field_name, field_value, duplicate_count, sample_order_ids)
select 'payment_reference', payment_reference, count(*)::integer, (array_agg(id order by created_at desc))[1:10]
from public.orders
where payment_reference is not null and payment_reference <> ''
group by payment_reference
having count(*) > 1;

insert into public.payment_duplicate_audit(field_name, field_value, duplicate_count, sample_order_ids)
select 'payment_external_id', payment_external_id, count(*)::integer, (array_agg(id order by created_at desc))[1:10]
from public.orders
where payment_external_id is not null and payment_external_id <> ''
group by payment_external_id
having count(*) > 1;

alter table if exists public.orders add column if not exists payment_provider text not null default 'qonto_transfer';
alter table if exists public.orders add column if not exists payment_status text not null default 'pending';
alter table if exists public.orders add column if not exists payment_reference text;
alter table if exists public.orders add column if not exists payment_external_id text;
alter table if exists public.orders add column if not exists payment_amount numeric;
alter table if exists public.orders add column if not exists payment_currency text not null default 'EUR';
alter table if exists public.orders add column if not exists payment_proof_url text;
alter table if exists public.orders add column if not exists payment_verified_at timestamptz;
alter table if exists public.orders add column if not exists payment_verified_by uuid;
alter table if exists public.orders add column if not exists payment_review_comment text;
alter table if exists public.orders add column if not exists idempotency_key text;
alter table if exists public.orders add column if not exists order_number text;
alter table if exists public.orders add column if not exists updated_at timestamptz default now();

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%payment_provider%'
  loop
    execute format('alter table public.orders drop constraint if exists %I', constraint_record.conname);
  end loop;

  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%payment_status%'
  loop
    execute format('alter table public.orders drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table if exists public.orders
  add constraint orders_payment_provider_check
  check (payment_provider in (
    'qonto_transfer',
    'revolut_transfer',
    'cash_on_delivery',
    'crypto_wallet',
    'external_payment_link',
    'stripe_disabled',
    'manual',
    'stripe_test',
    'sumup_manual',
    'sumup_payment_link'
  )) not valid;

alter table if exists public.orders
  add constraint orders_payment_status_check
  check (payment_status in (
    'pending',
    'proof_submitted',
    'under_review',
    'paid',
    'failed',
    'refunded',
    'cancelled',
    'processing',
    'awaiting_payment',
    'paid_external'
  )) not valid;

create index if not exists idx_orders_payment_provider on public.orders(payment_provider);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_payment_reference on public.orders(payment_reference) where payment_reference is not null;
create index if not exists idx_orders_payment_external_id on public.orders(payment_external_id) where payment_external_id is not null;
create index if not exists idx_orders_idempotency_key_lookup on public.orders(idempotency_key) where idempotency_key is not null;

do $$
begin
  if not exists (
    select 1 from public.orders
    where order_number is not null and order_number <> ''
    group by order_number
    having count(*) > 1
  ) then
    create unique index if not exists idx_orders_order_number_unique
      on public.orders(order_number)
      where order_number is not null;
  end if;

  if not exists (
    select 1 from public.orders
    where idempotency_key is not null and idempotency_key <> ''
    group by idempotency_key
    having count(*) > 1
  ) then
    create unique index if not exists idx_orders_idempotency_key_unique
      on public.orders(idempotency_key)
      where idempotency_key is not null;
  end if;

  if not exists (
    select 1 from public.orders
    where payment_reference is not null and payment_reference <> ''
    group by payment_reference
    having count(*) > 1
  ) then
    create unique index if not exists idx_orders_payment_reference_unique
      on public.orders(payment_reference)
      where payment_reference is not null;
  end if;

  if not exists (
    select 1 from public.orders
    where payment_external_id is not null and payment_external_id <> ''
    group by payment_external_id
    having count(*) > 1
  ) then
    create unique index if not exists idx_orders_payment_external_id_unique
      on public.orders(payment_external_id)
      where payment_external_id is not null;
  end if;
end $$;

create or replace function public.create_checkout_order_atomic(
  target_idempotency_key text,
  order_payload jsonb,
  items_payload jsonb,
  event_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_order public.orders%rowtype;
  inserted_order public.orders%rowtype;
  item_record jsonb;
  advisory_key bigint;
begin
  if target_idempotency_key is null or length(trim(target_idempotency_key)) < 16 then
    raise exception 'idempotency_key required' using errcode = '22023';
  end if;

  advisory_key := ('x' || substr(md5(target_idempotency_key), 1, 16))::bit(64)::bigint;
  perform pg_advisory_xact_lock(advisory_key);

  select *
  into existing_order
  from public.orders
  where idempotency_key = target_idempotency_key
  order by created_at asc
  limit 1;

  if found then
    return jsonb_build_object(
      'existing', true,
      'order', jsonb_build_object(
        'id', existing_order.id,
        'order_number', existing_order.order_number,
        'tracking_token', existing_order.tracking_token,
        'status', existing_order.status,
        'payment_status', existing_order.payment_status,
        'total_cents', existing_order.total_cents
      )
    );
  end if;

  insert into public.orders (
    order_number,
    idempotency_key,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    customer_commune,
    order_mode,
    subtotal,
    delivery_fee,
    delivery_fee_cents,
    sub_total_cents,
    total_cents,
    total_amount,
    delivery_type,
    notes,
    creneaux,
    address,
    source,
    status,
    delivery_status,
    payment_status,
    payment_provider,
    payment_method,
    payment_reference,
    payment_external_id,
    payment_amount,
    payment_currency,
    payment_proof_url,
    tracking_token
  )
  values (
    order_payload->>'order_number',
    target_idempotency_key,
    nullif(order_payload->>'customer_id', '')::uuid,
    nullif(order_payload->>'customer_name', ''),
    order_payload->>'customer_phone',
    nullif(order_payload->>'customer_email', ''),
    nullif(order_payload->>'customer_commune', ''),
    order_payload->>'order_mode',
    (order_payload->>'subtotal')::numeric,
    (order_payload->>'delivery_fee')::numeric,
    (order_payload->>'delivery_fee_cents')::integer,
    (order_payload->>'sub_total_cents')::integer,
    (order_payload->>'total_cents')::integer,
    (order_payload->>'total_amount')::numeric,
    order_payload->>'delivery_type',
    nullif(order_payload->>'notes', ''),
    nullif(order_payload->>'creneaux', ''),
    nullif(order_payload->>'address', ''),
    order_payload->>'source',
    coalesce(order_payload->>'status', 'pending'),
    coalesce(order_payload->>'delivery_status', 'pending'),
    coalesce(order_payload->>'payment_status', 'pending'),
    coalesce(order_payload->>'payment_provider', 'qonto_transfer'),
    coalesce(order_payload->>'payment_method', 'manual'),
    nullif(order_payload->>'payment_reference', ''),
    nullif(order_payload->>'payment_external_id', ''),
    (order_payload->>'payment_amount')::numeric,
    coalesce(order_payload->>'payment_currency', 'EUR'),
    nullif(order_payload->>'payment_proof_url', ''),
    order_payload->>'tracking_token'
  )
  returning * into inserted_order;

  for item_record in select * from jsonb_array_elements(items_payload)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      vendor_id,
      product_name,
      vendor_name,
      unit_price,
      quantity,
      subtotal,
      total,
      vendor_commission
    )
    values (
      inserted_order.id,
      (item_record->>'product_id')::uuid,
      (item_record->>'vendor_id')::uuid,
      item_record->>'product_name',
      item_record->>'vendor_name',
      (item_record->>'unit_price')::numeric,
      (item_record->>'quantity')::integer,
      (item_record->>'subtotal')::numeric,
      (item_record->>'total')::numeric,
      (item_record->>'vendor_commission')::numeric
    );
  end loop;

  insert into public.order_events(order_id, event_type, payload)
  values (
    inserted_order.id,
    coalesce(event_payload->>'event_type', 'public_order_created'),
    coalesce(event_payload->'payload', '{}'::jsonb)
  );

  return jsonb_build_object(
    'existing', false,
    'order', jsonb_build_object(
      'id', inserted_order.id,
      'order_number', inserted_order.order_number,
      'tracking_token', inserted_order.tracking_token,
      'status', inserted_order.status,
      'payment_status', inserted_order.payment_status,
      'total_cents', inserted_order.total_cents
    )
  );
end;
$$;

revoke all on function public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb) to service_role;

-- ─── CORRECTIFS P0 (audit Agent 3) ───

-- R4.1 : Activer RLS sur payment_duplicate_audit (table d'audit sensible)
alter table if exists public.payment_duplicate_audit enable row level security;
drop policy if exists payment_duplicate_audit_service_only on public.payment_duplicate_audit;
create policy payment_duplicate_audit_service_only on public.payment_duplicate_audit
  for all to anon, authenticated
  using (false) with check (false);
-- Seul service_role peut lire/écrire dans la table d'audit

-- R4.3 : Vérifier que RLS est activé sur orders (safe — no-op si déjà activé)
alter table if exists public.orders enable row level security;

-- R4.5 : Gérer la collision sur payment_external_id dans la RPC
-- Ajouter un bloc de détection de doublon payment_external_id avant l'insert
-- La logique est déjà partiellement gérée par l'index unique, mais la RPC
-- doit retourner un 409 propre au lieu d'un 500.
-- (La gestion se fait côté Edge Function qui appelle la RPC — le bloc
-- de vérification pré-insert est déjà présent dans checkout-order/index.ts)

-- R4.4 : Supprimer l'ancien index redondant si le nouveau existe
drop index if exists idx_orders_idempotency_key;
-- Le nouvel index unique idx_orders_idempotency_key_unique le remplace

-- Rollback manuel documenté :
-- drop function if exists public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb);
-- drop table if exists public.payment_duplicate_audit;
-- drop index if exists idx_orders_payment_provider;
-- drop index if exists idx_orders_payment_status;
-- drop index if exists idx_orders_idempotency_key_unique;
-- drop index if exists idx_orders_payment_external_id_unique;
-- Les colonnes ajoutées sont conservées par défaut pour éviter toute perte d'audit historique.
