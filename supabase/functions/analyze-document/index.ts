import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  validateString, 
  validateBase64,
  validateMimeType,
  sanitizeForPrompt, 
  validationErrorResponse,
  MAX_TEXT_SIZE,
  MAX_BASE64_SIZE,
  MIN_TEXT_LENGTH
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert pre-mortem analyst. The user has uploaded a document for decision analysis.

Your job is to:
1. First, identify what type of document this is (job offer, contract, proposal, investment document, etc.)
2. Infer what decision the user is likely facing based on the document
3. Provide a comprehensive pre-mortem analysis

Return your response as valid JSON with this exact structure:
{
  "documentType": "string describing the type of document",
  "inferredDecision": "string describing what decision the user is likely facing",
  "category": "career|business|investment|personal|travel|other",
  "blindSpots": [
    {"title": "Short title", "description": "Detailed explanation of this blind spot"}
  ],
  "failureModes": [
    {"title": "Short title", "description": "How this could fail", "likelihood": "high|medium|low", "impact": "high|medium|low"}
  ],
  "warningSignals": [
    {"signal": "What to watch for", "timeframe": "When to watch for it"}
  ],
  "killCriteria": [
    "Clear condition that should make them walk away"
  ],
  "unaskedQuestion": "The most important question they haven't considered"
}

RULES:
- Provide 2-4 blind spots
- Provide 3-5 failure modes
- Provide 2-4 warning signals
- Provide 2-3 kill criteria
- Be specific to the document content
- category must be exactly one of: career, business, investment, personal, travel, other
- Return ONLY valid JSON, no markdown formatting`;

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

    // Validate the JWT by passing the token explicitly
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log("Invalid token:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log("Authenticated user:", userId);

    const body = await req.json();
    const { extractedText, userContext, sourceType, imageBase64, mimeType } = body;

    // SECURITY: Validate all inputs with size limits
    let validatedText: string | null = null;
    let validatedContext: string | null = null;
    let validatedImage: string | null = null;
    let validatedMimeType: string | null = null;
    
    // Validate extracted text if provided
    if (extractedText) {
      const textValidation = validateString(extractedText, {
        maxLength: MAX_TEXT_SIZE,
        fieldName: 'Document text'
      });
      if (!textValidation.valid) {
        return validationErrorResponse(textValidation.error, corsHeaders);
      }
      // Check if it's meaningful content
      if (textValidation.value.length > MIN_TEXT_LENGTH && 
          !textValidation.value.includes("Full text extraction for PDF/DOCX files requires additional processing")) {
        validatedText = textValidation.value;
      }
    }
    
    // Validate user context if provided
    if (userContext) {
      const contextValidation = validateString(userContext, {
        maxLength: MAX_TEXT_SIZE,
        fieldName: 'Context'
      });
      if (!contextValidation.valid) {
        return validationErrorResponse(contextValidation.error, corsHeaders);
      }
      validatedContext = contextValidation.value;
    }
    
    // Validate base64 image if provided
    if (imageBase64) {
      const imageValidation = validateBase64(imageBase64, {
        maxSize: MAX_BASE64_SIZE,
        fieldName: 'Image'
      });
      if (!imageValidation.valid) {
        return validationErrorResponse(imageValidation.error, corsHeaders);
      }
      validatedImage = imageValidation.value;
      
      // Validate MIME type when image is present
      if (!mimeType) {
        return validationErrorResponse('MIME type is required for image uploads', corsHeaders);
      }
      const mimeValidation = validateMimeType(mimeType);
      if (!mimeValidation.valid) {
        return validationErrorResponse(mimeValidation.error, corsHeaders);
      }
      validatedMimeType = mimeValidation.value;
    }
    
    // Check if we have meaningful content to analyze
    if (!validatedText && !validatedImage) {
      // If we only have context but no actual document content, use context as the analysis input
      if (validatedContext && validatedContext.length > 20) {
        // Continue with context as the main content
      } else {
        return validationErrorResponse(
          "Could not extract text from this document. Please provide more context about what the document contains, or try uploading a plain text file or image instead.",
          corsHeaders
        );
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

    let messages: any[];

    if (validatedImage && validatedMimeType) {
      // Image analysis with vision
      messages = [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${validatedMimeType};base64,${validatedImage}`
              }
            },
            {
              type: "text",
              text: `${systemPrompt}

The user uploaded this image for decision analysis. 
${validatedContext ? `User's context: "${sanitizeForPrompt(validatedContext)}"` : "No additional context provided."}

First, describe what you see in the image and what decision it might relate to. Then provide the pre-mortem analysis in the JSON format specified above.`
            }
          ]
        }
      ];
    } else {
      // Text-based document analysis
      // Use the best available content
      const contentToAnalyze = validatedText || validatedContext || '';
      
      const userMessage = `Here is the document content for analysis:

---
${sanitizeForPrompt(contentToAnalyze)}
---

${validatedContext && contentToAnalyze !== validatedContext ? `Additional context from user: "${sanitizeForPrompt(validatedContext)}"` : ""}

Analyze this content and provide the pre-mortem analysis.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 2000,
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
          JSON.stringify({ error: "Usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let analysis;
    try {
      // Clean up potential markdown formatting
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      
      // If the AI returned a plain text message instead of JSON, create a fallback response
      // This happens when the document content wasn't properly extracted
      if (content.includes("cannot be analyzed") || content.includes("need the actual content") || content.includes("provide the text")) {
        return new Response(
          JSON.stringify({ 
            error: "Could not extract text from this document. Please try uploading a plain text file, an image, or provide additional context about the document."
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // For other parse failures, return a more helpful error
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis results. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!analysis.blindSpots || !analysis.failureModes) {
      return new Response(
        JSON.stringify({ error: "Incomplete analysis received" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize category
    const validCategories = ["career", "business", "investment", "personal", "travel", "other"];
    if (!validCategories.includes(analysis.category?.toLowerCase())) {
      analysis.category = "other";
    } else {
      analysis.category = analysis.category.toLowerCase();
    }

    return new Response(
      JSON.stringify({
        analysis,
        sourceType,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Document analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
