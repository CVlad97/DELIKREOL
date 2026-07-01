import { publicSupabase, isPublicSupabaseConfigured } from '../lib/publicSupabase';
import { partnerProfiles } from '../data/partnerProfiles';

const assetFromPublic = (relativePath: string): string => {
  const clean = relativePath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
};

export const PRODUCT_IMAGE_FALLBACK = assetFromPublic('vendors/_fallback/photo-a-confirmer.svg');

export type PublicVendorRow = {
  id: string;
  business_name?: string | null;
  name?: string | null;
  business_type?: string | null;
  description?: string | null;
  logo_url?: string | null;
  image_url?: string | null;
  address?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  commission_rate?: number | string | null;
  delivery_radius_km?: number | string | null;
  service_zone?: string | null;
  zone_label?: string | null;
  is_active?: boolean | string | null;
  is_public?: boolean | string | null;
  is_demo?: boolean | string | null;
  status?: string | null;
  opening_hours?: Record<string, unknown> | null;
  created_at?: string | null;
};

export type PublicProductRow = {
  id: string;
  vendor_id?: string | null;
  vendorId?: string | null;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  price?: number | string | null;
  image_url?: string | null;
  image?: string | null;
  is_available?: boolean | string | null;
  available?: boolean | string | null;
  stock_quantity?: number | string | null;
  is_public?: boolean | string | null;
  is_demo?: boolean | string | null;
  status?: string | null;
  created_at?: string | null;
};

export type PublicCatalogProduct = {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_latitude: number | null;
  vendor_longitude: number | null;
  vendor_delivery_radius_km: number;
  name: string;
  description: string;
  category: string;
  price: number | null;
  image_url: string | null;
  stock_quantity: number | null;
  zone_label: string;
  available: boolean;
};

export type PublicCatalogVendor = {
  id: string;
  business_name: string;
  business_type: string;
  description: string;
  logo_url: string | null;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  commission_rate: number;
  delivery_radius_km: number;
  zone_label: string;
};

const truthy = (value: unknown) => value === true || String(value ?? '').toLowerCase() === 'true';
const verified = (value: unknown) => String(value ?? '').toLowerCase() === 'verified';
const numberOr = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

type PilotVendorSeed = {
  business_name: string;
  display_name: string;
  business_type: string;
  description: string;
  product_name: string;
  product_description: string;
};

const pilotVendors: PilotVendorSeed[] = [
  {
    business_name: "Coco's Food",
    display_name: 'Coco Food',
    business_type: 'Partenaire pilote',
    description: 'Partenaire pilote. Carte en cours d’intégration.',
    product_name: 'Carte Coco Food en cours d’intégration',
    product_description: 'Nombreuses photos reçues. Prix et descriptions à confirmer.',
  },
  {
    business_name: 'Les Delices de Ninice',
    display_name: 'Les Délices de Ninice',
    business_type: 'Partenaire pilote',
    description: 'Partenaire pilote. Spécialités en cours d’intégration.',
    product_name: 'Spécialités Les Délices de Ninice',
    product_description: 'Carte en cours d’intégration. Prix à confirmer.',
  },
  {
    business_name: "Saveurs d'Afrique",
    display_name: 'Saveur Afrique',
    business_type: 'Partenaire pilote',
    description: 'Partenaire pilote. Carte à confirmer.',
    product_name: 'Saveur Afrique — carte à confirmer',
    product_description: 'Carte en cours d’intégration. Prix à confirmer.',
  },
];

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function catalogKey(value: string) {
  const normalized = normalizeName(value);
  if (normalized.includes('coco') && normalized.includes('food')) return 'coco-food';
  if (normalized.includes('ninice')) return 'ninice';
  if (normalized.includes('saveur') && normalized.includes('afrique')) return 'saveur-afrique';
  if (normalized.includes('lodika') && normalized.includes('afrique')) return 'saveur-afrique';
  return normalized;
}

function getPartnerProfile(name: string) {
  const target = catalogKey(name);
  return (
    partnerProfiles.find((profile) => catalogKey(profile.name) === target || (profile.legalName ? catalogKey(profile.legalName) === target : false)) ?? null
  );
}

function vendorIsPublic(row: PublicVendorRow) {
  return truthy(row.is_public) && !truthy(row.is_demo) && verified(row.status) && row.is_active !== false;
}

function productIsPublic(row: PublicProductRow) {
  const available = row.available ?? row.is_available;
  return truthy(row.is_public) && !truthy(row.is_demo) && verified(row.status) && available !== false && String(available ?? 'true').toLowerCase() !== 'false';
}

function normalizeVendor(row: PublicVendorRow): PublicCatalogVendor {
  return {
    id: row.id,
    business_name: row.business_name ?? row.name ?? 'Partenaire DELIKREOL',
    business_type: row.business_type ?? 'Partenaire local',
    description: row.description ?? 'Partenaire vérifié en Martinique.',
    logo_url: row.logo_url ?? row.image_url ?? PRODUCT_IMAGE_FALLBACK,
    address: row.address ?? row.zone_label ?? row.service_zone ?? 'Martinique',
    phone: row.phone ?? '',
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    commission_rate: numberOr(row.commission_rate, 0.15),
    delivery_radius_km: numberOr(row.delivery_radius_km, 3),
    zone_label: row.zone_label ?? row.service_zone ?? row.address ?? 'Martinique',
  };
}

function normalizeProduct(row: PublicProductRow, vendor: PublicCatalogVendor): PublicCatalogProduct {
  return {
    id: row.id,
    vendor_id: row.vendor_id ?? row.vendorId ?? vendor.id,
    vendor_name: vendor.business_name,
    vendor_latitude: vendor.latitude,
    vendor_longitude: vendor.longitude,
    vendor_delivery_radius_km: vendor.delivery_radius_km,
    name: row.name ?? 'Produit local',
    description: row.description ?? 'Disponibilité à confirmer par le partenaire.',
    category: row.category ?? 'Cuisine locale',
    price: row.price == null ? null : numberOr(row.price, 0),
    image_url: row.image_url ?? row.image ?? PRODUCT_IMAGE_FALLBACK,
    stock_quantity: row.stock_quantity == null ? null : numberOr(row.stock_quantity, 0),
    zone_label: vendor.zone_label,
    available: true,
  };
}

function buildPilotVendor(seed: PilotVendorSeed, index: number): PublicCatalogVendor {
  const profile = getPartnerProfile(seed.business_name);
  return {
    id: `pilot-${index + 1}`,
    business_name: seed.display_name,
    business_type: seed.business_type,
    description: seed.description,
    logo_url: null,
    address: profile?.address ?? profile?.zone ?? 'Martinique',
    phone: profile?.contactPhone ?? '',
    latitude: null,
    longitude: null,
    commission_rate: 0.15,
    delivery_radius_km: 3,
    zone_label: profile?.zone ?? profile?.address ?? 'Martinique',
  };
}

function buildPilotProduct(seed: PilotVendorSeed, vendor: PublicCatalogVendor, index: number): PublicCatalogProduct {
  return {
    id: `pilot-product-${index + 1}`,
    vendor_id: vendor.id,
    vendor_name: vendor.business_name,
    vendor_latitude: vendor.latitude,
    vendor_longitude: vendor.longitude,
    vendor_delivery_radius_km: vendor.delivery_radius_km,
    name: seed.product_name,
    description: seed.product_description,
    category: 'Partenaire pilote',
    price: null,
    image_url: null,
    stock_quantity: null,
    zone_label: vendor.zone_label,
    available: false,
  };
}

function mergePilotFallback(vendors: PublicCatalogVendor[], products: PublicCatalogProduct[]) {
  const vendorByKey = new Map(vendors.map((vendor) => [catalogKey(vendor.business_name), vendor]));
  const missingPilotKeys = new Set<string>();
  const mergedVendors = [...vendors];

  pilotVendors.forEach((seed, index) => {
    const key = catalogKey(seed.business_name);
    if (vendorByKey.has(key)) return;
    const pilotVendor = buildPilotVendor(seed, index);
    vendorByKey.set(key, pilotVendor);
    missingPilotKeys.add(key);
    mergedVendors.push(pilotVendor);
  });

  const mergedProducts = [...products];
  pilotVendors.forEach((seed, index) => {
    const key = catalogKey(seed.business_name);
    if (!missingPilotKeys.has(key)) return;
    const vendor = vendorByKey.get(key);
    if (!vendor) return;
    mergedProducts.push(buildPilotProduct(seed, vendor, index));
  });

  return { vendors: mergedVendors, products: mergedProducts };
}

export async function loadPublicCatalog() {
  if (!isPublicSupabaseConfigured || !publicSupabase) {
    const fallback = mergePilotFallback([], []);
    return { configured: false, vendors: fallback.vendors, products: fallback.products };
  }

  try {
    const [{ data: vendorRows, error: vendorError }, { data: productRows, error: productError }] = await Promise.all([
      publicSupabase.from('vendors').select('*').order('created_at', { ascending: false }),
      publicSupabase.from('products').select('*').order('created_at', { ascending: false }),
    ]);

    if (vendorError || productError) {
      throw vendorError ?? productError;
    }

    const vendors = ((vendorRows ?? []) as PublicVendorRow[]).filter(vendorIsPublic).map(normalizeVendor);
    const vendorMap = new Map(vendors.map((vendor) => [vendor.id, vendor]));
    const products = ((productRows ?? []) as PublicProductRow[])
      .filter(productIsPublic)
      .map((product) => {
        const vendorId = product.vendor_id ?? product.vendorId ?? '';
        const vendor = vendorMap.get(vendorId);
        return vendor ? normalizeProduct(product, vendor) : null;
      })
      .filter((product): product is PublicCatalogProduct => Boolean(product));

    const merged = mergePilotFallback(vendors, products);
    return { configured: true, vendors: merged.vendors, products: merged.products };
  } catch {
    const fallback = mergePilotFallback([], []);
    return { configured: true, vendors: fallback.vendors, products: fallback.products };
  }
}
