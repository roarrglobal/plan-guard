import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface OutcomeLoggingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionText: string;
  failureModes?: Array<{ what_fails: string; id?: string }>;
  onSave: (outcome: OutcomeData) => void;
}

export interface OutcomeData {
  proceeded: "yes" | "yes_modified" | "no";
  result: "better" | "expected" | "worse" | "early";
  risksMaterialized: string[];
  lesson: string;
}

const PROCEEDED_OPTIONS = [
  { value: "yes", label: "Yes, as planned", icon: CheckCircle, color: "text-emerald-600" },
  { value: "yes_modified", label: "Yes, but modified", icon: AlertTriangle, color: "text-amber-600" },
  { value: "no", label: "No, I didn't proceed", icon: XCircle, color: "text-red-600" },
];

const RESULT_OPTIONS = [
  { value: "better", label: "Better than expected", emoji: "🎉" },
  { value: "expected", label: "As expected", emoji: "✓" },
  { value: "worse", label: "Worse than expected", emoji: "😔" },
  { value: "early", label: "Too early to tell", emoji: "⏳" },
];

export function OutcomeLoggingModal({ 
  open, 
  onOpenChange, 
  decisionText, 
  failureModes = [],
  onSave 
}: OutcomeLoggingModalProps) {
  const [proceeded, setProceeded] = useState<OutcomeData["proceeded"] | null>(null);
  const [result, setResult] = useState<OutcomeData["result"] | null>(null);
  const [risksMaterialized, setRisksMaterialized] = useState<string[]>([]);
  const [lesson, setLesson] = useState("");
  const [step, setStep] = useState(1);

  const handleRiskToggle = (riskId: string) => {
    setRisksMaterialized(prev => 
      prev.includes(riskId) 
        ? prev.filter(id => id !== riskId)
        : [...prev, riskId]
    );
  };

  const handleSave = () => {
    if (proceeded && result) {
      onSave({
        proceeded,
        result,
        risksMaterialized,
        lesson,
      });
    }
  };

  const canProceed = () => {
    if (step === 1) return proceeded !== null;
    if (step === 2) return result !== null;
    return true;
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else handleSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Log Outcome
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {decisionText.slice(0, 100)}...
          </p>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Did you proceed? */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Did you proceed with this decision?</p>
            <div className="space-y-2">
              {PROCEEDED_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setProceeded(option.value as OutcomeData["proceeded"])}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      proceeded === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: How did it turn out? */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">How did it turn out?</p>
            <div className="grid grid-cols-2 gap-2">
              {RESULT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setResult(option.value as OutcomeData["result"])}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                    result === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs font-medium text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Risks materialized */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Did any of these risks materialize?</p>
            {failureModes.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {failureModes.map((mode, i) => (
                  <label
                    key={mode.id || i}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={risksMaterialized.includes(mode.id || String(i))}
                      onCheckedChange={() => handleRiskToggle(mode.id || String(i))}
                    />
                    <span className="text-sm">{mode.what_fails}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific failure modes were identified for this decision.
              </p>
            )}
          </div>
        )}

        {/* Step 4: Lesson learned */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">One lesson learned (optional)</p>
            <Textarea
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="What did you learn from this experience?"
              rows={3}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={nextStep}
            disabled={!canProceed()}
          >
            {step === 4 ? "Save Outcome" : "Continue"}
            {step < 4 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
