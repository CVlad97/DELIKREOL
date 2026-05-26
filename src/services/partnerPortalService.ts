import { publicSupabase, isPublicSupabaseConfigured } from '../lib/publicSupabase';
import { isDemoMode } from '../lib/supabase';

export type PartnerLeadInput = {
  business_name: string;
  contact_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  commune?: string;
  zone_label?: string;
  activity_type?: string;
  delivery_radius_km?: number;
  opening_hours?: string;
};

export type PartnerProductInput = {
  business_name: string;
  product_name: string;
  description?: string;
  category?: string;
  price?: number;
  stock_quantity?: number;
  is_available?: boolean;
  image_url?: string | null;
};

type LocalPartnerLead = Record<string, unknown> & {
  id: string;
  source: string;
  status: string;
  created_at: string;
};

type LocalPartnerProduct = Record<string, unknown> & {
  id: string;
  source: string;
  status: string;
  created_at: string;
};

const LEADS_KEY = 'delikreol_partner_leads_local_v1';
const PRODUCTS_KEY = 'delikreol_partner_products_local_v1';

function readLocalJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalJson<T>(key: string, rows: T[]) {
  localStorage.setItem(key, JSON.stringify(rows));
}

function saveLeadLocally(input: Record<string, unknown>) {
  const rows = readLocalJson<LocalPartnerLead>(LEADS_KEY);
  rows.unshift({
    ...input,
    id: `lead_${Date.now()}`,
    source: 'public_partner_portal_demo',
    status: 'pending_review',
    created_at: new Date().toISOString(),
  });
  writeLocalJson(LEADS_KEY, rows.slice(0, 200));
}

function saveProductLocally(input: Record<string, unknown>) {
  const rows = readLocalJson<LocalPartnerProduct>(PRODUCTS_KEY);
  rows.unshift({
    ...input,
    id: `prod_${Date.now()}`,
    source: 'public_partner_portal_demo',
    status: 'pending_review',
    created_at: new Date().toISOString(),
  });
  writeLocalJson(PRODUCTS_KEY, rows.slice(0, 500));
}

function getClient() {
  if (!isPublicSupabaseConfigured || !publicSupabase) {
    return null;
  }
  return publicSupabase;
}

function toSafeRadius(value?: number) {
  const n = Number(value ?? 8);
  if (!Number.isFinite(n) || n <= 0) return 8;
  return Math.min(40, n);
}

export async function submitPartnerLead(input: PartnerLeadInput) {
  const client = getClient();
  const payload = {
    business_name: input.business_name,
    contact_name: input.contact_name,
    phone: input.phone,
    whatsapp: input.whatsapp ?? input.phone,
    email: input.email ?? null,
    address: input.address ?? null,
    commune: input.commune ?? null,
    zone_label: input.zone_label ?? input.commune ?? null,
    activity_type: input.activity_type ?? 'food_partner',
    delivery_radius_km: toSafeRadius(input.delivery_radius_km),
    opening_hours: input.opening_hours ?? null,
    source: 'public_partner_portal',
    status: 'pending_review',
  };

  if (!client || isDemoMode) {
    saveLeadLocally(payload);
    return;
  }

  const { error } = await client.from('partner_applications').insert(payload);
  if (error) {
    saveLeadLocally(payload);
    throw error;
  }
}

export async function uploadPartnerProductPhoto(file: File) {
  const client = getClient();
  if (!client || isDemoMode) {
    return { path: `demo/${Date.now()}-${file.name}`, publicUrl: '' };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `public/${Date.now()}-${safeName}`;
  const { error } = await client.storage.from('product-photos').upload(path, file, { upsert: false, cacheControl: '3600' });
  if (error) throw error;
  const { data } = client.storage.from('product-photos').getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function submitPartnerProduct(input: PartnerProductInput) {
  const client = getClient();
  const payload = {
    business_name: input.business_name,
    product_name: input.product_name,
    description: input.description ?? null,
    category: input.category ?? 'Cuisine locale',
    price: input.price ?? 0,
    stock_quantity: input.stock_quantity ?? null,
    is_available: input.is_available ?? true,
    image_url: input.image_url ?? null,
    source: 'public_partner_portal',
    status: 'pending_review',
  };

  if (!client || isDemoMode) {
    saveProductLocally(payload);
    return;
  }

  const { error } = await client.from('partner_catalog_submissions').insert(payload);
  if (error) {
    saveProductLocally(payload);
    throw error;
  }
}
