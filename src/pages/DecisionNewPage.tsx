import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";
import { 
  ArrowLeft,
  Zap,
  Plus,
  Trash2,
  Target,
  Clock,
  Save,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STAKES_OPTIONS = [
  { id: "low", label: "Low", description: "Easily reversible" },
  { id: "medium", label: "Medium", description: "Some consequences" },
  { id: "high", label: "High", description: "Significant impact" },
];

const CATEGORIES = [
  "Career",
  "Business", 
  "Personal",
  "Finance",
  "Health",
  "Relationships",
  "Other",
];

const DEADLINE_OPTIONS = [
  { id: "today", label: "Today", days: 0 },
  { id: "week", label: "This week", days: 7 },
  { id: "month", label: "This month", days: 30 },
  { id: "none", label: "No rush", days: null },
];

const OUTCOME_CHECK_OPTIONS = [
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
];

export default function DecisionNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"input" | "context" | "nudge" | "decide">("input");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingNudge, setIsGeneratingNudge] = useState(false);
  
  // Form data
  const [decisionText, setDecisionText] = useState("");
  const [options, setOptions] = useState([{ label: "" }, { label: "" }]);
  const [stakes, setStakes] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [customDeadline, setCustomDeadline] = useState<string>("");
  const [aiNudge, setAiNudge] = useState<string>("");
  
  // Decision made
  const [chosenOption, setChosenOption] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [outcomeCheckDays, setOutcomeCheckDays] = useState(30);

  const addOption = () => {
    setOptions([...options, { label: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].label = value;
    setOptions(newOptions);
  };

  const generateAiNudge = async () => {
    setIsGeneratingNudge(true);
    
    // Simulate AI response - in production this would call the AI
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const nudges = [
      `You've framed this as ${options[0]?.label || "Option A"} vs ${options[1]?.label || "Option B"}, but what's Option C that you haven't considered?`,
      "What would you advise a friend to do in this exact situation?",
      "If you had to decide in the next 5 minutes, which way would you lean?",
      "What are you most afraid of? That fear might be pointing to the right choice.",
      "Fast forward 6 months — which decision would you regret NOT making?",
    ];
    
    setAiNudge(nudges[Math.floor(Math.random() * nudges.length)]);
    setIsGeneratingNudge(false);
    setStep("nudge");
  };

  const handleSave = async (action: "later" | "decide" | "deep_snag") => {
    if (!user) return;

    setIsSaving(true);

    const deadlineDate = deadline === "custom" 
      ? customDeadline 
      : deadline && DEADLINE_OPTIONS.find(d => d.id === deadline)?.days !== null
        ? format(addDays(new Date(), DEADLINE_OPTIONS.find(d => d.id === deadline)!.days!), "yyyy-MM-dd")
        : null;

    const decisionData = {
      user_id: user.id,
      decision_text: decisionText,
      options: options.filter(o => o.label.trim()),
      stakes,
      category,
      deadline: deadlineDate,
      status: action === "decide" ? "made" : "pending",
      chosen_option: action === "decide" ? chosenOption : null,
      confidence: action === "decide" ? confidence : null,
      outcome_check_date: action === "decide" 
        ? format(addDays(new Date(), outcomeCheckDays), "yyyy-MM-dd")
        : null,
      ai_nudge: aiNudge || null,
    };

    const { data, error } = await supabase
      .from("decisions")
      .insert(decisionData)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error saving decision",
        description: error.message,
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (action === "deep_snag") {
      // Navigate to Deep Snag with this decision
      navigate(`/analyze?decision=${data.id}&text=${encodeURIComponent(decisionText)}`);
    } else {
      toast({
        title: action === "decide" ? "Decision logged" : "Decision captured",
        description: action === "decide" 
          ? `We'll check in on this in ${outcomeCheckDays} days.`
          : "You can come back to this later.",
      });
      navigate("/decisions");
    }

    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step === "decide") setStep("nudge");
              else if (step === "nudge") setStep("context");
              else if (step === "context") setStep("input");
              else navigate("/decisions");
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            Capture Decision
          </h1>
        </div>

        {/* Step 1: Decision Input */}
        {step === "input" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">What decision are you making?</Label>
              <Textarea
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                placeholder="Describe the decision you're facing..."
                className="bg-white min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">What are the options?</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="bg-white"
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add option
              </Button>
            </div>

            <Button
              onClick={() => setStep("context")}
              disabled={!decisionText.trim() || options.filter(o => o.label.trim()).length < 2}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Context Tags */}
        {step === "context" && (
          <div className="space-y-6">
            {/* Stakes */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Stakes</Label>
              <div className="grid grid-cols-3 gap-3">
                {STAKES_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setStakes(option.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      stakes === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-white hover:border-primary/30"
                    )}
                  >
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border border-border text-foreground hover:border-primary/30"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Deadline</Label>
              <div className="flex flex-wrap gap-2">
                {DEADLINE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setDeadline(option.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      deadline === option.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border border-border text-foreground hover:border-primary/30"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  onClick={() => setDeadline("custom")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    deadline === "custom"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border border-border text-foreground hover:border-primary/30"
                  )}
                >
                  Custom
                </button>
              </div>
              {deadline === "custom" && (
                <Input
                  type="date"
                  value={customDeadline}
                  onChange={(e) => setCustomDeadline(e.target.value)}
                  className="bg-white max-w-[200px]"
                />
              )}
            </div>

            <Button
              onClick={generateAiNudge}
              disabled={isGeneratingNudge}
              className="w-full"
            >
              {isGeneratingNudge ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Thinking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Get AI Perspective
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Step 3: AI Nudge */}
        {step === "nudge" && (
          <div className="space-y-6">
            {/* AI Nudge Card */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Before you decide:
                  </p>
                  <p className="text-foreground font-medium">
                    {aiNudge}
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Preview */}
            <div className="bg-white border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-2">Your decision:</p>
              <p className="text-foreground font-medium mb-3">{decisionText}</p>
              <div className="flex flex-wrap gap-2">
                {options.filter(o => o.label.trim()).map((option, idx) => (
                  <Badge key={idx} variant="secondary">
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-center text-muted-foreground">
                What would you like to do?
              </p>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => handleSave("deep_snag")}
                disabled={isSaving}
              >
                <Target className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Deep Snag this</p>
                  <p className="text-xs text-muted-foreground">Run a full pre-mortem analysis</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => setStep("decide")}
              >
                <Zap className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <p className="font-medium">Decide now</p>
                  <p className="text-xs text-muted-foreground">Log your decision and track the outcome</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => handleSave("later")}
                disabled={isSaving}
              >
                <Save className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Save for later</p>
                  <p className="text-xs text-muted-foreground">Add to pending decisions</p>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Make Decision */}
        {step === "decide" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Which option did you choose?</Label>
              <div className="space-y-2">
                {options.filter(o => o.label.trim()).map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setChosenOption(option.label)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all",
                      chosenOption === option.label
                        ? "border-primary bg-primary/5"
                        : "border-border bg-white hover:border-primary/30"
                    )}
                  >
                    <p className="font-medium text-foreground">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Confidence level: {confidence}/5
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfidence(level)}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-medium transition-colors",
                      confidence >= level
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Check in on this:</Label>
              <div className="flex gap-2">
                {OUTCOME_CHECK_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setOutcomeCheckDays(option.days)}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-medium transition-colors",
                      outcomeCheckDays === option.days
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border border-border text-foreground hover:border-primary/30"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => handleSave("decide")}
              disabled={!chosenOption || isSaving}
              className="w-full"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Log Decision
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
