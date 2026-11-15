import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const WORKER_HASH = "1c1fec5b4ce0225cbec63775311c8faea6a49af3b823d870e92c19b3c2a62b7b";
const enc = new TextEncoder();
const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function sha256(value: string) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(value)));
}
function normalizePhone(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return `596${digits.slice(1)}`;
  return digits;
}
async function workerAuthorized(req: Request) {
  const key = req.headers.get("x-delikreol-worker-key") ?? "";
  return key.length >= 32 && await sha256(key) === WORKER_HASH;
}

// Le filtre `is_active` a été retiré : un traiteur désactivé ou en cours
// d'onboarding reste le destinataire des commandes déjà passées chez lui, et
// `Langouste House` (inactif, mais partenaire de la commande de démonstration)
// ne pouvait structurellement jamais être trouvé — d'où un `no_subscription`
// alors que la commande avait bien été notifiée.
async function findVendor(phone: string) {
  const { data } = await admin.from("vendors")
    .select("id,business_name,name,phone,whatsapp,is_active,status")
    .limit(200);
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const matches = (data ?? []).filter((vendor) =>
    normalizePhone(vendor.whatsapp) === normalized || normalizePhone(vendor.phone) === normalized
  );
  return matches.find((vendor) => vendor.is_active) ?? matches[0] ?? null;
}

async function pullItems() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: queued, error } = await admin.from("partner_notifications")
    .select("id,order_id,order_number,partner_name,partner_phone,message,status,attempts,created_at,channel")
    .eq("channel", "webpush")
    .in("status", ["queued", "pending"])
    .gte("created_at", cutoff)
    // Espacement des reprises : une notif déjà tentée n'est réessayée qu'après
    // deux minutes, sinon la boucle du worker la consomme en quelques secondes
    // et épuise ses tentatives avant qu'un appareil ait pu s'abonner.
    .or(`attempts.eq.0,updated_at.lt.${new Date(Date.now() - 2 * 60 * 1000).toISOString()}`)
    .order("created_at", { ascending: true })
    .limit(10);
  if (error) throw error;
  const items = [];
  for (const item of queued ?? []) {
    const vendor = await findVendor(String(item.partner_phone ?? ""));
    let subscriptions: Array<Record<string, unknown>> = [];
    if (vendor?.id) {
      const { data } = await admin.from("vendor_push_subscriptions")
        .select("id,endpoint,p256dh,auth")
        .eq("vendor_id", vendor.id)
        .is("disabled_at", null)
        .limit(10);
      subscriptions = data ?? [];
    }
    items.push({ ...item, vendor_id: vendor?.id ?? null, subscriptions });
  }
  return items;
}

async function ack(body: any) {
  const id = String(body.id ?? "");
  const status = String(body.status ?? "");
  if (!id || !["sent", "failed", "no_subscription", "blocked"].includes(status)) {
    return json({ error: "invalid ack" }, 400);
  }
  const { data: current } = await admin.from("partner_notifications")
    .select("attempts,order_id").eq("id", id).maybeSingle();
  const attempts = Number(current?.attempts ?? 0) + 1;
  const patch: Record<string, unknown> = {
    status,
    attempts,
    last_error: body.last_error ? String(body.last_error).slice(0, 500) : null,
    provider_message_id: body.provider_message_id ? String(body.provider_message_id).slice(0, 250) : null,
    updated_at: new Date().toISOString(),
  };

  // « Aucun appareil abonné » n'est pas une fin de vie : c'est un état qui peut
  // se débloquer (le traiteur active ses alertes depuis son téléphone). On
  // remet la notification en file pour qu'elle parte encore, au lieu de la
  // perdre définitivement et sans trace.
  if (status === "no_subscription" && attempts <= 10) {
    patch.status = "queued";
  }
  if (status === "sent") patch.sent_at = new Date().toISOString();

  const { error } = await admin.from("partner_notifications").update(patch).eq("id", id);
  if (error) return json({ error: error.message }, 500);

  // `orders.partner_notified_at` ne doit être renseigné qu'une fois la
  // notification réellement partie. Il était écrit au moment de la mise en
  // file, ce qui faisait apparaître comme « traiteur prévenu » une commande
  // dont la notification n'était jamais arrivée.
  if (status === "sent" && current?.order_id) {
    const { error: orderError } = await admin.from("orders")
      .update({ partner_notified_at: new Date().toISOString() })
      .eq("id", String(current.order_id))
      .is("partner_notified_at", null);
    if (orderError) console.error("[vendor-push-gateway] partner_notified_at update failed", orderError.message);
  }

  return json({ ok: true, requeued: patch.status === "queued" });
}

Deno.serve(async (req: Request) => {
  if (req.method === "GET") return json({ ok: true, service: "delikreol-vendor-push-gateway-v1" });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!await workerAuthorized(req)) return json({ error: "unauthorized" }, 401);
  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400); }

  try {
    if (body?.action === "pull_webpush") return json({ items: await pullItems() });
    if (body?.action === "ack") return ack(body);
    if (body?.action === "disable_subscription") {
      const id = String(body.subscription_id ?? "");
      if (!id) return json({ error: "missing subscription_id" }, 400);
      const { error } = await admin.from("vendor_push_subscriptions")
        .update({ disabled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", id);
      return error ? json({ error: error.message }, 500) : json({ ok: true });
    }
    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error("vendor push gateway error", error instanceof Error ? error.message : String(error));
    return json({ error: "processing_failed" }, 500);
  }
});
