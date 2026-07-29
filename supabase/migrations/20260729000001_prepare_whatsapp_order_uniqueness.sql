-- DELIKREOL — préparation uniquement, ne pas exécuter sans validation humaine.
-- Objectif: empêcher deux commandes avec le même identifiant métier ou la même clé d'idempotence.

create unique index if not exists idx_orders_order_number_unique
  on public.orders(order_number)
  where order_number is not null;

create unique index if not exists idx_orders_idempotency_key_unique
  on public.orders(idempotency_key)
  where idempotency_key is not null;

