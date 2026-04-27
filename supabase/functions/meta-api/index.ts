import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { action, endpoint, data: requestData } = await req.json();

    if (!action || !endpoint) {
      throw new Error("Missing action or endpoint");
    }

    const { data: apiKey } = await supabaseClient
      .from("api_keys")
      .select("id, encrypted_key, metadata")
      .eq("service", "meta")
      .eq("is_active", true)
      .single();

    if (!apiKey) {
      throw new Error("Meta API key not configured");
    }

    const startTime = Date.now();
    const apiUrl = `https://graph.facebook.com/v18.0/${endpoint}`;

    let metaResponse;
    if (action === "GET") {
      const params = new URLSearchParams({
        access_token: apiKey.encrypted_key,
        ...requestData,
      });
      metaResponse = await fetch(`${apiUrl}?${params}`);
    } else if (action === "POST") {
      metaResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: apiKey.encrypted_key,
          ...requestData,
        }),
      });
    } else {
      throw new Error("Invalid action. Use GET or POST");
    }

    const responseTime = Date.now() - startTime;
    const result = await metaResponse.json();

    await supabaseClient.from("api_usage_logs").insert({
      api_key_id: apiKey.id,
      service: "meta",
      endpoint,
      user_id: user.id,
      request_data: { action, endpoint },
      response_status: metaResponse.ok ? "success" : "error",
      response_time_ms: responseTime,
      error_message: metaResponse.ok ? null : result.error?.message,
    });

    if (!metaResponse.ok) {
      throw new Error(result.error?.message || "Meta API error");
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Meta API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
