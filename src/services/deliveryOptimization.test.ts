import { describe, expect, it } from 'vitest';
import { optimizeDeliveryPlan, type OptimizableVendor } from './deliveryOptimization';

const baseVendor: OptimizableVendor = {
  vendorId: 'vendor-a',
  name: 'Vendor A',
  deliveryZoneId: 'fort-de-france',
  latitude: 14.61,
  longitude: -61.07,
  preparationTimeMinutes: 30,
  deliveryRadiusKm: 10,
  pickupAvailable: true,
  scheduledDeliveryAvailable: true,
  deliverySlots: ['11:30-12:30', '18:00-19:00'],
};

describe('deliveryOptimization', () => {
  it('consolidates vendors in the same delivery zone', () => {
    const plan = optimizeDeliveryPlan({
      vendors: [
        baseVendor,
        { ...baseVendor, vendorId: 'vendor-b', name: 'Vendor B', latitude: 14.612, longitude: -61.071 },
      ],
    });

    expect(plan.code).toBe('SAME_ZONE_CONSOLIDATED_DELIVERY');
    expect(plan.deliveriesCount).toBe(1);
    expect(plan.commonSlots).toContain('11:30-12:30');
  });

  it('allows a cross-zone optimized route when constraints are respected', () => {
    const plan = optimizeDeliveryPlan({
      vendors: [
        baseVendor,
        { ...baseVendor, vendorId: 'vendor-b', name: 'Vendor B', deliveryZoneId: 'schoelcher', latitude: 14.617, longitude: -61.083 },
      ],
    });

    expect(plan.code).toBe('CROSS_ZONE_OPTIMIZED_ROUTE');
    expect(plan.deliveriesCount).toBe(1);
  });

  it('requires split delivery confirmation when consolidation is not reasonable', () => {
    const plan = optimizeDeliveryPlan({
      vendors: [
        baseVendor,
        { ...baseVendor, vendorId: 'vendor-b', name: 'Vendor B', deliveryZoneId: 'riviere-pilote', latitude: 14.487, longitude: -60.902 },
      ],
    });

    expect(plan.code).toBe('CROSS_ZONE_SPLIT_DELIVERY_REQUIRED');
    expect(plan.requiresExplicitConfirmation).toBe(true);
  });

  it('rejects scheduled multi-vendor delivery when a vendor has no scheduled slots', () => {
    const plan = optimizeDeliveryPlan({
      vendors: [
        baseVendor,
        { ...baseVendor, vendorId: 'vendor-b', name: 'Vendor B', scheduledDeliveryAvailable: false, deliverySlots: [] },
      ],
    });

    expect(plan.code).toBe('NO_COMPATIBLE_DELIVERY_OPTION');
  });
});
