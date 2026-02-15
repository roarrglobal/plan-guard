import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendEmail } from "../_shared/email.ts";
import {
  welcomeEmail,
  teamInviteEmail,
  analysisCompleteEmail,
  outcomeReminderEmail,
  outcomeOverdueEmail,
  trialEndingEmail,
  trialEndedEmail,
  weeklyDigestEmail,
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Map email_type → template function that returns { subject, html } */
function buildEmail(
  type: string,
  data: Record<string, unknown>
): { subject: string; html: string } {
  switch (type) {
    case "welcome":
      return welcomeEmail(
        (data.name as string) || "there",
        !!data.is_team
      );

    case "team_invite":
      return teamInviteEmail(
        (data.team_name as string) || "",
        (data.inviter_name as string) || "Someone",
        (data.role as string) || "member",
        (data.invite_url as string) || ""
      );

    case "analysis_complete":
      return analysisCompleteEmail(
        (data.decision_title as string) || "",
        (data.verdict as string) || "",
        (data.analysis_url as string) || ""
      );

    case "outcome_reminder":
      return outcomeReminderEmail(
        (data.decision_title as string) || "",
        (data.decision_date as string) || "",
        (data.verdict as string) || "",
        (data.outcome_url as string) || "",
        (data.quick_outcome_url as string) || undefined
      );

    case "outcome_overdue":
      return outcomeOverdueEmail(
        (data.decision_title as string) || "",
        (data.due_date as string) || "",
        (data.quick_outcome_url as string) || undefined
      );

    case "trial_ending":
      return trialEndingEmail(
        (data.name as string) || "there",
        (data.days_left as number) || 3
      );

    case "trial_ended":
      return trialEndedEmail();

    case "weekly_digest":
      return weeklyDigestEmail(
        (data.team_name as string) || "",
        {
          decisionsCreated: (data.decisions_created as number) || 0,
          analysesRun: (data.analyses_run as number) || 0,
          outcomesLogged: (data.outcomes_logged as number) || 0,
          pendingOutcomes: (data.pending_outcomes as number) || 0,
        },
        (data.dashboard_url as string) || ""
      );

    default:
      return {
        subject: "Notification from Snag",
        html: `<p>${JSON.stringify(data)}</p>`,
      };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { email_type, to_email, template_data, user_id, queue_id } = body;

    if (!email_type || !to_email) {
      return new Response(
        JSON.stringify({ error: "email_type and to_email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Check email preferences ──────────────────────────────────
    if (user_id) {
      const { data: prefs } = await adminClient
        .from("email_preferences")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle();

      if (prefs?.unsubscribed_all) {
        console.log(`User ${user_id} has unsubscribed from all emails`);
        if (queue_id) {
          await adminClient
            .from("email_queue")
            .update({ status: "sent", sent_at: new Date().toISOString(), error_message: "User unsubscribed" })
            .eq("id", queue_id);
        }
        return new Response(
          JSON.stringify({ sent: false, reason: "unsubscribed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (prefs) {
        const prefMap: Record<string, string> = {
          outcome_reminder: "outcome_reminders",
          outcome_overdue: "outcome_reminders",
          weekly_digest: "weekly_digest",
          team_invite: "team_activity",
          analysis_complete: "team_activity",
        };
        const prefKey = prefMap[email_type];
        if (prefKey && (prefs as Record<string, unknown>)[prefKey] === false) {
          console.log(`User opted out of ${email_type}`);
          if (queue_id) {
            await adminClient
              .from("email_queue")
              .update({ status: "sent", sent_at: new Date().toISOString(), error_message: "User opted out" })
              .eq("id", queue_id);
          }
          return new Response(
            JSON.stringify({ sent: false, reason: "opted_out" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // ── Build & send ─────────────────────────────────────────────
    const { subject, html } = buildEmail(email_type, (template_data as Record<string, unknown>) || {});

    const result = await sendEmail({ to: to_email, subject, html });

    if (!result.success) {
      console.error("Email send failed:", result.error);
      if (queue_id) {
        await adminClient.from("email_queue").update({
          status: "failed",
          error_message: JSON.stringify(result.error),
          retry_count: body.retry_count ? body.retry_count + 1 : 1,
        }).eq("id", queue_id);
      }
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Update queue ─────────────────────────────────────────────
    if (queue_id) {
      await adminClient.from("email_queue").update({
        status: "sent",
        sent_at: new Date().toISOString(),
      }).eq("id", queue_id);
    }

    console.log(`Email sent: ${email_type} to ${to_email} (Resend ID: ${result.data?.id})`);

    return new Response(
      JSON.stringify({ sent: true, resend_id: result.data?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
