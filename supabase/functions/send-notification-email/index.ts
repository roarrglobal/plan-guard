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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Use anon client for auth verification
    const anonClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for reading other users' data
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { team_id, decision_id, type, actor_name, content, mentioned_user_ids = [], new_status, old_status } = body;

    if (!team_id) {
      return new Response(JSON.stringify({ error: "team_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the decision info
    let decisionTitle = "a decision";
    if (decision_id) {
      const { data: decision } = await adminClient
        .from("team_decisions")
        .select("decision_text")
        .eq("id", decision_id)
        .maybeSingle();
      if (decision) decisionTitle = decision.decision_text;
    }

    // Get team info
    const { data: team } = await adminClient
      .from("teams")
      .select("name, slug")
      .eq("id", team_id)
      .maybeSingle();

    // Determine who to notify
    let notifyUserIds: string[] = [];

    if (type === "comment") {
      // Notify mentioned users + decision creator (but not the actor)
      if (decision_id) {
        const { data: decision } = await adminClient
          .from("team_decisions")
          .select("created_by")
          .eq("id", decision_id)
          .maybeSingle();
        if (decision && decision.created_by !== user.id) {
          notifyUserIds.push(decision.created_by);
        }
      }
      // Add mentioned users
      notifyUserIds = [...new Set([...notifyUserIds, ...mentioned_user_ids])];
      notifyUserIds = notifyUserIds.filter((id) => id !== user.id);
    } else if (type === "status_change") {
      // Notify all team members except actor
      const { data: members } = await adminClient
        .from("team_members")
        .select("user_id")
        .eq("team_id", team_id)
        .eq("status", "active");
      if (members) {
        notifyUserIds = members.map((m) => m.user_id).filter((id) => id !== user.id);
      }
    }

    if (notifyUserIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get emails for these users
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const emailMap = new Map<string, string>();
    if (authUsers?.users) {
      authUsers.users.forEach((u) => {
        if (u.email && notifyUserIds.includes(u.id)) {
          emailMap.set(u.id, u.email);
        }
      });
    }

    // Create in-app notifications for non-mentioned users (mentioned already get notifications from client)
    const nonMentionedIds = notifyUserIds.filter((id) => !mentioned_user_ids.includes(id));
    if (nonMentionedIds.length > 0) {
      const notifications = nonMentionedIds.map((uid) => ({
        user_id: uid,
        team_id,
        type: type === "comment" ? "comment" : "status_change",
        title: type === "comment"
          ? `${actor_name} commented on "${decisionTitle.slice(0, 60)}"`
          : `Decision status changed to ${new_status}`,
        body: type === "comment" ? content?.slice(0, 200) : `"${decisionTitle.slice(0, 100)}" was moved from ${old_status} to ${new_status}`,
        entity_type: "decision",
        entity_id: decision_id,
        actor_id: user.id,
      }));
      await adminClient.from("notifications").insert(notifications);
    }

    // Send emails using Supabase's built-in email (via auth.admin)
    // Since we don't have a dedicated email service, we log the intent
    // In production, you'd integrate with Resend, SendGrid, etc.
    const emailsSent = emailMap.size;
    console.log(`Would send ${emailsSent} emails for ${type} notification on team ${team?.name}`);
    for (const [uid, email] of emailMap) {
      const subject = type === "comment"
        ? `💬 ${actor_name} commented on "${decisionTitle.slice(0, 40)}"`
        : `🔄 Decision "${decisionTitle.slice(0, 40)}" status changed to ${new_status}`;

      console.log(`Email to ${email}: ${subject}`);
      // TODO: Integrate with email service (Resend, SendGrid, etc.)
      // For now, in-app notifications are the primary channel
    }

    return new Response(
      JSON.stringify({ sent: emailsSent, notifications: nonMentionedIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
