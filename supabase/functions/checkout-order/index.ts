import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const allowedOrigins = new Set([
  "https://delikreol.com",
  "https://www.delikreol.com",
  "https://cvlad97.github.io",
  "http://localhost:5173",
]);

const MAX_BODY_BYTES = 16_384;
const MAX_ITEMS = 25;
const DEFAULT_COMMISSION_RATE = 15;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DELIVERY_FEES: Record<string, { cents: number; type: string }> = {
  retrait: { cents: 0, type: "pickup" },
  pickup: { cents: 0, type: "pickup" },
  relais: { cents: 250, type: "relay_point" },
  relay_point: { cents: 250, type: "relay_point" },
  livraison: { cents: 400, type: "home_delivery" },
  home_delivery: { cents: 400, type: "home_delivery" },
};

// --- Confirmation client par e-mail (Resend) -------------------------------
// Best-effort assumé : la commande est déjà écrite quand on envoie. Un e-mail
// qui échoue ne doit jamais faire échouer une commande — mais il doit être
// visible, jamais silencieux : l'échec remonte dans la réponse et dans les logs.
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const ORDER_EMAIL_FROM = Deno.env.get("ORDER_EMAIL_FROM") ?? "DELIKREOL <commandes@delikreol.com>";
// Pas de valeur par défaut : `delikreol.com` n'a **aucun enregistrement MX**,
// donc une réponse adressée à `commandes@delikreol.com` rebondit. Mieux vaut
// un e-mail sans `reply_to` qu'un e-mail qui invite le client à répondre à une
// adresse morte. À définir explicitement quand la boîte existera.
const ORDER_EMAIL_REPLY_TO = Deno.env.get("ORDER_EMAIL_REPLY_TO") ?? "";
const SITE_URL = "https://delikreol.com";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] as string
  ));
}

function euros(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

type OrderConfirmationEmail = {
  to: string;
  orderNumber: string;
  partnerName: string;
  modeLabel: string;
  address: string | null;
  scheduled: string | null;
  subtotalCents: number;
  deliveryCents: number;
  totalCents: number;
  items: Array<{ product_name: string; quantity: number; subtotalCents: number }>;
};

async function sendOrderConfirmationEmail(input: OrderConfirmationEmail): Promise<{ sent: boolean; id?: string; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return { sent: false, error: "RESEND_API_KEY absente (aucun e-mail envoyé)" };

  const lines = input.items.map((item) =>
    `<tr><td style="padding:6px 0;color:#0f172a">${escapeHtml(item.quantity)} × ${escapeHtml(item.product_name)}</td>`
    + `<td align="right" style="padding:6px 0;color:#0f172a;white-space:nowrap">${euros(item.subtotalCents)}</td></tr>`
  ).join("");

  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f8fafc;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:24px">
  <p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#64748b">DELIKREOL</p>
  <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">Commande ${escapeHtml(input.orderNumber)} confirmée</h1>
  <p style="margin:0 0 16px;color:#334155;font-size:14px">Merci. Votre commande a été transmise à <strong>${escapeHtml(input.partnerName)}</strong>, qui la confirme et la prépare.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">${lines}
    <tr><td style="padding:8px 0;color:#64748b">Sous-total</td><td align="right" style="padding:8px 0;color:#334155">${euros(input.subtotalCents)}</td></tr>
    <tr><td style="padding:0 0 8px;color:#64748b">${escapeHtml(input.modeLabel)}</td><td align="right" style="padding:0 0 8px;color:#334155">${euros(input.deliveryCents)}</td></tr>
    <tr><td style="padding:8px 0;font-weight:700;color:#0f172a">Total</td><td align="right" style="padding:8px 0;font-weight:700;color:#0f172a">${euros(input.totalCents)}</td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:14px;color:#334155"><strong>${escapeHtml(input.modeLabel)}</strong>${input.address ? ` — ${escapeHtml(input.address)}` : ""}${input.scheduled ? `<br>Créneau souhaité : ${escapeHtml(input.scheduled)}` : ""}</p>
  <p style="margin:20px 0 0;font-size:13px;color:#475569">Suivre votre commande : <a href="${SITE_URL}/statut-commande" style="color:#0369a1">${SITE_URL}/statut-commande</a> — munissez-vous du numéro ${escapeHtml(input.orderNumber)}.</p>
  <p style="margin:12px 0 0;font-size:12px;color:#94a3b8">Le montant est encaissé par DELIKREOL ; le traiteur prépare, DELIKREOL organise la remise. Une question : écrivez-nous depuis la page Contact du site.</p>
</div></body></html>`;

  const text = [
    `Commande ${input.orderNumber} confirmée`,
    `Partenaire : ${input.partnerName}`,
    "",
    ...input.items.map((item) => `- ${item.quantity} × ${item.product_name} : ${euros(item.subtotalCents)}`),
    "",
    `Sous-total : ${euros(input.subtotalCents)}`,
    `${input.modeLabel} : ${euros(input.deliveryCents)}`,
    `Total : ${euros(input.totalCents)}`,
    input.address ? `Adresse : ${input.address}` : "",
    input.scheduled ? `Créneau souhaité : ${input.scheduled}` : "",
    "",
    `Suivi : ${SITE_URL}/statut-commande (numéro ${input.orderNumber})`,
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: ORDER_EMAIL_FROM,
        to: [input.to],
        ...(ORDER_EMAIL_REPLY_TO ? { reply_to: ORDER_EMAIL_REPLY_TO } : {}),
        subject: `Votre commande ${input.orderNumber} — DELIKREOL`,
        html,
        text,
      }),
    });
    const payload = await response.json().catch(() => ({} as Record<string, unknown>));
    if (!response.ok) {
      return { sent: false, error: `resend ${response.status}: ${String(payload?.message ?? "echec")}`.slice(0, 300) };
    }
    return { sent: true, id: typeof payload?.id === "string" ? payload.id : undefined };
  } catch (error) {
    return { sent: false, error: (error instanceof Error ? error.message : "envoi impossible").slice(0, 300) };
  }
}

type CheckoutItemInput = {
  product_id?: unknown;
  id?: unknown;
  quantity?: unknown;
  selected_options?: unknown;
};

type MenuSelection = {
  appetizers: string[];
  sides: string[];
  drinks: string[];
  sauces: string[];
  condiments: string[];
  instructions?: string;
};

type MenuOptions = {
  appetizers?: string[];
  sides?: string[];
  drinks?: string[];
  sauces?: string[];
  condiments?: string[];
  included_appetizer_count?: number;
  included_side_count?: number;
  included_drink_count?: number;
  included_sauce_count?: number;
  included_condiment_count?: number;
  instructions_enabled?: boolean;
};

type ProductRow = {
  id: string;
  vendor_id: string;
  name: string;
  price: number | string;
  is_available: boolean;
  is_public: boolean;
  is_demo: boolean;
  status: string;
  menu_options: MenuOptions | null;
  vendors: {
    id: string;
    business_name: string | null;
    name: string | null;
    phone: string | null;
    commission_rate: number | string | null;
    stripe_connect_account_id: string | null;
    stripe_charges_enabled: boolean | null;
    stripe_payouts_enabled: boolean | null;
    status: string | null;
    is_active: boolean | null;
    is_public: boolean | null;
    is_demo: boolean | null;
  } | null;
};

const BASE_PAYMENT_PROVIDERS = new Set([
  "qonto_transfer",
  "revolut_transfer",
  "cash_on_delivery",
]);

function resolveAllowedPaymentProviders(): Set<string> {
  const providers = new Set(BASE_PAYMENT_PROVIDERS);
  if (Deno.env.get("ENABLE_CRYPTO_PAYMENT") === "true") providers.add("crypto_wallet");
  if (Deno.env.get("ENABLE_EXTERNAL_PAYMENT_LINK") === "true") providers.add("external_payment_link");
  return providers;
}

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
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

function normalizeQuantity(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 99) return null;
  return parsed;
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function parseChoiceArray(choices: unknown) {
  if (choices == null) return [];
  if (!Array.isArray(choices) || choices.some((choice) => typeof choice !== "string")) {
    throw new Response(JSON.stringify({ error: "Composition de menu invalide" }), { status: 400 });
  }
  return choices.map((choice) => sanitizeText(choice, 80)).filter(Boolean);
}

function parseSelectedOptions(value: unknown): MenuSelection | null {
  if (value == null) return null;
  if (!value || typeof value !== "object") {
    throw new Response(JSON.stringify({ error: "Composition de menu invalide" }), { status: 400 });
  }
  const record = value as Record<string, unknown>;
  return {
    appetizers: parseChoiceArray(record.appetizers),
    sides: parseChoiceArray(record.sides),
    drinks: parseChoiceArray(record.drinks),
    sauces: parseChoiceArray(record.sauces),
    condiments: parseChoiceArray(record.condiments),
    instructions: sanitizeText(record.instructions, 240) || undefined,
  };
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseItems(rawItems: unknown) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > MAX_ITEMS) {
    throw new Response(JSON.stringify({ error: "items invalides" }), { status: 400 });
  }
  const aggregated = new Map<string, { productId: string; quantity: number; selectedOptions: MenuSelection | null }>();
  for (const item of rawItems as CheckoutItemInput[]) {
    const productId = typeof item.product_id === "string" ? item.product_id : typeof item.id === "string" ? item.id : "";
    const quantity = normalizeQuantity(item.quantity ?? 1);
    if (!UUID_RE.test(productId) || !quantity) {
      throw new Response(JSON.stringify({ error: "Chaque ligne doit contenir product_id UUID et quantity valide" }), { status: 400 });
    }
    const selectedOptions = parseSelectedOptions(item.selected_options);
    const key = `${productId}:${JSON.stringify(selectedOptions)}`;
    const existing = aggregated.get(key);
    aggregated.set(key, { productId, selectedOptions, quantity: (existing?.quantity || 0) + quantity });
  }
  return Array.from(aggregated.values());
}

function normalizeOptions(product: ProductRow) {
  const raw = product.menu_options;
  if (!raw) return null;
  const appetizers = Array.isArray(raw.appetizers) ? raw.appetizers.filter((item) => typeof item === "string") : [];
  const sides = Array.isArray(raw.sides) ? raw.sides.filter((item) => typeof item === "string") : [];
  const drinks = Array.isArray(raw.drinks) ? raw.drinks.filter((item) => typeof item === "string") : [];
  const sauces = Array.isArray(raw.sauces) ? raw.sauces.filter((item) => typeof item === "string") : [];
  const condiments = Array.isArray(raw.condiments) ? raw.condiments.filter((item) => typeof item === "string") : [];
  const appetizerCount = Number(raw.included_appetizer_count ?? 0);
  const sideCount = Number(raw.included_side_count ?? 0);
  const drinkCount = Number(raw.included_drink_count ?? 0);
  const sauceCount = Number(raw.included_sauce_count ?? 0);
  const condimentCount = Number(raw.included_condiment_count ?? 0);
  if (!Number.isInteger(appetizerCount) || !Number.isInteger(sideCount) || !Number.isInteger(drinkCount) || !Number.isInteger(sauceCount) || !Number.isInteger(condimentCount)) {
    throw new Response(JSON.stringify({ error: `Configuration de menu invalide: ${product.name}` }), { status: 409 });
  }
  if (appetizerCount < 0 || sideCount < 0 || drinkCount < 0 || sauceCount < 0 || condimentCount < 0 || appetizerCount > appetizers.length || sideCount > sides.length || drinkCount > drinks.length || sauceCount > sauces.length || condimentCount > condiments.length) {
    throw new Response(JSON.stringify({ error: `Configuration de menu invalide: ${product.name}` }), { status: 409 });
  }
  return { appetizers, sides, drinks, sauces, condiments, appetizerCount, sideCount, drinkCount, sauceCount, condimentCount, instructionsEnabled: raw.instructions_enabled !== false };
}

function validateMenuSelection(product: ProductRow, selection: MenuSelection | null) {
  const options = normalizeOptions(product);
  if (!options) {
    if (selection && (selection.appetizers.length || selection.sides.length || selection.drinks.length || selection.sauces.length || selection.condiments.length || selection.instructions)) {
      throw new Response(JSON.stringify({ error: `Composition non autorisée: ${product.name}` }), { status: 400 });
    }
    return null;
  }
  if (!selection) throw new Response(JSON.stringify({ error: `Composition requise: ${product.name}` }), { status: 400 });
  const uniqueAppetizers = new Set(selection.appetizers);
  const uniqueSides = new Set(selection.sides);
  const uniqueDrinks = new Set(selection.drinks);
  const uniqueSauces = new Set(selection.sauces);
  const uniqueCondiments = new Set(selection.condiments);
  const valid = uniqueAppetizers.size === options.appetizerCount &&
    uniqueSides.size === options.sideCount &&
    uniqueDrinks.size === options.drinkCount &&
    uniqueSauces.size === options.sauceCount &&
    uniqueCondiments.size === options.condimentCount &&
    [...uniqueAppetizers].every((choice) => options.appetizers.includes(choice)) &&
    [...uniqueSides].every((choice) => options.sides.includes(choice)) &&
    [...uniqueDrinks].every((choice) => options.drinks.includes(choice)) &&
    [...uniqueSauces].every((choice) => options.sauces.includes(choice)) &&
    [...uniqueCondiments].every((choice) => options.condiments.includes(choice));
  if (!valid) throw new Response(JSON.stringify({ error: `Composition invalide: ${product.name}` }), { status: 400 });
  const instructions = options.instructionsEnabled ? sanitizeText(selection.instructions, 240) : "";
  return {
    appetizers: [...uniqueAppetizers],
    sides: [...uniqueSides],
    drinks: [...uniqueDrinks],
    sauces: [...uniqueSauces],
    condiments: [...uniqueCondiments],
    instructions: instructions || undefined,
  };
}

async function enforceRateLimit(admin: ReturnType<typeof createClient>, requestFingerprint: string) {
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);
  const rateKey = await sha256Hex(`${requestFingerprint}:${windowStart.toISOString()}`);
  const { data, error } = await admin.rpc("consume_checkout_rate_limit", {
    target_rate_key: rateKey,
    target_window_started_at: windowStart.toISOString(),
  });
  if (error) {
    console.error("[checkout-order] rate limit unavailable", error.message);
    throw new Response(JSON.stringify({ error: "Service de protection temporairement indisponible" }), { status: 503 });
  }
  if (Number(data || 0) > 20) {
    throw new Response(JSON.stringify({ error: "Trop de tentatives, réessayez plus tard" }), { status: 429 });
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) return json(req, { error: "Payload trop volumineux" }, 413);
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) return json(req, { error: "Payload trop volumineux" }, 413);

    const body = JSON.parse(rawBody);
    const admin = createClient(assertEnv("SUPABASE_URL"), assertEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: authData } = token ? await admin.auth.getUser(token) : { data: { user: null } };

    const idempotencyKey = sanitizeText(body.idempotency_key, 120);
    if (!idempotencyKey || idempotencyKey.length < 16) return json(req, { error: "idempotency_key required" }, 400);

    await enforceRateLimit(admin, `${req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown"}:${req.headers.get("user-agent") || "ua"}`);

    const { data: existing, error: existingError } = await admin
      .from("orders")
      .select("id, order_number, status, payment_status, tracking_token")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return json(req, { existing: true, order: existing });

    const parsedItems = parseItems(body.items);
    const productIds = [...new Set(parsedItems.map((item) => item.productId))];
    const { data: productsData, error: productsError } = await admin
      .from("products")
      .select("id, vendor_id, name, price, is_available, is_public, is_demo, status, menu_options, vendors(id, business_name, name, phone, commission_rate, stripe_connect_account_id, stripe_charges_enabled, stripe_payouts_enabled, status, is_active, is_public, is_demo)")
      .in("id", productIds);
    if (productsError) throw productsError;
    const products = new Map((productsData || []).map((product: ProductRow) => [product.id, product]));
    if (products.size !== productIds.length) return json(req, { error: "Produit introuvable" }, 404);

    const vendorIds = new Set<string>();
    const orderItems = parsedItems.map((item) => {
      const product = products.get(item.productId);
      if (!product) throw new Response(JSON.stringify({ error: "Produit introuvable" }), { status: 404 });
      const vendor = product.vendors;
      const isProductSellable = product.is_available && product.is_public && !product.is_demo && product.status === "verified";
      const isVendorSellable = Boolean(vendor?.is_active && vendor.is_public && !vendor.is_demo && vendor.status === "verified");
      if (!isProductSellable || !isVendorSellable) {
        throw new Response(JSON.stringify({ error: `Produit indisponible: ${product.name}` }), { status: 409 });
      }
      const selectedOptions = validateMenuSelection(product, item.selectedOptions);
      vendorIds.add(product.vendor_id);
      const unitCents = toCents(product.price);
      const subtotalCents = unitCents * item.quantity;
      const commissionRate = Number(vendor?.commission_rate ?? DEFAULT_COMMISSION_RATE);
      const commissionCents = Math.round(subtotalCents * (Number.isFinite(commissionRate) ? commissionRate : DEFAULT_COMMISSION_RATE) / 100);
      return {
        product_id: product.id,
        vendor_id: product.vendor_id,
        product_name: product.name,
        vendor_name: vendor?.business_name || vendor?.name || "",
        unit_price: unitCents / 100,
        quantity: item.quantity,
        subtotal: subtotalCents / 100,
        total: subtotalCents / 100,
        vendor_commission: commissionCents / 100,
        selected_options: selectedOptions,
      };
    });

    if (vendorIds.size !== 1) return json(req, { error: "Panier multi-vendeur bloqué en lancement: une commande par partenaire" }, 409);

    const primaryVendor = products.get(parsedItems[0].productId)?.vendors || null;
    const partnerName = sanitizeText(primaryVendor?.business_name || primaryVendor?.name, 160);
    const partnerPhone = sanitizeText(primaryVendor?.phone, 30);

    const mode = sanitizeText(body.delivery_mode || body.mode, 32) || "retrait";
    const delivery = DELIVERY_FEES[mode];
    if (!delivery) return json(req, { error: "delivery_mode invalide" }, 400);
    const subtotalCents = orderItems.reduce((sum, item) => sum + Math.round(Number(item.subtotal) * 100), 0);
    const totalCents = subtotalCents + delivery.cents;
    if (totalCents <= 0) return json(req, { error: "Total commande invalide" }, 400);

    const rawPaymentProvider = sanitizeText(body.payment_provider, 32);
    const allowedPaymentProviders = resolveAllowedPaymentProviders();
    if (!rawPaymentProvider || !allowedPaymentProviders.has(rawPaymentProvider)) {
      return json(req, { error: "payment_provider non autorisé", reason: "Provider de paiement inconnu, désactivé ou non activé par feature flag serveur." }, 400);
    }
    const paymentProvider = rawPaymentProvider;
    const phone = sanitizeText(body.phone || body.customer_phone, 30);
    if (!phone || phone.length < 8) return json(req, { error: "Téléphone requis" }, 400);
    const paymentExternalId = sanitizeText(body.payment_external_id, 180);
    if (paymentProvider === "crypto_wallet" && !paymentExternalId) return json(req, { error: "Hash de transaction requis pour le paiement crypto" }, 400);
    if (paymentExternalId) {
      const { data: duplicatePayment, error: duplicatePaymentError } = await admin
        .from("orders")
        .select("id, order_number, payment_status")
        .eq("payment_external_id", paymentExternalId)
        .maybeSingle();
      if (duplicatePaymentError) throw duplicatePaymentError;
      if (duplicatePayment) return json(req, { error: "Référence paiement déjà utilisée", order: duplicatePayment }, 409);
    }

    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const random = Array.from(crypto.getRandomValues(new Uint8Array(6))).map((byte) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[byte % 36]).join("");
    const orderNumber = `DK-${datePart}-${random}`;
    const paymentStatus = "pending";
    const paymentReference = `${paymentProvider.toUpperCase()}-${orderNumber}`;
    const trackingToken = Array.from(crypto.getRandomValues(new Uint8Array(8))).map((byte) => byte.toString(16).padStart(2, "0")).join("");

    const compositionNotes = orderItems.flatMap((item) => {
      if (!item.selected_options) return [];
      const details = [
        item.selected_options.appetizers.length ? `entrée(s): ${item.selected_options.appetizers.join(", ")}` : "",
        item.selected_options.sides.length ? `accompagnement(s): ${item.selected_options.sides.join(", ")}` : "",
        item.selected_options.drinks.length ? `boisson(s): ${item.selected_options.drinks.join(", ")}` : "",
        item.selected_options.sauces.length ? `sauce(s): ${item.selected_options.sauces.join(", ")}` : "",
        item.selected_options.condiments.length ? `condiment(s): ${item.selected_options.condiments.join(", ")}` : "",
        item.selected_options.instructions ? `consigne: ${item.selected_options.instructions}` : "",
      ].filter(Boolean).join("; ");
      return [`${item.product_name}: ${details}`];
    });
    const customerNotes = sanitizeText(body.notes, 1000);
    const securedNotes = [customerNotes, compositionNotes.length ? `Composition des menus:\n${compositionNotes.join("\n")}` : ""].filter(Boolean).join("\n\n").slice(0, 1000);

    const { data: result, error: rpcError } = await admin.rpc("create_checkout_order_atomic", {
      target_idempotency_key: idempotencyKey,
      order_payload: {
        order_number: orderNumber,
        customer_id: authData.user?.id || "",
        customer_name: sanitizeText(body.customer_name, 120) || null,
        customer_phone: phone,
        customer_email: sanitizeText(body.email || authData.user?.email, 160) || null,
        customer_commune: sanitizeText(body.commune, 120) || null,
        order_mode: mode,
        subtotal: subtotalCents / 100,
        delivery_fee: delivery.cents / 100,
        delivery_fee_cents: delivery.cents,
        sub_total_cents: subtotalCents,
        total_cents: totalCents,
        total_amount: totalCents / 100,
        delivery_type: delivery.type,
        notes: securedNotes || null,
        creneaux: sanitizeText(body.creneaux, 240) || null,
        address: sanitizeText(body.address, 240) || null,
        source: "checkout_order_function",
        status: "pending",
        delivery_status: "pending",
        payment_status: paymentStatus,
        payment_provider: paymentProvider,
        payment_method: paymentProvider,
        payment_reference: paymentReference,
        payment_external_id: paymentExternalId || null,
        payment_amount: totalCents / 100,
        payment_currency: "EUR",
        payment_proof_url: sanitizeText(body.payment_proof_url, 500) || null,
        tracking_token: trackingToken,
        partner_phone: partnerPhone || null,
        partner_notified_at: null,
      },
      items_payload: orderItems,
      event_payload: {
        event_type: "whatsapp_order_prepared",
        payload: {
          mode,
          items_count: orderItems.length,
          subtotal_cents: subtotalCents,
          delivery_fee_cents: delivery.cents,
          total_cents: totalCents,
          vendor_id: Array.from(vendorIds)[0],
          payment_provider: paymentProvider,
          payment_reference: paymentReference,
          menu_selections: orderItems.map((item) => ({ product_id: item.product_id, selected_options: item.selected_options })),
        },
      },
    });
    if (rpcError) throw rpcError;
    const order = result?.order;
    if (!order?.id || !order?.order_number) throw new Error("RPC create_checkout_order_atomic returned no order");

    let partnerNotificationQueued = false;
    let partnerNotificationError: string | null = null;
    if (!partnerPhone) {
      // Un traiteur sans numéro ne peut être joint par aucun canal : c'est une
      // donnée à corriger, pas un cas à ignorer en silence.
      partnerNotificationError = "traiteur sans numéro de téléphone";
      console.error("[checkout-order] vendor without phone", primaryVendor?.id ?? order.id);
    }
    if (partnerPhone) {
      const testMarker = securedNotes.toUpperCase().includes("TEST TECHNIQUE") ? " · TEST TECHNIQUE — NE PAS PRÉPARER" : "";
      const partnerMessage = `DELIKREOL · Nouvelle commande ${order.order_number} · ${(totalCents / 100).toFixed(2)} € · ${delivery.type === "pickup" ? "retrait" : delivery.type === "relay_point" ? "point relais" : "livraison"}${testMarker}. Ouvrez votre espace DELIKREOL pour accepter ou refuser.`;
      const { error: notificationError } = await admin.from("partner_notifications").insert({
        order_id: order.id,
        order_number: order.order_number,
        partner_name: partnerName || "Partenaire DELIKREOL",
        partner_phone: partnerPhone,
        channel: "webpush",
        message: partnerMessage,
        status: "queued",
      });
      if (notificationError) {
        partnerNotificationError = notificationError.message;
        console.error("[checkout-order] partner notification queue failed", notificationError.message);
      } else {
        partnerNotificationQueued = true;
        // On enregistre le numéro, mais surtout PAS `partner_notified_at` :
        // mettre en file n'est pas notifier. Le drapeau est désormais posé par
        // `vendor-push-gateway` quand l'envoi réussit réellement.
        const { error: notifiedAtError } = await admin
          .from("orders")
          .update({ partner_phone: partnerPhone })
          .eq("id", order.id);
        if (notifiedAtError) console.error("[checkout-order] partner_phone update failed", notifiedAtError.message);
      }
    }

    // Confirmation client : uniquement sur une commande neuve, jamais sur un
    // rejeu idempotent — sinon un client qui rafraîchit recevrait l'e-mail
    // plusieurs fois.
    let customerEmailSent = false;
    let customerEmailError: string | null = null;
    if (result?.existing) {
      customerEmailError = "commande existante : e-mail de confirmation non renvoyé";
    } else {
      const customerEmail = sanitizeText(body.email || authData.user?.email, 160).toLowerCase();
      if (!customerEmail.includes("@")) {
        customerEmailError = "aucune adresse e-mail client fournie";
      } else {
        const emailResult = await sendOrderConfirmationEmail({
          to: customerEmail,
          orderNumber: String(order.order_number),
          partnerName: partnerName || "votre traiteur",
          modeLabel: delivery.type === "pickup" ? "Retrait" : delivery.type === "relay_point" ? "Point relais" : "Livraison",
          address: sanitizeText(body.address || body.delivery_address, 240) || null,
          scheduled: sanitizeText(body.scheduled_date || body.creneaux, 60) || null,
          subtotalCents,
          deliveryCents: delivery.cents,
          totalCents,
          items: orderItems.map((item) => ({
            product_name: String(item.product_name),
            quantity: Number(item.quantity),
            subtotalCents: Math.round(Number(item.subtotal) * 100),
          })),
        });
        customerEmailSent = emailResult.sent;
        customerEmailError = emailResult.error ?? null;
        if (!emailResult.sent) console.error("[checkout-order] customer confirmation email failed", customerEmailError);
      }
    }

    return json(req, {
      success: true,
      existing: Boolean(result?.existing),
      order,
      partner_notification_queued: partnerNotificationQueued,
      partner_notification_error: partnerNotificationError,
      customer_email_sent: customerEmailSent,
      customer_email_error: customerEmailError,
    });
  } catch (error) {
    if (error instanceof Response) {
      const body = await error.text();
      return json(req, JSON.parse(body), error.status);
    }
    if (error instanceof Error && (
      error.message?.includes("23505") ||
      error.message?.includes("unique_violation") ||
      error.message?.includes("duplicate key") ||
      error.message?.includes("idx_orders_payment_external_id_unique")
    )) {
      return json(req, { error: "Ce paiement a déjà été utilisé pour une autre commande.", code: "PAYMENT_EXTERNAL_ID_COLLISION" }, 409);
    }
    console.error("[checkout-order] error", error instanceof Error ? error.message : String(error));
    return json(req, { error: "Unable to create order" }, 500);
  }
});
