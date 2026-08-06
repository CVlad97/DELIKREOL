import type { Product } from '../lib/supabase';

export type CartDeliveryOrderMode = 'livraison_directe' | 'livraison_programmee';

export const DIRECT_DELIVERY_MULTIPLE_VENDORS_CODE =
  'DIRECT_DELIVERY_MULTIPLE_VENDORS_NOT_ALLOWED';

export const DIRECT_DELIVERY_MULTIPLE_VENDORS_MESSAGE =
  'La livraison directe ne permet de commander qu’auprès d’un seul traiteur à la fois. Videz votre panier ou choisissez une livraison programmée pour commander auprès de plusieurs traiteurs.';

export interface CartVendorItem extends Product {
  quantity?: number;
}

export interface CartVendorGroup {
  key: string;
  name: string;
  items: CartVendorItem[];
}

export interface CartVendorRuleResult {
  allowed: boolean;
  code?: typeof DIRECT_DELIVERY_MULTIPLE_VENDORS_CODE;
  message?: string;
  currentVendorName?: string;
  nextVendorName?: string;
}

export function resolveCartVendor(product: Pick<Product, 'vendor_id' | 'vendor'>) {
  const vendorName = product.vendor?.business_name?.trim() || product.vendor_id?.trim() || '';
  return {
    key: vendorName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
    name: vendorName || 'Traiteur à confirmer',
  };
}

export function groupCartItemsByVendor(items: CartVendorItem[]): CartVendorGroup[] {
  const groups = new Map<string, CartVendorGroup>();

  for (const item of items) {
    const vendor = resolveCartVendor(item);
    const existing = groups.get(vendor.key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(vendor.key, {
        key: vendor.key,
        name: vendor.name,
        items: [item],
      });
    }
  }

  return Array.from(groups.values()).sort((left, right) => left.name.localeCompare(right.name, 'fr'));
}

export function validateCartVendorRule(
  items: CartVendorItem[],
  product: Product | null,
  deliveryOrderMode: CartDeliveryOrderMode,
): CartVendorRuleResult {
  if (deliveryOrderMode === 'livraison_programmee' || !product || items.length === 0) {
    return { allowed: true };
  }

  const currentVendor = resolveCartVendor(items[0]);
  const nextVendor = resolveCartVendor(product);

  if (currentVendor.key && nextVendor.key && currentVendor.key !== nextVendor.key) {
    return {
      allowed: false,
      code: DIRECT_DELIVERY_MULTIPLE_VENDORS_CODE,
      message: DIRECT_DELIVERY_MULTIPLE_VENDORS_MESSAGE,
      currentVendorName: currentVendor.name,
      nextVendorName: nextVendor.name,
    };
  }

  return { allowed: true };
}

export function validateOrderVendorRule(
  items: CartVendorItem[],
  deliveryOrderMode: CartDeliveryOrderMode,
): CartVendorRuleResult {
  const groups = groupCartItemsByVendor(items);

  if (deliveryOrderMode === 'livraison_directe' && groups.length > 1) {
    return {
      allowed: false,
      code: DIRECT_DELIVERY_MULTIPLE_VENDORS_CODE,
      message: DIRECT_DELIVERY_MULTIPLE_VENDORS_MESSAGE,
      currentVendorName: groups[0]?.name,
      nextVendorName: groups[1]?.name,
    };
  }

  return { allowed: true };
}
