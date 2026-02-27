import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { 
  validateString, 
  validateObject,
  validateEnum,
  sanitizeForPrompt, 
  validationErrorResponse,
  MAX_TEXT_SIZE,
  MIN_TEXT_LENGTH 
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const { action, analysisType } = body;
    
    // SECURITY: Validate action type
    const validActions = ['suggest', 'quick_retro_nudge', 'extract', 'analyze'] as const;
    const actionValidation = validateEnum(action, validActions, {
      fieldName: 'Action',
      defaultValue: 'analyze'
    });
    
    if (!actionValidation.valid) {
      return validationErrorResponse(actionValidation.error, corsHeaders);
    }
    
    const validatedAction = actionValidation.value;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Handle AI suggestion for analysis type
    if (validatedAction === "suggest") {
      // Validate content for suggestion
      const contentValidation = validateObject(body.content, { fieldName: 'Content' });
      if (!contentValidation.valid) {
        return validationErrorResponse(contentValidation.error, corsHeaders);
      }
      
      const entryTypeValidation = validateString(body.entryType, {
        maxLength: 100,
        fieldName: 'Entry type'
      });
      
      // Extract text content for analysis
      let textContent = '';
      const content = body.content;
      if (typeof content === 'string') {
        textContent = content.slice(0, MAX_TEXT_SIZE);
      } else if (content && typeof content === 'object') {
        const parts: string[] = [];
        for (const [key, value] of Object.entries(content)) {
          if (typeof value === 'string') {
            parts.push(value.slice(0, 2000));
          }
        }
        textContent = parts.join(' ').slice(0, MAX_TEXT_SIZE);
      }
      
      const entryType = entryTypeValidation.valid ? entryTypeValidation.value : 'general';

      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ suggestion: "ask_user", reason: "Unable to determine, please choose manually." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // First check entry type for strong signals
      const entryTypeSignals: Record<string, string> = {
        'manifestation': 'pre_mortem',
        'morning': 'pre_mortem',
        'evening': 'post_mortem',
        'gratitude': 'post_mortem',
        'reflection': 'neutral',
        'free_write': 'neutral'
      };
      
      const typeSignal = entryTypeSignals[entryType] || 'neutral';
      
      // If strong signal from entry type, use it
      if (typeSignal !== 'neutral') {
        const reasons: Record<string, Record<string, string>> = {
          'pre_mortem': {
            'manifestation': 'This is a vision you\'re calling in. A pre-mortem will help you stress-test the path to get there.',
            'morning': 'These intentions deserve scrutiny. A pre-mortem surfaces what could go wrong.'
          },
          'post_mortem': {
            'evening': 'This is a reflection on your day. Extract the lessons while they\'re fresh.',
            'gratitude': 'You\'re grateful for something that happened. A post-mortem helps you understand WHY it worked.'
          }
        };
        
        return new Response(
          JSON.stringify({ 
            suggestion: typeSignal, 
            confidence: 'high',
            reason: reasons[typeSignal]?.[entryType] || 
              (typeSignal === 'pre_mortem' 
                ? 'This looks like a goal or intention worth stress-testing.'
                : 'This looks like a past experience worth analyzing.')
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Otherwise, analyze content with AI
      try {
        const suggestionPrompt = `Analyze this journal entry and determine if it's about:
1. A FUTURE decision, plan, goal, or intention (suggest: pre_mortem)
2. A PAST event, outcome, or experience (suggest: post_mortem)
3. UNCLEAR or could be either (suggest: ask_user)

Look for:
- Future language: "considering", "thinking about", "planning to", "should I", "want to", "going to", "might", "debating", "opportunity"
- Past language: "happened", "went", "was", "learned", "realized", "discovered", "turned out", "yesterday", "last week"

Journal entry:
${sanitizeForPrompt(textContent)}

Return JSON only: {"suggestion": "pre_mortem" or "post_mortem" or "ask_user", "confidence": "high" or "medium", "reason": "brief explanation in 1-2 sentences"}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: suggestionPrompt }],
          }),
        });

        if (!response.ok) {
          console.error("AI suggestion failed:", response.status);
          return new Response(
            JSON.stringify({ suggestion: "ask_user", reason: "Please choose the analysis type that fits best." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const aiResponse = await response.json();
        const aiContent = aiResponse.choices?.[0]?.message?.content?.trim() || "";
        
        try {
          const cleanedContent = aiContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
          const result = JSON.parse(cleanedContent);
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch {
          return new Response(
            JSON.stringify({ suggestion: "ask_user", reason: "Please choose the analysis type that fits best." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (err) {
        console.error("Suggestion error:", err);
        return new Response(
          JSON.stringify({ suggestion: "ask_user", reason: "Please choose the analysis type that fits best." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Handle Quick Retro AI nudge
    if (validatedAction === "quick_retro_nudge") {
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ nudge: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate quick retro inputs
      const descValidation = validateString(body.description, { maxLength: 5000, fieldName: 'Description' });
      const lessonValidation = validateString(body.lesson, { maxLength: 2000, fieldName: 'Lesson' });
      
      const description = descValidation.valid ? descValidation.value : 'Not provided';
      const lesson = lessonValidation.valid ? lessonValidation.value : 'Not provided';
      const whatWorked = typeof body.whatWorked === 'string' ? sanitizeForPrompt(body.whatWorked.slice(0, 2000)) : 'Not specified';
      const whatDidnt = typeof body.whatDidnt === 'string' ? sanitizeForPrompt(body.whatDidnt.slice(0, 2000)) : 'Not specified';
      const category = typeof body.category === 'string' ? sanitizeForPrompt(body.category.slice(0, 100)) : 'general';
      
      const nudgePrompt = `Based on this quick retrospective, provide ONE insightful observation or question in under 30 words:

What happened: ${description}
Category: ${category}
What worked: ${whatWorked}
What didn't work: ${whatDidnt}  
Lesson: ${lesson}

Be specific to their content. Look for patterns or deeper questions. Return just the nudge text, no quotes or formatting.`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: nudgePrompt }],
          }),
        });

        if (!response.ok) {
          return new Response(
            JSON.stringify({ nudge: null }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const aiResponse = await response.json();
        const nudge = aiResponse.choices?.[0]?.message?.content?.trim() || null;

        return new Response(
          JSON.stringify({ nudge }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ nudge: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Handle extraction action for Pre-Mortem/Post-Mortem
    if (validatedAction === "extract") {
      // Validate content for extraction
      let extractContent = '';
      const content = body.content;
      if (typeof content === 'string') {
        extractContent = sanitizeForPrompt(content.slice(0, MAX_TEXT_SIZE));
      } else if (content && typeof content === 'object') {
        const parts: string[] = [];
        for (const [key, value] of Object.entries(content)) {
          if (typeof value === 'string') {
            parts.push(value.slice(0, 2000));
          }
        }
        extractContent = sanitizeForPrompt(parts.join(' ').slice(0, MAX_TEXT_SIZE));
      }
      
      const entryType = typeof body.entryType === 'string' ? sanitizeForPrompt(body.entryType.slice(0, 100)) : 'general';
      
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ extracted: extractContent }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const extractionPrompt = analysisType === "pre_mortem" 
        ? `The user has written a journal entry. Extract any decision, plan, goal, or intention they're considering. Frame it as a decision to be stress-tested.

Entry type: ${entryType}
Content:
${extractContent}

Return ONLY the extracted decision/plan as a single paragraph. No JSON, no formatting. Just the extracted text that can be analyzed for potential failure modes and blind spots.`
        : `The user has written a journal entry. Extract any outcome, event, experience, or completed situation they're reflecting on. Frame it as something to analyze retrospectively.

Entry type: ${entryType}
Content:
${extractContent}

Return ONLY the extracted outcome/event as a single paragraph. No JSON, no formatting. Just the extracted text that can be analyzed for lessons learned and root causes.`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "user", content: extractionPrompt },
            ],
          }),
        });

        if (!response.ok) {
          console.error("AI extraction failed:", response.status);
          return new Response(
            JSON.stringify({ extracted: extractContent }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const aiResponse = await response.json();
        const extracted = aiResponse.choices?.[0]?.message?.content?.trim() || extractContent;

        return new Response(
          JSON.stringify({ extracted }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        console.error("Extraction error:", err);
        return new Response(
          JSON.stringify({ extracted: extractContent }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Regular journal analysis - extract and validate content
    const journalContent = body.content;
    const entryType = typeof body.entryType === 'string' ? sanitizeForPrompt(body.entryType.slice(0, 100)) : 'general';
    const mood = typeof body.mood === 'string' ? sanitizeForPrompt(body.mood.slice(0, 100)) : null;
    
    // Extract text content from structured journal content
    let textContent = "";
    if (typeof journalContent === "string") {
      textContent = journalContent;
    } else if (journalContent && typeof journalContent === "object") {
      // Handle structured journal content
      const parts: string[] = [];
      if (journalContent.freeform) parts.push(journalContent.freeform);
      if (journalContent.grateful_for) parts.push(`Grateful for: ${journalContent.grateful_for}`);
      if (journalContent.why_grateful) parts.push(`Why: ${journalContent.why_grateful}`);
      if (journalContent.one_thing_to_remember) parts.push(`One thing to remember: ${journalContent.one_thing_to_remember}`);
      if (journalContent.i_am_statements) parts.push(`I am: ${journalContent.i_am_statements}`);
      if (journalContent.vision) parts.push(`Vision: ${journalContent.vision}`);
      if (journalContent.action_today) parts.push(`Action today: ${journalContent.action_today}`);
      if (journalContent.release) parts.push(`Releasing: ${journalContent.release}`);
      // Handle gratitude fields
      if (journalContent.gratitude_1) parts.push(`Grateful for: ${journalContent.gratitude_1}`);
      if (journalContent.gratitude_2) parts.push(`Grateful for: ${journalContent.gratitude_2}`);
      if (journalContent.gratitude_3) parts.push(`Grateful for: ${journalContent.gratitude_3}`);
      // Handle evening review fields
      if (journalContent.went_well) parts.push(`What went well: ${journalContent.went_well}`);
      if (journalContent.could_be_better) parts.push(`Could be better: ${journalContent.could_be_better}`);
      if (journalContent.learned) parts.push(`Learned: ${journalContent.learned}`);
      // Handle morning fields
      if (journalContent.intention) parts.push(`Intention: ${journalContent.intention}`);
      if (journalContent.looking_forward_to) parts.push(`Looking forward to: ${journalContent.looking_forward_to}`);
      // Handle text field
      if (journalContent.text) parts.push(journalContent.text);
      textContent = parts.join("\n\n");
    }

    // Validate and sanitize final content
    const contentValidation = validateString(textContent, {
      minLength: MIN_TEXT_LENGTH,
      maxLength: MAX_TEXT_SIZE,
      fieldName: 'Journal entry'
    });
    
    if (!contentValidation.valid) {
      return validationErrorResponse(contentValidation.error, corsHeaders);
    }
    
    const sanitizedContent = contentValidation.value;

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userMessage = `
Analyze this journal entry:

ENTRY TYPE: ${entryType}
${mood ? `MOOD: ${mood}` : ""}

CONTENT:
${sanitizedContent}

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
