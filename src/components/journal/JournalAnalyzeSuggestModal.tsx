import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Search, Loader2, Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface JournalAnalyzeSuggestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryType: string;
  entryContent: Record<string, unknown>;
}

type AnalysisType = "pre_mortem" | "post_mortem";
type SuggestionResult = {
  suggestion: "pre_mortem" | "post_mortem" | "ask_user";
  confidence?: "high" | "medium";
  reason?: string;
};

const ANALYSIS_OPTIONS = [
  {
    id: "pre_mortem" as AnalysisType,
    icon: Target,
    title: "Pre-Mortem (Deep Snag)",
    description: "Stress-test a decision or plan you're considering. Find blind spots, failure modes, warning signals.",
    bestFor: "Plans, goals, intentions, decisions ahead",
    colorClass: "border-primary/30 hover:border-primary hover:bg-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "post_mortem" as AnalysisType,
    icon: Search,
    title: "Post-Mortem",
    description: "Analyze something that already happened. Extract lessons, find root causes, build wisdom.",
    bestFor: "Outcomes, events, reflections on the past",
    colorClass: "border-amber-300 hover:border-amber-500 hover:bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

export function JournalAnalyzeSuggestModal({
  open,
  onOpenChange,
  entryId,
  entryType,
  entryContent,
}: JournalAnalyzeSuggestModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"loading" | "suggest" | "select" | "extract" | "confirm">("loading");
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);
  const [selectedType, setSelectedType] = useState<AnalysisType | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedContent, setExtractedContent] = useState("");
  const [editedContent, setEditedContent] = useState("");

  const getEntryText = (): string => {
    if (typeof entryContent === "string") return entryContent;
    if (entryContent?.text) return String(entryContent.text);
    if (entryContent?.body) return String(entryContent.body);
    
    const textParts: string[] = [];
    Object.entries(entryContent).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        textParts.push(`${key.replace(/_/g, " ")}: ${value}`);
      }
    });
    return textParts.join("\n");
  };

  // Fetch AI suggestion when modal opens
  useEffect(() => {
    if (!open) return;
    
    setStep("loading");
    setSuggestion(null);
    setSelectedType(null);
    setExtractedContent("");
    setEditedContent("");

    const fetchSuggestion = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("analyze-journal", {
          body: {
            action: "suggest",
            content: getEntryText(),
            entryType,
          },
        });

        if (error) throw error;

        const result = data as SuggestionResult;
        setSuggestion(result);
        
        if (result.suggestion === "ask_user") {
          setStep("select");
        } else {
          setStep("suggest");
        }
      } catch (err) {
        console.error("Failed to get suggestion:", err);
        setStep("select");
      }
    };

    fetchSuggestion();
  }, [open, entryType]);

  const handleSelectType = async (type: AnalysisType) => {
    setSelectedType(type);
    setStep("extract");
    setIsExtracting(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-journal", {
        body: {
          action: "extract",
          content: getEntryText(),
          entryType,
          analysisType: type,
        },
      });

      if (error) throw error;

      const extracted = data?.extracted || getEntryText();
      setExtractedContent(extracted);
      setEditedContent(extracted);
      setStep("confirm");
    } catch (err) {
      console.error("Extraction error:", err);
      const raw = getEntryText();
      setExtractedContent(raw);
      setEditedContent(raw);
      setStep("confirm");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmAnalysis = () => {
    onOpenChange(false);
    
    if (selectedType === "pre_mortem") {
      navigate("/analyze", { 
        state: { 
          prefillContent: editedContent,
          sourceJournalId: entryId 
        } 
      });
    } else {
      navigate("/post-mortem/new", { 
        state: { 
          prefillContent: editedContent,
          sourceJournalId: entryId 
        } 
      });
    }
  };

  const suggestedOption = suggestion?.suggestion === "pre_mortem" || suggestion?.suggestion === "post_mortem"
    ? ANALYSIS_OPTIONS.find(o => o.id === suggestion.suggestion)
    : null;

  const alternativeOption = suggestedOption
    ? ANALYSIS_OPTIONS.find(o => o.id !== suggestedOption.id)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Analyze this entry
          </DialogTitle>
        </DialogHeader>

        {/* Loading state */}
        {step === "loading" && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Reading your entry...
            </p>
          </div>
        )}

        {/* Suggestion state */}
        {step === "suggest" && suggestedOption && (
          <div className="space-y-4 pt-2">
            {/* Suggested option - highlighted */}
            <div className={cn(
              "p-4 rounded-xl border-2 transition-all",
              suggestedOption.id === "pre_mortem" 
                ? "border-primary bg-primary/5" 
                : "border-amber-400 bg-amber-50"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  suggestedOption.iconBg
                )}>
                  <Lightbulb className={cn("w-5 h-5", suggestedOption.iconColor)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Suggested
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{suggestedOption.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {suggestion?.reason || suggestedOption.description}
                  </p>
                  <Button 
                    onClick={() => handleSelectType(suggestedOption.id)}
                    className="w-full gap-2"
                    variant={suggestedOption.id === "pre_mortem" ? "default" : "secondary"}
                  >
                    Run {suggestedOption.id === "pre_mortem" ? "Pre-Mortem" : "Post-Mortem"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Alternative option */}
            {alternativeOption && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Or choose manually:</p>
                <button
                  onClick={() => handleSelectType(alternativeOption.id)}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {alternativeOption.id === "pre_mortem" ? "🎯" : "🔍"} {alternativeOption.title} instead
                </button>
              </div>
            )}
          </div>
        )}

        {/* Selection state (when AI is unsure) */}
        {step === "select" && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground text-center">
              What kind of analysis fits best?
            </p>
            <div className="space-y-3">
              {ANALYSIS_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectType(option.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      option.colorClass
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        option.iconBg
                      )}>
                        <Icon className={cn("w-5 h-5", option.iconColor)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{option.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Best for: {option.bestFor}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Extracting state */}
        {step === "extract" && isExtracting && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Extracting relevant content for analysis...
            </p>
          </div>
        )}

        {/* Confirm state */}
        {step === "confirm" && (
          <div className="space-y-4 pt-2">
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                We extracted the following for your {selectedType === "pre_mortem" ? "Pre-Mortem" : "Post-Mortem"} analysis.
                You can edit it before proceeding.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Content to analyze:</Label>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[150px]"
                placeholder="The content to analyze..."
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(suggestion?.suggestion === "ask_user" ? "select" : "suggest")} 
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handleConfirmAnalysis} className="flex-1 gap-2">
                Start Analysis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
