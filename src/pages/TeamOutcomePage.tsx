import { useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Star } from "lucide-react";
import type { Team } from "@/hooks/useTeams";

const RESULTS = [
  { value: "right_call", label: "Right Call", emoji: "✅", color: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)]/30" },
  { value: "mostly_right", label: "Mostly Right", emoji: "👍", color: "bg-[hsl(160,84%,39%)]/5 text-[hsl(160,60%,45%)] border-[hsl(160,60%,45%)]/30" },
  { value: "mixed", label: "Mixed", emoji: "⚖️", color: "bg-warning/10 text-warning border-warning/30" },
  { value: "mostly_wrong", label: "Mostly Wrong", emoji: "👎", color: "bg-destructive/10 text-destructive border-destructive/30" },
  { value: "wrong_call", label: "Wrong Call", emoji: "❌", color: "bg-destructive/10 text-destructive border-destructive/30" },
  { value: "too_early", label: "Too Early", emoji: "⏳", color: "bg-muted text-muted-foreground border-border" },
];

export default function TeamOutcomePage() {
  const { decisionId } = useParams<{ decisionId: string }>();
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [result, setResult] = useState("");
  const [satisfaction, setSatisfaction] = useState([5]);
  const [whatHappened, setWhatHappened] = useState("");
  const [predictionsHit, setPredictionsHit] = useState<Record<string, string>>({});
  const [missedPredictions, setMissedPredictions] = useState("");
  const [lesson, setLesson] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: decision } = useQuery({
    queryKey: ["team-decision", decisionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_decisions")
        .select("*")
        .eq("id", decisionId!)
        .maybeSingle();
      return data as any;
    },
    enabled: !!decisionId,
  });

  // Get latest analysis for prediction accuracy check
  const { data: latestAnalysis } = useQuery({
    queryKey: ["team-decision-latest-analysis", decisionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_analyses")
        .select("*")
        .eq("decision_id", decisionId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any;
    },
    enabled: !!decisionId,
  });

  const analysisOutput = latestAnalysis?.output_json as any;
  const blindSpots = analysisOutput?.blind_spots || [];
  const failureModes = analysisOutput?.failure_modes || [];

  const handleSave = async () => {
    if (!user || !team || !decisionId) return;
    setIsSaving(true);

    const { error } = await supabase.from("team_outcomes").insert({
      decision_id: decisionId,
      team_id: team.id,
      user_id: user.id,
      analysis_id: latestAnalysis?.id || null,
      result,
      satisfaction: satisfaction[0],
      what_happened: whatHappened.trim() || null,
      predictions_hit: predictionsHit,
      predictions_missed: { missed: missedPredictions.trim() || null },
      lesson: lesson.trim() || null,
    } as any);

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    // Update decision status
    await supabase.from("team_decisions").update({
      status: "completed",
      outcome_notes: whatHappened.trim() || null,
    }).eq("id", decisionId);

    // Log activity
    await supabase.from("team_activity").insert({
      team_id: team.id,
      user_id: user.id,
      action_type: "outcome_logged",
      entity_type: "decision",
      entity_id: decisionId,
      metadata: { title: decision?.decision_text, result },
    });

    toast.success("Outcome logged! 🎉");
    queryClient.invalidateQueries({ queryKey: ["team-decision", decisionId] });
    navigate(`/team/${team.slug}/decisions/${decisionId}`);
    setIsSaving(false);
  };

  if (!decision) return null;

  const totalSteps = analysisOutput ? 5 : 4;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/team/${team.slug}/decisions/${decisionId}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Decision
      </button>

      <div>
        <h1 className="text-xl font-bold text-foreground">Log Outcome</h1>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{decision.decision_text}</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Result */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How did this decision turn out?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RESULTS.map((r) => (
              <button
                key={r.value}
                onClick={() => setResult(r.value)}
                className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center gap-3 ${
                  result === r.value ? r.color : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="text-sm font-medium text-foreground">{r.label}</span>
              </button>
            ))}
            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)} disabled={!result}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Satisfaction */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How satisfied are you with the outcome?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="px-4">
              <Slider
                value={satisfaction}
                onValueChange={setSatisfaction}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">Not at all</span>
                <span className="text-lg font-bold text-primary">{satisfaction[0]}</span>
                <span className="text-xs text-muted-foreground">Very satisfied</span>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: What Happened */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Briefly describe what happened</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <textarea
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value.slice(0, 500))}
                placeholder="What was the outcome? What changed?"
                rows={4}
                className="w-full resize-none text-sm border rounded-lg p-3 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-[10px] text-muted-foreground text-right mt-1">{whatHappened.length}/500</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(analysisOutput ? 4 : totalSteps)}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Prediction Accuracy (only if analysis exists) */}
      {step === 4 && analysisOutput && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prediction Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {blindSpots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blind Spots</p>
                {blindSpots.map((bs: any, i: number) => {
                  const key = `bs_${i}`;
                  const text = typeof bs === "string" ? bs : bs.spot;
                  return (
                    <div key={key} className="p-2 border rounded-lg space-y-1">
                      <p className="text-sm text-foreground">{text}</p>
                      <div className="flex gap-2">
                        {["Yes", "Partially", "No"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setPredictionsHit((p) => ({ ...p, [key]: opt }))}
                            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                              predictionsHit[key] === opt
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {failureModes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Failure Modes</p>
                {failureModes.slice(0, 3).map((fm: any, i: number) => {
                  const key = `fm_${i}`;
                  return (
                    <div key={key} className="p-2 border rounded-lg space-y-1">
                      <p className="text-sm text-foreground">{fm.what}</p>
                      <div className="flex gap-2">
                        {["Yes", "Partially", "No"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setPredictionsHit((p) => ({ ...p, [key]: opt }))}
                            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                              predictionsHit[key] === opt
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Anything we missed?</p>
              <textarea
                value={missedPredictions}
                onChange={(e) => setMissedPredictions(e.target.value.slice(0, 300))}
                placeholder="Were there risks or outcomes that weren't predicted?"
                rows={2}
                className="w-full resize-none text-sm border rounded-lg p-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(5)}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5 (or 4 if no analysis): Lesson */}
      {step === totalSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What's the key lesson?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <textarea
                value={lesson}
                onChange={(e) => setLesson(e.target.value.slice(0, 200))}
                placeholder="What would you do differently? What would you repeat?"
                rows={3}
                className="w-full resize-none text-sm border rounded-lg p-3 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-[10px] text-muted-foreground text-right mt-1">{lesson.length}/200</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(analysisOutput ? 4 : 3)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Save Outcome
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
