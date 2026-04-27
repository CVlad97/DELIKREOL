import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type LiteOrderPayload = {
  customer_name: string;
  customer_phone: string;
  delivery_mode: 'pickup' | 'pilot' | 'out_of_zone';
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  note?: string | null;
  total_amount: number;
  items: Array<{
    product_name: string;
    vendor_name?: string | null;
    quantity: number;
    unit_price: number;
  }>;
};

export type BusinessRequestPayload = {
  company_name: string;
  contact: string;
  people_count?: number | null;
  requested_date?: string | null;
  requested_time?: string | null;
  location?: string | null;
  budget?: string | null;
  frequency?: string | null;
};

export async function createLiteOrder(payload: LiteOrderPayload) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      delivery_type: payload.delivery_mode,
      scheduled_date: payload.scheduled_date ?? null,
      scheduled_time: payload.scheduled_time ?? null,
      note: payload.note ?? null,
      total_amount: payload.total_amount,
      status: 'pending',
      source: 'lite'
    })
    .select()
    .maybeSingle();
  if (error || !data) return { data: null, error: error?.message ?? 'Order insert failed' };

  const itemsPayload = payload.items.map((item) => ({
    order_id: data.id,
    product_name: item.product_name,
    vendor_name: item.vendor_name ?? null,
    quantity: item.quantity,
    unit_price: item.unit_price
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
  if (itemsError) return { data, error: itemsError.message };
  return { data, error: null };
}

export async function createBusinessRequest(payload: BusinessRequestPayload) {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase not configured' };
  const { data, error } = await supabase
    .from('business_requests')
    .insert({
      company_name: payload.company_name,
      contact: payload.contact,
      people_count: payload.people_count ?? null,
      requested_date: payload.requested_date ?? null,
      requested_time: payload.requested_time ?? null,
      location: payload.location ?? null,
      budget: payload.budget ?? null,
      frequency: payload.frequency ?? null,
      status: 'pending',
      source: 'lite'
    })
    .select()
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
