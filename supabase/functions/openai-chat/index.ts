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

    const { messages, model = "gpt-4", temperature = 0.7 } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format");
    }

    const { data: apiKey } = await supabaseClient
      .from("api_keys")
      .select("id, encrypted_key")
      .eq("service", "openai")
      .eq("is_active", true)
      .single();

    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const startTime = Date.now();

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.encrypted_key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    const responseTime = Date.now() - startTime;
    const result = await openaiResponse.json();

    await supabaseClient.from("api_usage_logs").insert({
      api_key_id: apiKey.id,
      service: "openai",
      endpoint: "/v1/chat/completions",
      user_id: user.id,
      request_data: { model, message_count: messages.length },
      response_status: openaiResponse.ok ? "success" : "error",
      response_time_ms: responseTime,
      error_message: openaiResponse.ok ? null : result.error?.message,
    });

    if (!openaiResponse.ok) {
      throw new Error(result.error?.message || "OpenAI API error");
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("OpenAI chat error:", error);
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
