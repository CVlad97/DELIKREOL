import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'supabase/functions/checkout-order/index.ts'),
  'utf8',
);

describe('checkout-order delivery vendor rules', () => {
  it('rejects multi-vendor direct delivery with a stable business code', () => {
    expect(source).toContain('DIRECT_DELIVERY_MULTIPLE_VENDORS_NOT_ALLOWED');
    expect(source).toContain('deliveryOrderMode === "livraison_directe" && vendorIds.size !== 1');
  });

  it('allows scheduled multi-vendor orders only with a declared slot', () => {
    expect(source).toContain('deliveryOrderMode === "livraison_programmee" && vendorIds.size > 1 && !creneaux');
    expect(source).toContain('SCHEDULED_DELIVERY_SLOT_REQUIRED');
  });

  it('records partner partition metadata without exposing other vendors in order item rows', () => {
    expect(source).toContain('vendor_ids: Array.from(vendorIds)');
    expect(source).toContain('order_scope: vendorIds.size > 1 ? "multi-traiteurs" : "mono-traiteur"');
    expect(source).toContain('orderItems.map((item) => ({ ...item, order_id: order.id }))');
  });

  it('requires server-side delivery plan confirmation before creating split deliveries', () => {
    expect(source).toContain('chooseDeliveryOptimizationPlan');
    expect(source).toContain('DELIVERY_PLAN_RECALCULATION_REQUIRED');
    expect(source).toContain('deliveryPlan.requiresConfirmation && !deliveryPlanConfirmed');
    expect(source).toContain('CROSS_ZONE_SPLIT_DELIVERY_REQUIRED');
  });
});
