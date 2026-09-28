import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const VERIFY_HASH = "8d67ac53ddee12b906d1858979aba7e6310bd9d5b942436eb200c43532026cc8";
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
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
async function sha256(value: string) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(value)));
}
function normalizePhone(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return `596${digits.slice(1)}`;
  return digits;
}
async function signed(raw: Uint8Array, header: string | null) {
  const secret = Deno.env.get("WHATSAPP_APP_SECRET") ?? "";
  if (!secret || !header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = hex(await crypto.subtle.sign("HMAC", key, raw));
  return header.slice(7).toLowerCase() === signature;
}
async function workerAuthorized(req: Request) {
  const key = req.headers.get("x-delikreol-worker-key") ?? "";
  return key.length >= 32 && await sha256(key) === WORKER_HASH;
}
async function findVendor(phone: string) {
  const { data } = await admin.from("vendors")
    .select("id,business_name,name,phone,whatsapp,is_active,status")
    .eq("is_active", true).limit(100);
  const normalized = normalizePhone(phone);
  return (data ?? []).find((vendor) =>
    normalizePhone(vendor.whatsapp) === normalized || normalizePhone(vendor.phone) === normalized
  ) ?? null;
}
async function handleWorker(req: Request, body: any) {
  if (!await workerAuthorized(req)) return json({ error: "unauthorized" }, 401);
  if (body?.action === "pull") {
    const { data: queued, error } = await admin.from("partner_notifications")
      .select("id,order_id,order_number,partner_name,partner_phone,message,status,attempts,created_at")
      .eq("channel", "whatsapp")
      .in("status", ["queued", "pending"])
      .order("created_at", { ascending: true })
      .limit(10);
    if (error) return json({ error: error.message }, 500);
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: inbound } = await admin.from("whatsapp_messages")
      .select("from_number,created_at")
      .eq("direction", "inbound")
      .gte("created_at", cutoff)
      .limit(500);
    const recent = new Set((inbound ?? []).map((row) => normalizePhone(row.from_number)));
    return json({
      items: (queued ?? []).map((item) => ({
        ...item,
        recipient: normalizePhone(item.partner_phone),
        freeform_allowed: recent.has(normalizePhone(item.partner_phone)),
      })),
    });
  }
  if (body?.action === "ack") {
    const id = String(body.id ?? "");
    const status = String(body.status ?? "");
    if (!id || !["sent", "failed", "template_required", "blocked"].includes(status)) {
      return json({ error: "invalid ack" }, 400);
    }
    const { data: current } = await admin.from("partner_notifications")
      .select("attempts").eq("id", id).maybeSingle();
    const patch: Record<string, unknown> = {
      status,
      attempts: Number(current?.attempts ?? 0) + 1,
      last_error: body.last_error ? String(body.last_error).slice(0, 500) : null,
      provider_message_id: body.provider_message_id ? String(body.provider_message_id).slice(0, 250) : null,
      updated_at: new Date().toISOString(),
    };
    if (status === "sent") patch.sent_at = new Date().toISOString();
    const { error } = await admin.from("partner_notifications").update(patch).eq("id", id);
    return error ? json({ error: error.message }, 500) : json({ ok: true });
  }
  return json({ error: "unknown action" }, 400);
}
async function handleMeta(body: any) {
  if (body?.object !== "whatsapp_business_account") return;
  for (const entry of body.entry ?? []) for (const change of entry.changes ?? []) {
    const value = change.value ?? {};
    const to = value.metadata?.display_phone_number ?? null;
    for (const msg of value.messages ?? []) {
      const from = normalizePhone(msg.from);
      const vendor = await findVendor(from);
      const content = String(
        msg.text?.body ?? msg.image?.caption ?? msg.document?.caption ?? msg.button?.text ?? "",
      ).slice(0, 4000);
      const media = msg.image?.id ?? msg.document?.id ?? msg.video?.id ?? msg.audio?.id ?? null;
      await admin.from("whatsapp_messages").upsert({
        whatsapp_id: String(msg.id),
        vendor_id: vendor?.id ?? null,
        from_number: from,
        to_number: normalizePhone(to),
        message_type: String(msg.type ?? "unknown").slice(0, 40),
        message_content: content || null,
        media_id: media,
        direction: "inbound",
        status: "received",
        metadata: { vendor_name: vendor?.business_name ?? vendor?.name ?? null },
        updated_at: new Date().toISOString(),
      }, { onConflict: "whatsapp_id", ignoreDuplicates: true });
    }
    for (const status of value.statuses ?? []) {
      await admin.from("whatsapp_messages").update({
        provider_status: String(status.status ?? ""),
        status: String(status.status ?? ""),
        updated_at: new Date().toISOString(),
      }).eq("whatsapp_id", String(status.id ?? ""));
    }
  }
}
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    if (mode === "subscribe") {
      const token = url.searchParams.get("hub.verify_token") ?? "";
      const challenge = url.searchParams.get("hub.challenge") ?? "";
      return token && await sha256(token) === VERIFY_HASH
        ? new Response(challenge, { status: 200 })
        : new Response("Forbidden", { status: 403 });
    }
    return json({
      ok: true,
      service: "delikreol-whatsapp-gateway-v2",
      meta_signature_ready: Boolean(Deno.env.get("WHATSAPP_APP_SECRET")),
    });
  }
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const raw = new Uint8Array(await req.arrayBuffer());
  let body: any;
  try { body = JSON.parse(new TextDecoder().decode(raw)); }
  catch { return json({ error: "invalid_json" }, 400); }
  if (req.headers.has("x-delikreol-worker-key")) return handleWorker(req, body);
  if (!Deno.env.get("WHATSAPP_APP_SECRET")) {
    return json({ error: "meta_signature_not_configured" }, 503);
  }
  if (!await signed(raw, req.headers.get("x-hub-signature-256"))) {
    return json({ error: "invalid_signature" }, 403);
  }
  try {
    await handleMeta(body);
    return json({ received: true });
  } catch (error) {
    console.error(
      "whatsapp gateway error",
      error instanceof Error ? error.message : String(error),
    );
    return json({ error: "processing_failed" }, 500);
  }
});
