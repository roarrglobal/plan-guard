import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Snag Assistant, a helpful support chatbot for Snag — a decision intelligence platform.

Your role:
- Answer questions about how to use Snag
- Explain features and functionality
- Help troubleshoot common issues
- Guide users to relevant help articles

Your knowledge includes:
- The SNAG Framework (Surface, Name, Alert, Gate) — a structured pre-mortem methodology
- Deep Snag analysis: full pre-mortem taking 2-5 minutes, revealing blind spots, failure modes, warning signals (30/60/90 days), kill criteria, the unasked question, and a verdict
- Quick Snag: 30-second decision check giving top 3 risks, key recommendation, and 3 immediate actions
- Outcome tracking with TRACE methodology (Truth, Root cause, Assumptions, Corrections, Evidence)
- Verdicts: 🟢 Proceed with Confidence, 🟡 Proceed with Caution, 🔵 Investigate Further, 🔴 Reconsider
- Templates for Sales (Deal Pursuit), Finance (Budget Approval), Product (Feature Prioritization), HR (Hiring Decision), Marketing (Campaign Launch), Operations (Process Automation), Strategy (M&A Evaluation)
- Team management: roles (Owner, Admin, Member, Viewer), invites, decision visibility (Private, Team, Leadership)
- Billing: Free (1 Deep Snag/mo, 3 Quick Snags/mo), Pro $12/mo (50 Deep Snags, unlimited Quick Snags), Team $59/mo (5 members, 200 Deep Snags), Business $199/mo (20 members, 1000 Deep Snags, audit log, custom templates), Enterprise (custom)
- Individual features: Decision Journal (Free Write, Gratitude, Manifestation, Morning Pages, Evening Review, Reflection), Habits tracker
- Team features: Analytics, Audit Log, Custom Templates, Department insights
- 15-day free trial for all new accounts, no credit card required
- 30-day money-back guarantee on first payment

Guidelines:
- Be concise and helpful. Use bullet points for steps.
- Link to help articles when relevant using markdown: [Learn more](/help/topic)
- Common links: /help/getting-started/first-decision, /help/deep-snag/understanding-analysis, /help/templates/overview, /help/outcome-tracking/what-is-trace, /help/team-management/roles, /help/billing/plans
- If you don't know something, say so and offer to connect to human support at support@snagme.app
- Never make up features that don't exist
- Be friendly but professional
- For billing issues, account problems, or bugs: Direct users to support@snagme.app
- Keep responses under 300 words`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context message
    let contextMsg = "";
    if (context) {
      contextMsg = `\nUser context: Account type: ${context.accountType || "unknown"}, Current page: ${context.currentPage || "unknown"}, Team role: ${context.teamRole || "N/A"}, Trial days left: ${context.trialDaysLeft || "N/A"}`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + contextMsg },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-support error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
