import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Target,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FeatureUpgradeModal } from "@/components/subscription/FeatureUpgradeModal";
import type { Json } from "@/integrations/supabase/types";

type PostMortemType = "decision" | "project" | "event" | "failure" | "success" | "other";
type OutcomeStatus = "success" | "partial" | "failure" | "mixed" | "pivot";
type Step = "context" | "outcome" | "expectations" | "analysis" | "deep_dive" | "ai_results";

const TYPE_OPTIONS = [
  { id: "decision" as PostMortemType, label: "Decision Outcome", description: "A choice you made" },
  { id: "project" as PostMortemType, label: "Project/Initiative", description: "A completed effort" },
  { id: "event" as PostMortemType, label: "Event", description: "Something that happened" },
  { id: "failure" as PostMortemType, label: "Failure", description: "Something that didn't work" },
  { id: "success" as PostMortemType, label: "Success", description: "Something that went well" },
  { id: "other" as PostMortemType, label: "Other", description: "Something else" },
];

const OUTCOME_OPTIONS = [
  { id: "success" as OutcomeStatus, icon: CheckCircle, label: "Success", color: "text-green-600 bg-green-50 border-green-200", description: "Achieved intended outcome" },
  { id: "partial" as OutcomeStatus, icon: AlertTriangle, label: "Partial", color: "text-yellow-600 bg-yellow-50 border-yellow-200", description: "Some goals met, some missed" },
  { id: "failure" as OutcomeStatus, icon: XCircle, label: "Failure", color: "text-red-600 bg-red-50 border-red-200", description: "Did not achieve intended outcome" },
  { id: "mixed" as OutcomeStatus, icon: RefreshCw, label: "Mixed", color: "text-blue-600 bg-blue-50 border-blue-200", description: "Good and bad elements" },
  { id: "pivot" as OutcomeStatus, icon: Target, label: "Pivot", color: "text-purple-600 bg-purple-50 border-purple-200", description: "Changed direction entirely" },
];

const STEPS: { id: Step; label: string; number: number }[] = [
  { id: "context", label: "Context", number: 1 },
  { id: "outcome", label: "Outcome", number: 2 },
  { id: "expectations", label: "Expectations", number: 3 },
  { id: "analysis", label: "Your Analysis", number: 4 },
  { id: "deep_dive", label: "Deep Dive", number: 5 },
  { id: "ai_results", label: "AI Insights", number: 6 },
];

export default function PostMortemNewPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { access, isLoading: accessLoading } = useFeatureAccess("post_mortem");
  
  const [step, setStep] = useState<Step>("context");
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Form data
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [postMortemType, setPostMortemType] = useState<PostMortemType | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus | null>(null);
  const [outcomeRating, setOutcomeRating] = useState([5]);
  
  const [expectations, setExpectations] = useState({
    what_expected: "",
    what_actually_happened: "",
    biggest_surprise: "",
  });
  
  const [userInputs, setUserInputs] = useState({
    went_well_1: "",
    went_well_2: "",
    went_well_3: "",
    went_wrong_1: "",
    went_wrong_2: "",
    went_wrong_3: "",
    do_differently: "",
    surprised_by: "",
    carry_forward: "",
  });
  
  const [deepDive, setDeepDive] = useState({
    root_cause_guess: "",
    what_you_avoided_admitting: "",
    external_vs_internal: 50, // 0 = all external, 100 = all internal
    luck_vs_skill: 50, // 0 = all luck, 100 = all skill
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, unknown> | null>(null);

  // Check feature access
  useEffect(() => {
    if (!accessLoading && access && !access.allowed) {
      setShowUpgradeModal(true);
    }
  }, [access, accessLoading]);

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  const canProceed = () => {
    switch (step) {
      case "context":
        return description.length >= 20 && postMortemType;
      case "outcome":
        return outcomeStatus !== null;
      case "expectations":
        return expectations.what_expected.length > 0;
      case "analysis":
        return userInputs.went_well_1.length > 0 || userInputs.went_wrong_1.length > 0;
      case "deep_dive":
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const nextStep = STEPS[currentStepIndex + 1];
    if (nextStep) {
      if (nextStep.id === "ai_results") {
        handleGenerateAnalysis();
      } else {
        setStep(nextStep.id);
      }
    }
  };

  const handleBack = () => {
    const prevStep = STEPS[currentStepIndex - 1];
    if (prevStep) {
      setStep(prevStep.id);
    }
  };

  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    setStep("ai_results");
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-post-mortem", {
        body: {
          description,
          outcomeStatus,
          outcomeRating: outcomeRating[0],
          postMortemType,
          userInputs: {
            ...userInputs,
            ...expectations,
            ...deepDive,
          },
        },
      });

      if (error) throw error;
      
      setAiAnalysis(data);
      
      // Increment lifetime usage for free tier
      if (profile?.subscription_tier === "free" || !profile?.subscription_tier) {
        await supabase.rpc("increment_lifetime_usage", { 
          p_user_id: user?.id, 
          p_feature: "post_mortem" 
        });
      } else {
        await supabase.rpc("increment_post_mortem_usage", { p_user_id: user?.id });
      }
    } catch (err) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
      setStep("deep_dive");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !postMortemType || !outcomeStatus) return;

    setIsSaving(true);
    
    const { error } = await supabase
      .from("post_mortems")
      .insert([{
        user_id: user.id,
        title: title || null,
        description,
        post_mortem_type: postMortemType,
        outcome_status: outcomeStatus,
        outcome_rating: outcomeRating[0],
        user_inputs: { ...userInputs, ...expectations, ...deepDive } as unknown as Json,
        ai_analysis: aiAnalysis as Json | null,
      }]);

    if (error) {
      toast({
        title: "Error saving post-mortem",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post-mortem saved",
        description: "Your reflection has been recorded.",
      });
      navigate("/post-mortem");
    }

    setIsSaving(false);
  };

  // Redirect if locked
  if (!accessLoading && access && !access.allowed) {
    return (
      <FeatureUpgradeModal
        open={showUpgradeModal}
        onOpenChange={(open) => {
          setShowUpgradeModal(open);
          if (!open) navigate("/post-mortem");
        }}
        feature="post_mortem"
        reason={access.reason === "trial_used" ? "trial_used" : "pro_feature"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/post-mortem")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">New Post-Mortem</h1>
            <p className="text-sm text-muted-foreground">Learn from what happened</p>
          </div>
          {access?.is_trial && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              Trial: {access.remaining} left
            </span>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  step === s.id
                    ? "bg-primary text-primary-foreground"
                    : idx < currentStepIndex
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                  {idx < currentStepIndex ? "✓" : s.number}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step: Context */}
        {step === "context" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2">
              <Label className="text-base font-semibold">What are you analyzing?</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the event, project, or decision outcome in detail. What happened? When did it happen? Who was involved?"
                className="min-h-[140px]"
              />
              <p className="text-xs text-muted-foreground">{description.length}/20 minimum characters</p>
            </div>

            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this post-mortem a memorable name..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">What type is this?</Label>
              <div className="grid grid-cols-2 gap-3">
                {TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostMortemType(type.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      postMortemType === type.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    )}
                  >
                    <span className="font-medium text-sm">{type.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleNext} 
              disabled={!canProceed()}
              className="w-full"
              size="lg"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step: Outcome */}
        {step === "outcome" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-3">
              <Label className="text-base font-semibold">How did it go overall?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OUTCOME_OPTIONS.map((outcome) => {
                  const Icon = outcome.icon;
                  return (
                    <button
                      key={outcome.id}
                      type="button"
                      onClick={() => setOutcomeStatus(outcome.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all flex items-start gap-3",
                        outcomeStatus === outcome.id
                          ? `${outcome.color} ring-2 ring-offset-2`
                          : "border-border hover:border-primary/30 bg-card"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 mt-0.5", outcome.color.split(" ")[0])} />
                      <div>
                        <p className="font-medium text-sm">{outcome.label}</p>
                        <p className="text-xs text-muted-foreground">{outcome.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Satisfaction Score</Label>
                <span className="text-2xl font-bold text-primary">{outcomeRating[0]}/10</span>
              </div>
              <Slider
                value={outcomeRating}
                onValueChange={setOutcomeRating}
                min={1}
                max={10}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Dissatisfied</span>
                <span>Very Satisfied</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Expectations vs Reality */}
        {step === "expectations" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Expectations vs Reality</h2>
              <p className="text-sm text-muted-foreground">Where did predictions meet reality?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">What did you expect to happen?</Label>
                <Textarea
                  value={expectations.what_expected}
                  onChange={(e) => setExpectations(prev => ({ ...prev, what_expected: e.target.value }))}
                  placeholder="Before this began, what outcome did you envision?"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">What actually happened?</Label>
                <Textarea
                  value={expectations.what_actually_happened}
                  onChange={(e) => setExpectations(prev => ({ ...prev, what_actually_happened: e.target.value }))}
                  placeholder="Describe the actual result in detail..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">What surprised you most?</Label>
                <Textarea
                  value={expectations.biggest_surprise}
                  onChange={(e) => setExpectations(prev => ({ ...prev, biggest_surprise: e.target.value }))}
                  placeholder="The thing you least expected..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Analysis */}
        {step === "analysis" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 p-4 bg-green-50/50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <Label className="font-semibold text-green-800">What Went Well</Label>
                </div>
                {[1, 2, 3].map((num) => (
                  <Input
                    key={num}
                    value={userInputs[`went_well_${num}` as keyof typeof userInputs]}
                    onChange={(e) => setUserInputs(prev => ({
                      ...prev,
                      [`went_well_${num}`]: e.target.value
                    }))}
                    placeholder={`${num}. Something that worked...`}
                    className="bg-white"
                  />
                ))}
              </div>

              <div className="space-y-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <Label className="font-semibold text-red-800">What Didn't Work</Label>
                </div>
                {[1, 2, 3].map((num) => (
                  <Input
                    key={num}
                    value={userInputs[`went_wrong_${num}` as keyof typeof userInputs]}
                    onChange={(e) => setUserInputs(prev => ({
                      ...prev,
                      [`went_wrong_${num}`]: e.target.value
                    }))}
                    placeholder={`${num}. Something that failed...`}
                    className="bg-white"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">What would you do differently?</Label>
              <Textarea
                value={userInputs.do_differently}
                onChange={(e) => setUserInputs(prev => ({ ...prev, do_differently: e.target.value }))}
                placeholder="If you could go back in time..."
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">What will you carry forward?</Label>
              <Textarea
                value={userInputs.carry_forward}
                onChange={(e) => setUserInputs(prev => ({ ...prev, carry_forward: e.target.value }))}
                placeholder="Key takeaways for the future..."
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Deep Dive */}
        {step === "deep_dive" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold">The Uncomfortable Truth</h2>
              <p className="text-sm text-muted-foreground">Dig deeper for real insights</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">What do you think was the root cause?</Label>
                <Textarea
                  value={deepDive.root_cause_guess}
                  onChange={(e) => setDeepDive(prev => ({ ...prev, root_cause_guess: e.target.value }))}
                  placeholder="Beyond the surface, what really drove this outcome?"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">What are you avoiding admitting?</Label>
                <Textarea
                  value={deepDive.what_you_avoided_admitting}
                  onChange={(e) => setDeepDive(prev => ({ ...prev, what_you_avoided_admitting: e.target.value }))}
                  placeholder="The thing you don't want to say out loud..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground italic">This stays private. Be honest with yourself.</p>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
                <Label className="font-medium">External factors vs Your actions</Label>
                <Slider
                  value={[deepDive.external_vs_internal]}
                  onValueChange={([v]) => setDeepDive(prev => ({ ...prev, external_vs_internal: v }))}
                  min={0}
                  max={100}
                  step={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mostly external factors</span>
                  <span>Mostly my actions</span>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
                <Label className="font-medium">Luck vs Skill</Label>
                <Slider
                  value={[deepDive.luck_vs_skill]}
                  onValueChange={([v]) => setDeepDive(prev => ({ ...prev, luck_vs_skill: v }))}
                  min={0}
                  max={100}
                  step={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mostly luck</span>
                  <span>Mostly skill</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 gap-2">
                <Sparkles className="w-4 h-4" />
                Generate AI Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Step: AI Results */}
        {step === "ai_results" && (
          <div className="space-y-6 animate-in fade-in">
            {isAnalyzing ? (
              <div className="text-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analyzing your reflection...</h3>
                <p className="text-sm text-muted-foreground">Extracting insights and patterns</p>
              </div>
            ) : aiAnalysis ? (
              <>
                {/* Summary */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Summary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {(aiAnalysis.outcome_assessment as any)?.summary || "Analysis complete"}
                  </p>
                </div>

                {/* Root Cause */}
                {(aiAnalysis.root_cause_analysis as any)?.primary_root_cause && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="font-semibold text-amber-800 mb-2">🎯 Primary Root Cause</h3>
                    <p className="text-sm text-amber-900">
                      {(aiAnalysis.root_cause_analysis as any).primary_root_cause}
                    </p>
                  </div>
                )}

                {/* Success & Failure Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(aiAnalysis.success_factors as any[])?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-green-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Success Factors
                      </h3>
                      {(aiAnalysis.success_factors as any[]).map((item, idx) => (
                        <div key={idx} className="bg-green-50 border border-green-100 rounded-lg p-3">
                          <p className="font-medium text-sm text-green-800">{item.factor}</p>
                          <p className="text-xs text-green-600 mt-1">{item.why_it_worked}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(aiAnalysis.failure_factors as any[])?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-red-700 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Failure Factors
                      </h3>
                      {(aiAnalysis.failure_factors as any[]).map((item, idx) => (
                        <div key={idx} className="bg-red-50 border border-red-100 rounded-lg p-3">
                          <p className="font-medium text-sm text-red-800">{item.factor}</p>
                          <p className="text-xs text-red-600 mt-1">{item.why_it_failed}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lessons */}
                {(aiAnalysis.lessons_extracted as any[])?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Key Lessons
                    </h3>
                    <div className="space-y-2">
                      {(aiAnalysis.lessons_extracted as any[]).map((lesson, idx) => (
                        <div key={idx} className="bg-card border rounded-lg p-4">
                          <p className="font-medium text-sm">{lesson.lesson}</p>
                          <p className="text-xs text-muted-foreground mt-1">→ {lesson.application}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* The Uncomfortable Truth */}
                {(aiAnalysis.uncomfortable_truth as any)?.truth && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4">
                    <h3 className="font-semibold text-amber-800 mb-2">💡 The Uncomfortable Truth</h3>
                    <p className="text-sm text-amber-900 italic">
                      "{(aiAnalysis.uncomfortable_truth as any).truth}"
                    </p>
                    {(aiAnalysis.uncomfortable_truth as any).what_changes && (
                      <p className="text-xs text-amber-700 mt-2">
                        What changes if you accept this: {(aiAnalysis.uncomfortable_truth as any).what_changes}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Items */}
                {(aiAnalysis.action_items as any) && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-green-800 mb-2">Start Doing</h4>
                      <ul className="text-xs text-green-700 space-y-1">
                        {(aiAnalysis.action_items as any).start_doing?.map((item: string, idx: number) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-red-800 mb-2">Stop Doing</h4>
                      <ul className="text-xs text-red-700 space-y-1">
                        {(aiAnalysis.action_items as any).stop_doing?.map((item: string, idx: number) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-blue-800 mb-2">Continue Doing</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {(aiAnalysis.action_items as any).continue_doing?.map((item: string, idx: number) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* One Sentence Lesson */}
                {aiAnalysis.one_sentence_lesson && (
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 text-center">
                    <p className="text-sm font-medium italic">"{aiAnalysis.one_sentence_lesson as string}"</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep("deep_dive")} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                    {isSaving ? "Saving..." : "Save Post-Mortem"}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      <FeatureUpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="post_mortem"
        reason="trial_used"
      />
    </div>
  );
}
