import type { Product } from '../lib/supabase';
import type { TraiteurSpace } from '../data/traiteurs';
import { resolveTraiteurCoords } from './partnerGeo';
import { calculateDistanceKm, type Coords } from './geolocation';

export type DeliveryOptimizationCode =
  | 'SAME_ZONE_CONSOLIDATED_DELIVERY'
  | 'CROSS_ZONE_OPTIMIZED_ROUTE'
  | 'CROSS_ZONE_HUB_CONSOLIDATION'
  | 'CROSS_ZONE_SPLIT_DELIVERY_REQUIRED'
  | 'NO_COMPATIBLE_DELIVERY_OPTION';

export interface DeliveryOptimizationConstraints {
  maxDetourMinutes: number;
  maxExtraKm: number;
  maxWaitMinutes: number;
  maxCustomerDelayMinutes: number;
  maxDeliveryCost: number;
  averageSpeedKmh: number;
  baseDeliveryFee: number;
  perKmFee: number;
  splitDeliveryPenalty: number;
}

export interface ConsolidationHub {
  id: string;
  name: string;
  zoneId: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface OptimizableVendor {
  vendorId: string;
  name: string;
  deliveryZoneId: string;
  latitude: number | null;
  longitude: number | null;
  preparationTimeMinutes: number;
  deliveryRadiusKm: number;
  pickupAvailable: boolean;
  scheduledDeliveryAvailable: boolean;
  deliverySlots: string[];
}

export interface DeliveryOptimizationPlan {
  code: DeliveryOptimizationCode;
  label: string;
  explanation: string;
  deliveriesCount: number;
  totalFee: number;
  estimatedDurationMinutes: number;
  totalDistanceKm: number;
  commonSlots: string[];
  vendorZones: string[];
  vendorNames: string[];
  requiresExplicitConfirmation: boolean;
  score: number;
}

export const DEFAULT_DELIVERY_OPTIMIZATION_CONSTRAINTS: DeliveryOptimizationConstraints = {
  maxDetourMinutes: 15,
  maxExtraKm: 10,
  maxWaitMinutes: 20,
  maxCustomerDelayMinutes: 15,
  maxDeliveryCost: 18,
  averageSpeedKmh: 35,
  baseDeliveryFee: 4,
  perKmFee: 0.85,
  splitDeliveryPenalty: 8,
};

function normalizeZone(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeVendor(value: string) {
  return normalizeZone(value);
}

function intersectSlots(vendors: OptimizableVendor[]) {
  if (vendors.length === 0) return [];
  return vendors
    .slice(1)
    .reduce(
      (slots, vendor) => slots.filter((slot) => vendor.deliverySlots.includes(slot)),
      [...vendors[0].deliverySlots],
    );
}

function maxPairwiseDistanceKm(vendors: OptimizableVendor[]) {
  let maxDistance = 0;
  for (let leftIndex = 0; leftIndex < vendors.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < vendors.length; rightIndex += 1) {
      const left = vendors[leftIndex];
      const right = vendors[rightIndex];
      if (left.latitude == null || left.longitude == null || right.latitude == null || right.longitude == null) {
        return Number.POSITIVE_INFINITY;
      }
      maxDistance = Math.max(
        maxDistance,
        calculateDistanceKm(
          { latitude: left.latitude, longitude: left.longitude },
          { latitude: right.latitude, longitude: right.longitude },
        ),
      );
    }
  }
  return maxDistance;
}

function estimateFee(distanceKm: number, deliveriesCount: number, constraints: DeliveryOptimizationConstraints) {
  const distanceFee = Number.isFinite(distanceKm) ? distanceKm * constraints.perKmFee : 0;
  return Math.round((constraints.baseDeliveryFee * deliveriesCount + distanceFee) * 100) / 100;
}

function scorePlan(params: {
  fee: number;
  distanceKm: number;
  durationMinutes: number;
  waitMinutes: number;
  delayMinutes: number;
  deliveriesCount: number;
}, constraints: DeliveryOptimizationConstraints) {
  const splitPenalty = params.deliveriesCount > 1 ? constraints.splitDeliveryPenalty * params.deliveriesCount : 0;
  return Math.round((
    params.fee +
    (Number.isFinite(params.distanceKm) ? params.distanceKm : constraints.maxExtraKm * 2) +
    params.durationMinutes / 10 +
    params.waitMinutes / 10 +
    params.delayMinutes / 10 +
    splitPenalty
  ) * 100) / 100;
}

function zoneFromSpace(space: TraiteurSpace) {
  return normalizeZone(space.commune || space.zone.split('—')[0].split('–')[0].trim() || space.zone);
}

export function buildOptimizableVendorsFromCart(
  items: Array<Product & { quantity?: number }>,
  spaces: TraiteurSpace[],
): OptimizableVendor[] {
  const vendorNames = Array.from(new Set(items.map((item) => item.vendor?.business_name || item.vendor_id).filter(Boolean)));
  return vendorNames.map((vendorName) => {
    const space = spaces.find((candidate) => normalizeVendor(candidate.name) === normalizeVendor(vendorName));
    const coords = space?.latitude != null && space.longitude != null
      ? { latitude: space.latitude, longitude: space.longitude }
      : resolveTraiteurCoords(space?.zone || vendorName, space?.commune);

    return {
      vendorId: vendorName,
      name: space?.name || vendorName,
      deliveryZoneId: space ? zoneFromSpace(space) : normalizeZone(vendorName),
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      preparationTimeMinutes: space?.prep_time ?? 30,
      deliveryRadiusKm: 10,
      pickupAvailable: true,
      scheduledDeliveryAvailable: Boolean(space?.delivery_slots?.length),
      deliverySlots: space?.delivery_slots ?? [],
    };
  });
}

export function optimizeDeliveryPlan(params: {
  vendors: OptimizableVendor[];
  customer?: Coords | null;
  constraints?: DeliveryOptimizationConstraints;
  hubs?: ConsolidationHub[];
}): DeliveryOptimizationPlan {
  const constraints = params.constraints || DEFAULT_DELIVERY_OPTIMIZATION_CONSTRAINTS;
  const vendors = params.vendors.filter((vendor) => vendor.scheduledDeliveryAvailable);
  const vendorZones = Array.from(new Set(vendors.map((vendor) => vendor.deliveryZoneId)));
  const vendorNames = vendors.map((vendor) => vendor.name);
  const commonSlots = intersectSlots(vendors);
  const unavailableVendors = params.vendors.filter((vendor) => !vendor.scheduledDeliveryAvailable);

  if (vendors.length === 0 || unavailableVendors.length > 0) {
    return {
      code: 'NO_COMPATIBLE_DELIVERY_OPTION',
      label: 'Aucune livraison programmée compatible',
      explanation: 'Un ou plusieurs traiteurs ne disposent pas de livraison programmée activée.',
      deliveriesCount: 0,
      totalFee: 0,
      estimatedDurationMinutes: 0,
      totalDistanceKm: 0,
      commonSlots: [],
      vendorZones,
      vendorNames,
      requiresExplicitConfirmation: false,
      score: Number.POSITIVE_INFINITY,
    };
  }

  if (commonSlots.length === 0) {
    return {
      code: 'CROSS_ZONE_SPLIT_DELIVERY_REQUIRED',
      label: 'Livraison en plusieurs fois nécessaire',
      explanation: 'Aucun créneau commun ne couvre tous les traiteurs. Des livraisons séparées doivent être confirmées.',
      deliveriesCount: vendors.length,
      totalFee: estimateFee(0, vendors.length, constraints),
      estimatedDurationMinutes: vendors.reduce((sum, vendor) => sum + vendor.preparationTimeMinutes, 0),
      totalDistanceKm: 0,
      commonSlots: [],
      vendorZones,
      vendorNames,
      requiresExplicitConfirmation: true,
      score: scorePlan({ fee: estimateFee(0, vendors.length, constraints), distanceKm: 0, durationMinutes: 90, waitMinutes: 0, delayMinutes: 0, deliveriesCount: vendors.length }, constraints),
    };
  }

  if (vendorZones.length === 1) {
    const distanceKm = maxPairwiseDistanceKm(vendors);
    const durationMinutes = Math.max(...vendors.map((vendor) => vendor.preparationTimeMinutes)) + 25;
    const fee = estimateFee(Number.isFinite(distanceKm) ? distanceKm : 0, 1, constraints);
    return {
      code: 'SAME_ZONE_CONSOLIDATED_DELIVERY',
      label: 'Livraison groupée disponible',
      explanation: 'Tous les traiteurs sont dans la même zone et partagent au moins un créneau compatible.',
      deliveriesCount: 1,
      totalFee: fee,
      estimatedDurationMinutes: durationMinutes,
      totalDistanceKm: Number.isFinite(distanceKm) ? Math.round(distanceKm * 10) / 10 : 0,
      commonSlots,
      vendorZones,
      vendorNames,
      requiresExplicitConfirmation: false,
      score: scorePlan({ fee, distanceKm, durationMinutes, waitMinutes: 0, delayMinutes: 0, deliveriesCount: 1 }, constraints),
    };
  }

  const crossZoneDistanceKm = maxPairwiseDistanceKm(vendors);
  const detourMinutes = Number.isFinite(crossZoneDistanceKm)
    ? (crossZoneDistanceKm / constraints.averageSpeedKmh) * 60
    : Number.POSITIVE_INFINITY;
  const routeDurationMinutes = Math.max(...vendors.map((vendor) => vendor.preparationTimeMinutes)) + detourMinutes + 25;
  const routeFee = estimateFee(crossZoneDistanceKm, 1, constraints);
  if (
    crossZoneDistanceKm <= constraints.maxExtraKm &&
    detourMinutes <= constraints.maxDetourMinutes &&
    routeFee <= constraints.maxDeliveryCost
  ) {
    return {
      code: 'CROSS_ZONE_OPTIMIZED_ROUTE',
      label: 'Itinéraire optimisé entre plusieurs zones',
      explanation: 'Les zones sont compatibles avec un seul itinéraire consolidé sous les limites de détour, délai et coût.',
      deliveriesCount: 1,
      totalFee: routeFee,
      estimatedDurationMinutes: Math.round(routeDurationMinutes),
      totalDistanceKm: Math.round(crossZoneDistanceKm * 10) / 10,
      commonSlots,
      vendorZones,
      vendorNames,
      requiresExplicitConfirmation: false,
      score: scorePlan({ fee: routeFee, distanceKm: crossZoneDistanceKm, durationMinutes: routeDurationMinutes, waitMinutes: 0, delayMinutes: 0, deliveriesCount: 1 }, constraints),
    };
  }

  const activeHub = (params.hubs || []).find((hub) => hub.active && vendorZones.includes(hub.zoneId));
  if (activeHub) {
    const hubPoint = { latitude: activeHub.latitude, longitude: activeHub.longitude };
    const distanceToHub = vendors.reduce((sum, vendor) => {
      if (vendor.latitude == null || vendor.longitude == null) return sum + constraints.maxExtraKm;
      return sum + calculateDistanceKm({ latitude: vendor.latitude, longitude: vendor.longitude }, hubPoint);
    }, 0);
    const fee = estimateFee(distanceToHub, 1, constraints);
    if (fee <= constraints.maxDeliveryCost) {
      return {
        code: 'CROSS_ZONE_HUB_CONSOLIDATION',
        label: 'Point de consolidation disponible',
        explanation: `Les commandes peuvent être regroupées au hub ${activeHub.name} avant une seule livraison finale.`,
        deliveriesCount: 1,
        totalFee: fee,
        estimatedDurationMinutes: Math.round(Math.max(...vendors.map((vendor) => vendor.preparationTimeMinutes)) + 45),
        totalDistanceKm: Math.round(distanceToHub * 10) / 10,
        commonSlots,
        vendorZones,
        vendorNames,
        requiresExplicitConfirmation: false,
        score: scorePlan({ fee, distanceKm: distanceToHub, durationMinutes: 45, waitMinutes: 10, delayMinutes: 0, deliveriesCount: 1 }, constraints),
      };
    }
  }

  const splitDistance = params.customer
    ? vendors.reduce((sum, vendor) => {
        if (vendor.latitude == null || vendor.longitude == null) return sum;
        return sum + calculateDistanceKm({ latitude: vendor.latitude, longitude: vendor.longitude }, params.customer as Coords);
      }, 0)
    : 0;
  const splitFee = estimateFee(splitDistance, vendors.length, constraints);

  if (splitFee > constraints.maxDeliveryCost * vendors.length) {
    return {
      code: 'NO_COMPATIBLE_DELIVERY_OPTION',
      label: 'Aucune option raisonnable',
      explanation: 'Les livraisons fractionnées dépassent le plafond de coût configuré.',
      deliveriesCount: 0,
      totalFee: splitFee,
      estimatedDurationMinutes: 0,
      totalDistanceKm: Math.round(splitDistance * 10) / 10,
      commonSlots,
      vendorZones,
      vendorNames,
      requiresExplicitConfirmation: false,
      score: Number.POSITIVE_INFINITY,
    };
  }

  return {
    code: 'CROSS_ZONE_SPLIT_DELIVERY_REQUIRED',
    label: 'Livraison en plusieurs fois nécessaire',
    explanation: 'Aucune consolidation raisonnable ne respecte les limites configurées. Le client doit confirmer plusieurs livraisons.',
    deliveriesCount: vendors.length,
    totalFee: splitFee,
    estimatedDurationMinutes: vendors.reduce((sum, vendor) => sum + vendor.preparationTimeMinutes + 25, 0),
    totalDistanceKm: Math.round(splitDistance * 10) / 10,
    commonSlots,
    vendorZones,
    vendorNames,
    requiresExplicitConfirmation: true,
    score: scorePlan({ fee: splitFee, distanceKm: splitDistance, durationMinutes: 90, waitMinutes: 0, delayMinutes: 0, deliveriesCount: vendors.length }, constraints),
  };
}
