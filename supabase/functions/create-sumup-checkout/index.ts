const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
const SUMUP_API_KEY = Deno.env.get("SUMUP_API_KEY");
const SUMUP_MERCHANT_CODE = Deno.env.get("SUMUP_MERCHANT_CODE");
const SUMUP_ENV = Deno.env.get("SUMUP_ENV") ?? "sandbox";

if (!SUPABASE_URL || !rawSecretKeys || !SUMUP_API_KEY || !SUMUP_MERCHANT_CODE) {
  throw new Error("Missing SumUp/Supabase server configuration");
}
if (!["sandbox", "production"].includes(SUMUP_ENV)) throw new Error("Invalid SUMUP_ENV");

const secretKeys = JSON.parse(rawSecretKeys) as Record<string, string>;
const supabaseSecretKey = secretKeys["payments"];
if (!supabaseSecretKey) throw new Error("Supabase secret key named payments is required");

const SUMUP_CHECKOUTS_URL = "https://api.sumup.com/v0.1/checkouts";
const ALLOWED_ORIGINS = new Set([
  "https://delikreol.com",
  "https://www.delikreol.com",
  "http://localhost:3000",
  "http://localhost:5173",
]);

type DbOptions = { method?: string; body?: unknown; prefer?: string };
async function dbRequest<T>(path: string, options: DbOptions = {}): Promise<T> {
  const headers = new Headers({ apikey: supabaseSecretKey, Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.prefer) headers.set("Prefer", options.prefer);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Database request failed (${response.status}): ${raw.slice(0, 300)}`);
  return (raw ? JSON.parse(raw) : null) as T;
}

function cors(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://delikreol.com",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(origin), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function normalizePhone(value: string) { return value.replace(/[^\d+]/g, ""); }
function isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed" }, 403, origin);

  try {
    const body = await req.json();
    const orderId = typeof body.order_id === "string" ? body.order_id : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : "";
    if (!isUuid(orderId)) return json({ error: "Invalid order_id" }, 400, origin);
    if (!email || !phone) return json({ error: "Order email and phone are required" }, 400, origin);

    const orderQuery = new URLSearchParams({
      select: "id,order_number,customer_email,customer_phone,payment_status,payment_provider,payment_external_id,payment_reference,total_amount,total_cents,payment_currency,tracking_token",
      id: `eq.${orderId}`,
      limit: "1",
    });
    const orders = await dbRequest<Array<Record<string, unknown>>>(`orders?${orderQuery}`);
    const order = orders[0];
    if (!order) return json({ error: "Order not found" }, 404, origin);

    const savedEmail = String(order.customer_email ?? "").trim().toLowerCase();
    const savedPhone = normalizePhone(String(order.customer_phone ?? ""));
    if (savedEmail !== email || !savedPhone || savedPhone !== phone) return json({ error: "Order details did not match" }, 403, origin);
    if (!["pending", "awaiting_payment", "failed", "processing"].includes(String(order.payment_status))) {
      return json({ error: "Order is not payable", payment_status: order.payment_status }, 409, origin);
    }

    if (order.payment_provider === "sumup" && order.payment_external_id) {
      const eventQuery = new URLSearchParams({
        select: "payment_link_url,status",
        order_id: `eq.${orderId}`,
        provider: "eq.sumup",
        provider_event_id: `eq.${String(order.payment_external_id)}`,
        limit: "1",
      });
      const existing = (await dbRequest<Array<Record<string, unknown>>>(`external_payment_events?${eventQuery}`))[0];
      if (existing?.payment_link_url && ["pending", "processing"].includes(String(existing.status))) {
        return json({ checkout_id: order.payment_external_id, payment_url: existing.payment_link_url, status: existing.status }, 200, origin);
      }
    }

    const amountCents = order.total_cents != null ? Number(order.total_cents) : Math.round(Number(order.total_amount) * 100);
    if (!Number.isInteger(amountCents) || amountCents < 1 || amountCents > 10_000_000) return json({ error: "Invalid order amount" }, 400, origin);
    const amount = amountCents / 100;
    const currency = String(order.payment_currency || "EUR").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) return json({ error: "Invalid currency" }, 400, origin);

    const reference = `DK-${String(order.order_number || order.id).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40)}`;
    const trackingToken = String(order.tracking_token || "");
    const returnUrl = trackingToken
      ? `https://delikreol.com/statut-commande?order=${encodeURIComponent(trackingToken)}`
      : "https://delikreol.com/statut-commande";

    const sumupResponse = await fetch(SUMUP_CHECKOUTS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${SUMUP_API_KEY}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        checkout_reference: reference,
        amount,
        currency,
        merchant_code: SUMUP_MERCHANT_CODE,
        description: `Commande DeliKreol ${order.order_number || order.id}`,
        return_url: returnUrl,
        hosted_checkout: { enabled: true },
      }),
    });
    const payload = await sumupResponse.json().catch(() => ({}));
    if (!sumupResponse.ok) {
      console.error("SumUp checkout creation failed", sumupResponse.status, JSON.stringify(payload).slice(0, 700));
      return json({ error: "Could not create SumUp checkout" }, 502, origin);
    }

    const checkoutId = String(payload.id ?? payload.checkout_id ?? "");
    const paymentUrl = String(payload.hosted_checkout_url ?? payload.payment_url ?? "");
    if (!checkoutId || !/^https:\/\//i.test(paymentUrl)) return json({ error: "SumUp returned an incomplete checkout response" }, 502, origin);

    const patchQuery = new URLSearchParams({ id: `eq.${orderId}` });
    await dbRequest(`orders?${patchQuery}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: {
        payment_provider: "sumup",
        payment_status: "processing",
        payment_external_id: checkoutId,
        payment_reference: reference,
        payment_amount: amount,
        payment_currency: currency,
        payment_error: null,
      },
    });
    await dbRequest("external_payment_events", {
      method: "POST",
      prefer: "return=minimal",
      body: {
        order_id: orderId,
        order_number: order.order_number,
        provider: "sumup",
        provider_event_id: checkoutId,
        payment_link_url: paymentUrl,
        amount_cents: amountCents,
        currency: currency.toLowerCase(),
        status: String(payload.status || "pending").toLowerCase(),
        payload: { checkout_reference: reference, environment: SUMUP_ENV },
      },
    });

    return json({ checkout_id: checkoutId, payment_url: paymentUrl, status: payload.status ?? "PENDING", environment: SUMUP_ENV }, 200, origin);
  } catch (error) {
    console.error("create-sumup-checkout error", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Unable to start SumUp checkout" }, 500, origin);
  }
});
