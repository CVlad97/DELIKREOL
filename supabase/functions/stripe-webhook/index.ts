import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@19.3.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://delikreol.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function assertEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function getStripe() {
  return new Stripe(assertEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-02-25.clover",
  });
}

function getAdminClient() {
  return createClient(assertEnv("SUPABASE_URL"), assertEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function insertWebhookEvent(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event,
  payloadHash: string,
) {
  const { error } = await supabase.from("stripe_webhook_events").insert({
    id: event.id,
    event_type: event.type,
    type: event.type,
    processing_status: "processing",
    received_at: new Date().toISOString(),
    payload_hash: payloadHash,
    payload: {
      id: event.id,
      type: event.type,
      object: event.object,
      api_version: event.api_version,
    },
  });

  if (!error) return { inserted: true };
  if (error.code === "23505") return { inserted: false };

  console.error("[stripe] webhook idempotency insert failed", error.message);
  throw error;
}

async function updateWebhookEvent(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
  patch: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("stripe_webhook_events")
    .update(patch)
    .eq("id", eventId);

  if (error) console.warn("[stripe] webhook event update failed", error.message);
}

async function addOrderEvent(
  supabase: ReturnType<typeof createClient>,
  orderId: string,
  eventType: string,
  payload: Record<string, unknown>,
) {
  const { error } = await supabase.from("order_events").insert({
    order_id: orderId,
    event_type: eventType,
    payload,
  });

  if (error) console.warn("[stripe] order_event insert failed", error.message);
}

async function markOrderPaid(
  supabase: ReturnType<typeof createClient>,
  orderId: string,
  patch: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      payment_method: "card",
      payment_provider: "stripe_test",
      paid_at: new Date().toISOString(),
      ...patch,
    })
    .eq("id", orderId);

  if (error) throw error;
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.orderId || session.client_reference_id || "";
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;

  console.log(`[stripe] checkout.session.completed order=${orderId || "missing"} session=${session.id}`);
  if (!orderId) return { orderId: null, paymentIntentId };

  const patch: Record<string, unknown> = {
    stripe_checkout_session_id: session.id,
    payment_intent_id: paymentIntentId,
  };

  if (session.payment_status === "paid") {
    await markOrderPaid(supabase, orderId, patch);
  } else {
    const { error } = await supabase
      .from("orders")
      .update({
        ...patch,
        payment_status: "processing",
        payment_provider: "stripe_test",
        payment_method: "card",
      })
      .eq("id", orderId);
    if (error) throw error;
  }

  await addOrderEvent(supabase, orderId, "stripe_checkout_completed", {
    checkout_session_id: session.id,
    payment_intent_id: paymentIntentId,
    payment_status: session.payment_status,
  });

  return { orderId, paymentIntentId };
}

async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent,
) {
  const orderId = paymentIntent.metadata?.orderId || "";
  console.log(`[stripe] payment_intent.succeeded order=${orderId || "missing"} pi=${paymentIntent.id}`);
  if (!orderId) return { orderId: null, paymentIntentId: paymentIntent.id };

  await markOrderPaid(supabase, orderId, {
    payment_intent_id: paymentIntent.id,
  });

  await addOrderEvent(supabase, orderId, "payment_succeeded", {
    payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  });

  return { orderId, paymentIntentId: paymentIntent.id };
}

async function handlePaymentIntentFailed(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent,
) {
  const orderId = paymentIntent.metadata?.orderId || "";
  console.log(`[stripe] payment_intent.payment_failed order=${orderId || "missing"} pi=${paymentIntent.id}`);
  if (!orderId) return { orderId: null, paymentIntentId: paymentIntent.id };

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      payment_error: paymentIntent.last_payment_error?.message || "Paiement refusé",
      payment_intent_id: paymentIntent.id,
    })
    .eq("id", orderId);

  if (error) throw error;
  await addOrderEvent(supabase, orderId, "payment_failed", {
    payment_intent_id: paymentIntent.id,
    failure_code: paymentIntent.last_payment_error?.code || null,
  });

  return { orderId, paymentIntentId: paymentIntent.id };
}

async function handleChargeRefunded(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  charge: Stripe.Charge,
) {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : "";
  let orderId = charge.metadata?.orderId || "";

  if (!orderId && paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    orderId = paymentIntent.metadata?.orderId || "";
  }

  console.log(`[stripe] charge.refunded order=${orderId || "missing"} pi=${paymentIntentId || "missing"}`);
  if (!orderId) return { orderId: null, paymentIntentId };

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "refunded",
      refunded_at: new Date().toISOString(),
      payment_intent_id: paymentIntentId || null,
    })
    .eq("id", orderId);

  if (error) throw error;
  await addOrderEvent(supabase, orderId, "payment_refunded", {
    charge_id: charge.id,
    amount_refunded: charge.amount_refunded || charge.amount,
    payment_intent_id: paymentIntentId || null,
  });

  return { orderId, paymentIntentId };
}

async function handleAccountUpdated(
  supabase: ReturnType<typeof createClient>,
  account: Stripe.Account,
) {
  const status = account.charges_enabled && account.payouts_enabled
    ? "actif"
    : account.charges_enabled
      ? "payments_ready"
      : account.details_submitted
        ? "details_submitted"
        : "onboarding";

  const payload = {
    stripe_status: status,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    onboarding_completed: account.charges_enabled && account.payouts_enabled,
    updated_at: new Date().toISOString(),
  };

  for (const table of ["partners", "drivers"]) {
    const { error } = await supabase.from(table).update(payload).eq("stripe_account_id", account.id);
    if (!error) return { orderId: null, paymentIntentId: null };
  }

  return { orderId: null, paymentIntentId: null };
}

async function handleTransferCreated(
  supabase: ReturnType<typeof createClient>,
  transfer: Stripe.Transfer,
) {
  const { error } = await supabase.from("payouts").insert({
    stripe_transfer_id: transfer.id,
    stripe_account_id: typeof transfer.destination === "string" ? transfer.destination : "",
    amount: transfer.amount / 100,
    currency: transfer.currency,
    status: "completed",
    description: transfer.description || "Transfert Stripe vers compte Connect",
    metadata: transfer.metadata || {},
  });

  if (error) console.warn("[stripe] payout log skipped", error.message);
  return { orderId: null, paymentIntentId: null };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const startedAt = Date.now();
  let event: Stripe.Event | null = null;
  let supabase: ReturnType<typeof createClient> | null = null;

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) return json({ error: "Signature webhook manquante" }, 401);

    const rawBody = await req.text();
    event = await getStripe().webhooks.constructEventAsync(rawBody, signature, assertEnv("STRIPE_WEBHOOK_SECRET"));
    const payloadHash = await sha256Hex(rawBody);
    supabase = getAdminClient();

    const insertResult = await insertWebhookEvent(supabase, event, payloadHash);
    if (!insertResult.inserted) {
      console.log(`[stripe] duplicate webhook event=${event.id} type=${event.type}`);
      return json({ received: true, idempotent: true });
    }

    const stripe = getStripe();
    let result: { orderId: string | null; paymentIntentId: string | null } = {
      orderId: null,
      paymentIntentId: null,
    };

    switch (event.type) {
      case "checkout.session.completed":
        result = await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.succeeded":
        result = await handlePaymentIntentSucceeded(supabase, event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        result = await handlePaymentIntentFailed(supabase, event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        result = await handleChargeRefunded(supabase, stripe, event.data.object as Stripe.Charge);
        break;
      case "account.updated":
        result = await handleAccountUpdated(supabase, event.data.object as Stripe.Account);
        break;
      case "transfer.created":
        result = await handleTransferCreated(supabase, event.data.object as Stripe.Transfer);
        break;
      default:
        console.log(`[stripe] unmanaged event=${event.type}`);
    }

    await updateWebhookEvent(supabase, event.id, {
      processing_status: "processed",
      processed_at: new Date().toISOString(),
      order_id: result.orderId,
      payment_intent_id: result.paymentIntentId,
    });

    console.log(`[stripe] webhook processed event=${event.id} type=${event.type} duration_ms=${Date.now() - startedAt}`);
    return json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[stripe] webhook error", message);

    if (event && supabase) {
      await updateWebhookEvent(supabase, event.id, {
        processing_status: "failed",
        last_error: message.slice(0, 500),
      });
    }

    if (message.toLowerCase().includes("signature")) return json({ error: message }, 401);
    return json({ error: "Webhook processing failed" }, 500);
  }
});
