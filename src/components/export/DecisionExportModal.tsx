import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export interface ExportSections {
  executiveSummary: boolean;
  fullAnalysis: boolean;
  blindSpots: boolean;
  failureModes: boolean;
  warningSignals: boolean;
  killCriteria: boolean;
  stakeholderMap: boolean;
  recommendation: boolean;
  outcome: boolean;
}

interface DecisionExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (sections: ExportSections, includeBranding: boolean) => void;
  hasAnalysis: boolean;
  hasOutcome: boolean;
  hasStakeholders: boolean;
}

const SECTION_OPTIONS = [
  { key: "executiveSummary" as const, label: "Executive Summary", description: "Summary, bottom line, and unasked question" },
  { key: "blindSpots" as const, label: "Blind Spots", description: "Identified blind spots with categories" },
  { key: "failureModes" as const, label: "Failure Modes", description: "Risk table with likelihood and impact" },
  { key: "warningSignals" as const, label: "Warning Signals", description: "Timeline-based warning indicators" },
  { key: "killCriteria" as const, label: "Kill Criteria", description: "Conditions that should halt the decision" },
  { key: "stakeholderMap" as const, label: "Stakeholder Map", description: "Impact and influence analysis" },
  { key: "recommendation" as const, label: "Recommendation", description: "Recommended option with rationale" },
  { key: "outcome" as const, label: "Outcome", description: "Result and lessons learned" },
];

export function DecisionExportModal({
  open,
  onOpenChange,
  onExport,
  hasAnalysis,
  hasOutcome,
  hasStakeholders,
}: DecisionExportModalProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [includeBranding, setIncludeBranding] = useState(true);
  const [sections, setSections] = useState<ExportSections>({
    executiveSummary: true,
    fullAnalysis: true,
    blindSpots: true,
    failureModes: true,
    warningSignals: true,
    killCriteria: true,
    stakeholderMap: true,
    recommendation: true,
    outcome: true,
  });

  const toggleSection = (key: keyof ExportSections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isDisabled = (key: string) => {
    if (!hasAnalysis && key !== "outcome") return true;
    if (key === "outcome" && !hasOutcome) return true;
    if (key === "stakeholderMap" && !hasStakeholders) return true;
    return false;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      onExport(sections, includeBranding);
      toast({ title: "Report exported", description: "Your PDF has been downloaded." });
      onOpenChange(false);
    } catch {
      toast({ title: "Export failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const anySectionSelected = Object.values(sections).some(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Export Decision Report
          </DialogTitle>
          <DialogDescription>
            Generate a professional PDF report for sharing with stakeholders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-[50vh] overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Include Sections</p>
          {SECTION_OPTIONS.map((option) => {
            const disabled = isDisabled(option.key);
            return (
              <label
                key={option.key}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-muted/50"
                } ${sections[option.key] && !disabled ? "border-primary/30 bg-primary/5" : "border-border"}`}
              >
                <Checkbox
                  checked={sections[option.key] && !disabled}
                  onCheckedChange={() => !disabled && toggleSection(option.key)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{option.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-between py-2 border-t border-border">
          <Label htmlFor="branding" className="text-sm text-muted-foreground">
            Include Snag branding
          </Label>
          <Switch
            id="branding"
            checked={includeBranding}
            onCheckedChange={setIncludeBranding}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleExport}
            disabled={!anySectionSelected || isExporting}
          >
            {isExporting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" />Download PDF</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
