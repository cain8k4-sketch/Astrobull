/**
 * Astro Bull — email you when a creator signs up.
 *
 * Deploy: Supabase Dashboard → Edge Functions → create `creator-signup-notify`
 * Secrets (Dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY   = re_...   (from resend.com)
 *   OWNER_EMAIL      = AstroBull.Robinhood@Gmail.com
 *
 * Trigger: Database → Webhooks → creators INSERT → this function URL
 *   (or Supabase "Database Webhooks" HTTP POST with type=INSERT payload)
 *
 * Never put RESEND_API_KEY in Vercel VITE_* vars.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_URL = "https://api.resend.com/emails";

type CreatorRow = {
  id?: string;
  name?: string;
  email?: string;
  wallet?: string;
  handle_tiktok?: string | null;
  handle_youtube?: string | null;
  handle_snapchat?: string | null;
  handle_x?: string | null;
  handle_instagram?: string | null;
  status?: string;
  created_at?: string;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

function pickRecord(body: Record<string, unknown>): CreatorRow | null {
  // Database Webhook / Realtime style
  const record = (body.record ?? body.new ?? body) as CreatorRow | undefined;
  if (!record || typeof record !== "object") return null;
  if (!record.name && !record.email) return null;
  return record;
}

function formatBody(c: CreatorRow): string {
  const lines = [
    "New Astro Bull creator signup",
    "",
    `Name: ${c.name ?? "—"}`,
    `Email: ${c.email ?? "—"}`,
    `Wallet: ${c.wallet ?? "—"}`,
    `TikTok: ${c.handle_tiktok || "—"}`,
    `YouTube: ${c.handle_youtube || "—"}`,
    `Snapchat: ${c.handle_snapchat || "—"}`,
    `X: ${c.handle_x || "—"}`,
    `Instagram: ${c.handle_instagram || "—"}`,
    `Status: ${c.status ?? "pending"}`,
    `Time: ${c.created_at ?? new Date().toISOString()}`,
    `Id: ${c.id ?? "—"}`,
    "",
    "Admin: https://www.astrobull.xyz/admin",
  ];
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  const to =
    Deno.env.get("OWNER_EMAIL")?.trim() || "AstroBull.Robinhood@Gmail.com";

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY secret not set" }),
      {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  const creator = pickRecord(body);
  if (!creator) {
    return new Response(JSON.stringify({ error: "No creator record in body" }), {
      status: 400,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  const subject = `Astro Bull · new creator: ${creator.name ?? "unknown"}`;
  const text = formatBody(creator);

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Astro Bull <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
      reply_to: creator.email || undefined,
    }),
  });

  const resText = await res.text();
  if (!res.ok) {
    return new Response(
      JSON.stringify({
        error: "Resend failed",
        status: res.status,
        detail: resText.slice(0, 300),
      }),
      {
        status: 502,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify({ ok: true, to }), {
    status: 200,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
});
