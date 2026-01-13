import { AlertTriangle, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { useUsage } from "@/hooks/useUsage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UsageWarningBannerProps {
  onUpgrade?: () => void;
}

export function UsageWarningBanner({ onUpgrade }: UsageWarningBannerProps) {
  const { usage, getPercentage, tier } = useUsage();
  const [dismissed, setDismissed] = useState<string | null>(null);

  if (!usage || tier === "pro" || tier === "business") return null;

  const analysisPercentage = getPercentage(usage.analyses_used ?? 0, usage.analyses_limit);
  
  // Don't show if under 80% or if dismissed
  if (analysisPercentage < 80) return null;
  
  const warningKey = `${usage.period_start}-${analysisPercentage >= 100 ? '100' : analysisPercentage >= 90 ? '90' : '80'}`;
  if (dismissed === warningKey) return null;

  const isAtLimit = analysisPercentage >= 100;
  const isCritical = analysisPercentage >= 90;

  return (
    <div
      className={cn(
        "relative rounded-xl p-4 mb-4 border",
        isAtLimit
          ? "bg-destructive/10 border-destructive/30"
          : isCritical
          ? "bg-warning/10 border-warning/30"
          : "bg-amber-50 border-amber-200"
      )}
    >
      <button
        onClick={() => setDismissed(warningKey)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            isAtLimit
              ? "bg-destructive/20"
              : isCritical
              ? "bg-warning/20"
              : "bg-amber-100"
          )}
        >
          {isAtLimit ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <TrendingUp className={cn("w-5 h-5", isCritical ? "text-warning" : "text-amber-600")} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-semibold text-sm",
              isAtLimit
                ? "text-destructive"
                : isCritical
                ? "text-warning"
                : "text-amber-800"
            )}
          >
            {isAtLimit
              ? "Analysis limit reached"
              : isCritical
              ? "Almost at your limit"
              : "Approaching your limit"}
          </h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAtLimit
              ? "You've used all your analyses this month. Upgrade to continue."
              : `You've used ${usage.analyses_used} of ${usage.analyses_limit} analyses (${analysisPercentage}%).`}
          </p>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isAtLimit
                  ? "bg-destructive"
                  : isCritical
                  ? "bg-warning"
                  : "bg-amber-500"
              )}
              style={{ width: `${Math.min(100, analysisPercentage)}%` }}
            />
          </div>

          {onUpgrade && (
            <Button
              onClick={onUpgrade}
              size="sm"
              className="mt-3"
              variant={isAtLimit ? "default" : "outline"}
            >
              Upgrade to Pro
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
