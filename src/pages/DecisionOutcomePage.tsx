import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";

interface Decision {
  id: string;
  decision_text: string;
  created_at: string;
  deep_snag_id: string | null;
  category: string | null;
}

interface AnalysisResult {
  failure_modes?: Array<{ what_fails: string }>;
}

const PROCEEDED_OPTIONS = [
  { value: "yes", label: "Yes, as planned", icon: CheckCircle, color: "text-emerald-600", bgActive: "bg-emerald-50 border-emerald-300" },
  { value: "yes_modified", label: "Yes, but modified", icon: AlertTriangle, color: "text-amber-600", bgActive: "bg-amber-50 border-amber-300" },
  { value: "no", label: "No, I didn't proceed", icon: XCircle, color: "text-red-600", bgActive: "bg-red-50 border-red-300" },
];

const RESULT_OPTIONS = [
  { value: "better", label: "Better than expected", emoji: "🎉" },
  { value: "expected", label: "As expected", emoji: "✓" },
  { value: "worse", label: "Worse than expected", emoji: "😔" },
  { value: "early", label: "Too early to tell", emoji: "⏳" },
];

export default function DecisionOutcomePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [decision, setDecision] = useState<Decision | null>(null);
  const [failureModes, setFailureModes] = useState<Array<{ what_fails: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [proceeded, setProceeded] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [risksMaterialized, setRisksMaterialized] = useState<string[]>([]);
  const [lesson, setLesson] = useState("");

  useEffect(() => {
    if (user && id) {
      fetchDecision();
    }
  }, [user, id]);

  const fetchDecision = async () => {
    const { data, error } = await supabase
      .from("decisions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({ title: "Decision not found", variant: "destructive" });
      navigate("/decisions");
      return;
    }

    setDecision(data);

    // If there's a linked Deep Snag, get failure modes
    if (data.deep_snag_id) {
      const { data: analysis } = await supabase
        .from("analyses")
        .select("result")
        .eq("id", data.deep_snag_id)
        .single();

      if (analysis?.result) {
        const result = analysis.result as AnalysisResult;
        setFailureModes(result.failure_modes || []);
      }
    }

    setLoading(false);
  };

  const handleRiskToggle = (risk: string) => {
    setRisksMaterialized(prev =>
      prev.includes(risk)
        ? prev.filter(r => r !== risk)
        : [...prev, risk]
    );
  };

  const handleSave = async () => {
    if (!proceeded || !result || !decision) return;

    setSaving(true);
    
    const { error } = await supabase
      .from("decisions")
      .update({
        outcome_proceeded: proceeded,
        outcome_result: result,
        risks_materialized: risksMaterialized,
        outcome_lesson: lesson,
        outcome_logged_at: new Date().toISOString(),
        outcome_status: result === "worse" ? "failure" : result === "better" ? "success" : "partial",
        status: "completed",
      })
      .eq("id", decision.id);

    if (error) {
      toast({ title: "Failed to save outcome", variant: "destructive" });
      setSaving(false);
      return;
    }

    toast({ title: "Outcome logged", description: "Your decision outcome has been recorded." });
    navigate(`/decisions/${decision.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!decision) return null;

  const daysSince = differenceInDays(new Date(), new Date(decision.created_at));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Log Outcome</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Decision Summary */}
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Decision from {daysSince} days ago
          </p>
          <p className="text-sm">{decision.decision_text}</p>
        </div>

        {/* Step 1: Did you proceed? */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Did you proceed with this decision?</h2>
          <div className="space-y-2">
            {PROCEEDED_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = proceeded === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setProceeded(option.value)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                    isSelected ? option.bgActive : "border-border hover:border-primary/30"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${option.color}`} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: How did it turn out? */}
        {proceeded && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">How did it turn out?</h2>
            <div className="grid grid-cols-2 gap-3">
              {RESULT_OPTIONS.map((option) => {
                const isSelected = result === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setResult(option.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-xs font-medium text-center">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Risks materialized */}
        {result && failureModes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Did any of these risks materialize?</h2>
            <div className="space-y-2">
              {failureModes.map((mode, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={risksMaterialized.includes(mode.what_fails)}
                    onCheckedChange={() => handleRiskToggle(mode.what_fails)}
                  />
                  <span className="text-sm">{mode.what_fails}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Lesson learned */}
        {result && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">One lesson learned (optional)</h2>
            <Textarea
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="What did you learn from this experience?"
              rows={3}
            />
          </div>
        )}

        {/* Save button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={!proceeded || !result || saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Outcome"
          )}
        </Button>
      </main>
    </div>
  );
}
