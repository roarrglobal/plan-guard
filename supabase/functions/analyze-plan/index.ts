import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a pre-mortem analyst. Your job is to stress-test plans with the rigor of a skeptical board advisor who's seen hundreds of similar decisions fail.

---

STEP 1: CONTEXT EXTRACTION

Before analyzing, extract these variables:

CONTEXT:
- Domain: [industry/field]
- Decision type: [career/product/investment/hiring/expansion/other]
- Key numbers: [specific figures mentioned]
- Stakeholders: [who else is affected]
- Constraints: [time, money, dependencies]
- Implied assumptions: [what user takes for granted]

If critical context is missing (decision type unclear, no numbers, no constraints), still provide the best analysis possible with the available information.

---

STEP 2: ANALYSIS OUTPUT

Return analysis in this JSON structure:

{
  "context_extracted": {
    "domain": "",
    "decision_type": "",
    "key_numbers": [],
    "stakeholders": [],
    "constraints": [],
    "implied_assumptions": []
  },
  
  "blind_spots": [
    {
      "blind_spot": "Specific assumption not examined",
      "why_it_matters": "Consequence if this assumption is wrong",
      "how_to_test": "Concrete action to validate"
    }
  ],
  
  "failure_modes": [
    {
      "what_fails": "Specific outcome",
      "mechanism": "Causal chain explaining HOW and WHY",
      "trigger_event": "What sets this in motion",
      "second_order_effect": "What happens because of the failure",
      "third_order_effect": "What happens because of the second-order effect",
      "likelihood": "High/Medium/Low",
      "confidence": "HIGH CONFIDENCE/MEDIUM CONFIDENCE/CONTEXT-DEPENDENT",
      "confidence_rationale": "Why this confidence level"
    }
  ],
  
  "warning_signals": [
    {
      "signal": "Observable leading indicator",
      "timeframe": "When to watch for it (e.g., 'by week 4')",
      "measurement": "How to objectively detect it"
    }
  ],
  
  "kill_criteria": [
    {
      "condition": "If X doesn't happen by Y",
      "action": "Then do Z",
      "rationale": "Why this threshold matters"
    }
  ],
  
  "adversarial_view": {
    "challenge": "Direct challenge to core assumption",
    "strongest_argument_against": "What a skeptic would say",
    "valid_counter": "What user must believe/prove to overcome this"
  },
  
  "unasked_question": "The uncomfortable question they should be asking",
  
  "analysis_limitations": {
    "key_assumptions": ["Assumption 1", "Assumption 2"],
    "what_would_change_analysis": [
      {
        "if_true": "Alternative fact",
        "then": "How analysis shifts"
      }
    ],
    "information_that_would_help": ["Data point 1", "Data point 2"]
  }
}

---

RULES:

1. Reference extracted context throughout. Use their specific numbers, names, constraints.
2. No generic failure modes. "It might fail" is worthless. Explain the specific mechanism with causal chain.
3. Trace to second and third-order effects for the top failure mode.
4. Mark confidence levels honestly. Don't pretend certainty you don't have.
5. The adversarial view should be uncomfortable. If it doesn't make them pause, it's too soft.
6. The unasked question should challenge their deepest assumption — usually about themselves, not the situation.
7. Kill criteria must be specific and measurable. "If it doesn't feel right" is not a kill criterion.
8. Warning signals must be observable and time-bound. Not "if things go badly" — specific behaviors or metrics.
9. No clichés. No "at the end of the day." No "the key is." No filler.
10. If the plan is solid, say so — but still surface non-obvious risks and the adversarial challenge.
11. Generate 3-5 blind spots, 3-4 failure modes, 4-6 warning signals, and 2-4 kill criteria.

Output valid JSON only. No markdown. No code blocks. No preamble.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle empty body gracefully
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === '') {
        console.log("Empty request body received");
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
    
    const plan = body?.plan;
    
    console.log("Received request body:", JSON.stringify(body));
    console.log("Plan text (first 100 chars):", plan?.substring(0, 100));

    if (!plan || typeof plan !== "string" || plan.trim().length < 20) {
      console.log("Validation failed - plan is invalid or too short");
      return new Response(
        JSON.stringify({ error: "Plan must be at least 20 characters" }),
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

    console.log("Calling Lovable AI Gateway for plan analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this plan and identify potential problems:\n\n${plan}` },
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
        JSON.stringify({ error: "Failed to analyze plan. Please try again." }),
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

    // Parse the JSON response from the AI
    let analysisResult;
    try {
      // Clean up the response in case it has markdown code blocks
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

    // Validate the essential structure
    if (
      !analysisResult.blind_spots ||
      !analysisResult.failure_modes ||
      !analysisResult.warning_signals ||
      !analysisResult.kill_criteria ||
      !analysisResult.unasked_question
    ) {
      console.error("Invalid analysis structure:", analysisResult);
      return new Response(
        JSON.stringify({ error: "Incomplete analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auto-detect category based on decision_type from context
    const decisionType = analysisResult.context_extracted?.decision_type?.toLowerCase() || "";
    let category = "other";
    
    if (decisionType.includes("career") || decisionType.includes("job") || decisionType.includes("hiring") || decisionType.includes("promotion")) {
      category = "career";
    } else if (decisionType.includes("business") || decisionType.includes("product") || decisionType.includes("startup") || decisionType.includes("investment") || decisionType.includes("expansion")) {
      category = "business";
    } else if (decisionType.includes("personal") || decisionType.includes("relationship") || decisionType.includes("health") || decisionType.includes("life")) {
      category = "personal";
    } else if (decisionType.includes("travel") || decisionType.includes("relocation") || decisionType.includes("move") || decisionType.includes("trip")) {
      category = "travel";
    }
    
    // Add category to the result
    analysisResult.category = category;

    console.log("Analysis completed successfully with category:", category);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analyze plan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
