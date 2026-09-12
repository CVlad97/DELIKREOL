-- Reconcile the verified production catalog after the September 2026 pilot.
-- This records the already-reviewed data operation for reproducible deployment.
-- It only removes orders explicitly marked as simulations.

BEGIN;

UPDATE public.products
SET stock_quantity = 15,
    updated_at = now();

DELETE FROM public.order_items
WHERE order_id IN (
  SELECT id
  FROM public.orders
  WHERE order_number LIKE 'DK-SIM-%'
     OR lower(coalesce(customer_name, '')) LIKE '%simulation%'
);

DELETE FROM public.orders
WHERE order_number LIKE 'DK-SIM-%'
   OR lower(coalesce(customer_name, '')) LIKE '%simulation%';

COMMIT;
