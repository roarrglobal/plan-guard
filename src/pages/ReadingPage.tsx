import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, Share2, Sparkles, Moon, Sun, Stars, Hash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SnagLogo } from "@/components/SnagLogo";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

const READING_META: Record<string, { title: string; emoji: string; icon: typeof Moon; color: string; gradient: string }> = {
  vedic: { title: "Vedic Birth Chart", emoji: "🕉️", icon: Moon, color: "text-indigo-500", gradient: "from-indigo-500/10 via-purple-500/5 to-background" },
  western: { title: "Western Birth Chart", emoji: "♈", icon: Sun, color: "text-amber-500", gradient: "from-amber-500/10 via-orange-500/5 to-background" },
  chinese: { title: "Chinese Astrology Profile", emoji: "🐉", icon: Stars, color: "text-red-500", gradient: "from-red-500/10 via-rose-500/5 to-background" },
  numerology: { title: "Numerology Life Map", emoji: "🔢", icon: Hash, color: "text-emerald-500", gradient: "from-emerald-500/10 via-teal-500/5 to-background" },
};

export default function ReadingPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // If id is "new", we're generating a new reading
  const readingType = searchParams.get("type") || "";
  const isNew = id === "new";

  useEffect(() => {
    if (!user) return;
    if (isNew && readingType) {
      generateReading();
    } else if (id && id !== "new") {
      fetchReading(id);
    }
  }, [user, id, readingType]);

  const fetchReading = async (readingId: string) => {
    const { data, error } = await supabase
      .from("mystical_readings")
      .select("*")
      .eq("id", readingId)
      .single();

    if (error || !data) {
      toast({ title: "Reading not found", variant: "destructive" });
      navigate("/dashboard");
      return;
    }
    setReading(data);
    setIsLoading(false);
  };

  const generateReading = async () => {
    setIsGenerating(true);
    setIsLoading(true);

    try {
      // Create mock purchase
      const { data: purchase } = await supabase
        .from("mystical_purchases")
        .insert({
          user_id: user!.id,
          product_type: readingType,
          amount_cents: readingType === "vedic" ? 2900 : readingType === "numerology" ? 900 : 1900,
          status: "completed", // Mock: instant completion
        })
        .select()
        .single();

      const { data, error } = await supabase.functions.invoke("generate-reading", {
        body: { reading_type: readingType, purchase_id: purchase?.id },
      });

      if (error) throw error;
      if (data?.reading_id) {
        // Fetch the stored reading
        await fetchReading(data.reading_id);
      } else if (data?.reading) {
        setReading({ reading_type: readingType, reading_data: data.reading, created_at: new Date().toISOString() });
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toast({ title: "Failed to generate reading", description: err.message || "Please try again.", variant: "destructive" });
      navigate("/dashboard");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {isGenerating ? "Consulting the cosmos..." : "Loading your reading..."}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isGenerating
                ? `Your ${READING_META[readingType]?.title || "cosmic"} reading is being crafted with ancient wisdom and modern AI.`
                : "One moment please..."}
            </p>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  if (!reading) return null;

  const type = reading.reading_type || readingType;
  const meta = READING_META[type] || READING_META.western;
  const readingData = (reading.reading_data as any)?.reading || reading.reading_data;
  const calculations = (reading.reading_data as any)?.calculations;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <SnagLogo size="sm" />
          <div className="flex gap-2">
            <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><Share2 className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-[700px] mx-auto w-full space-y-6 pb-12">
        {/* Hero Card */}
        <Card className={cn("overflow-hidden border-0 shadow-lg")}>
          <CardContent className={cn("p-8 bg-gradient-to-br text-center", meta.gradient)}>
            <span className="text-5xl mb-4 block">{meta.emoji}</span>
            <h1 className="text-2xl font-bold text-foreground mb-2">Your {meta.title}</h1>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(reading.created_at).toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>
          </CardContent>
        </Card>

        {/* Render reading based on type */}
        {type === "vedic" && <VedicReading data={readingData} calculations={calculations?.vedic} />}
        {type === "western" && <WesternReading data={readingData} calculations={calculations?.western} />}
        {type === "chinese" && <ChineseReading data={readingData} calculations={calculations?.chinese} />}
        {type === "numerology" && <NumerologyReading data={readingData} calculations={calculations?.numerology} />}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button className="flex-1 gap-2" onClick={() => navigate("/analyze")}>
            <Sparkles className="w-4 h-4" />
            Apply to My Decisions
          </Button>
        </div>
      </main>
    </div>
  );
}

// ── Vedic Reading Display ──────────────────────────────────────
function VedicReading({ data, calculations }: { data: any; calculations?: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      {/* Core Info */}
      <ReadingSection title="🌙 Birth Chart Essentials">
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label="Lagna (Ascendant)" value={data.lagna?.sign || "—"} sub={data.lagna?.description} />
          <InfoCard label="Moon Sign (Rashi)" value={data.moon_sign?.rashi || calculations?.rashi || "—"} sub={data.moon_sign?.description} />
          <InfoCard label="Nakshatra" value={data.moon_sign?.nakshatra || calculations?.nakshatra || "—"} sub={`Lord: ${data.moon_sign?.lord || calculations?.lord || "—"}`} />
          <InfoCard label="Pada" value={data.moon_sign?.pada ? `Pada ${data.moon_sign.pada}` : "—"} />
        </div>
      </ReadingSection>

      {/* Current Dasha */}
      {data.current_dasha && (
        <ReadingSection title="📅 Current Planetary Period">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="font-semibold text-foreground">
                {data.current_dasha.mahadasha} Mahadasha • {data.current_dasha.antardasha} Antardasha
              </p>
              <p className="text-xs text-muted-foreground mt-1">{data.current_dasha.period}</p>
              <p className="text-sm text-foreground mt-2">{data.current_dasha.description}</p>
            </CardContent>
          </Card>
        </ReadingSection>
      )}

      {/* Favorable/Unfavorable */}
      {data.favorable_periods?.length > 0 && (
        <ReadingSection title="✅ Favorable Periods">
          {data.favorable_periods.map((p: any, i: number) => (
            <PeriodCard key={i} period={p.period} description={p.description} items={p.suitable_for} variant="positive" />
          ))}
        </ReadingSection>
      )}
      {data.unfavorable_periods?.length > 0 && (
        <ReadingSection title="⚠️ Periods of Caution">
          {data.unfavorable_periods.map((p: any, i: number) => (
            <PeriodCard key={i} period={p.period} description={p.description} items={p.avoid} variant="negative" />
          ))}
        </ReadingSection>
      )}

      {/* Decision Guidance */}
      {data.decision_guidance && <DecisionGuidance data={data.decision_guidance} />}

      {/* Doshas */}
      {data.doshas?.length > 0 && (
        <ReadingSection title="🔮 Doshas">
          {data.doshas.filter((d: any) => d.present).map((d: any, i: number) => (
            <Card key={i} className="border-amber-500/20 bg-amber-500/5 mb-2">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground text-sm">{d.name}</span>
                  <Badge variant="outline" className="text-[10px]">{d.severity}</Badge>
                </div>
                {d.remedies?.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                    {d.remedies.map((r: string, j: number) => <li key={j}>• {r}</li>)}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </ReadingSection>
      )}
    </div>
  );
}

// ── Western Reading Display ────────────────────────────────────
function WesternReading({ data, calculations }: { data: any; calculations?: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      <ReadingSection title="☀️ The Big Three">
        <div className="grid grid-cols-3 gap-3">
          <InfoCard label="Sun Sign" value={data.sun_sign?.sign || calculations?.sign || "—"} sub={data.sun_sign?.symbol} />
          <InfoCard label="Moon Sign" value={data.moon_sign?.sign || "—"} />
          <InfoCard label="Rising Sign" value={data.rising_sign?.sign || "—"} />
        </div>
        {data.sun_sign?.description && (
          <p className="text-sm text-muted-foreground mt-3">{data.sun_sign.description}</p>
        )}
      </ReadingSection>

      {data.elemental_balance && (
        <ReadingSection title="🔥 Elemental Balance">
          <div className="grid grid-cols-4 gap-2">
            {["fire", "earth", "air", "water"].map((el) => (
              <div key={el} className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-foreground">{data.elemental_balance[el] || 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{el}</p>
              </div>
            ))}
          </div>
          {data.elemental_balance.interpretation && (
            <p className="text-sm text-muted-foreground mt-2">{data.elemental_balance.interpretation}</p>
          )}
        </ReadingSection>
      )}

      {data.planetary_positions?.length > 0 && (
        <ReadingSection title="🪐 Planetary Positions">
          <div className="space-y-2">
            {data.planetary_positions.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-foreground">{p.planet}</span>
                  <span className="text-xs text-muted-foreground ml-2">in {p.sign}</span>
                </div>
                {p.house && <Badge variant="outline" className="text-[10px]">House {p.house}</Badge>}
              </div>
            ))}
          </div>
        </ReadingSection>
      )}

      {data.current_transits?.length > 0 && (
        <ReadingSection title="🔄 Current Transits">
          {data.current_transits.map((t: any, i: number) => (
            <Card key={i} className="mb-2 border-border/50">
              <CardContent className="p-3">
                <p className="text-sm font-medium text-foreground">{t.transit}</p>
                <p className="text-xs text-muted-foreground">{t.effect}</p>
                {t.duration && <Badge variant="outline" className="text-[10px] mt-1">{t.duration}</Badge>}
              </CardContent>
            </Card>
          ))}
        </ReadingSection>
      )}

      {data.mercury_retrograde && (
        <ReadingSection title="☿ Mercury Retrograde">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-3">
              <p className="text-sm font-medium text-foreground">Next: {data.mercury_retrograde.next_date}</p>
              <p className="text-xs text-muted-foreground mt-1">{data.mercury_retrograde.advice}</p>
            </CardContent>
          </Card>
        </ReadingSection>
      )}

      {data.decision_guidance && <DecisionGuidance data={data.decision_guidance} />}
    </div>
  );
}

// ── Chinese Reading Display ────────────────────────────────────
function ChineseReading({ data, calculations }: { data: any; calculations?: any }) {
  if (!data) return null;
  const pillars = ["year_pillar", "month_pillar", "day_pillar", "hour_pillar"].filter(p => data[p]);
  return (
    <div className="space-y-4">
      <ReadingSection title="🏯 Four Pillars of Destiny">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pillars.map((key) => (
            <InfoCard
              key={key}
              label={key.replace("_pillar", "").replace(/^\w/, c => c.toUpperCase())}
              value={data[key].animal}
              sub={`${data[key].element}`}
            />
          ))}
        </div>
      </ReadingSection>

      {data.five_elements && (
        <ReadingSection title="🌿 Five Elements">
          <div className="grid grid-cols-5 gap-2 mb-2">
            {["wood", "fire", "earth", "metal", "water"].map((el) => (
              <div key={el} className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-foreground">{data.five_elements[el] || 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{el}</p>
              </div>
            ))}
          </div>
          {data.five_elements.interpretation && (
            <p className="text-sm text-muted-foreground">{data.five_elements.interpretation}</p>
          )}
        </ReadingSection>
      )}

      {data.compatibility && (
        <ReadingSection title="🤝 Compatibility">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-500/5 rounded-lg">
              <p className="text-xs font-medium text-emerald-600 mb-1">Best Allies</p>
              <p className="text-sm text-foreground">{data.compatibility.best_allies?.join(", ")}</p>
            </div>
            <div className="p-3 bg-red-500/5 rounded-lg">
              <p className="text-xs font-medium text-red-600 mb-1">Conflicts</p>
              <p className="text-sm text-foreground">{data.compatibility.conflicts?.join(", ")}</p>
            </div>
          </div>
        </ReadingSection>
      )}

      {data.favorable && (
        <ReadingSection title="🍀 Favorable Attributes">
          <div className="grid grid-cols-2 gap-3">
            {data.favorable.directions?.length > 0 && <InfoCard label="Directions" value={data.favorable.directions.join(", ")} />}
            {data.favorable.colors?.length > 0 && <InfoCard label="Colors" value={data.favorable.colors.join(", ")} />}
            {data.favorable.numbers?.length > 0 && <InfoCard label="Numbers" value={data.favorable.numbers.join(", ")} />}
            {data.favorable.seasons?.length > 0 && <InfoCard label="Seasons" value={data.favorable.seasons.join(", ")} />}
          </div>
        </ReadingSection>
      )}

      {data.decision_guidance && <DecisionGuidance data={data.decision_guidance} />}
    </div>
  );
}

// ── Numerology Reading Display ─────────────────────────────────
function NumerologyReading({ data, calculations }: { data: any; calculations?: any }) {
  if (!data) return null;
  const coreNumbers = [
    { key: "life_path", emoji: "🛤️" },
    { key: "expression", emoji: "🗣️" },
    { key: "soul_urge", emoji: "💗" },
    { key: "personality", emoji: "🎭" },
  ].filter(n => data[n.key]);

  return (
    <div className="space-y-4">
      <ReadingSection title="🔢 Core Numbers">
        <div className="grid grid-cols-2 gap-3">
          {coreNumbers.map(({ key, emoji }) => (
            <Card key={key} className="border-border/50">
              <CardContent className="p-4 text-center">
                <span className="text-2xl">{emoji}</span>
                <p className="text-3xl font-bold text-foreground mt-1">{data[key].number}</p>
                <p className="text-xs font-medium text-primary uppercase tracking-wider">{data[key].title || key.replace("_", " ")}</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{data[key].description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ReadingSection>

      {data.personal_year && (
        <ReadingSection title={`📅 Personal Year ${data.personal_year.year}`}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-primary">{data.personal_year.number}</span>
                <div>
                  <p className="font-semibold text-foreground">{data.personal_year.theme}</p>
                  <p className="text-xs text-muted-foreground">Year {data.personal_year.year}</p>
                </div>
              </div>
              <p className="text-sm text-foreground">{data.personal_year.description}</p>
              {data.personal_year.opportunities?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-emerald-600 mb-1">Opportunities:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {data.personal_year.opportunities.map((o: string, i: number) => <li key={i}>✓ {o}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </ReadingSection>
      )}

      {data.pinnacle_numbers?.length > 0 && (
        <ReadingSection title="🏔️ Pinnacle Numbers">
          {data.pinnacle_numbers.map((p: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg mb-2">
              <span className="text-xl font-bold text-primary w-8 text-center">{p.number}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{p.period}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
            </div>
          ))}
        </ReadingSection>
      )}

      {data.decision_guidance && <DecisionGuidance data={data.decision_guidance} />}
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────

function ReadingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-3 bg-muted/40 rounded-lg">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function PeriodCard({ period, description, items, variant }: { period: string; description: string; items?: string[]; variant: "positive" | "negative" }) {
  const isPositive = variant === "positive";
  return (
    <Card className={cn("mb-2", isPositive ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5")}>
      <CardContent className="p-3">
        <p className="text-sm font-medium text-foreground">{period}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {items?.length ? (
          <ul className="text-xs mt-1 space-y-0.5">
            {items.map((item, i) => (
              <li key={i} className={isPositive ? "text-emerald-600" : "text-amber-600"}>
                {isPositive ? "✓" : "✗"} {item}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DecisionGuidance({ data }: { data: any }) {
  return (
    <ReadingSection title="🎯 Decision Guidance">
      <Card className="border-primary/20">
        <CardContent className="p-4 space-y-3">
          {data.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-emerald-600 mb-1">Strengths</p>
              <ul className="text-sm text-foreground space-y-0.5">
                {data.strengths.map((s: string, i: number) => <li key={i}>✓ {s}</li>)}
              </ul>
            </div>
          )}
          {(data.cautions || data.challenges)?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-600 mb-1">Cautions</p>
              <ul className="text-sm text-foreground space-y-0.5">
                {(data.cautions || data.challenges).map((c: string, i: number) => <li key={i}>⚠ {c}</li>)}
              </ul>
            </div>
          )}
          {(data.best_timing || data.favorable_timing || data.timing_advice) && (
            <div>
              <p className="text-xs font-medium text-primary mb-1">Timing</p>
              <p className="text-sm text-foreground">{data.best_timing || data.favorable_timing || data.timing_advice}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </ReadingSection>
  );
}
