import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

type PostMortemType = "decision" | "project" | "event" | "failure" | "success" | "other";
type OutcomeStatus = "success" | "partial" | "failure" | "mixed";

const TYPE_OPTIONS = [
  { id: "decision" as PostMortemType, label: "Decision Outcome" },
  { id: "project" as PostMortemType, label: "Project/Initiative" },
  { id: "event" as PostMortemType, label: "Event" },
  { id: "failure" as PostMortemType, label: "Failure" },
  { id: "success" as PostMortemType, label: "Success" },
  { id: "other" as PostMortemType, label: "Other" },
];

const OUTCOME_OPTIONS = [
  { id: "success" as OutcomeStatus, icon: CheckCircle, label: "Success", color: "text-green-600", description: "Achieved intended outcome" },
  { id: "partial" as OutcomeStatus, icon: AlertTriangle, label: "Partial", color: "text-yellow-600", description: "Some goals met, some missed" },
  { id: "failure" as OutcomeStatus, icon: XCircle, label: "Failure", color: "text-red-600", description: "Did not achieve intended outcome" },
  { id: "mixed" as OutcomeStatus, icon: RefreshCw, label: "Mixed", color: "text-blue-600", description: "Good and bad elements" },
];

export default function PostMortemNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"what" | "outcome" | "analysis" | "ai">("what");
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form data
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [postMortemType, setPostMortemType] = useState<PostMortemType | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus | null>(null);
  const [outcomeRating, setOutcomeRating] = useState([5]);
  
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
  
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, unknown> | null>(null);

  const handleNext = () => {
    if (step === "what" && description && postMortemType) {
      setStep("outcome");
    } else if (step === "outcome" && outcomeStatus) {
      setStep("analysis");
    }
  };

  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in production, this would call an edge function)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAnalysis = {
      summary: "Based on your reflection, this experience provided valuable insights about planning and execution.",
      key_learnings: [
        { learning: "Preparation directly impacts outcomes", application: "Build buffer time into future projects" },
        { learning: "Communication gaps created friction", application: "Establish clearer update cadences" },
      ],
      root_causes: outcomeStatus === "failure" || outcomeStatus === "partial" ? [
        { issue: "Timeline pressure", cause: "Underestimated complexity", prevention: "Add 20% buffer to estimates" },
      ] : [],
      success_factors: outcomeStatus === "success" || outcomeStatus === "partial" ? [
        { factor: "Early stakeholder alignment", why: "Reduced mid-project pivots", replication: "Front-load alignment meetings" },
      ] : [],
      action_items: [
        { action: "Document lessons learned", timeline: "This week" },
        { action: "Share insights with team", timeline: "Next meeting" },
      ],
      one_sentence_lesson: "Success comes from preparation, communication, and adaptability.",
    };
    
    setAiAnalysis(mockAnalysis);
    setStep("ai");
    setIsAnalyzing(false);
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
        user_inputs: userInputs as unknown as Json,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/post-mortem")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">New Post-Mortem</h1>
            <p className="text-sm text-muted-foreground">Reflect and learn from what happened</p>
          </div>
        </div>

        {/* Step: What happened */}
        {step === "what" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>What are you analyzing?</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the event, project, or decision outcome..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this post-mortem a name..."
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostMortemType(type.id)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-colors",
                      postMortemType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleNext} 
              disabled={!description || !postMortemType}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step: Outcome */}
        {step === "outcome" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>How did it go?</Label>
              <div className="grid grid-cols-2 gap-3">
                {OUTCOME_OPTIONS.map((outcome) => {
                  const Icon = outcome.icon;
                  return (
                    <button
                      key={outcome.id}
                      type="button"
                      onClick={() => setOutcomeStatus(outcome.id)}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-colors",
                        outcomeStatus === outcome.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 mb-2", outcome.color)} />
                      <p className="font-medium text-sm">{outcome.label}</p>
                      <p className="text-xs text-muted-foreground">{outcome.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Satisfaction (1-10): {outcomeRating[0]}</Label>
              <Slider
                value={outcomeRating}
                onValueChange={setOutcomeRating}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("what")} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!outcomeStatus}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step: Analysis prompts */}
        {step === "analysis" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>What went well? (List 3 things)</Label>
              {[1, 2, 3].map((num) => (
                <Input
                  key={num}
                  value={userInputs[`went_well_${num}` as keyof typeof userInputs]}
                  onChange={(e) => setUserInputs(prev => ({
                    ...prev,
                    [`went_well_${num}`]: e.target.value
                  }))}
                  placeholder={`${num}. Something that worked...`}
                />
              ))}
            </div>

            <div className="space-y-4">
              <Label>What didn't go well? (List 3 things)</Label>
              {[1, 2, 3].map((num) => (
                <Input
                  key={num}
                  value={userInputs[`went_wrong_${num}` as keyof typeof userInputs]}
                  onChange={(e) => setUserInputs(prev => ({
                    ...prev,
                    [`went_wrong_${num}`]: e.target.value
                  }))}
                  placeholder={`${num}. Something that didn't work...`}
                />
              ))}
            </div>

            <div className="space-y-2">
              <Label>What would you do differently?</Label>
              <Textarea
                value={userInputs.do_differently}
                onChange={(e) => setUserInputs(prev => ({ ...prev, do_differently: e.target.value }))}
                placeholder="If you could go back..."
              />
            </div>

            <div className="space-y-2">
              <Label>What surprised you?</Label>
              <Textarea
                value={userInputs.surprised_by}
                onChange={(e) => setUserInputs(prev => ({ ...prev, surprised_by: e.target.value }))}
                placeholder="Something unexpected..."
              />
            </div>

            <div className="space-y-2">
              <Label>What will you carry forward?</Label>
              <Textarea
                value={userInputs.carry_forward}
                onChange={(e) => setUserInputs(prev => ({ ...prev, carry_forward: e.target.value }))}
                placeholder="Key takeaways for the future..."
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("outcome")} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleGenerateAnalysis} 
                disabled={isAnalyzing}
                className="flex-1 gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: AI Analysis */}
        {step === "ai" && aiAnalysis && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground">{aiAnalysis.summary as string}</p>
            </div>

            {/* Key Learnings */}
            <div>
              <h3 className="font-semibold mb-3">Key Learnings</h3>
              <div className="space-y-2">
                {(aiAnalysis.key_learnings as { learning: string; application: string }[])?.map((item, idx) => (
                  <div key={idx} className="bg-card border rounded-lg p-3">
                    <p className="font-medium text-sm">{item.learning}</p>
                    <p className="text-xs text-muted-foreground mt-1">→ {item.application}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div>
              <h3 className="font-semibold mb-3">Action Items</h3>
              <div className="space-y-2">
                {(aiAnalysis.action_items as { action: string; timeline: string }[])?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-card border rounded-lg p-3">
                    <span className="text-sm">{item.action}</span>
                    <span className="text-xs text-muted-foreground">{item.timeline}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* One Sentence Lesson */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
              <p className="text-sm font-medium italic">"{aiAnalysis.one_sentence_lesson as string}"</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("analysis")} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? "Saving..." : "Save Post-Mortem"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
