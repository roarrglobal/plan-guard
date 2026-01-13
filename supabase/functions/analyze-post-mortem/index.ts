import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are an expert Post-Mortem analyst. Analyze the user's reflection on a past event, decision, or project. Your goal is to extract deep insights and actionable lessons.

Return your analysis in this EXACT JSON structure:

{
  "outcome_assessment": {
    "summary": "One-paragraph summary of what happened",
    "outcome_category": "success|partial|failure|mixed|pivot",
    "key_factors": ["Factor 1", "Factor 2", "Factor 3"]
  },
  
  "expectation_vs_reality": [
    {
      "expected": "What they expected",
      "actual": "What actually happened",
      "accuracy": "accurate|partially_accurate|wrong",
      "insight": "What this gap reveals"
    }
  ],
  
  "root_cause_analysis": {
    "five_whys": {
      "problem": "The core issue or outcome",
      "why_1": "First-level cause",
      "why_2": "Deeper cause",
      "why_3": "Deeper still",
      "why_4": "Getting to root",
      "why_5": "Root cause"
    },
    "contributing_factors": {
      "people": ["People-related factors"],
      "process": ["Process/system factors"],
      "external": ["External/environmental factors"],
      "timing": ["Timing-related factors"],
      "decisions": ["Key decision factors"]
    },
    "primary_root_cause": "The single biggest factor"
  },
  
  "success_factors": [
    {
      "factor": "What worked",
      "why_it_worked": "The mechanism",
      "replicability": "high|medium|low",
      "how_to_replicate": "How to repeat this success"
    }
  ],
  
  "failure_factors": [
    {
      "factor": "What didn't work",
      "why_it_failed": "The mechanism",
      "avoidability": "high|medium|low",
      "how_to_avoid": "How to prevent in future"
    }
  ],
  
  "lessons_extracted": [
    {
      "lesson": "The key insight",
      "evidence": "What proved this",
      "application": "How to apply going forward",
      "category": "decision_making|execution|people|timing|resources|mindset"
    }
  ],
  
  "action_items": {
    "start_doing": ["Actions to begin"],
    "stop_doing": ["Actions to cease"],
    "continue_doing": ["Actions to maintain"]
  },
  
  "uncomfortable_truth": {
    "truth": "The thing they might not want to admit",
    "why_hard_to_admit": "What makes this uncomfortable",
    "what_changes": "How accepting this shifts perspective",
    "pattern_check": "Is this a recurring pattern?"
  },
  
  "one_sentence_lesson": "The most important takeaway in one sentence",
  
  "advice_to_others": "What advice would you give someone facing the same situation?"
}

RULES:
1. Return ONLY valid JSON. No markdown, no backticks.
2. Be specific to their actual situation - reference their details.
3. The uncomfortable_truth should be genuinely probing - not surface level.
4. Look for patterns they might not see.
5. Balance empathy with honest feedback.
6. Focus on extractable, actionable wisdom.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { description, outcomeStatus, outcomeRating, userInputs, postMortemType } = body;

    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Description must be at least 20 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the user message with all context
    const userMessage = `
Analyze this post-mortem reflection:

EVENT/DECISION: ${description}

TYPE: ${postMortemType || "general"}

OUTCOME STATUS: ${outcomeStatus || "unknown"} (Satisfaction: ${outcomeRating || "N/A"}/10)

USER'S REFLECTIONS:
- What went well:
  1. ${userInputs?.went_well_1 || "Not provided"}
  2. ${userInputs?.went_well_2 || "Not provided"}
  3. ${userInputs?.went_well_3 || "Not provided"}

- What didn't go well:
  1. ${userInputs?.went_wrong_1 || "Not provided"}
  2. ${userInputs?.went_wrong_2 || "Not provided"}
  3. ${userInputs?.went_wrong_3 || "Not provided"}

- What they would do differently: ${userInputs?.do_differently || "Not provided"}

- What surprised them: ${userInputs?.surprised_by || "Not provided"}

- What they want to carry forward: ${userInputs?.carry_forward || "Not provided"}

${userInputs?.expectations ? `- What they expected: ${userInputs.expectations}` : ""}
${userInputs?.actual_result ? `- What actually happened: ${userInputs.actual_result}` : ""}

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
