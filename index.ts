import { corsHeaders } from "npm:@supabase/supabase-js@^2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const body = await req.json();
    const { username, email, memberCode, createdAt } = body;

    if (!username || !email || !memberCode) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhook = Deno.env.get("DISCORD_WEBHOOK_URL");
    if (!webhook) {
      return new Response(JSON.stringify({ error: "DISCORD_WEBHOOK_URL is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dt = createdAt ? new Date(createdAt) : new Date();
    const time = dt.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

    const payload = {
      embeds: [{
        title: "🛒 BAS SHOP — สมาชิกใหม่",
        color: 16724758,
        fields: [
          { name: "ชื่อผู้ใช้", value: String(username), inline: true },
          { name: "รหัส", value: String(memberCode), inline: true },
          { name: "อีเมล", value: String(email), inline: false },
          { name: "เวลา", value: time, inline: false },
        ],
        footer: { text: "BAS SHOP" },
      }],
    };

    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text();
      return new Response(JSON.stringify({ error: "Discord webhook failed", detail }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
