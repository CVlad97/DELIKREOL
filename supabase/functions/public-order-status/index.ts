import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const allowedOrigins = new Set([
  "https://delikreol.com",
  "https://www.delikreol.com",
  "http://localhost:5173",
]);
const TRACKING_TOKEN_RE = /^[0-9a-f]{16}$/i;

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://delikreol.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const trackingToken = typeof body?.tracking_token === "string"
      ? body.tracking_token.trim()
      : "";

    if (!TRACKING_TOKEN_RE.test(trackingToken)) {
      return json(req, { error: "Token de suivi invalide" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase server configuration");
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, order_number, status, payment_status, delivery_status, total_amount, created_at, customer_commune, order_mode")
      .eq("tracking_token", trackingToken)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return json(req, { error: "Commande introuvable" }, 404);

    const { data: items, error: itemsError } = await admin
      .from("order_items")
      .select("product_id, product_name, quantity, unit_price, vendor_name")
      .eq("order_id", order.id);

    if (itemsError) throw itemsError;

    return json(req, {
      order: {
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        delivery_status: order.delivery_status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        commune: order.customer_commune,
        mode: order.order_mode,
        items: (items || []).map((item) => ({
          product_id: item.product_id,
          name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          vendor_name: item.vendor_name,
        })),
      },
    });
  } catch (error) {
    console.error(
      "[public-order-status] error",
      error instanceof Error ? error.message : String(error),
    );
    return json(req, { error: "Impossible de consulter la commande" }, 500);
  }
});
