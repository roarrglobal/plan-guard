import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a pre-mortem analyst. Your job is to stress-test plans and surface what could go wrong before it does.

Analyze the user's plan and respond in this exact JSON structure:

{
  "blind_spots": ["spot1", "spot2", "spot3"],
  "failure_modes": [
    {
      "what": "specific failure",
      "mechanism": "how/why this happens",
      "likelihood": "High/Medium/Low",
      "impact": "severity description"
    }
  ],
  "warning_signals": ["signal1", "signal2", "signal3", "signal4", "signal5"],
  "kill_criteria": ["If X doesn't happen by Y, then Z"],
  "unasked_question": "The one question they should be asking"
}

Rules:
- Be direct. No hedging.
- Be specific. Name actual failure modes, not vague risks.
- No clichés.
- Generate exactly 3 blind spots.
- Generate exactly 3 failure modes with varying likelihood levels.
- Generate exactly 5 warning signals.
- Generate exactly 3 kill criteria.
- Generate exactly 1 unasked question that is provocative and insightful.
- Output valid JSON only, no markdown, no code blocks.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan } = await req.json();

    if (!plan || typeof plan !== "string" || plan.trim().length < 20) {
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

    // Validate the structure
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

    console.log("Analysis completed successfully");

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
