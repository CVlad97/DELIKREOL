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

    const { action, spreadsheetId, range, values } = await req.json();

    if (!action || !spreadsheetId) {
      throw new Error("Missing required parameters");
    }

    const { data: apiKey } = await supabaseClient
      .from("api_keys")
      .select("id, encrypted_key, metadata")
      .eq("service", "google_sheets")
      .eq("is_active", true)
      .single();

    if (!apiKey) {
      throw new Error("Google Sheets API key not configured");
    }

    const startTime = Date.now();
    let apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
    let sheetsResponse;

    if (action === "read") {
      if (!range) {
        throw new Error("Range is required for read action");
      }
      apiUrl += `/values/${range}`;
      sheetsResponse = await fetch(`${apiUrl}?key=${apiKey.encrypted_key}`);
    } else if (action === "write") {
      if (!range || !values) {
        throw new Error("Range and values are required for write action");
      }
      apiUrl += `/values/${range}:append?valueInputOption=USER_ENTERED`;
      sheetsResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.encrypted_key}`,
        },
        body: JSON.stringify({ values }),
      });
    } else if (action === "update") {
      if (!range || !values) {
        throw new Error("Range and values are required for update action");
      }
      apiUrl += `/values/${range}?valueInputOption=USER_ENTERED`;
      sheetsResponse = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.encrypted_key}`,
        },
        body: JSON.stringify({ values }),
      });
    } else {
      throw new Error("Invalid action. Use read, write, or update");
    }

    const responseTime = Date.now() - startTime;
    const result = await sheetsResponse.json();

    await supabaseClient.from("api_usage_logs").insert({
      api_key_id: apiKey.id,
      service: "google_sheets",
      endpoint: `spreadsheets/${spreadsheetId}`,
      user_id: user.id,
      request_data: { action, range, spreadsheetId },
      response_status: sheetsResponse.ok ? "success" : "error",
      response_time_ms: responseTime,
      error_message: sheetsResponse.ok ? null : result.error?.message,
    });

    if (!sheetsResponse.ok) {
      throw new Error(result.error?.message || "Google Sheets API error");
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Google Sheets error:", error);
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
