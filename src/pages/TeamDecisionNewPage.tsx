import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save, Zap } from "lucide-react";
import type { Team } from "@/hooks/useTeams";

const CATEGORIES = [
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "product", label: "Product" },
  { value: "hr", label: "HR" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
  { value: "strategy", label: "Strategy" },
  { value: "other", label: "Other" },
];

const STAKES = [
  { value: "low", label: "Low", desc: "Easily reversible, minor impact" },
  { value: "medium", label: "Medium", desc: "Some effort to reverse, moderate impact" },
  { value: "high", label: "High", desc: "Difficult to reverse, significant impact" },
  { value: "critical", label: "Critical", desc: "Irreversible, existential impact" },
];

const REVERSIBILITY = [
  { value: "easy", label: "Easy", desc: "Can be reversed quickly with little cost" },
  { value: "difficult", label: "Difficult", desc: "Reversible but with significant effort" },
  { value: "irreversible", label: "Irreversible", desc: "Cannot be undone once committed" },
];

const TIMELINES = [
  { value: "urgent", label: "Urgent (< 48h)" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "extended", label: "Extended (3+ months)" },
];

const VISIBILITY = [
  { value: "private", label: "Private", desc: "Only you can see this" },
  { value: "team", label: "Team", desc: "All team members can see" },
  { value: "leadership", label: "Leadership", desc: "Only admins and owners" },
];

const ANALYSIS_TYPES = [
  { value: "quick", label: "Quick Snag", desc: "~30 seconds", icon: "⚡" },
  { value: "standard", label: "Standard Snag", desc: "~2 minutes", icon: "🔍" },
  { value: "deep", label: "Deep Snag", desc: "~5 minutes", icon: "🧠" },
];

export default function TeamDecisionNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { team } = useOutletContext<{ team: Team }>();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("strategy");
  const [stakes, setStakes] = useState("medium");
  const [reversibility, setReversibility] = useState("difficult");
  const [timeline, setTimeline] = useState("this_week");
  const [deadline, setDeadline] = useState("");
  const [inputContext, setInputContext] = useState("");
  const [visibility, setVisibility] = useState("team");
  const [analysisType, setAnalysisType] = useState("standard");

  const canProceedStep1 = title.trim().length >= 5;
  const canProceedStep2 = true; // all optional

  const handleSaveDraft = async () => {
    if (!user || !team || !title.trim()) return;
    setIsSaving(true);

    const { data, error } = await supabase
      .from("team_decisions")
      .insert({
        team_id: team.id,
        created_by: user.id,
        decision_text: title.trim(),
        description: description.trim() || null,
        category,
        stakes,
        reversibility,
        timeline,
        deadline: deadline || null,
        input_context: inputContext.trim() || null,
        visibility,
        status: "open",
      } as any)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Decision saved as draft");
      // Log activity
      await supabase.from("team_activity").insert({
        team_id: team.id,
        user_id: user.id,
        action_type: "decision_created",
        entity_type: "decision",
        entity_id: (data as any).id,
        metadata: { title: title.trim() },
      });
      navigate(`/team/${team.slug}/decisions/${(data as any).id}`);
    }
    setIsSaving(false);
  };

  const handleRunAnalysis = async () => {
    if (!user || !team || !title.trim()) return;
    setIsSaving(true);

    // Create decision first
    const { data, error } = await supabase
      .from("team_decisions")
      .insert({
        team_id: team.id,
        created_by: user.id,
        decision_text: title.trim(),
        description: description.trim() || null,
        category,
        stakes,
        reversibility,
        timeline,
        deadline: deadline || null,
        input_context: inputContext.trim() || null,
        visibility,
        status: "open",
      } as any)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    // Log activity
    await supabase.from("team_activity").insert({
      team_id: team.id,
      user_id: user.id,
      action_type: "decision_created",
      entity_type: "decision",
      entity_id: (data as any).id,
      metadata: { title: title.trim() },
    });

    // Navigate to detail page which will trigger analysis
    navigate(`/team/${team.slug}/decisions/${(data as any).id}?analyze=${analysisType}`);
    setIsSaving(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/team/${team.slug}/decisions`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Decisions
      </button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">New Decision</h1>
        <p className="text-sm text-muted-foreground mt-1">Capture and analyze a team decision</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => s < step && setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                  ? "bg-primary/20 text-primary cursor-pointer"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </button>
            {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-primary/40" : "bg-muted"}`} />}
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          {step === 1 ? "Basic Info" : step === 2 ? "Context" : "Visibility & Analysis"}
        </span>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Decision Title <span className="text-primary">*</span></Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Should we expand to APAC market?"
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's the decision about? Provide context..."
                rows={4}
                className="bg-input resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Stakes</Label>
              <div className="grid grid-cols-2 gap-2">
                {STAKES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStakes(s.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      stakes === s.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Context */}
      {step === 2 && (
        <Card>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Reversibility</Label>
              <div className="space-y-2">
                {REVERSIBILITY.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setReversibility(r.value)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      reversibility === r.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Timeline</Label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger className="bg-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMELINES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Deadline (optional)</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Additional Context (optional)</Label>
              <Textarea
                value={inputContext}
                onChange={(e) => setInputContext(e.target.value)}
                placeholder="Any additional context, data, or constraints..."
                rows={3}
                className="bg-input resize-none"
              />
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

      {/* Step 3: Visibility & Analysis */}
      {step === 3 && (
        <Card>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Visibility</Label>
              <div className="space-y-2">
                {VISIBILITY.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setVisibility(v.value)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      visibility === v.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{v.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Analysis Type</Label>
              <div className="space-y-2">
                {ANALYSIS_TYPES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAnalysisType(a.value)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      analysisType === a.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{a.icon}</span>
                      <p className="text-sm font-medium text-foreground">{a.label}</p>
                      <span className="text-xs text-muted-foreground ml-auto">{a.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={handleRunAnalysis} disabled={isSaving || !canProceedStep1} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                {isSaving ? "Creating..." : "Create & Run Analysis"}
              </Button>
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || !canProceedStep1} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="ghost" onClick={() => setStep(2)} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
