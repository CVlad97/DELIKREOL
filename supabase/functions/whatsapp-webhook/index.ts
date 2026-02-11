import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "delikreol_2024";

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified");
        return new Response(challenge, { status: 200 });
      } else {
        return new Response("Forbidden", { status: 403 });
      }
    }

    if (req.method === "POST") {
      const body = await req.json();
      console.log("Webhook received:", JSON.stringify(body, null, 2));

      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === "messages") {
              const value = change.value;

              if (value.messages) {
                for (const message of value.messages) {
                  await handleIncomingMessage(message, value.metadata?.display_phone_number);
                }
              }

              if (value.statuses) {
                for (const status of value.statuses) {
                  await handleMessageStatus(status);
                }
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleIncomingMessage(message: any, businessPhone: string) {
  const fromNumber = message.from;
  const messageId = message.id;
  const messageType = message.type;
  let messageContent = "";
  let mediaUrl = null;

  if (messageType === "text") {
    messageContent = message.text?.body || "";
  } else if (messageType === "image") {
    mediaUrl = message.image?.id;
    messageContent = message.image?.caption || "";
  }

  await supabaseClient.from("whatsapp_messages").insert({
    whatsapp_id: messageId,
    from_number: fromNumber,
    to_number: businessPhone,
    message_type: messageType,
    message_content: messageContent,
    media_url: mediaUrl,
    direction: "inbound",
    status: "delivered",
  });

  const session = await getOrCreateSession(fromNumber);

  const response = await processMessage(messageContent.toLowerCase(), session);

  if (response) {
    await sendWhatsAppMessage(fromNumber, response);
  }
}

async function handleMessageStatus(status: any) {
  const messageId = status.id;
  const newStatus = status.status;

  await supabaseClient
    .from("whatsapp_messages")
    .update({ status: newStatus })
    .eq("whatsapp_id", messageId);
}

async function getOrCreateSession(phoneNumber: string) {
  let { data: session } = await supabaseClient
    .from("whatsapp_sessions")
    .select("*")
    .eq("phone_number", phoneNumber)
    .single();

  if (!session) {
    const { data: newSession } = await supabaseClient
      .from("whatsapp_sessions")
      .insert({
        phone_number: phoneNumber,
        session_state: "idle",
        session_data: { cart: [] },
      })
      .select()
      .single();
    session = newSession;
  } else {
    await supabaseClient
      .from("whatsapp_sessions")
      .update({
        last_interaction_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", session.id);
  }

  return session;
}

async function processMessage(message: string, session: any): Promise<string | null> {
  if (message.includes("menu") || message.includes("start") || message.includes("commencer")) {
    return `🌴 *DELIKREOL - Menu Principal*\n\n1️⃣ Voir les restaurants\n2️⃣ Voir les producteurs\n3️⃣ Mes commandes\n4️⃣ Mon panier\n5️⃣ Aide\n\nRépondez avec le numéro de votre choix !`;
  }

  if (message.includes("aide") || message.includes("help")) {
    return `🆘 *Comment utiliser Delikreol par WhatsApp:*\n\n• Tapez "menu" pour voir les options\n• Tapez "restaurants" pour voir la liste\n• Tapez "panier" pour voir votre panier\n• Tapez "commande" pour passer commande\n\nOu visitez: delikreol.com\n📞 Support: +596 696 XX XX XX`;
  }

  if (message === "1" || message.includes("restaurant")) {
    const { data: vendors } = await supabaseClient
      .from("vendors")
      .select("*")
      .eq("business_type", "restaurant")
      .eq("is_active", true)
      .limit(5);

    if (vendors && vendors.length > 0) {
      let response = `🍽️ *Restaurants disponibles:*\n\n`;
      vendors.forEach((v, i) => {
        response += `${i + 1}. *${v.business_name}*\n   ${v.description || "Cuisine créole"}\n\n`;
      });
      response += `\nRépondez avec le numéro du restaurant pour voir le menu !`;
      return response;
    }
  }

  if (message === "3" || message.includes("commande")) {
    if (session.user_id) {
      const { data: orders } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("customer_id", session.user_id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (orders && orders.length > 0) {
        let response = `📦 *Vos dernières commandes:*\n\n`;
        orders.forEach((order) => {
          response += `#${order.order_number}\n`;
          response += `Statut: ${order.status}\n`;
          response += `Montant: ${order.total_amount}€\n\n`;
        });
        return response;
      } else {
        return `Vous n'avez pas encore de commande.\nTapez "menu" pour commencer ! 😊`;
      }
    } else {
      return `Pour voir vos commandes, créez un compte sur delikreol.com\nOu tapez "menu" pour commander ! 🛒`;
    }
  }

  return `Je n'ai pas compris votre message.\nTapez "menu" pour voir les options ou "aide" pour assistance. 🤖`;
}

async function sendWhatsAppMessage(to: string, message: string) {
  const { data: apiKey } = await supabaseClient
    .from("api_keys")
    .select("encrypted_key, metadata")
    .eq("service", "meta")
    .eq("is_active", true)
    .single();

  if (!apiKey) {
    console.error("Meta API key not found");
    return;
  }

  const phoneNumberId = apiKey.metadata?.phone_number_id;
  if (!phoneNumberId) {
    console.error("WhatsApp phone number ID not configured");
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.encrypted_key}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.messages?.[0]?.id) {
      await supabaseClient.from("whatsapp_messages").insert({
        whatsapp_id: result.messages[0].id,
        from_number: phoneNumberId,
        to_number: to,
        message_type: "text",
        message_content: message,
        direction: "outbound",
        status: "sent",
      });
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}
