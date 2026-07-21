import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@19.3.1";

const allowedOrigins = new Set([
  "https://delikreol.com",
  "https://www.delikreol.com",
  "https://cvlad97.github.io",
  "http://localhost:5173",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://delikreol.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function assertEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

type OrderItemRow = {
  quantity: number;
  unit_price: number | string;
  subtotal: number | string | null;
  vendor_id: string | null;
  vendor_commission: number | string | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json(req, { error: "Authentication required" }, 401);

    const admin = createClient(assertEnv("SUPABASE_URL"), assertEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return json(req, { error: "Invalid session" }, 401);

    const body = await req.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const currency = typeof body.currency === "string" ? body.currency.toLowerCase() : "eur";
    if (!orderId) return json(req, { error: "orderId is required" }, 400);
    if (currency !== "eur") return json(req, { error: "Unsupported currency" }, 400);

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, customer_id, delivery_fee, payment_intent_id, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return json(req, { error: "Order not found" }, 404);
    if (order.customer_id !== authData.user.id) return json(req, { error: "Forbidden" }, 403);
    if (order.payment_status === "paid") return json(req, { error: "Order already paid" }, 409);

    const { data: rawItems, error: itemsError } = await admin
      .from("order_items")
      .select("quantity, unit_price, subtotal, vendor_id, vendor_commission")
      .eq("order_id", order.id);

    if (itemsError) throw itemsError;
    const items = (rawItems || []) as OrderItemRow[];
    if (items.length === 0) return json(req, { error: "Order has no items" }, 400);

    const itemTotalCents = items.reduce((sum, item) => {
      const subtotal = toNumber(item.subtotal) || toNumber(item.unit_price) * item.quantity;
      return sum + Math.round(subtotal * 100);
    }, 0);
    const totalCents = itemTotalCents + Math.round(toNumber(order.delivery_fee) * 100);
    if (totalCents <= 0) return json(req, { error: "Invalid order total" }, 400);

    const stripe = new Stripe(assertEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-02-25.clover",
    });

    if (order.payment_intent_id) {
      const existingIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);
      if (existingIntent.client_secret) return json(req, { clientSecret: existingIntent.client_secret, existing: true });
    }

    const vendorIds = Array.from(new Set(items.map((item) => item.vendor_id).filter(Boolean))) as string[];
    let connectedAccountId: string | null = null;
    let applicationFeeCents = 0;

    if (vendorIds.length === 1) {
      const { data: vendor } = await admin
        .from("vendors")
        .select("stripe_connect_account_id, stripe_charges_enabled, commission_rate")
        .eq("id", vendorIds[0])
        .maybeSingle();

      if (vendor?.stripe_charges_enabled && vendor.stripe_connect_account_id?.startsWith("acct_")) {
        connectedAccountId = vendor.stripe_connect_account_id;
        const recordedCommission = items.reduce((sum, item) => sum + Math.round(toNumber(item.vendor_commission) * 100), 0);
        const rateCommission = Math.round(itemTotalCents * (toNumber(vendor.commission_rate) / 100));
        applicationFeeCents = Math.min(Math.max(recordedCommission || rateCommission, 0), Math.max(totalCents - 1, 0));
      }
    }

    const params: Stripe.PaymentIntentCreateParams = {
      amount: totalCents,
      currency,
      metadata: { orderId: order.id },
      automatic_payment_methods: { enabled: true },
    };

    if (connectedAccountId) {
      params.transfer_data = { destination: connectedAccountId };
      params.application_fee_amount = applicationFeeCents;
    }

    const paymentIntent = await stripe.paymentIntents.create(params, {
      idempotencyKey: `delikreol_pi_${order.id}`,
    });

    await admin
      .from("orders")
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: "processing",
        payment_provider: "stripe_test",
        payment_method: "card",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    await admin.from("order_events").insert({
      order_id: order.id,
      event_type: "stripe_payment_intent_created",
      payload: {
        payment_intent_id: paymentIntent.id,
        amount: totalCents,
        connected_account_id: connectedAccountId,
        application_fee_amount: applicationFeeCents,
      },
    });

    return json(req, { clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("[stripe] create-payment-intent error", error instanceof Error ? error.message : String(error));
    return json(req, { error: "Unable to create payment intent" }, 500);
  }
});
