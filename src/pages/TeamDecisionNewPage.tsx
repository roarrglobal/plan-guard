import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save, Zap, FileText, X } from "lucide-react";
import { DepartmentBadge } from "@/components/templates/DepartmentBadge";
import { TemplateSelectorModal } from "@/components/templates/TemplateSelectorModal";
import { useDecisionTemplates, type DecisionTemplate } from "@/hooks/useDecisionTemplates";
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
  const [searchParams] = useSearchParams();
  const { data: templates = [] } = useDecisionTemplates(team?.id);

  const [step, setStep] = useState(0); // Start at step 0 (template selection)
  const [isSaving, setIsSaving] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

  // Selected template
  const [selectedTemplate, setSelectedTemplate] = useState<DecisionTemplate | null>(null);
  const [templateFieldValues, setTemplateFieldValues] = useState<Record<string, any>>({});

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

  // Auto-select template from URL param
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && templates.length > 0) {
      const t = templates.find(t => t.id === templateId);
      if (t) {
        handleSelectTemplate(t);
        setStep(1);
      }
    }
  }, [searchParams, templates]);

  const handleSelectTemplate = (template: DecisionTemplate) => {
    setSelectedTemplate(template);
    setCategory(template.department);
    setTemplateFieldValues({});
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setTemplateFieldValues({});
  };

  const canProceedStep1 = title.trim().length >= 5;

  const buildInputContext = () => {
    let context = inputContext.trim();
    if (selectedTemplate && Object.keys(templateFieldValues).length > 0) {
      const templateContext = selectedTemplate.input_fields
        .map((f: any) => {
          const val = templateFieldValues[f.name];
          if (val !== undefined && val !== "" && val !== null) {
            return `${f.label}: ${val}`;
          }
          return null;
        })
        .filter(Boolean)
        .join("\n");
      context = templateContext + (context ? "\n\n" + context : "");
    }
    return context || null;
  };

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
        input_context: buildInputContext(),
        visibility,
        status: "open",
        template_id: selectedTemplate?.id || null,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Decision saved as draft");
      // Increment template usage count
      if (selectedTemplate?.id) {
        supabase.rpc("increment_template_usage", { p_template_id: selectedTemplate.id } as any).then(() => {});
      }
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
        input_context: buildInputContext(),
        visibility,
        status: "open",
        template_id: selectedTemplate?.id || null,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    await supabase.from("team_activity").insert({
      team_id: team.id,
      user_id: user.id,
      action_type: "decision_created",
      entity_type: "decision",
      entity_id: (data as any).id,
      metadata: { title: title.trim() },
    });

    // Increment template usage count
    if (selectedTemplate?.id) {
      supabase.rpc("increment_template_usage", { p_template_id: selectedTemplate.id } as any).then(() => {});
    }

    navigate(`/team/${team.slug}/decisions/${(data as any).id}?analyze=${analysisType}`);
    setIsSaving(false);
  };

  const totalSteps = selectedTemplate ? 4 : 3;
  const stepLabels = selectedTemplate
    ? ["Template", "Basic Info", "Context", "Visibility & Analysis"]
    : ["Start", "Basic Info", "Context & Analysis"];

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
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-primary/20 text-primary cursor-pointer"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
            {i < totalSteps - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-primary/40" : "bg-muted"}`} />}
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          {stepLabels[step]}
        </span>
      </div>

      {/* Step 0: Choose how to start */}
      {step === 0 && (
        <Card>
          <CardContent className="p-5 space-y-5">
            <Label className="text-sm font-medium">Choose how to start</Label>

            {selectedTemplate ? (
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{selectedTemplate.name}</span>
                    <DepartmentBadge department={selectedTemplate.department} size="sm" />
                  </div>
                  <Button size="sm" variant="ghost" onClick={handleClearTemplate} className="h-7 w-7 p-0">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-left transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">Start from scratch</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Create a custom decision analysis</p>
                </button>
                <button
                  onClick={() => setTemplateSelectorOpen(true)}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">Use a template</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Start with department-specific blind spots and failure modes
                  </p>
                </button>
              </div>
            )}

            {selectedTemplate && (
              <div className="flex justify-end">
                <Button onClick={() => setStep(1)}>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

            {/* Template-specific input fields */}
            {selectedTemplate && selectedTemplate.input_fields?.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-border">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Template Fields
                </Label>
                {selectedTemplate.input_fields.map((field: any) => (
                  <div key={field.name} className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      {field.label}
                      {field.required && <span className="text-primary ml-1">*</span>}
                    </Label>
                    {field.type === "text" && (
                      <Input
                        value={templateFieldValues[field.name] || ""}
                        onChange={e => setTemplateFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className="bg-input"
                      />
                    )}
                    {field.type === "number" && (
                      <Input
                        type="number"
                        value={templateFieldValues[field.name] || ""}
                        onChange={e => setTemplateFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className="bg-input"
                      />
                    )}
                    {field.type === "date" && (
                      <Input
                        type="date"
                        value={templateFieldValues[field.name] || ""}
                        onChange={e => setTemplateFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className="bg-input"
                      />
                    )}
                    {field.type === "select" && (
                      <Select
                        value={templateFieldValues[field.name] || ""}
                        onValueChange={v => setTemplateFieldValues(prev => ({ ...prev, [field.name]: v }))}
                      >
                        <SelectTrigger className="bg-input"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map((o: string) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === "slider" && (
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[templateFieldValues[field.name] || field.min || 0]}
                          onValueChange={([v]) => setTemplateFieldValues(prev => ({ ...prev, [field.name]: v }))}
                          min={field.min || 0}
                          max={field.max || 100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-foreground w-8 text-right">
                          {templateFieldValues[field.name] || field.min || 0}
                        </span>
                      </div>
                    )}
                    {field.type === "boolean" && (
                      <Select
                        value={templateFieldValues[field.name]?.toString() || ""}
                        onValueChange={v => setTemplateFieldValues(prev => ({ ...prev, [field.name]: v === "true" }))}
                      >
                        <SelectTrigger className="bg-input"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
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

            {selectedTemplate && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-medium">Using template: {selectedTemplate.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {selectedTemplate.blind_spot_library?.length || 0} blind spots and {selectedTemplate.failure_mode_library?.length || 0} failure modes will be included in the analysis
                </p>
              </div>
            )}

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

      <TemplateSelectorModal
        open={templateSelectorOpen}
        onOpenChange={setTemplateSelectorOpen}
        templates={templates}
        onSelect={(t) => {
          handleSelectTemplate(t);
          setStep(0);
        }}
      />
    </div>
  );
}
