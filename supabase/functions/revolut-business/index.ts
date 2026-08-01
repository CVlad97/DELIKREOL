import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json(req, { error: "Authentication required" }, 401);

  try {
    const supabase = createClient(assertEnv("SUPABASE_URL"), assertEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return json(req, { error: "Invalid session" }, 401);
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || !isAdmin) return json(req, { error: "Admin required" }, 403);

    const apiToken = Deno.env.get("REVOLUT_BUSINESS_API_TOKEN");
    if (!apiToken) {
      return json(req, {
        status: "REVOLUT_API_DISABLED",
        message: "Mode manuel actif. Aucun credential Revolut Business serveur configuré.",
      });
    }

    return json(req, {
      status: "REVOLUT_API_CONFIGURED_NOT_AUTOMATED",
      message: "Connecteur prêt à sécuriser côté serveur avant activation explicite des webhooks.",
    });
  } catch (error) {
    console.error("[revolut-business] error", error instanceof Error ? error.message : String(error));
    return json(req, { error: "Revolut adapter unavailable" }, 500);
  }
});
