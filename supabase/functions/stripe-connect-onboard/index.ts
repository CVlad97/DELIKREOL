import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@19.3.1";

const allowedOrigins = new Set([
  "https://delikreol.com",
  "https://www.delikreol.com",
  "https://cvlad97.github.io",
  "http://localhost:5173",
]);

type OnboardType = "vendor" | "driver";

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

function sanitize(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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
    const type: OnboardType = sanitize(body.type, 20) === "driver" ? "driver" : "vendor";
    const entityId = sanitize(body.entityId || body.vendorId || body.driverId, 80);
    if (!entityId) return json(req, { error: "entityId is required" }, 400);

    const table = type === "driver" ? "drivers" : "vendors";
    const { data: entity, error: entityError } = await admin
      .from(table)
      .select(type === "driver"
        ? "id, email, name, full_name, stripe_connect_account_id, stripe_account_id"
        : "id, email, name, business_name, stripe_connect_account_id, stripe_account_id")
      .eq("id", entityId)
      .single();
    if (entityError || !entity) return json(req, { error: "Entity not found" }, 404);

    const email = sanitize(entity.email, 160);
    const displayName = sanitize(entity.business_name || entity.full_name || entity.name || "Partenaire DELIKREOL", 120);
    if (!email) return json(req, { error: "Email partenaire requis avant onboarding Stripe" }, 400);

    const stripe = new Stripe(assertEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-02-25.clover",
    });

    const accountId = entity.stripe_connect_account_id || entity.stripe_account_id || (await stripe.accounts.create({
      type: "express",
      email,
      business_type: "individual",
      business_profile: {
        name: displayName,
        product_description: type === "vendor"
          ? "Traiteur partenaire DELIKREOL — marketplace culinaire Martinique"
          : "Livreur partenaire DELIKREOL — livraison de repas Martinique",
      },
      metadata: {
        onboard_type: type,
        entity_id: entityId,
      },
    })).id;

    await admin.from(table).update({
      stripe_connect_account_id: accountId,
      stripe_account_id: accountId,
      stripe_updated_at: new Date().toISOString(),
    }).eq("id", entityId);

    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://delikreol.com";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl}/admin/stripe-connect?status=refresh&type=${type}&id=${encodeURIComponent(entityId)}`,
      return_url: `${siteUrl}/admin/stripe-connect?status=success&type=${type}&id=${encodeURIComponent(entityId)}`,
      type: "account_onboarding",
    });

    return json(req, { accountLink: accountLink.url, stripeAccountId: accountId });
  } catch (error) {
    console.error("[stripe] connect onboard error", error instanceof Error ? error.message : String(error));
    return json(req, { error: "Unable to create Stripe onboarding link" }, 500);
  }
});
