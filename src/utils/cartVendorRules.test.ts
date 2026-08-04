import { describe, expect, it } from 'vitest';
import type { Product } from '../lib/supabase';
import {
  DIRECT_DELIVERY_MULTIPLE_VENDORS_CODE,
  DIRECT_DELIVERY_MULTIPLE_VENDORS_MESSAGE,
  groupCartItemsByVendor,
  validateCartVendorRule,
  validateOrderVendorRule,
} from './cartVendorRules';

function product(id: string, vendorId: string): Product {
  return {
    id,
    vendor_id: vendorId,
    name: id,
    description: null,
    category: 'Plats',
    price: 10,
    image_url: null,
    is_available: true,
    stock_quantity: null,
    created_at: '2026-08-04T00:00:00.000Z',
  };
}

describe('cartVendorRules', () => {
  it('allows direct delivery when all products come from the same caterer', () => {
    const items = [{ ...product('p1', 'Traiteur A'), quantity: 1 }];

    expect(validateCartVendorRule(items, product('p2', 'Traiteur A'), 'livraison_directe')).toEqual({
      allowed: true,
    });
    expect(validateOrderVendorRule(items, 'livraison_directe')).toEqual({ allowed: true });
  });

  it('blocks direct delivery when a second caterer is added', () => {
    const result = validateCartVendorRule(
      [{ ...product('p1', 'Traiteur A'), quantity: 1 }],
      product('p2', 'Traiteur B'),
      'livraison_directe',
    );

    expect(result.allowed).toBe(false);
    expect(result.code).toBe(DIRECT_DELIVERY_MULTIPLE_VENDORS_CODE);
    expect(result.message).toBe(DIRECT_DELIVERY_MULTIPLE_VENDORS_MESSAGE);
  });

  it('allows scheduled delivery with multiple caterers', () => {
    const items = [
      { ...product('p1', 'Traiteur A'), quantity: 1 },
      { ...product('p2', 'Traiteur B'), quantity: 2 },
    ];

    expect(validateCartVendorRule(items, product('p3', 'Traiteur C'), 'livraison_programmee')).toEqual({
      allowed: true,
    });
    expect(validateOrderVendorRule(items, 'livraison_programmee')).toEqual({ allowed: true });
  });

  it('groups cart lines by caterer for scheduled multi-caterer display', () => {
    const groups = groupCartItemsByVendor([
      { ...product('dessert', 'Traiteur B'), quantity: 1 },
      { ...product('plat', 'Traiteur A'), quantity: 2 },
      { ...product('boisson', 'Traiteur A'), quantity: 1 },
    ]);

    expect(groups.map((group) => [group.name, group.items.map((item) => item.id)])).toEqual([
      ['Traiteur A', ['plat', 'boisson']],
      ['Traiteur B', ['dessert']],
    ]);
  });
});
