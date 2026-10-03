const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
const SUMUP_API_KEY = Deno.env.get("SUMUP_API_KEY");
const SUMUP_ENV = Deno.env.get("SUMUP_ENV") ?? "sandbox";

if (!SUPABASE_URL || !rawSecretKeys || !SUMUP_API_KEY) throw new Error("Missing SumUp/Supabase server configuration");
if (!["sandbox", "production"].includes(SUMUP_ENV)) throw new Error("Invalid SUMUP_ENV");

const secretKeys = JSON.parse(rawSecretKeys) as Record<string, string>;
const supabaseSecretKey = secretKeys["payments"];
if (!supabaseSecretKey) throw new Error("Supabase secret key named payments is required");

const SUMUP_CHECKOUTS_URL = "https://api.sumup.com/v0.1/checkouts";
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
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function firstString(...values: unknown[]): string {
  for (const value of values) if (typeof value === "string" && value.trim()) return value.trim();
  return "";
}
function mapStatus(status: string): string | null {
  switch (status.toUpperCase()) {
    case "PAID": case "SUCCESSFUL": case "SUCCESS": return "paid";
    case "FAILED": case "DECLINED": return "failed";
    case "REFUNDED": return "refunded";
    case "CANCELLED": return "cancelled";
    case "PENDING": case "PROCESSING": return "processing";
    default: return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const notification = await req.json();
    const nested = notification?.payload && typeof notification.payload === "object" ? notification.payload : {};
    const checkout = notification?.checkout && typeof notification.checkout === "object" ? notification.checkout : {};
    const checkoutId = firstString(
      notification?.checkout_id,
      notification?.checkoutId,
      nested?.checkout_id,
      nested?.checkoutId,
      nested?.id,
      checkout?.id,
      notification?.id,
    );
    if (!checkoutId) return json({ received: true, processed: false, reason: "Missing checkout id" });
    if (checkoutId.length > 200) return json({ error: "Invalid checkout id" }, 400);

    // The inbound body is only a trigger. SumUp itself is the source of truth.
    const sumupResponse = await fetch(`${SUMUP_CHECKOUTS_URL}/${encodeURIComponent(checkoutId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${SUMUP_API_KEY}`, Accept: "application/json" },
    });
    if (!sumupResponse.ok) {
      console.error("SumUp checkout verification failed", sumupResponse.status);
      return json({ error: "Unable to verify checkout with SumUp" }, 502);
    }
    const verified = await sumupResponse.json();
    const verifiedId = firstString(verified?.id, verified?.checkout_id);
    const verifiedReference = firstString(verified?.checkout_reference);
    const verifiedStatus = firstString(verified?.status, verified?.transaction_status);
    const paymentStatus = mapStatus(verifiedStatus);
    if (!verifiedId || verifiedId !== checkoutId || !paymentStatus) {
      return json({ received: true, processed: false, reason: "Checkout or status not actionable" });
    }

    const orderQuery = new URLSearchParams({
      select: "id,order_number,payment_status,payment_external_id,payment_reference,total_amount,total_cents,payment_currency",
      payment_provider: "eq.sumup",
      payment_external_id: `eq.${verifiedId}`,
      limit: "1",
    });
    const order = (await dbRequest<Array<Record<string, unknown>>>(`orders?${orderQuery}`))[0];
    if (!order || (verifiedReference && String(order.payment_reference ?? "") !== verifiedReference)) {
      return json({ received: true, processed: false, reason: "No matching order" });
    }

    const expectedCents = order.total_cents != null ? Number(order.total_cents) : Math.round(Number(order.total_amount) * 100);
    const sumupAmount = Number(verified?.amount ?? verified?.transaction_amount);
    const expectedCurrency = String(order.payment_currency || "EUR").toUpperCase();
    const actualCurrency = firstString(verified?.currency, verified?.transaction_currency).toUpperCase();
    if (!Number.isFinite(sumupAmount) || Math.round(sumupAmount * 100) !== expectedCents || (actualCurrency && actualCurrency !== expectedCurrency)) {
      console.error("SumUp amount/currency mismatch", order.id);
      return json({ error: "Checkout amount or currency mismatch" }, 409);
    }

    const currentStatus = String(order.payment_status ?? "").toLowerCase();
    let nextStatus = paymentStatus;
    if (["paid", "refunded"].includes(currentStatus)) {
      if (currentStatus === "refunded" || ["processing", "failed", "cancelled"].includes(paymentStatus)) nextStatus = currentStatus;
    }
    if (paymentStatus === "refunded" && !["paid", "refunded"].includes(currentStatus)) {
      return json({ error: "Refund reported for an order not marked paid" }, 409);
    }

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { payment_status: nextStatus };
    if (nextStatus === "paid") {
      if (currentStatus !== "paid") patch.paid_at = now;
      patch.payment_verified_at = now;
      patch.payment_error = null;
    } else if (nextStatus === "refunded") {
      patch.refunded_at = now;
    } else if (nextStatus === "failed") {
      patch.payment_error = `SumUp status: ${verifiedStatus}`.slice(0, 200);
    }

    const orderPatchQuery = new URLSearchParams({ id: `eq.${String(order.id)}`, payment_provider: "eq.sumup", payment_external_id: `eq.${verifiedId}` });
    await dbRequest(`orders?${orderPatchQuery}`, { method: "PATCH", prefer: "return=minimal", body: patch });

    const eventQuery = new URLSearchParams({ order_id: `eq.${String(order.id)}`, provider: "eq.sumup", provider_event_id: `eq.${verifiedId}` });
    await dbRequest(`external_payment_events?${eventQuery}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: { status: nextStatus, payload: { sumup_status: verifiedStatus, environment: SUMUP_ENV } },
    });

    return json({ received: true, processed: true, order_id: order.id, payment_status: nextStatus });
  } catch (error) {
    console.error("sumup-webhook error", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Unable to process SumUp notification" }, 500);
  }
});
