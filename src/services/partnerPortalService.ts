import { publicSupabase, isPublicSupabaseConfigured } from '../lib/publicSupabase';

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

function getClient() {
  if (!isPublicSupabaseConfigured || !publicSupabase) {
    throw new Error('Supabase public non configure.');
  }
  return publicSupabase;
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
    delivery_radius_km: input.delivery_radius_km ?? 8,
    opening_hours: input.opening_hours ?? null,
    source: 'public_partner_portal',
    status: 'pending_review',
  };

  const { error } = await client.from('partner_applications').insert(payload);
  if (error) throw error;
}

export async function uploadPartnerProductPhoto(file: File) {
  const client = getClient();
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

  const { error } = await client.from('partner_catalog_submissions').insert(payload);
  if (error) throw error;
}
