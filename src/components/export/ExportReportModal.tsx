import { useState } from "react";
import { FileText, Download, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type ReportType = "pre_mortem" | "post_mortem" | "framework" | "decision";

interface ReportOption {
  id: ReportType;
  title: string;
  description: string;
  icon: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    id: "pre_mortem",
    title: "Pre-Mortem Analysis",
    description: "Blind spots, failure modes, warning signals, and kill criteria",
    icon: "🎯",
  },
  {
    id: "post_mortem",
    title: "Post-Mortem Review",
    description: "Root causes, lessons learned, and action items",
    icon: "📋",
  },
  {
    id: "framework",
    title: "Business Framework",
    description: "SWOT, Porter's Five Forces, or strategic analysis",
    icon: "📊",
  },
  {
    id: "decision",
    title: "Decision Log",
    description: "Decision statement, options, and outcomes",
    icon: "⚖️",
  },
];

interface ExportReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (reportType: ReportType) => Promise<void>;
  availableReports?: ReportType[];
}

export function ExportReportModal({
  open,
  onOpenChange,
  onExport,
  availableReports = ["pre_mortem", "post_mortem", "framework", "decision"],
}: ExportReportModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedReport) return;

    setIsExporting(true);
    try {
      await onExport(selectedReport);
      toast({
        title: "Report exported",
        description: "Your PDF report has been downloaded.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Export Report
          </DialogTitle>
          <DialogDescription>
            Generate a professional McKinsey-style PDF report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {REPORT_OPTIONS.map((option) => {
            const isAvailable = availableReports.includes(option.id);
            const isSelected = selectedReport === option.id;

            return (
              <button
                key={option.id}
                onClick={() => isAvailable && setSelectedReport(option.id)}
                disabled={!isAvailable}
                className={cn(
                  "w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : isAvailable
                    ? "border-border hover:border-primary/50 hover:bg-muted/50"
                    : "border-border/50 opacity-50 cursor-not-allowed"
                )}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{option.title}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    {!isAvailable && (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleExport}
            disabled={!selectedReport || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Reports are formatted in professional consulting style with proper structure
        </p>
      </DialogContent>
    </Dialog>
  );
}
