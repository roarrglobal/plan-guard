import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Props {
  analysisType: string;
  onCancel?: () => void;
}

const ESTIMATED_TIMES: Record<string, string> = {
  quick: "~30 seconds",
  standard: "~2 minutes",
  deep: "~5 minutes",
};

export function AnalysisLoadingState({ analysisType, onCancel }: Props) {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <div>
            <p className="text-sm font-semibold text-foreground">Analyzing your decision...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated time: {ESTIMATED_TIMES[analysisType] || "~2 minutes"}
            </p>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground underline">
              Cancel
            </button>
          )}
        </CardContent>
      </Card>

      {/* Skeleton sections */}
      {["Summary", "Blind Spots", "Failure Modes", "Warning Signals"].map((section) => (
        <div key={section} className="border border-border rounded-lg p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
