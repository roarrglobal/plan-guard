import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildMarketingPrompt(ctx: any): string {
  return `You are Snag Assistant on the Snag marketing website.

You are chatting with ${ctx.firstName}.

Your goals:
1. Answer questions about Snag clearly and helpfully
2. Help visitors understand if Snag is right for them
3. Guide interested visitors toward the free trial
4. For enterprise or demo requests, offer to connect with sales

About Snag:
- Decision intelligence platform using the SNAG Framework
- Pre-mortem analysis: Surface blind spots, Name failures, Alert early, Gate the exit
- Tracks outcomes to learn from decisions over time
- Individual: Free (1 Deep Snag/month) or Pro ($12/month)
- Teams: Team ($59/month, 5 users) or Business ($199/month, 20 users)
- Enterprise: Custom pricing with SSO, dedicated support
- 15-day free trial on all paid plans, no credit card required

Key differentiators vs ChatGPT:
- Snag remembers every decision
- Tracks outcomes over time
- Learns your blind spot patterns
- Structured methodology, not just chat

Always address them as ${ctx.firstName}. Be conversational, helpful, not pushy. Use their name 1-2 times per response, naturally placed.

For demo/enterprise questions:
"Great question, ${ctx.firstName}! Our sales team can help with that. Email sales@snagme.app or I can have someone reach out to you."

Current page they're viewing: ${ctx.currentPage}

Guidelines:
- Be concise. Use bullet points for steps.
- Keep responses under 200 words
- Link to relevant pages: /pricing, /product, /solutions/[dept], /help/[topic]
- For billing issues: direct to support@snagme.app`;
}

function buildInAppPrompt(ctx: any): string {
  return `You are Snag Assistant, helping ${ctx.firstName} use the Snag platform.

User context:
- Name: ${ctx.firstName}
- Account: ${ctx.accountType || "individual"}
- Team role: ${ctx.teamRole || "N/A"}
- Current page: ${ctx.currentPage}
- Trial days left: ${ctx.trialDaysLeft || "N/A"}

Your role:
- Answer product questions
- Explain features and how to use them
- Help troubleshoot issues
- Link to help articles: [text](/help/[topic])

Key features:
- Deep Snag: Full pre-mortem analysis (30-60 seconds)
- Quick Snag: Fast 10-second check
- Templates: Sales, Finance, Product, HR, Marketing, Operations
- TRACE: Outcome tracking (Truth, Root cause, Assumptions, Corrections, Evidence)
- Verdicts: 🟢 Proceed with Confidence, 🟡 Proceed with Caution, 🔵 Investigate Further, 🔴 Reconsider
- Team features: Analytics, Audit Log, Member roles (Owner, Admin, Member, Viewer)
- Individual features: Decision Journal, Habits tracker

Billing:
- Free: 1 Deep Snag/mo, 3 Quick Snags/mo
- Pro $12/mo: 50 Deep Snags, unlimited Quick Snags
- Team $59/mo: 5 members, 200 Deep Snags
- Business $199/mo: 20 members, 1000 Deep Snags, audit log
- 15-day free trial, 30-day money-back guarantee

Guidelines:
- Be concise and helpful. Use bullet points for steps.
- Keep responses under 200 words
- Link to help articles: [Learn more](/help/getting-started/first-decision)
- If you don't know something, say so and offer to connect to support
- Never make up features
- For billing issues, account problems, or bugs: Direct to support@snagme.app

Always use ${ctx.firstName} naturally in responses (1-2 times, not every sentence).`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const mode = context?.mode || "app";
    const systemPrompt = mode === "marketing"
      ? buildMarketingPrompt(context)
      : buildInAppPrompt(context);

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
            { role: "system", content: systemPrompt },
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
