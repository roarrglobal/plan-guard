import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { 
  validateString, 
  validateObject,
  sanitizeForPrompt, 
  validationErrorResponse,
  MAX_TEXT_SIZE,
  MIN_PLAN_LENGTH 
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a post-mortem analyst. Your job is to help people extract maximum learning from outcomes — both successes and failures.

The user will describe something that happened — a decision outcome, project completion, event, or experience. Analyze it thoroughly.

RETURN ONLY VALID JSON in this exact structure:
{
  "summary": "2-3 sentence synthesis of what happened and why",
  "outcome_assessment": {
    "original_goal": "What they were trying to achieve",
    "actual_outcome": "What actually happened",
    "outcome_category": "success|partial|failure|mixed|pivot",
    "satisfaction_score": 7,
    "time_context": "Relevant timing information"
  },
  "expectation_vs_reality": [
    {
      "expected": "What was expected",
      "actual": "What happened",
      "accuracy": "accurate|partially_accurate|wrong",
      "implication": "What this gap means"
    }
  ],
  "root_cause_analysis": {
    "five_whys": {
      "problem": "The outcome being analyzed",
      "why_1": "First level",
      "why_2": "Second level",
      "why_3": "Third level",
      "why_4": "Fourth level",
      "why_5_root_cause": "The deepest cause"
    },
    "contributing_factors": {
      "people": ["People-related factors"],
      "process": ["Process-related factors"],
      "external": ["External factors"],
      "decisions": ["Key decisions that mattered"]
    },
    "primary_root_cause": "The single biggest factor"
  },
  "success_factors": [
    {
      "factor": "What worked",
      "why_it_worked": "Mechanism",
      "replicability": "high|medium|low",
      "how_to_replicate": "Action to repeat"
    }
  ],
  "failure_factors": [
    {
      "factor": "What didn't work",
      "why_it_failed": "Mechanism",
      "avoidability": "high|medium|low",
      "how_to_avoid": "Action to prevent"
    }
  ],
  "lessons": [
    {
      "lesson": "The insight",
      "evidence": "What proved this",
      "application": "How to apply",
      "category": "decision_making|execution|people|timing|resources|mindset"
    }
  ],
  "action_items": {
    "start_doing": ["New actions to begin"],
    "stop_doing": ["Actions to cease"],
    "continue_doing": ["Actions to maintain"]
  },
  "uncomfortable_truth": {
    "truth": "What they might be avoiding",
    "why_hard_to_admit": "Why this is uncomfortable",
    "what_changes": "How accepting it shifts perspective"
  },
  "one_sentence_wisdom": "The single most important takeaway",
  "category": "career|business|personal|project|relationship|health|financial|other"
}

RULES:
1. Return ONLY valid JSON. No markdown, no backticks.
2. Be specific to their actual situation. Reference their details.
3. Don't soften the uncomfortable truth. That's the point.
4. Balance acknowledgment of success with honest critique.
5. Root cause analysis should go DEEP, not surface-level.
6. Lessons should be actionable, not platitudes.
7. If it was a success, still find what could have been better.
8. If it was a failure, still find what worked.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client to validate the token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the JWT and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log("Invalid token:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log("Authenticated user:", userId);

    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({ error: "Request body is empty" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      body = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse request body:", parseErr);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { outcomeStatus, outcomeRating, postMortemType } = body;
    
    // SECURITY: Validate all inputs
    const descriptionValidation = validateString(body.description, {
      minLength: MIN_PLAN_LENGTH,
      maxLength: MAX_TEXT_SIZE,
      fieldName: 'Description'
    });
    
    if (!descriptionValidation.valid) {
      return validationErrorResponse(descriptionValidation.error, corsHeaders);
    }
    
    const description = descriptionValidation.value;
    
    // Validate userInputs object
    const inputsValidation = validateObject(body.userInputs, {
      fieldName: 'User inputs'
    });
    
    if (!inputsValidation.valid) {
      return validationErrorResponse(inputsValidation.error, corsHeaders);
    }
    
    const userInputs = inputsValidation.value;
    
    // Sanitize all text fields in userInputs
    const sanitizedInputs: Record<string, string> = {};
    if (userInputs) {
      for (const [key, value] of Object.entries(userInputs)) {
        if (typeof value === 'string') {
          sanitizedInputs[key] = sanitizeForPrompt(value.slice(0, 2000)); // Max 2KB per field
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the user message with all sanitized context
    const userMessage = `
Analyze this post-mortem reflection:

EVENT/DECISION: ${sanitizeForPrompt(description)}

TYPE: ${sanitizeForPrompt(postMortemType || "general")}

OUTCOME STATUS: ${sanitizeForPrompt(outcomeStatus || "unknown")} (Satisfaction: ${outcomeRating || "N/A"}/10)

USER'S REFLECTIONS:
- What went well:
  1. ${sanitizedInputs.went_well_1 || "Not provided"}
  2. ${sanitizedInputs.went_well_2 || "Not provided"}
  3. ${sanitizedInputs.went_well_3 || "Not provided"}

- What didn't go well:
  1. ${sanitizedInputs.went_wrong_1 || "Not provided"}
  2. ${sanitizedInputs.went_wrong_2 || "Not provided"}
  3. ${sanitizedInputs.went_wrong_3 || "Not provided"}

- What they would do differently: ${sanitizedInputs.do_differently || "Not provided"}

- What surprised them: ${sanitizedInputs.surprised_by || "Not provided"}

- What they want to carry forward: ${sanitizedInputs.carry_forward || "Not provided"}

${sanitizedInputs.expectations ? `- What they expected: ${sanitizedInputs.expectations}` : ""}
${sanitizedInputs.actual_result ? `- What actually happened: ${sanitizedInputs.actual_result}` : ""}

Provide a thorough post-mortem analysis with deep insights and actionable lessons.
`;

    console.log("Calling Lovable AI Gateway for post-mortem analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Invalid response from AI. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let analysisResult;
    try {
      const cleanedContent = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content, parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Post-mortem analysis completed successfully");

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analyze post-mortem error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
