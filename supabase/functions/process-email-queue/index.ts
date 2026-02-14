import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Fetch pending emails where scheduled_for <= now, max 50 per run
    const { data: pendingEmails, error } = await adminClient
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .lt("retry_count", 3)
      .order("scheduled_for", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Failed to fetch queue:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${pendingEmails.length} queued emails`);

    let sent = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      try {
        const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_type: email.email_type,
            to_email: email.to_email,
            template_data: email.template_data,
            user_id: email.user_id,
            queue_id: email.id,
            retry_count: email.retry_count,
          }),
        });

        if (sendRes.ok) {
          sent++;
        } else {
          failed++;
          const errText = await sendRes.text();
          console.error(`Failed to send email ${email.id}:`, errText);
        }
      } catch (e) {
        failed++;
        console.error(`Error sending email ${email.id}:`, e);
        await adminClient.from("email_queue").update({
          status: "failed",
          error_message: e instanceof Error ? e.message : "Unknown error",
          retry_count: (email.retry_count || 0) + 1,
        }).eq("id", email.id);
      }
    }

    console.log(`Queue processed: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ processed: pendingEmails.length, sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Process queue error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
