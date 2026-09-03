import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const username = String(body.username ?? "ไม่ระบุ");
    const email = String(body.email ?? "ไม่ระบุ");
    const memberId = String(body.memberId ?? "#000000");

    const webhook = Deno.env.get("DISCORD_WEBHOOK_URL");
    if (!webhook) {
      return new Response(JSON.stringify({ error: "DISCORD_WEBHOOK_URL ยังไม่ได้ตั้งค่า" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const time = new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());

    const discordResponse = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "🛒 BAS SHOP — สมาชิกใหม่",
          color: 16711748,
          fields: [
            { name: "ชื่อผู้ใช้", value: username, inline: false },
            { name: "รหัส", value: memberId, inline: false },
            { name: "อีเมล", value: email, inline: false },
            { name: "เวลา", value: time, inline: false }
          ],
          footer: { text: "BAS SHOP" }
        }]
      })
    });

    if (!discordResponse.ok) {
      const details = await discordResponse.text();
      return new Response(JSON.stringify({ error: "ส่ง Discord ไม่สำเร็จ", details }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message ?? error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
