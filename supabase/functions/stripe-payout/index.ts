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

function toCents(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

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

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();
    if (profile?.role !== "admin") return json(req, { error: "Admin role required" }, 403);

    const body = await req.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    if (!orderId) return json(req, { error: "orderId is required" }, 400);

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, order_number, payment_status, status")
      .eq("id", orderId)
      .single();
    if (orderError || !order) return json(req, { error: "Order not found" }, 404);
    if (order.payment_status !== "paid") return json(req, { error: "Order not paid" }, 409);
    if (["cancelled"].includes(order.status)) return json(req, { error: "Order cancelled" }, 409);

    const { data: existingPayout } = await admin
      .from("payouts")
      .select("id, status, stripe_transfer_id")
      .eq("order_id", orderId)
      .in("status", ["pending", "processing", "paid"])
      .maybeSingle();
    if (existingPayout) {
      return json(req, {
        error: "Payout already exists",
        payout: existingPayout,
      }, 409);
    }

    const { data: items, error: itemsError } = await admin
      .from("order_items")
      .select("vendor_id, subtotal, vendor_commission")
      .eq("order_id", orderId);
    if (itemsError) throw itemsError;
    if (!items || items.length === 0) return json(req, { error: "Order has no items" }, 400);

    const vendorIds = Array.from(new Set(items.map((item) => item.vendor_id).filter(Boolean))) as string[];
    if (vendorIds.length !== 1) return json(req, { error: "Payout multi-vendeur non supporté" }, 409);

    const { data: vendor, error: vendorError } = await admin
      .from("vendors")
      .select("stripe_connect_account_id, stripe_charges_enabled, stripe_payouts_enabled")
      .eq("id", vendorIds[0])
      .single();
    if (vendorError || !vendor) return json(req, { error: "Vendor not found" }, 404);
    if (!vendor.stripe_charges_enabled || !vendor.stripe_payouts_enabled || !vendor.stripe_connect_account_id?.startsWith("acct_")) {
      return json(req, { error: "Compte Stripe Connect vendeur incomplet" }, 409);
    }

    const eligibleCents = items.reduce((sum, item) => {
      const subtotalCents = toCents(item.subtotal);
      const commissionCents = toCents(item.vendor_commission);
      return sum + Math.max(subtotalCents - commissionCents, 0);
    }, 0);
    if (eligibleCents <= 0) return json(req, { error: "No eligible payout amount" }, 400);

    const stripe = new Stripe(assertEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-02-25.clover",
    });
    const account = await stripe.accounts.retrieve(vendor.stripe_connect_account_id);
    if (!account.charges_enabled || !account.payouts_enabled) {
      return json(req, { error: "Stripe Connect account not ready" }, 409);
    }

    const transfer = await stripe.transfers.create(
      {
        amount: eligibleCents,
        currency: "eur",
        destination: vendor.stripe_connect_account_id,
        description: `Reversement vendeur DELIKREOL ${order.order_number || orderId}`,
        metadata: {
          order_id: orderId,
          order_number: order.order_number || "",
          vendor_id: vendorIds[0],
        },
      },
      { idempotencyKey: `delikreol_payout_${orderId}` },
    );

    const { error: payoutError } = await admin.from("payouts").insert({
      order_id: orderId,
      amount: eligibleCents / 100,
      currency: "eur",
      stripe_transfer_id: transfer.id,
      status: "paid",
      requested_by: authData.user.id,
      metadata: {
        stripe_account_id: vendor.stripe_connect_account_id,
        vendor_id: vendorIds[0],
        eligible_cents: eligibleCents,
      },
    });
    if (payoutError) throw payoutError;

    await admin.from("order_events").insert({
      order_id: orderId,
      event_type: "seller_payout_paid",
      payload: {
        transfer_id: transfer.id,
        amount_cents: eligibleCents,
        vendor_id: vendorIds[0],
      },
    });

    return json(req, {
      success: true,
      transfer: {
        id: transfer.id,
        amount_cents: eligibleCents,
        currency: "eur",
        destination: vendor.stripe_connect_account_id,
      },
    });
  } catch (error) {
    console.error("[stripe] payout error", error instanceof Error ? error.message : String(error));
    return json(req, { error: "Unable to create payout" }, 500);
  }
});
