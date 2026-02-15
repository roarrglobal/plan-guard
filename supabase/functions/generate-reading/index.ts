import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Deterministic calculations ──────────────────────────────────────────

function getWesternZodiac(month: number, day: number) {
  const signs = [
    { sign: "Capricorn", symbol: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn", start: [1, 1], end: [1, 19] },
    { sign: "Aquarius", symbol: "♒", element: "Air", modality: "Fixed", ruler: "Uranus", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", symbol: "♓", element: "Water", modality: "Mutable", ruler: "Neptune", start: [2, 19], end: [3, 20] },
    { sign: "Aries", symbol: "♈", element: "Fire", modality: "Cardinal", ruler: "Mars", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", symbol: "♉", element: "Earth", modality: "Fixed", ruler: "Venus", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", symbol: "♊", element: "Air", modality: "Mutable", ruler: "Mercury", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", symbol: "♋", element: "Water", modality: "Cardinal", ruler: "Moon", start: [6, 21], end: [7, 22] },
    { sign: "Leo", symbol: "♌", element: "Fire", modality: "Fixed", ruler: "Sun", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", symbol: "♍", element: "Earth", modality: "Mutable", ruler: "Mercury", start: [8, 23], end: [9, 22] },
    { sign: "Libra", symbol: "♎", element: "Air", modality: "Cardinal", ruler: "Venus", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", symbol: "♏", element: "Water", modality: "Fixed", ruler: "Pluto", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", symbol: "♐", element: "Fire", modality: "Mutable", ruler: "Jupiter", start: [11, 22], end: [12, 21] },
    { sign: "Capricorn", symbol: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn", start: [12, 22], end: [12, 31] },
  ];
  for (const s of signs) {
    const [sm, sd] = s.start;
    const [em, ed] = s.end;
    if ((month === sm && day >= sd) || (month === em && day <= ed)) return s;
  }
  return signs[0];
}

function getChineseZodiac(year: number) {
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const elements = ["Metal", "Metal", "Water", "Water", "Wood", "Wood", "Fire", "Fire", "Earth", "Earth"];
  const idx = (year - 4) % 12;
  const elemIdx = (year - 4) % 10;
  return { animal: animals[idx], element: elements[elemIdx], yinYang: year % 2 === 0 ? "Yang" : "Yin" };
}

function getVedicMoonSign(month: number, day: number) {
  const nakshatras = [
    { rashi: "Mesha (Aries)", nakshatra: "Ashwini", lord: "Ketu" },
    { rashi: "Vrishabha (Taurus)", nakshatra: "Rohini", lord: "Moon" },
    { rashi: "Mithuna (Gemini)", nakshatra: "Mrigashira", lord: "Mars" },
    { rashi: "Karka (Cancer)", nakshatra: "Pushya", lord: "Saturn" },
    { rashi: "Simha (Leo)", nakshatra: "Magha", lord: "Ketu" },
    { rashi: "Kanya (Virgo)", nakshatra: "Hasta", lord: "Moon" },
    { rashi: "Tula (Libra)", nakshatra: "Chitra", lord: "Mars" },
    { rashi: "Vrishchika (Scorpio)", nakshatra: "Anuradha", lord: "Saturn" },
    { rashi: "Dhanu (Sagittarius)", nakshatra: "Moola", lord: "Ketu" },
    { rashi: "Makara (Capricorn)", nakshatra: "Shravana", lord: "Moon" },
    { rashi: "Kumbha (Aquarius)", nakshatra: "Shatabhisha", lord: "Rahu" },
    { rashi: "Meena (Pisces)", nakshatra: "Revati", lord: "Mercury" },
  ];
  const idx = ((month - 1 + (day > 15 ? 1 : 0)) % 12);
  return nakshatras[idx];
}

function getLifePathNumber(dob: string): number {
  const digits = dob.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function getExpressionNumber(name: string): number {
  const map: Record<string, number> = { a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8 };
  let sum = name.toLowerCase().replace(/[^a-z]/g, "").split("").reduce((a, c) => a + (map[c] || 0), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function getSoulUrgeNumber(name: string): number {
  const vowels = "aeiou";
  const map: Record<string, number> = { a:1,e:5,i:9,o:6,u:3 };
  let sum = name.toLowerCase().replace(/[^a-z]/g, "").split("").filter(c => vowels.includes(c)).reduce((a, c) => a + (map[c] || 0), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function getPersonalYear(dob: string, currentYear: number): number {
  const [_, m, d] = dob.split("-").map(Number);
  let sum = m + d + currentYear;
  while (sum > 9) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

// ── Prompt builders ──────────────────────────────────────────────

function buildVedicPrompt(dob: string, birthTime: string | null, birthPlace: string | null, vedic: any) {
  return `Generate a detailed Vedic astrology (Jyotish) reading for a person born on ${dob}${birthTime ? ` at ${birthTime}` : ""}${birthPlace ? ` in ${birthPlace}` : ""}.

Calculated data:
- Moon Sign (Rashi): ${vedic.rashi}
- Nakshatra: ${vedic.nakshatra}
- Nakshatra Lord: ${vedic.lord}

Return ONLY valid JSON with this structure:
{
  "lagna": { "sign": "string", "description": "string" },
  "moon_sign": { "rashi": "string", "nakshatra": "string", "pada": number, "lord": "string", "description": "string" },
  "current_dasha": { "mahadasha": "string", "antardasha": "string", "period": "string", "description": "string" },
  "favorable_periods": [{ "period": "string", "description": "string", "suitable_for": ["string"] }],
  "unfavorable_periods": [{ "period": "string", "description": "string", "avoid": ["string"] }],
  "doshas": [{ "name": "string", "present": boolean, "severity": "string", "remedies": ["string"] }],
  "decision_guidance": { "strengths": ["string"], "cautions": ["string"], "best_timing": "string" },
  "remedies": [{ "type": "string", "description": "string" }],
  "personality_traits": ["string"],
  "career_inclinations": ["string"]
}`;
}

function buildWesternPrompt(dob: string, birthTime: string | null, birthPlace: string | null, western: any) {
  return `Generate a detailed Western astrology birth chart reading for a person born on ${dob}${birthTime ? ` at ${birthTime}` : ""}${birthPlace ? ` in ${birthPlace}` : ""}.

Calculated data:
- Sun Sign: ${western.sign} (${western.symbol})
- Element: ${western.element}
- Modality: ${western.modality}
- Ruling Planet: ${western.ruler}

Return ONLY valid JSON:
{
  "sun_sign": { "sign": "string", "symbol": "string", "description": "string" },
  "moon_sign": { "sign": "string", "description": "string" },
  "rising_sign": { "sign": "string", "description": "string" },
  "planetary_positions": [{ "planet": "string", "sign": "string", "house": number, "description": "string" }],
  "major_aspects": [{ "aspect": "string", "planets": "string", "description": "string", "influence": "string" }],
  "current_transits": [{ "transit": "string", "effect": "string", "duration": "string" }],
  "mercury_retrograde": { "next_date": "string", "advice": "string" },
  "decision_guidance": { "strengths": ["string"], "challenges": ["string"], "favorable_timing": "string" },
  "personality_profile": { "core_traits": ["string"], "shadow_traits": ["string"], "growth_areas": ["string"] },
  "elemental_balance": { "fire": number, "earth": number, "air": number, "water": number, "interpretation": "string" }
}`;
}

function buildChinesePrompt(dob: string, birthTime: string | null, chinese: any) {
  return `Generate a detailed Chinese astrology BaZi / Four Pillars reading for a person born on ${dob}${birthTime ? ` at ${birthTime}` : ""}.

Calculated data:
- Year Animal: ${chinese.animal}
- Element: ${chinese.element}
- Yin/Yang: ${chinese.yinYang}

Return ONLY valid JSON:
{
  "year_pillar": { "animal": "string", "element": "string", "description": "string" },
  "month_pillar": { "animal": "string", "element": "string", "description": "string" },
  "day_pillar": { "animal": "string", "element": "string", "description": "string" },
  "hour_pillar": ${birthTime ? '{ "animal": "string", "element": "string", "description": "string" }' : "null"},
  "five_elements": { "wood": number, "fire": number, "earth": number, "metal": number, "water": number, "dominant": "string", "lacking": "string", "interpretation": "string" },
  "compatibility": { "best_allies": ["string"], "secret_friend": "string", "conflicts": ["string"] },
  "favorable": { "directions": ["string"], "colors": ["string"], "numbers": [0], "seasons": ["string"] },
  "decision_guidance": { "strengths": ["string"], "timing_advice": "string", "element_balance": "string" },
  "personality_traits": ["string"],
  "career_affinity": ["string"],
  "luck_cycles": [{ "period": "string", "element": "string", "description": "string" }]
}`;
}

function buildNumerologyPrompt(dob: string, displayName: string, lifePathNumber: number, expressionNumber: number, soulUrgeNumber: number, personalYear: number) {
  return `Generate a detailed numerology reading for a person named "${displayName}" born on ${dob}.

Calculated data:
- Life Path Number: ${lifePathNumber}
- Expression Number: ${expressionNumber}
- Soul Urge Number: ${soulUrgeNumber}
- Personal Year Number (${new Date().getFullYear()}): ${personalYear}

Return ONLY valid JSON:
{
  "life_path": { "number": ${lifePathNumber}, "title": "string", "description": "string", "strengths": ["string"], "challenges": ["string"] },
  "expression": { "number": ${expressionNumber}, "title": "string", "description": "string" },
  "soul_urge": { "number": ${soulUrgeNumber}, "title": "string", "description": "string" },
  "personality": { "number": 0, "title": "string", "description": "string" },
  "personal_year": { "number": ${personalYear}, "year": ${new Date().getFullYear()}, "theme": "string", "description": "string", "opportunities": ["string"], "challenges": ["string"] },
  "pinnacle_numbers": [{ "period": "string", "number": 0, "description": "string" }],
  "challenge_numbers": [{ "period": "string", "number": 0, "description": "string" }],
  "decision_guidance": { "favorable_numbers": [0], "timing_advice": "string", "year_focus": "string" },
  "compatibility_numbers": [0],
  "career_numbers": [0]
}`;
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { reading_type, purchase_id } = body;

    if (!reading_type || !["vedic", "western", "chinese", "numerology"].includes(reading_type)) {
      return new Response(JSON.stringify({ error: "Invalid reading_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile.date_of_birth) {
      return new Response(JSON.stringify({ error: "Date of birth is required for readings" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dob = profile.date_of_birth;
    const [year, month, day] = dob.split("-").map(Number);
    const birthTime = profile.birth_time || null;
    const birthPlace = profile.birth_place || null;
    const displayName = profile.display_name || "User";

    // Build calculations & prompt
    let userPrompt: string;
    const calculations: Record<string, any> = {};

    if (reading_type === "vedic") {
      const vedic = getVedicMoonSign(month, day);
      calculations.vedic = vedic;
      userPrompt = buildVedicPrompt(dob, birthTime, birthPlace, vedic);
    } else if (reading_type === "western") {
      const western = getWesternZodiac(month, day);
      calculations.western = western;
      userPrompt = buildWesternPrompt(dob, birthTime, birthPlace, western);
    } else if (reading_type === "chinese") {
      const chinese = getChineseZodiac(year);
      calculations.chinese = chinese;
      userPrompt = buildChinesePrompt(dob, birthTime, chinese);
    } else {
      const lifePathNumber = getLifePathNumber(dob);
      const expressionNumber = getExpressionNumber(displayName);
      const soulUrgeNumber = getSoulUrgeNumber(displayName);
      const personalYear = getPersonalYear(dob, new Date().getFullYear());
      calculations.numerology = { lifePathNumber, expressionNumber, soulUrgeNumber, personalYear };
      userPrompt = buildNumerologyPrompt(dob, displayName, lifePathNumber, expressionNumber, soulUrgeNumber, personalYear);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating ${reading_type} reading for user ${user.id}`);
    const startTime = Date.now();

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a master astrologer and numerologist with deep knowledge of Vedic, Western, and Chinese astrology systems as well as Pythagorean numerology. Generate insightful, personalized readings. Return ONLY valid JSON, no markdown, no backticks.",
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Service busy. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to generate reading." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;
    const processingTime = Date.now() - startTime;

    if (!content) {
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let readingData;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      readingData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse reading" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Merge calculations with AI reading
    const fullReading = {
      calculations,
      reading: readingData,
      generated_at: new Date().toISOString(),
      processing_time_ms: processingTime,
    };

    // Store reading
    const { data: stored, error: storeError } = await supabase
      .from("mystical_readings")
      .insert({
        user_id: user.id,
        reading_type,
        reading_data: fullReading,
      })
      .select()
      .single();

    if (storeError) {
      console.error("Failed to store reading:", storeError);
    }

    // If purchase_id provided, update purchase status
    if (purchase_id) {
      await supabase
        .from("mystical_purchases")
        .update({ status: "completed" })
        .eq("id", purchase_id)
        .eq("user_id", user.id);
    }

    console.log(`Reading generated in ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        reading: fullReading,
        reading_id: stored?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate reading error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
