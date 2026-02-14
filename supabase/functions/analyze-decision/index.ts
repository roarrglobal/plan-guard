import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  validateString,
  sanitizeForPrompt,
  validationErrorResponse,
  MAX_TEXT_SIZE,
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a strategic pre-mortem analyst using the SNAG Framework. Analyze with the rigor of a McKinsey consultant. Be direct, specific, and assume intelligence. Consider organizational dynamics and execution complexity.

Return ONLY valid JSON in this EXACT structure. No markdown, no backticks, no explanation.

{
  "summary": "2-3 sentence executive summary of the analysis",
  "blind_spots": [
    {
      "spot": "The specific assumption or gap",
      "category": "strategic|operational|financial|political",
      "why_it_matters": "Why this matters",
      "how_to_test": "How to validate"
    }
  ],
  "failure_modes": [
    {
      "what": "What specifically fails",
      "mechanism": "How and why this happens",
      "likelihood": "high|medium|low",
      "impact": "high|medium|low",
      "detectability": "easy|hard",
      "mitigation": "How to prevent or reduce risk"
    }
  ],
  "warning_signals": [
    {
      "timeframe": "30|60|90",
      "signal": "Observable indicator",
      "owner": "Who should watch for it",
      "action_if_seen": "What to do if seen"
    }
  ],
  "kill_criteria": [
    {
      "condition": "If this happens",
      "deadline": "By when",
      "action": "Then do this",
      "escalation": "Escalation path"
    }
  ],
  "stakeholder_map": [
    {
      "stakeholder": "Name or role",
      "impact": "positive|negative|neutral",
      "intensity": 1,
      "influence": "high|medium|low",
      "action": "Recommended action"
    }
  ],
  "unasked_question": "The one uncomfortable question they should be asking",
  "recommendation": {
    "option": "Recommended path forward",
    "rationale": "Why this is the best option",
    "dissenting_view": "The strongest argument against this recommendation",
    "confidence": "high|medium|low"
  },
  "bottom_line": {
    "verdict": "Proceed with Confidence|Proceed with Caution|Investigate Further|Reconsider",
    "primary_risk": "The single biggest risk",
    "key_action": "The most important next step",
    "confidence_note": "What would change this assessment"
  }
}

RULES:
1. Return ONLY valid JSON
2. Be specific to their actual decision - reference their details
3. No generic advice or clichés
4. 3-5 blind spots, 3-5 failure modes, 3-6 warning signals, 2-4 kill criteria
5. Stakeholder map should have 3-6 entries
6. Consider organizational politics, execution risk, market dynamics
7. The unasked question should be genuinely uncomfortable`;

function buildSystemPrompt(template: any): string {
  let prompt = SYSTEM_PROMPT;
  if (template) {
    const blindSpots = (template.blind_spot_library || [])
      .map((s: any) => `- ${s.spot}: ${s.prompt}`)
      .join("\n");
    const failureModes = (template.failure_mode_library || [])
      .map((m: any) => `- ${m.mode}: ${m.mechanism}\n  Likelihood factors: ${(m.likelihood_factors || []).join(", ")}`)
      .join("\n");

    prompt += `\n\nThis is a ${template.department} decision using the '${template.name}' template.

DOMAIN-SPECIFIC BLIND SPOTS TO EVALUATE:
${blindSpots}

DOMAIN-SPECIFIC FAILURE MODES TO CONSIDER:
${failureModes}

Use these domain-specific items as your starting point. Add additional blind spots and failure modes specific to this particular situation. In each blind_spot and failure_mode object in your response, add a "source" field with value "library" for items from the template and "generated" for new items you identify.`;
  }
  return prompt;
}

function buildUserPrompt(decision: any, analysisType: string): string {
  const parts = [
    `DECISION: ${decision.decision_text}`,
    decision.description ? `DESCRIPTION: ${decision.description}` : null,
    `CATEGORY: ${decision.category || "general"}`,
    `STAKES: ${decision.stakes || "medium"}`,
    decision.reversibility ? `REVERSIBILITY: ${decision.reversibility}` : null,
    decision.timeline ? `TIMELINE: ${decision.timeline}` : null,
    decision.deadline ? `DEADLINE: ${decision.deadline}` : null,
    decision.input_context ? `ADDITIONAL CONTEXT: ${decision.input_context}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const depth =
    analysisType === "deep"
      ? "Provide an exhaustive deep analysis. Include stakeholder mapping. Be thorough."
      : analysisType === "quick"
      ? "Provide a concise quick analysis. Focus on top 3 risks."
      : "Provide a standard analysis with balanced depth.";

  return `Analyze this business decision:\n\n${parts}\n\n${depth}`;
}

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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return validationErrorResponse("Invalid request body", corsHeaders);
    }

    const { decision_id, analysis_type = "standard", team_id } = body;

    if (!decision_id || !team_id) {
      return validationErrorResponse("decision_id and team_id are required", corsHeaders);
    }

    // Fetch the decision
    const { data: decision, error: decisionError } = await supabase
      .from("team_decisions")
      .select("*")
      .eq("id", decision_id)
      .single();

    if (decisionError || !decision) {
      return new Response(JSON.stringify({ error: "Decision not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch template if decision has one
    let template: any = null;
    const templateId = (decision as any).template_id;
    if (templateId) {
      const { data: tpl } = await supabase
        .from("decision_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      template = tpl;
    }

    // Build user prompt from decision data
    const userPrompt = buildUserPrompt(decision, analysis_type);
    const inputValidation = validateString(userPrompt, {
      minLength: 10,
      maxLength: MAX_TEXT_SIZE,
      fieldName: "Input",
    });
    if (!inputValidation.valid) {
      return validationErrorResponse(inputValidation.error, corsHeaders);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model =
      analysis_type === "deep"
        ? "google/gemini-2.5-pro"
        : analysis_type === "quick"
        ? "google/gemini-2.5-flash-lite"
        : "google/gemini-2.5-flash";

    console.log(`Running ${analysis_type} analysis with model ${model}`);
    const startTime = Date.now();

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt(template) },
          { role: "user", content: sanitizeForPrompt(inputValidation.value) },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;
    const processingTime = Date.now() - startTime;
    const tokenCount = aiResult.usage?.total_tokens || 0;

    if (!content) {
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysisResult;
    try {
      const cleaned = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      analysisResult = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse analysis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store analysis using service role for INSERT since RLS allows team members
    const { data: stored, error: storeError } = await supabase
      .from("team_analyses")
      .insert({
        decision_id,
        team_id,
        user_id: user.id,
        analysis_type,
        input_text: userPrompt,
        output_json: analysisResult,
        token_count: tokenCount,
        processing_time_ms: processingTime,
      })
      .select()
      .single();

    if (storeError) {
      console.error("Failed to store analysis:", storeError);
      // Still return the analysis even if storage fails
    }

    // Increment team usage
    try {
      await supabase.rpc("increment_team_snag_usage", {
        p_team_id: team_id,
        p_type: analysis_type === "deep" ? "deep" : "quick",
      });
    } catch (e) {
      console.error("Failed to increment usage:", e);
    }

    console.log(`Analysis complete in ${processingTime}ms, ${tokenCount} tokens`);

    return new Response(
      JSON.stringify({
        analysis: analysisResult,
        analysis_id: stored?.id,
        processing_time_ms: processingTime,
        token_count: tokenCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analyze decision error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
