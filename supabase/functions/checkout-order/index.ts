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

type CheckoutItemInput = {
  product_id?: unknown;
  id?: unknown;
  quantity?: unknown;
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
  vendors: {
    id: string;
    business_name: string | null;
    name: string | null;
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

// Fournisseurs de paiement toujours autorisés côté serveur. La liste est
// volontairement stricte : toute valeur non listée ici (y compris
// `stripe_disabled`, `stripe_test`, `manual` et les variants `sumup_*`) est
// rejetée avec un 400 explicite. Stripe reste désactivé pour ce lancement et
// "manual" est trop vague pour être exposé au client.
const BASE_PAYMENT_PROVIDERS = new Set([
  "qonto_transfer",
  "revolut_transfer",
  "cash_on_delivery",
]);

// Fournisseurs optionnels activés par feature flag serveur uniquement. Aucun
// client ne peut forcer leur activation : la décision vient de Deno.env, pas
// du corps de la requête.
function resolveAllowedPaymentProviders(): Set<string> {
  const providers = new Set(BASE_PAYMENT_PROVIDERS);
  if (Deno.env.get("ENABLE_CRYPTO_PAYMENT") === "true") {
    providers.add("crypto_wallet");
  }
  if (Deno.env.get("ENABLE_EXTERNAL_PAYMENT_LINK") === "true") {
    providers.add("external_payment_link");
  }
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

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parseItems(rawItems: unknown) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > MAX_ITEMS) {
    throw new Response(JSON.stringify({ error: "items invalides" }), { status: 400 });
  }

  const aggregated = new Map<string, number>();
  for (const item of rawItems as CheckoutItemInput[]) {
    const productId = typeof item.product_id === "string" ? item.product_id : typeof item.id === "string" ? item.id : "";
    const quantity = normalizeQuantity(item.quantity ?? 1);
    if (!UUID_RE.test(productId) || !quantity) {
      throw new Response(JSON.stringify({ error: "Chaque ligne doit contenir product_id UUID et quantity valide" }), {
        status: 400,
      });
    }
    aggregated.set(productId, (aggregated.get(productId) || 0) + quantity);
  }
  return Array.from(aggregated, ([productId, quantity]) => ({ productId, quantity }));
}

async function enforceRateLimit(
  admin: ReturnType<typeof createClient>,
  requestFingerprint: string,
) {
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);
  const rateKey = await sha256Hex(`${requestFingerprint}:${windowStart.toISOString()}`);

  const { data, error } = await admin.rpc("consume_checkout_rate_limit", {
    target_rate_key: rateKey,
    target_window_started_at: windowStart.toISOString(),
  });

  if (error) {
    console.warn("[checkout-order] rate limit skipped", error.message);
    return;
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
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return json(req, { error: "Payload trop volumineux" }, 413);
    }

    const body = JSON.parse(rawBody);
    const admin = createClient(assertEnv("SUPABASE_URL"), assertEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: authData } = token ? await admin.auth.getUser(token) : { data: { user: null } };

    const idempotencyKey = sanitizeText(body.idempotency_key, 120);
    if (!idempotencyKey || idempotencyKey.length < 16) {
      return json(req, { error: "idempotency_key required" }, 400);
    }

    await enforceRateLimit(
      admin,
      `${req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown"}:${req.headers.get("user-agent") || "ua"}`,
    );

    const { data: existing, error: existingError } = await admin
      .from("orders")
      .select("id, order_number, status, payment_status, tracking_token")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) return json(req, { existing: true, order: existing });

    const parsedItems = parseItems(body.items);
    const productIds = parsedItems.map((item) => item.productId);
    const { data: productsData, error: productsError } = await admin
      .from("products")
      .select("id, vendor_id, name, price, is_available, is_public, is_demo, status, vendors(id, business_name, name, commission_rate, stripe_connect_account_id, stripe_charges_enabled, stripe_payouts_enabled, status, is_active, is_public, is_demo)")
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
      };
    });

    if (vendorIds.size !== 1) {
      return json(req, { error: "Panier multi-vendeur bloqué en lancement: une commande par partenaire" }, 409);
    }

    const mode = sanitizeText(body.delivery_mode || body.mode, 32) || "retrait";
    const delivery = DELIVERY_FEES[mode];
    if (!delivery) return json(req, { error: "delivery_mode invalide" }, 400);

    const subtotalCents = orderItems.reduce((sum, item) => sum + Math.round(Number(item.subtotal) * 100), 0);
    const totalCents = subtotalCents + delivery.cents;
    if (totalCents <= 0) return json(req, { error: "Total commande invalide" }, 400);

    // Validation stricte du provider : aucune confiance dans la valeur client.
    // Un provider inconnu, désactivé (stripe_disabled, stripe_test, manual,
    // sumup_*) ou non activé par feature flag serveur est rejeté en 400. Pas
    // de repli silencieux vers qonto_transfer : le client doit désigner
    // explicitement un provider autorisé.
    const rawPaymentProvider = sanitizeText(body.payment_provider, 32);
    const allowedPaymentProviders = resolveAllowedPaymentProviders();
    if (!rawPaymentProvider || !allowedPaymentProviders.has(rawPaymentProvider)) {
      return json(
        req,
        {
          error: "payment_provider non autorisé",
          reason:
            "Provider de paiement inconnu, désactivé ou non activé par feature flag serveur.",
        },
        400,
      );
    }
    const paymentProvider = rawPaymentProvider;
    const phone = sanitizeText(body.phone || body.customer_phone, 30);
    if (!phone || phone.length < 8) return json(req, { error: "Téléphone requis" }, 400);
    const paymentExternalId = sanitizeText(body.payment_external_id, 180);
    if (paymentProvider === "crypto_wallet" && !paymentExternalId) {
      return json(req, { error: "Hash de transaction requis pour le paiement crypto" }, 400);
    }
    if (paymentExternalId) {
      const { data: duplicatePayment, error: duplicatePaymentError } = await admin
        .from("orders")
        .select("id, order_number, payment_status")
        .eq("payment_external_id", paymentExternalId)
        .maybeSingle();
      if (duplicatePaymentError) throw duplicatePaymentError;
      if (duplicatePayment) {
        return json(req, { error: "Référence paiement déjà utilisée", order: duplicatePayment }, 409);
      }
    }

    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const random = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((byte) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[byte % 36])
      .join("");
    const orderNumber = `DK-${datePart}-${random}`;

    // Le statut de paiement est dérivé UNIQUEMENT de données serveur, jamais
    // d'une valeur envoyée par le client (payment_external_id,
    // payment_status, etc.). Toute commande nouvellement créée démarre à
    // "pending" ; la transition vers "proof_submitted" / "paid" se fait via
    // la revue admin ou un webhook de paiement vérifié, pas sur la base d'un
    // champ fourni par le frontend.
    const paymentStatus = "pending";
    const paymentReference = `${paymentProvider.toUpperCase()}-${orderNumber}`;
    const trackingToken = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

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
        notes: sanitizeText(body.notes, 1000) || null,
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
        },
      },
    });

    if (rpcError) throw rpcError;
    const order = result?.order;
    if (!order?.id || !order?.order_number) throw new Error("RPC create_checkout_order_atomic returned no order");

    return json(req, {
      success: true,
      existing: Boolean(result?.existing),
      order,
    });
  } catch (error) {
    if (error instanceof Response) {
      const body = await error.text();
      return json(req, JSON.parse(body), error.status);
    }
    console.error("[checkout-order] error", error instanceof Error ? error.message : String(error));
    return json(req, { error: "Unable to create order" }, 500);
  }
});
