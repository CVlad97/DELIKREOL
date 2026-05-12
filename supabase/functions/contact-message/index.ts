import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const smtpUser = Deno.env.get("SMTP_USER") ?? "vladimir.claveau@gmail.com";
const smtpPass = Deno.env.get("SMTP_PASS") ?? "";
const smtpHost = Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com";
const smtpPort = Number(Deno.env.get("SMTP_PORT") ?? "465");
const smtpSecure = Deno.env.get("SMTP_SECURE") !== "false";
const contactToEmail = Deno.env.get("CONTACT_TO_EMAIL") ?? "vladimir.claveau@gmail.com";
const contactFromEmail = Deno.env.get("CONTACT_FROM_EMAIL") ?? "contact@delikreol.mq";
const contactFromName = Deno.env.get("CONTACT_FROM_NAME") ?? "Delikreol";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: insertedMessage, error: insertError } = await supabaseClient
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
        status: "new",
      })
      .select("id")
      .maybeSingle();

    if (insertError) {
      throw insertError;
    }

    if (!smtpPass) {
      throw new Error("SMTP_PASS missing");
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `${contactFromName} <${contactFromEmail}>`,
      to: contactToEmail,
      replyTo: `${name} <${email}>`,
      subject: `Nouveau message DELIKREOL - ${name}`,
      text: [
        `Nouveau message reçu depuis contact@delikreol.mq`,
        ``,
        `Nom: ${name}`,
        `Email: ${email}`,
        ``,
        `Message:`,
        message,
        insertedMessage?.id ? `\nID: ${insertedMessage.id}` : '',
      ].join("\n"),
    });

    return new Response(JSON.stringify({ success: true, id: insertedMessage?.id ?? null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact message error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
