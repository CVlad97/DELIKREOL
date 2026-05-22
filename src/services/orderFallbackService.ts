export type FallbackOrderItem = {
  product_id: string;
  vendor_id: string;
  product_name: string;
  vendor_name: string;
  quantity: number;
  unit_price: number;
};

export type FallbackOrderPayload = {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_mode: 'delivery' | 'pickup';
  delivery_address: string | null;
  delivery_slot: string | null;
  payment_method: string;
  vendor_availability_status: string;
  total_amount: number;
  source: string;
  items: FallbackOrderItem[];
};

type FallbackSaveResult = {
  saved: boolean;
  error?: string;
};

export async function saveFallbackOrderToSheet(payload: FallbackOrderPayload): Promise<FallbackSaveResult> {
  const endpoint = import.meta.env.VITE_SHEETS_API_URL || import.meta.env.VITE_METRICS_WEBHOOK_URL;
  if (!endpoint) {
    return { saved: false, error: 'Aucun endpoint Sheets/Metrics configuré.' };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'checkout_fallback',
        payload,
        sent_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      return { saved: false, error: `Endpoint indisponible (${res.status}).` };
    }

    return { saved: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { saved: false, error: message };
  }
}
