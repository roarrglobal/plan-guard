import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Zap, Loader2, AlertTriangle, CheckCircle2, ArrowRight, X, Lightbulb, Target, Shield } from "lucide-react";

interface QuickSnagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  teamSlug?: string;
}

interface QuickAnalysis {
  blind_spots: string[];
  top_failure_mode: string;
  recommendation: string;
  actions: string[];
  suggested_stakes: string;
}

const STAKES_KEYWORDS: Record<string, string[]> = {
  critical: ["acquisition", "merger", "layoff", "shutdown", "pivot", "fundraise", "IPO", "millions"],
  high: ["hire", "fire", "budget", "restructure", "partnership", "contract", "launch", "pricing"],
  medium: ["vendor", "tool", "process", "timeline", "feature", "campaign", "strategy"],
  low: ["meeting", "format", "schedule", "template", "naming"],
};

function detectStakes(text: string): string {
  const lower = text.toLowerCase();
  for (const [level, keywords] of Object.entries(STAKES_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) return level;
  }
  return "medium";
}

export function QuickSnagModal({ open, onOpenChange, teamId, teamSlug }: QuickSnagModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [stakes, setStakes] = useState("medium");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<QuickAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setInput("");
      setAnalysis(null);
      setStakes("medium");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-detect stakes on input change
  useEffect(() => {
    if (input.length > 10 && !analysis) {
      setStakes(detectStakes(input));
    }
  }, [input, analysis]);

  const handleAnalyze = async () => {
    if (!input.trim() || !user || !teamId) return;
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("quick-analyze", {
        body: { decision_text: input.trim(), team_id: teamId },
      });

      if (error) throw new Error(error.message);
      if (data?.analysis) {
        setAnalysis(data.analysis);
        if (data.analysis.suggested_stakes) {
          setStakes(data.analysis.suggested_stakes);
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !teamId || !input.trim()) return;
    setIsSaving(true);

    const { data, error } = await supabase
      .from("team_decisions")
      .insert({
        team_id: teamId,
        created_by: user.id,
        decision_text: input.trim(),
        stakes,
        category: "general",
        status: "decided",
        visibility: "team",
        description: analysis ? `Quick Snag: ${analysis.recommendation}` : null,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else {
      // Log activity
      await supabase.from("team_activity").insert({
        team_id: teamId,
        user_id: user.id,
        action_type: "decision_created",
        entity_type: "decision",
        entity_id: (data as any).id,
        metadata: { title: input.trim().slice(0, 50), quick_snag: true },
      });
      toast.success("Quick Snag saved");
      queryClient.invalidateQueries({ queryKey: ["team-decisions"] });
      onOpenChange(false);
    }
    setIsSaving(false);
  };

  const handleExpandToDeep = async () => {
    if (!user || !teamId || !teamSlug || !input.trim()) return;
    setIsSaving(true);

    const { data, error } = await supabase
      .from("team_decisions")
      .insert({
        team_id: teamId,
        created_by: user.id,
        decision_text: input.trim(),
        stakes,
        category: "general",
        status: "draft",
        visibility: "team",
      } as any)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else {
      await supabase.from("team_activity").insert({
        team_id: teamId,
        user_id: user.id,
        action_type: "decision_created",
        entity_type: "decision",
        entity_id: (data as any).id,
        metadata: { title: input.trim().slice(0, 50) },
      });
      onOpenChange(false);
      navigate(`/team/${teamSlug}/decisions/${(data as any).id}?analyze=deep`);
    }
    setIsSaving(false);
  };

  const stakesColor: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-primary/10 text-primary",
    high: "bg-destructive/10 text-destructive",
    critical: "bg-destructive text-destructive-foreground",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-0">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Quick Snag</h2>
              <p className="text-xs text-muted-foreground">Rapid decision analysis in seconds</p>
            </div>
          </div>

          {/* Input */}
          {!analysis && (
            <>
              <div className="space-y-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 500))}
                  placeholder="What decision are you facing?"
                  rows={3}
                  className="w-full resize-none text-sm border rounded-lg p-3 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Stakes:</span>
                    <Badge variant="outline" className={`text-[10px] ${stakesColor[stakes] || ""}`}>
                      {stakes}
                    </Badge>
                    <div className="flex gap-1">
                      {["low", "medium", "high", "critical"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStakes(s)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            stakes === s ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                          } ${s === "low" ? "bg-muted-foreground" : s === "medium" ? "bg-primary" : s === "high" ? "bg-destructive/70" : "bg-destructive"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{input.length}/500</span>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={input.trim().length < 5 || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" /> Analyze (⌘↵)
                  </>
                )}
              </Button>
            </>
          )}

          {/* Results */}
          {analysis && (
            <div className="space-y-4">
              {/* Blind Spots */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">Blind Spots</h3>
                </div>
                <ul className="space-y-1.5">
                  {analysis.blind_spots.map((spot, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-warning shrink-0">•</span>
                      {spot}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Failure Mode */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-destructive" />
                  <h3 className="text-sm font-semibold text-foreground">Top Risk</h3>
                </div>
                <p className="text-sm text-muted-foreground bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                  {analysis.top_failure_mode}
                </p>
              </div>

              {/* Recommendation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Recommendation</h3>
                </div>
                <p className="text-sm text-foreground font-medium bg-primary/5 p-3 rounded-lg border border-primary/10">
                  {analysis.recommendation}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Immediate Actions</h3>
                </div>
                <ol className="space-y-1.5">
                  {analysis.actions.map((action, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                      {action}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Button
                  onClick={handleExpandToDeep}
                  variant="default"
                  className="w-full"
                  disabled={isSaving}
                >
                  <ArrowRight className="w-4 h-4 mr-2" /> Expand to Deep Snag
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className="flex-1"
                    disabled={isSaving}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Save & Close
                  </Button>
                  <Button
                    onClick={() => onOpenChange(false)}
                    variant="ghost"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" /> Discard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
