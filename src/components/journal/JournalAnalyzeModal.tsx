import { useState } from "react";
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
import { Target, Search, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface JournalAnalyzeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryType: string;
  entryContent: Record<string, unknown>;
}

type AnalysisType = "pre_mortem" | "post_mortem";

const ANALYSIS_OPTIONS = [
  {
    id: "pre_mortem" as AnalysisType,
    icon: Target,
    title: "Pre-Mortem (Deep Snag)",
    description: "Stress-test a decision or plan you're considering. Find blind spots, failure modes, warning signals.",
    bestFor: "Plans, goals, intentions, decisions ahead",
    color: "border-primary/30 hover:border-primary hover:bg-primary/5",
  },
  {
    id: "post_mortem" as AnalysisType,
    icon: Search,
    title: "Post-Mortem",
    description: "Analyze something that already happened. Extract lessons, find root causes, build wisdom.",
    bestFor: "Outcomes, events, reflections on the past",
    color: "border-amber-300 hover:border-amber-500 hover:bg-amber-50",
  },
];

// Map entry types to recommended analysis
const ENTRY_ANALYSIS_RECOMMENDATIONS: Record<string, AnalysisType | null> = {
  free_write: null, // Could be either
  gratitude: "post_mortem",
  manifestation: "pre_mortem",
  reflection: null, // Could be either
  morning: "pre_mortem",
  evening: "post_mortem",
};

export function JournalAnalyzeModal({
  open,
  onOpenChange,
  entryId,
  entryType,
  entryContent,
}: JournalAnalyzeModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "extract" | "confirm">("select");
  const [selectedType, setSelectedType] = useState<AnalysisType | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedContent, setExtractedContent] = useState("");
  const [editedContent, setEditedContent] = useState("");

  const recommendation = ENTRY_ANALYSIS_RECOMMENDATIONS[entryType];

  const getEntryText = (): string => {
    if (typeof entryContent === "string") return entryContent;
    if (entryContent?.text) return String(entryContent.text);
    if (entryContent?.body) return String(entryContent.body);
    
    // Combine all text fields for extraction
    const textParts: string[] = [];
    Object.entries(entryContent).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        textParts.push(`${key.replace(/_/g, " ")}: ${value}`);
      }
    });
    return textParts.join("\n");
  };

  const handleSelectType = async (type: AnalysisType) => {
    setSelectedType(type);
    setStep("extract");
    setIsExtracting(true);

    try {
      // Call AI to extract relevant content from the journal entry
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
      // Fallback to using raw content
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
      // Navigate to analyze page with pre-filled content
      navigate("/analyze", { 
        state: { 
          prefillContent: editedContent,
          sourceJournalId: entryId 
        } 
      });
    } else {
      // Navigate to post-mortem page with pre-filled content
      navigate("/post-mortem/new", { 
        state: { 
          prefillContent: editedContent,
          sourceJournalId: entryId 
        } 
      });
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelectedType(null);
    setExtractedContent("");
    setEditedContent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Analyze this entry
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4 pt-2">
            {recommendation && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                💡 Based on your <span className="font-medium">{entryType.replace("_", " ")}</span> entry, 
                we recommend <span className="font-medium">{recommendation === "pre_mortem" ? "Pre-Mortem" : "Post-Mortem"}</span> analysis.
              </p>
            )}

            <div className="space-y-3">
              {ANALYSIS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isRecommended = recommendation === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectType(option.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      option.color,
                      isRecommended && "ring-2 ring-primary/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        option.id === "pre_mortem" ? "bg-primary/10" : "bg-amber-100"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          option.id === "pre_mortem" ? "text-primary" : "text-amber-600"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{option.title}</h3>
                          {isRecommended && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                              Recommended
                            </span>
                          )}
                        </div>
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

        {step === "extract" && isExtracting && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Extracting relevant content for analysis...
            </p>
          </div>
        )}

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
              <Button variant="outline" onClick={handleReset} className="flex-1">
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
