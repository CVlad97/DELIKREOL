export type FulfillmentMode =
  | 'livraison_directe'
  | 'livraison_programmee'
  | 'retrait_traiteur'
  | 'point_relais';

export type RelayType =
  | 'commerce_partenaire'
  | 'traiteur_point_relais'
  | 'hub_logistique'
  | 'consigne_refrigeree'
  | 'point_retrait_temporaire';

export type RelayStatus =
  | 'active'
  | 'inactive'
  | 'temporarily_unavailable'
  | 'full'
  | 'maintenance';

export type ProductStorageType = 'hot' | 'cold' | 'frozen' | 'dry';

export type FulfillmentPlanCode =
  | 'DIRECT_VENDOR_DELIVERY'
  | 'SCHEDULED_VENDOR_DELIVERY'
  | 'SINGLE_VENDOR_PICKUP'
  | 'SAME_ZONE_RELAY_CONSOLIDATION'
  | 'CROSS_ZONE_RELAY_CONSOLIDATION'
  | 'RELAY_SPLIT_TRANSFER_REQUIRED'
  | 'ALTERNATIVE_RELAY_RECOMMENDED'
  | 'VENDOR_PICKUP_RECOMMENDED'
  | 'SCHEDULED_DELIVERY_RECOMMENDED'
  | 'NO_COMPATIBLE_FULFILLMENT_OPTION'
  | 'VENDOR_PICKUP_MULTIPLE_VENDORS_NOT_ALLOWED'
  | 'VENDOR_PICKUP_DISABLED'
  | 'VENDOR_PICKUP_SLOT_UNAVAILABLE'
  | 'VENDOR_CLOSED'
  | 'PRODUCT_UNAVAILABLE'
  | 'PREPARATION_TIME_INCOMPATIBLE'
  | 'RELAY_POINT_INACTIVE'
  | 'RELAY_POINT_FULL'
  | 'RELAY_POINT_CLOSED'
  | 'RELAY_POINT_PRODUCT_INCOMPATIBLE'
  | 'RELAY_POINT_CAPACITY_EXCEEDED'
  | 'RELAY_POINT_VENDOR_NOT_SUPPORTED'
  | 'RELAY_POINT_ZONE_NOT_SUPPORTED'
  | 'RELAY_PICKUP_WINDOW_UNAVAILABLE'
  | 'RELAY_STORAGE_TIME_EXCEEDED';

export type EstimateConfidence = 'high' | 'medium' | 'low';

export interface TimeWindow {
  slotId: string;
  label: string;
}

export interface VendorPreparationWindow {
  vendorId: string;
  slotId: string;
  preparationTimeMinutes: number;
}

export interface FulfillmentVendor {
  vendorId: string;
  businessName: string;
  active: boolean;
  zoneId: string | null;
  municipality: string | null;
  latitude: number | null;
  longitude: number | null;
  preparationTimeMinutes: number | null;
  openingSlots: string[];
  deliverySlots: string[];
  directDeliveryEnabled: boolean;
  scheduledDeliveryEnabled: boolean;
  pickupEnabled: boolean;
  relayDeliveryEnabled: boolean;
  maximumOrdersPerSlot: number | null;
  currentOrdersPerSlot: number | null;
}

export interface FulfillmentRelayPoint {
  relayPointId: string;
  vendorId?: string | null;
  name: string;
  type: RelayType;
  status: RelayStatus;
  zoneId: string | null;
  municipality: string | null;
  addressLabel: string;
  latitude: number | null;
  longitude: number | null;
  pickupSlots: string[];
  capacityPerSlot: number | null;
  currentCapacityUsage: number | null;
  acceptsHotFood: boolean;
  acceptsColdFood: boolean;
  acceptsFrozenFood: boolean;
  refrigeratedStorageAvailable: boolean;
  hotHoldingAvailable: boolean;
  frozenStorageAvailable: boolean;
  maximumHoldingMinutes: number | null;
  supportedVendorIds: string[] | null;
  supportedZoneIds: string[] | null;
  active: boolean;
}

export interface FulfillmentProduct {
  productId: string;
  vendorId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  available: boolean;
  storageType: ProductStorageType;
}

export interface FulfillmentPlan {
  planId: string;
  mode: FulfillmentMode;
  possible: boolean;
  code: FulfillmentPlanCode;
  message: string;
  vendorIds: string[];
  relayPointId: string | null;
  relayHostVendorId: string | null;
  preparationWindows: VendorPreparationWindow[];
  transferWindow: TimeWindow | null;
  customerPickupWindow: TimeWindow | null;
  numberOfTransfers: number;
  numberOfDeliveries: number;
  totalCost: number;
  estimatedReadyAt: string | null;
  requiresExplicitConfirmation: boolean;
  confidence: EstimateConfidence;
  expiresAt: string;
  fingerprint: string;
  alternatives: string[];
}

export interface FulfillmentPlanInput {
  mode: FulfillmentMode;
  products: FulfillmentProduct[];
  vendors: FulfillmentVendor[];
  relayPoints: FulfillmentRelayPoint[];
  selectedRelayPointId?: string | null;
  selectedSlot?: string | null;
  now?: Date;
  dataVersion?: string;
}

export interface FulfillmentFingerprintInput {
  mode: FulfillmentMode;
  products: FulfillmentProduct[];
  vendorIds: string[];
  relayPointId: string | null;
  selectedSlot: string | null;
  totalCost: number;
  dataVersion: string;
}

type CartLikeProduct = {
  id: string;
  vendor_id: string;
  name: string;
  category?: string | null;
  price: number;
  quantity?: number;
  is_available?: boolean;
  vendor?: { business_name?: string | null } | null;
};

type VendorSpaceLike = {
  slug?: string;
  name: string;
  zone?: string;
  commune?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  prep_time?: number | null;
  delivery_slots?: string[];
  horaires?: Partial<Record<string, { open: string; close: string }>>;
  status?: string;
};

type RelayPointLike = {
  id: string | number;
  name: string;
  statut?: string;
  capacite?: number;
  adresse?: string;
  lat?: number;
  lng?: number;
  horaires?: string;
};

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right, 'fr'));
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function hash64Hex(value: string) {
  const seeds = [0x811c9dc5, 0x45d9f3b, 0x27d4eb2d, 0x165667b1];
  return seeds.map((seed) => {
    let hash = seed;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }).join('');
}

function makePlan(params: {
  input: FulfillmentPlanInput;
  possible: boolean;
  code: FulfillmentPlanCode;
  message: string;
  vendorIds: string[];
  relayPointId?: string | null;
  relayHostVendorId?: string | null;
  numberOfTransfers?: number;
  numberOfDeliveries?: number;
  totalCost?: number;
  requiresExplicitConfirmation?: boolean;
  confidence?: EstimateConfidence;
  alternatives?: string[];
}): FulfillmentPlan {
  const selectedSlot = params.input.selectedSlot || null;
  const totalCost = params.totalCost ?? 0;
  const relayPointId = params.relayPointId ?? null;
  const relayHostVendorId = params.relayHostVendorId ?? null;
  const now = params.input.now || new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  const preparationWindows = params.vendorIds.map((vendorId) => {
    const vendor = params.input.vendors.find((candidate) => candidate.vendorId === vendorId);
    return {
      vendorId,
      slotId: selectedSlot || 'slot-a-confirmer',
      preparationTimeMinutes: vendor?.preparationTimeMinutes ?? 30,
    };
  });

  return {
    planId: hash64Hex(`${params.code}:${Date.parse(expiresAt)}:${params.vendorIds.join('|')}`).slice(0, 16),
    mode: params.input.mode,
    possible: params.possible,
    code: params.code,
    message: params.message,
    vendorIds: params.vendorIds,
    relayPointId,
    relayHostVendorId,
    preparationWindows,
    transferWindow: relayPointId && selectedSlot ? { slotId: selectedSlot, label: selectedSlot } : null,
    customerPickupWindow: relayPointId && selectedSlot ? { slotId: selectedSlot, label: selectedSlot } : null,
    numberOfTransfers: params.numberOfTransfers ?? 0,
    numberOfDeliveries: params.numberOfDeliveries ?? 0,
    totalCost,
    estimatedReadyAt: null,
    requiresExplicitConfirmation: params.requiresExplicitConfirmation ?? false,
    confidence: params.confidence ?? 'medium',
    expiresAt,
    fingerprint: buildFulfillmentFingerprint({
      mode: params.input.mode,
      products: params.input.products,
      vendorIds: params.vendorIds,
      relayPointId,
      selectedSlot,
      totalCost,
      dataVersion: params.input.dataVersion || 'local-v1',
    }),
    alternatives: params.alternatives ?? [],
  };
}

function productUnits(products: FulfillmentProduct[]) {
  return products.reduce((sum, product) => sum + product.quantity, 0);
}

function slotsInclude(slots: string[], selectedSlot: string | null | undefined) {
  return Boolean(selectedSlot && slots.includes(selectedSlot));
}

function relayAcceptsProduct(relay: FulfillmentRelayPoint, product: FulfillmentProduct) {
  if (product.storageType === 'hot') return relay.acceptsHotFood && relay.hotHoldingAvailable;
  if (product.storageType === 'cold') return relay.acceptsColdFood && relay.refrigeratedStorageAvailable;
  if (product.storageType === 'frozen') return relay.acceptsFrozenFood && relay.frozenStorageAvailable;
  return true;
}

function normalizeVendorName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function vendorMatchesProduct(vendor: VendorSpaceLike, product: CartLikeProduct) {
  const productVendorName = product.vendor?.business_name || product.vendor_id;
  return normalizeVendorName(vendor.name) === normalizeVendorName(productVendorName);
}

export function inferProductStorageType(product: Pick<CartLikeProduct, 'name' | 'category'>): ProductStorageType {
  const value = `${product.category || ''} ${product.name}`.toLowerCase();
  if (/glace|sorbet|surgel/.test(value)) return 'frozen';
  if (/jus|boisson|salade|dessert|fruit|froid|smoothie/.test(value)) return 'cold';
  if (/colombo|grill|poulet|poisson|plat|chaud|riz|sauce|porc|cabri/.test(value)) return 'hot';
  return 'dry';
}

export function buildFulfillmentProductsFromCart(items: CartLikeProduct[]): FulfillmentProduct[] {
  return items.map((item) => ({
    productId: item.id,
    vendorId: item.vendor?.business_name || item.vendor_id,
    name: item.name,
    quantity: item.quantity || 1,
    unitPrice: item.price,
    available: item.is_available !== false,
    storageType: inferProductStorageType(item),
  }));
}

export function buildFulfillmentVendorsFromCart(
  items: CartLikeProduct[],
  vendorSpaces: VendorSpaceLike[],
): FulfillmentVendor[] {
  const products = buildFulfillmentProductsFromCart(items);
  const vendorIds = uniqueSorted(products.map((product) => product.vendorId));
  return vendorIds.map((vendorId) => {
    const item = items.find((candidate) => (candidate.vendor?.business_name || candidate.vendor_id) === vendorId);
    const space = item ? vendorSpaces.find((candidate) => vendorMatchesProduct(candidate, item)) : null;
    const zoneId = space?.commune || space?.zone || 'martinique';
    const openingSlots = space?.delivery_slots?.length ? space.delivery_slots : ['slot-a-confirmer'];
    return {
      vendorId,
      businessName: space?.name || vendorId,
      active: space?.status ? space.status === 'public confirmé' : true,
      zoneId,
      municipality: space?.commune || null,
      latitude: space?.latitude ?? null,
      longitude: space?.longitude ?? null,
      preparationTimeMinutes: space?.prep_time ?? 30,
      openingSlots,
      deliverySlots: openingSlots,
      directDeliveryEnabled: true,
      scheduledDeliveryEnabled: openingSlots.length > 0,
      pickupEnabled: true,
      relayDeliveryEnabled: true,
      maximumOrdersPerSlot: null,
      currentOrdersPerSlot: null,
    };
  });
}

export function buildFulfillmentRelayPoints(relayPoints: RelayPointLike[]): FulfillmentRelayPoint[] {
  return relayPoints.map((relay) => {
    const active = relay.statut === 'actif' || relay.statut === 'active';
    return {
      relayPointId: String(relay.id),
      vendorId: null,
      name: relay.name,
      type: 'commerce_partenaire',
      status: active ? 'active' : 'inactive',
      zoneId: null,
      municipality: null,
      addressLabel: relay.adresse || relay.name,
      latitude: relay.lat ?? null,
      longitude: relay.lng ?? null,
      pickupSlots: relay.horaires && relay.horaires !== 'A confirmer' ? [relay.horaires] : [],
      capacityPerSlot: relay.capacite ?? 0,
      currentCapacityUsage: 0,
      acceptsHotFood: false,
      acceptsColdFood: false,
      acceptsFrozenFood: false,
      refrigeratedStorageAvailable: false,
      hotHoldingAvailable: false,
      frozenStorageAvailable: false,
      maximumHoldingMinutes: null,
      supportedVendorIds: null,
      supportedZoneIds: null,
      active,
    };
  });
}

function vendorById(input: FulfillmentPlanInput) {
  return new Map(input.vendors.map((vendor) => [vendor.vendorId, vendor]));
}

function findRelay(input: FulfillmentPlanInput) {
  if (input.selectedRelayPointId) {
    return input.relayPoints.find((relay) => relay.relayPointId === input.selectedRelayPointId) || null;
  }
  return input.relayPoints.find((relay) => relay.active && relay.status === 'active') || null;
}

export function buildFulfillmentFingerprint(input: FulfillmentFingerprintInput) {
  const canonical = stableStringify({
    mode: input.mode,
    products: input.products
      .map((product) => ({
        productId: product.productId,
        vendorId: product.vendorId,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        available: product.available,
        storageType: product.storageType,
      }))
      .sort((left, right) => left.productId.localeCompare(right.productId)),
    vendorIds: uniqueSorted(input.vendorIds),
    relayPointId: input.relayPointId,
    selectedSlot: input.selectedSlot,
    totalCost: Math.round(input.totalCost * 100) / 100,
    dataVersion: input.dataVersion,
  });
  return `${hash64Hex(canonical)}${hash64Hex(`fulfillment:${canonical}`)}`;
}

export function evaluateFulfillmentPlan(input: FulfillmentPlanInput): FulfillmentPlan {
  const vendorIds = uniqueSorted(input.products.map((product) => product.vendorId));
  const vendors = vendorById(input);
  const missingProduct = input.products.find((product) => !product.available);
  if (missingProduct) {
    return makePlan({
      input,
      possible: false,
      code: 'PRODUCT_UNAVAILABLE',
      message: `Produit indisponible: ${missingProduct.name}`,
      vendorIds,
      alternatives: ['Retirer le produit indisponible du panier.'],
    });
  }

  const inactiveVendor = vendorIds.map((id) => vendors.get(id)).find((vendor) => !vendor?.active);
  if (inactiveVendor) {
    return makePlan({
      input,
      possible: false,
      code: 'VENDOR_CLOSED',
      message: 'Un traiteur du panier est fermé ou inactif.',
      vendorIds,
      alternatives: ['Choisir un autre traiteur disponible.'],
    });
  }

  if (input.mode === 'livraison_directe') {
    return makePlan({
      input,
      possible: vendorIds.length === 1,
      code: vendorIds.length === 1 ? 'DIRECT_VENDOR_DELIVERY' : 'NO_COMPATIBLE_FULFILLMENT_OPTION',
      message: vendorIds.length === 1
        ? 'Livraison directe mono-traiteur possible.'
        : 'La livraison directe ne permet qu’un seul traiteur.',
      vendorIds,
      numberOfDeliveries: vendorIds.length === 1 ? 1 : 0,
      totalCost: 4,
      alternatives: vendorIds.length === 1 ? [] : ['Choisir la livraison programmée ou vider le panier.'],
    });
  }

  if (input.mode === 'livraison_programmee') {
    const unavailableVendor = vendorIds.map((id) => vendors.get(id)).find((vendor) => !vendor?.scheduledDeliveryEnabled);
    if (unavailableVendor) {
      return makePlan({
        input,
        possible: false,
        code: 'NO_COMPATIBLE_FULFILLMENT_OPTION',
        message: 'Un traiteur ne supporte pas la livraison programmée.',
        vendorIds,
        alternatives: ['Choisir un autre traiteur ou un retrait.'],
      });
    }
    return makePlan({
      input,
      possible: true,
      code: 'SCHEDULED_VENDOR_DELIVERY',
      message: 'Livraison programmée possible sous réserve de confirmation des créneaux.',
      vendorIds,
      numberOfDeliveries: vendorIds.length > 1 ? 1 : vendorIds.length,
      totalCost: 4,
      requiresExplicitConfirmation: vendorIds.length > 1,
    });
  }

  if (input.mode === 'retrait_traiteur') {
    if (vendorIds.length !== 1) {
      return makePlan({
        input,
        possible: false,
        code: 'VENDOR_PICKUP_MULTIPLE_VENDORS_NOT_ALLOWED',
        message: 'Le retrait chez le traiteur ne permet qu’un seul traiteur par commande.',
        vendorIds,
        alternatives: ['Vider le panier, choisir un seul traiteur ou sélectionner un point relais compatible.'],
      });
    }
    const vendor = vendors.get(vendorIds[0]);
    if (!vendor?.pickupEnabled) {
      return makePlan({
        input,
        possible: false,
        code: 'VENDOR_PICKUP_DISABLED',
        message: 'Ce traiteur ne propose pas le retrait.',
        vendorIds,
        alternatives: ['Choisir la livraison programmée ou un point relais compatible.'],
      });
    }
    if (input.selectedSlot && !slotsInclude(vendor.openingSlots, input.selectedSlot)) {
      return makePlan({
        input,
        possible: false,
        code: 'VENDOR_PICKUP_SLOT_UNAVAILABLE',
        message: 'Le créneau de retrait demandé n’est pas disponible.',
        vendorIds,
        alternatives: ['Choisir un autre créneau.'],
      });
    }
    return makePlan({
      input,
      possible: true,
      code: 'SINGLE_VENDOR_PICKUP',
      message: 'Retrait chez le traiteur possible.',
      vendorIds,
      numberOfDeliveries: 0,
      totalCost: 0,
      confidence: 'high',
    });
  }

  const relay = findRelay(input);
  if (!relay) {
    return makePlan({
      input,
      possible: false,
      code: 'NO_COMPATIBLE_FULFILLMENT_OPTION',
      message: 'Aucun point relais compatible disponible.',
      vendorIds,
      alternatives: ['Choisir le retrait traiteur ou la livraison programmée.'],
    });
  }
  if (!relay.active || relay.status !== 'active') {
    return makePlan({
      input,
      possible: false,
      code: relay.status === 'full' ? 'RELAY_POINT_FULL' : 'RELAY_POINT_INACTIVE',
      message: 'Le point relais sélectionné n’est pas actif.',
      vendorIds,
      relayPointId: relay.relayPointId,
      alternatives: ['Choisir un autre point relais.'],
    });
  }
  if (!slotsInclude(relay.pickupSlots, input.selectedSlot)) {
    return makePlan({
      input,
      possible: false,
      code: 'RELAY_POINT_CLOSED',
      message: 'Le point relais est fermé sur le créneau demandé.',
      vendorIds,
      relayPointId: relay.relayPointId,
      alternatives: ['Choisir un autre créneau ou un autre relais.'],
    });
  }
  if (relay.capacityPerSlot != null && (relay.currentCapacityUsage || 0) + productUnits(input.products) > relay.capacityPerSlot) {
    return makePlan({
      input,
      possible: false,
      code: 'RELAY_POINT_CAPACITY_EXCEEDED',
      message: 'La capacité du point relais est insuffisante sur ce créneau.',
      vendorIds,
      relayPointId: relay.relayPointId,
      alternatives: ['Choisir un autre relais ou fractionner la commande.'],
    });
  }
  if (relay.supportedVendorIds && !vendorIds.every((vendorId) => relay.supportedVendorIds?.includes(vendorId))) {
    return makePlan({
      input,
      possible: false,
      code: 'RELAY_POINT_VENDOR_NOT_SUPPORTED',
      message: 'Un traiteur du panier n’est pas autorisé sur ce point relais.',
      vendorIds,
      relayPointId: relay.relayPointId,
      alternatives: ['Choisir un autre relais.'],
    });
  }
  if (
    relay.supportedZoneIds &&
    !vendorIds.every((vendorId) => {
      const vendor = vendors.get(vendorId);
      return vendor?.zoneId && relay.supportedZoneIds?.includes(vendor.zoneId);
    })
  ) {
    return makePlan({
      input,
      possible: false,
      code: 'RELAY_POINT_ZONE_NOT_SUPPORTED',
      message: 'Une zone traiteur n’est pas desservie par ce point relais.',
      vendorIds,
      relayPointId: relay.relayPointId,
      alternatives: ['Choisir un relais de la même zone.'],
    });
  }
  const incompatibleProduct = input.products.find((product) => !relayAcceptsProduct(relay, product));
  if (incompatibleProduct) {
    return makePlan({
      input,
      possible: false,
      code: 'RELAY_POINT_PRODUCT_INCOMPATIBLE',
      message: `Le point relais ne peut pas conserver: ${incompatibleProduct.name}.`,
      vendorIds,
      relayPointId: relay.relayPointId,
      alternatives: ['Retirer le produit incompatible ou choisir un autre relais.'],
    });
  }
  const relayVendor = vendorIds.map((id) => vendors.get(id)).find((vendor) => !vendor?.relayDeliveryEnabled);
  if (relayVendor) {
    return makePlan({
      input,
      possible: false,
      code: 'RELAY_POINT_VENDOR_NOT_SUPPORTED',
      message: 'Un traiteur du panier ne livre pas vers les points relais.',
      vendorIds,
      relayPointId: relay.relayPointId,
      alternatives: ['Choisir le retrait chez ce traiteur.'],
    });
  }

  const zones = uniqueSorted(vendorIds.map((vendorId) => vendors.get(vendorId)?.zoneId || 'zone-inconnue'));
  const code = zones.length === 1 ? 'SAME_ZONE_RELAY_CONSOLIDATION' : 'CROSS_ZONE_RELAY_CONSOLIDATION';
  return makePlan({
    input,
    possible: true,
    code,
    message: zones.length === 1
      ? 'Point relais compatible pour une consolidation même zone.'
      : 'Point relais compatible pour une consolidation entre zones.',
    vendorIds,
    relayPointId: relay.relayPointId,
    relayHostVendorId: relay.vendorId || null,
    numberOfTransfers: vendorIds.length,
    numberOfDeliveries: 1,
    totalCost: 2.5,
    requiresExplicitConfirmation: vendorIds.length > 1,
    confidence: zones.includes('zone-inconnue') ? 'low' : 'medium',
  });
}
