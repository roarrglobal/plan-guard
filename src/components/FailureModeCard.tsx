import { cn } from "@/lib/utils";

interface FailureMode {
  what: string;
  mechanism: string;
  likelihood: "High" | "Medium" | "Low";
  impact: string;
}

interface FailureModeCardProps {
  mode: FailureMode;
  index: number;
}

export function FailureModeCard({ mode, index }: FailureModeCardProps) {
  const likelihoodStyles = {
    High: "likelihood-high",
    Medium: "likelihood-medium",
    Low: "likelihood-low",
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/20 text-destructive text-sm font-bold flex items-center justify-center">
            {index}
          </span>
          <h4 className="font-semibold text-foreground leading-snug">{mode.what}</h4>
        </div>
        <span
          className={cn(
            "flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold",
            likelihoodStyles[mode.likelihood]
          )}
        >
          {mode.likelihood}
        </span>
      </div>

      <div className="pl-9 space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Mechanism
          </p>
          <p className="text-sm text-secondary-foreground">{mode.mechanism}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Impact
          </p>
          <p className="text-sm text-secondary-foreground">{mode.impact}</p>
        </div>
      </div>
    </div>
  );
}
