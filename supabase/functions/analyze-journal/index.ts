import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are an insightful personal reflection analyst. Analyze the user's journal entry and extract meaningful insights, patterns, and actionable guidance.

Based on the entry type and content, provide analysis in this JSON structure:

{
  "summary": "Brief summary of the entry's key themes",
  
  "emotional_landscape": {
    "primary_mood": "The dominant emotion",
    "underlying_emotions": ["Secondary emotions detected"],
    "emotional_trajectory": "rising|stable|declining|mixed",
    "energy_level": "high|medium|low"
  },
  
  "key_themes": [
    {
      "theme": "Main theme identified",
      "significance": "Why this matters",
      "pattern_note": "Is this recurring?"
    }
  ],
  
  "insights": [
    {
      "insight": "A meaningful observation",
      "evidence": "What in the entry supports this",
      "action_potential": "What they could do with this insight"
    }
  ],
  
  "blind_spots": [
    {
      "area": "Something they might not be seeing",
      "gentle_prompt": "A question to explore this"
    }
  ],
  
  "gratitude_analysis": {
    "depth_score": "surface|meaningful|profound",
    "specificity": "How specific their gratitude is",
    "suggestions": ["Ways to deepen gratitude practice"]
  },
  
  "manifestation_analysis": {
    "clarity_score": "vague|clear|crystal_clear",
    "alignment_check": "How aligned is this with their stated values?",
    "potential_blockers": ["Internal blockers identified"],
    "amplifiers": ["Things that could help achieve this"]
  },
  
  "decision_implications": {
    "pending_decisions": ["Decisions implied or mentioned"],
    "recommended_considerations": ["Things to think about"],
    "timing_notes": "Any urgency or timing considerations"
  },
  
  "growth_opportunities": [
    {
      "area": "Area for potential growth",
      "current_state": "Where they seem to be",
      "next_step": "A concrete next step"
    }
  ],
  
  "reflection_prompts": [
    "Question to deepen reflection",
    "Another thought-provoking question",
    "Third prompt for further exploration"
  ],
  
  "affirmation": "A personalized affirmation based on the entry"
}

RULES:
1. Return ONLY valid JSON. No markdown.
2. Be warm and supportive while being genuinely insightful.
3. Look for patterns they might not see.
4. Tailor analysis to the entry type (gratitude, manifestation, reflection, etc.).
5. The blind_spots should be gentle but honest.
6. Make insights specific to THEIR content, not generic advice.`;

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

    const { content, entryType, mood } = body;

    // Extract text content from structured journal content
    let textContent = "";
    if (typeof content === "string") {
      textContent = content;
    } else if (content && typeof content === "object") {
      // Handle structured journal content
      const parts: string[] = [];
      if (content.freeform) parts.push(content.freeform);
      if (content.grateful_for) parts.push(`Grateful for: ${content.grateful_for}`);
      if (content.why_grateful) parts.push(`Why: ${content.why_grateful}`);
      if (content.one_thing_to_remember) parts.push(`One thing to remember: ${content.one_thing_to_remember}`);
      if (content.i_am_statements) parts.push(`I am: ${content.i_am_statements}`);
      if (content.vision) parts.push(`Vision: ${content.vision}`);
      if (content.action_today) parts.push(`Action today: ${content.action_today}`);
      if (content.release) parts.push(`Releasing: ${content.release}`);
      textContent = parts.join("\n\n");
    }

    if (!textContent || textContent.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Journal entry content is too short" }),
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

    const userMessage = `
Analyze this journal entry:

ENTRY TYPE: ${entryType || "general"}
${mood ? `MOOD: ${mood}` : ""}

CONTENT:
${textContent}

Provide a thoughtful analysis with insights tailored to this specific entry.
`;

    console.log("Calling Lovable AI Gateway for journal analysis...");

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
    const aiContent = aiResponse.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error("No content in AI response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Invalid response from AI. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let analysisResult;
    try {
      const cleanedContent = aiContent
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent, parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Journal analysis completed successfully");

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analyze journal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
