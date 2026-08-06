import { describe, expect, it } from 'vitest';
import {
  buildFulfillmentFingerprint,
  evaluateFulfillmentPlan,
  type FulfillmentProduct,
  type FulfillmentRelayPoint,
  type FulfillmentVendor,
} from './fulfillmentRules';

const baseVendor: FulfillmentVendor = {
  vendorId: 'vendor-a',
  businessName: 'Traiteur A',
  active: true,
  zoneId: 'centre',
  municipality: 'Ducos',
  latitude: 14.58,
  longitude: -60.98,
  preparationTimeMinutes: 30,
  openingSlots: ['18:00-20:00'],
  deliverySlots: ['18:00-20:00'],
  directDeliveryEnabled: true,
  scheduledDeliveryEnabled: true,
  pickupEnabled: true,
  relayDeliveryEnabled: true,
  currentOrdersPerSlot: 1,
  maximumOrdersPerSlot: 5,
};

const baseRelay: FulfillmentRelayPoint = {
  relayPointId: 'relay-a',
  name: 'Relais Ducos',
  type: 'commerce_partenaire',
  status: 'active',
  zoneId: 'centre',
  municipality: 'Ducos',
  addressLabel: 'Ducos centre',
  latitude: 14.58,
  longitude: -60.97,
  pickupSlots: ['18:00-20:00'],
  capacityPerSlot: 8,
  currentCapacityUsage: 2,
  acceptsHotFood: true,
  acceptsColdFood: true,
  acceptsFrozenFood: false,
  refrigeratedStorageAvailable: true,
  hotHoldingAvailable: true,
  frozenStorageAvailable: false,
  maximumHoldingMinutes: 90,
  supportedVendorIds: null,
  supportedZoneIds: ['centre'],
  active: true,
};

const hotProduct: FulfillmentProduct = {
  productId: 'product-a',
  vendorId: 'vendor-a',
  name: 'Colombo',
  quantity: 2,
  unitPrice: 12,
  available: true,
  storageType: 'hot',
};

describe('fulfillmentRules', () => {
  it('allows single-vendor pickup only for a pickup-enabled vendor', () => {
    const plan = evaluateFulfillmentPlan({
      mode: 'retrait_traiteur',
      products: [hotProduct],
      vendors: [baseVendor],
      relayPoints: [],
      selectedSlot: '18:00-20:00',
    });

    expect(plan.code).toBe('SINGLE_VENDOR_PICKUP');
    expect(plan.requiresExplicitConfirmation).toBe(false);
    expect(plan.vendorIds).toEqual(['vendor-a']);
  });

  it('rejects vendor pickup when the cart contains multiple vendors', () => {
    const plan = evaluateFulfillmentPlan({
      mode: 'retrait_traiteur',
      products: [
        hotProduct,
        { ...hotProduct, productId: 'product-b', vendorId: 'vendor-b' },
      ],
      vendors: [baseVendor, { ...baseVendor, vendorId: 'vendor-b', businessName: 'Traiteur B' }],
      relayPoints: [],
      selectedSlot: '18:00-20:00',
    });

    expect(plan.code).toBe('VENDOR_PICKUP_MULTIPLE_VENDORS_NOT_ALLOWED');
    expect(plan.possible).toBe(false);
  });

  it('selects a relay for multiple compatible vendors in the same zone', () => {
    const plan = evaluateFulfillmentPlan({
      mode: 'point_relais',
      products: [
        hotProduct,
        { ...hotProduct, productId: 'product-b', vendorId: 'vendor-b', storageType: 'cold' },
      ],
      vendors: [baseVendor, { ...baseVendor, vendorId: 'vendor-b', businessName: 'Traiteur B' }],
      relayPoints: [baseRelay],
      selectedRelayPointId: 'relay-a',
      selectedSlot: '18:00-20:00',
    });

    expect(plan.possible).toBe(true);
    expect(plan.code).toBe('SAME_ZONE_RELAY_CONSOLIDATION');
    expect(plan.relayPointId).toBe('relay-a');
    expect(plan.requiresExplicitConfirmation).toBe(true);
  });

  it('allows a vendor location to act as a relay point when explicitly enabled', () => {
    const vendorRelay = {
      ...baseRelay,
      relayPointId: 'vendor-relay-a',
      name: 'Traiteur A — retrait relais',
      type: 'traiteur_point_relais' as const,
      vendorId: 'vendor-a',
      supportedVendorIds: ['vendor-a', 'vendor-b'],
    };

    const plan = evaluateFulfillmentPlan({
      mode: 'point_relais',
      products: [
        hotProduct,
        { ...hotProduct, productId: 'product-b', vendorId: 'vendor-b', storageType: 'cold' },
      ],
      vendors: [baseVendor, { ...baseVendor, vendorId: 'vendor-b', businessName: 'Traiteur B' }],
      relayPoints: [vendorRelay],
      selectedRelayPointId: 'vendor-relay-a',
      selectedSlot: '18:00-20:00',
    });

    expect(plan.possible).toBe(true);
    expect(plan.relayPointId).toBe('vendor-relay-a');
    expect(plan.relayHostVendorId).toBe('vendor-a');
    expect(plan.code).toBe('SAME_ZONE_RELAY_CONSOLIDATION');
  });

  it('rejects relay pickup when cold storage is required but unavailable', () => {
    const plan = evaluateFulfillmentPlan({
      mode: 'point_relais',
      products: [{ ...hotProduct, storageType: 'cold' }],
      vendors: [baseVendor],
      relayPoints: [{ ...baseRelay, refrigeratedStorageAvailable: false }],
      selectedRelayPointId: 'relay-a',
      selectedSlot: '18:00-20:00',
    });

    expect(plan.possible).toBe(false);
    expect(plan.code).toBe('RELAY_POINT_PRODUCT_INCOMPATIBLE');
  });

  it('rejects relay pickup when capacity is exceeded', () => {
    const plan = evaluateFulfillmentPlan({
      mode: 'point_relais',
      products: [{ ...hotProduct, quantity: 7 }],
      vendors: [baseVendor],
      relayPoints: [baseRelay],
      selectedRelayPointId: 'relay-a',
      selectedSlot: '18:00-20:00',
    });

    expect(plan.possible).toBe(false);
    expect(plan.code).toBe('RELAY_POINT_CAPACITY_EXCEEDED');
  });

  it('returns a deterministic fingerprint for the same validated plan inputs', () => {
    const left = buildFulfillmentFingerprint({
      mode: 'point_relais',
      products: [hotProduct],
      vendorIds: ['vendor-a'],
      relayPointId: 'relay-a',
      selectedSlot: '18:00-20:00',
      totalCost: 2.5,
      dataVersion: 'test-v1',
    });
    const right = buildFulfillmentFingerprint({
      mode: 'point_relais',
      products: [hotProduct],
      vendorIds: ['vendor-a'],
      relayPointId: 'relay-a',
      selectedSlot: '18:00-20:00',
      totalCost: 2.5,
      dataVersion: 'test-v1',
    });

    expect(left).toBe(right);
    expect(left).toHaveLength(64);
  });
});
