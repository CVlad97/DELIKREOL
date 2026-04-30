import { publicSupabase, isPublicSupabaseConfigured } from '../lib/publicSupabase';

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
  price: number;
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
    description: row.description ?? 'Partenaire verifie en Martinique.',
    logo_url: row.logo_url ?? row.image_url ?? null,
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
    description: row.description ?? 'Disponibilite confirmee par le partenaire.',
    category: row.category ?? 'Cuisine locale',
    price: numberOr(row.price, 0),
    image_url: row.image_url ?? row.image ?? null,
    stock_quantity: row.stock_quantity == null ? null : numberOr(row.stock_quantity, 0),
    zone_label: vendor.zone_label,
    available: true,
  };
}

export async function loadPublicCatalog() {
  if (!isPublicSupabaseConfigured || !publicSupabase) {
    return { configured: false, vendors: [] as PublicCatalogVendor[], products: [] as PublicCatalogProduct[] };
  }

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

  return { configured: true, vendors, products };
}
