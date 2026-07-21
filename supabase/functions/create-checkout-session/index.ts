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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function safeBaseUrl(value: unknown, requestOrigin: string | null) {
  const candidates = [value, requestOrigin, "https://delikreol.com"];
  for (const candidate of candidates) {
    if (typeof candidate !== "string" || candidate.length === 0) continue;
    try {
      const url = new URL(candidate);
      if (allowedOrigins.has(url.origin)) return url.origin;
    } catch {
      // Try the next candidate.
    }
  }
  return "https://delikreol.com";
}

type OrderItemRow = {
  product_name: string | null;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string | null;
  vendor_id: string | null;
  vendor_commission: number | string | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json(req, { error: "Authentication required" }, 401);

    const supabaseUrl = assertEnv("SUPABASE_URL");
    const serviceRoleKey = assertEnv("SUPABASE_SERVICE_ROLE_KEY");
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return json(req, { error: "Invalid session" }, 401);

    const body = await req.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    if (!orderId) return json(req, { error: "orderId is required" }, 400);

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, order_number, customer_id, delivery_fee, total_amount, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return json(req, { error: "Order not found" }, 404);
    if (order.customer_id !== authData.user.id) return json(req, { error: "Forbidden" }, 403);
    if (order.payment_status === "paid") return json(req, { error: "Order already paid" }, 409);

    const { data: rawItems, error: itemsError } = await admin
      .from("order_items")
      .select("product_name, quantity, unit_price, subtotal, vendor_id, vendor_commission")
      .eq("order_id", order.id);

    if (itemsError) throw itemsError;
    const items = (rawItems || []) as OrderItemRow[];
    if (items.length === 0) return json(req, { error: "Order has no items" }, 400);

    const itemTotalCents = items.reduce((sum, item) => {
      const subtotal = toNumber(item.subtotal) || toNumber(item.unit_price) * item.quantity;
      return sum + Math.round(subtotal * 100);
    }, 0);
    const deliveryFeeCents = Math.round(toNumber(order.delivery_fee) * 100);
    const totalCents = itemTotalCents + deliveryFeeCents;

    if (totalCents <= 0) return json(req, { error: "Invalid order total" }, 400);

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
        const recordedCommission = items.reduce(
          (sum, item) => sum + Math.round(toNumber(item.vendor_commission) * 100),
          0,
        );
        const rateCommission = Math.round(itemTotalCents * (toNumber(vendor.commission_rate) / 100));
        applicationFeeCents = Math.min(
          Math.max(recordedCommission || rateCommission, 0),
          Math.max(totalCents - 1, 0),
        );
      }
    }

    const siteUrl = safeBaseUrl(body.returnUrl, req.headers.get("origin"));
    const stripe = new Stripe(assertEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-02-25.clover",
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: (item.product_name || "Article DELIKREOL").slice(0, 127),
        },
        unit_amount: Math.round(toNumber(item.unit_price) * 100),
      },
      quantity: Math.max(1, Math.floor(item.quantity)),
    }));

    if (deliveryFeeCents > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Frais de livraison" },
          unit_amount: deliveryFeeCents,
        },
        quantity: 1,
      });
    }

    const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData = {
      metadata: {
        orderId: order.id,
        order_number: order.order_number || "",
      },
    };

    if (connectedAccountId) {
      paymentIntentData.transfer_data = { destination: connectedAccountId };
      paymentIntentData.application_fee_amount = applicationFeeCents;
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: lineItems,
        customer_email: authData.user.email || undefined,
        client_reference_id: order.id,
        success_url: `${siteUrl}/?stripe=success&order_id=${encodeURIComponent(order.id)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/?stripe=cancelled&order_id=${encodeURIComponent(order.id)}`,
        metadata: {
          orderId: order.id,
          order_number: order.order_number || "",
        },
        payment_intent_data: paymentIntentData,
      },
      { idempotencyKey: `delikreol_checkout_${order.id}` },
    );

    if (!session.url) throw new Error("Stripe Checkout URL was not returned");

    await admin
      .from("orders")
      .update({ payment_status: "processing", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    await admin.from("order_events").insert({
      order_id: order.id,
      event_type: "stripe_checkout_created",
      payload: {
        checkout_session_id: session.id,
        amount_total: totalCents,
        connected_account_id: connectedAccountId,
        application_fee_amount: applicationFeeCents,
      },
    });

    return json(req, { url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("create-checkout-session error", error);
    return json(
      req,
      { error: error instanceof Error ? error.message : "Unable to create Stripe Checkout session" },
      500,
    );
  }
});
