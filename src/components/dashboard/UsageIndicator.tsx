import { useUsage } from "@/hooks/useUsage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, AlertTriangle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProgressBarProps {
  label: string;
  used: number;
  limit: number;
  formatValue?: (val: number) => string;
  percentage: number;
  colorClass: string;
}

function ProgressBar({ label, used, limit, formatValue, percentage, colorClass }: ProgressBarProps) {
  const displayUsed = formatValue ? formatValue(used) : used.toString();
  const displayLimit = limit === -1 ? "∞" : (formatValue ? formatValue(limit) : limit.toString());
  const isUnlimited = limit === -1;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {displayUsed}/{displayLimit}
          {!isUnlimited && <span className="text-muted-foreground ml-1 text-xs">{percentage}%</span>}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: isUnlimited ? "5%" : `${Math.max(2, percentage)}%` }}
        />
      </div>
    </div>
  );
}

export default function UsageIndicator() {
  const navigate = useNavigate();
  const {
    usage,
    isLoading,
    daysUntilReset,
    formatBytes,
    getPercentage,
    getProgressColor,
    tier,
    isUnlimited,
  } = useUsage();

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const analysesPercentage = getPercentage(usage.analyses_used, usage.analyses_limit);
  const documentsPercentage = getPercentage(usage.documents_used, usage.documents_limit);
  const storagePercentage = getPercentage(usage.storage_used_bytes, usage.storage_limit_bytes);

  const isNearLimit = analysesPercentage >= 80 || documentsPercentage >= 80;
  const isAtLimit = analysesPercentage >= 100 || documentsPercentage >= 100;

  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            This month
          </CardTitle>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
            {tierLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analyses */}
        <ProgressBar
          label="Analyses"
          used={usage.analyses_used}
          limit={usage.analyses_limit}
          percentage={analysesPercentage}
          colorClass={getProgressColor(analysesPercentage)}
        />

        {/* Documents (only show for paid tiers) */}
        {usage.documents_limit !== 0 && (
          <ProgressBar
            label="Documents"
            used={usage.documents_used}
            limit={usage.documents_limit}
            percentage={documentsPercentage}
            colorClass={getProgressColor(documentsPercentage)}
          />
        )}

        {/* Storage (only show for paid tiers) */}
        {usage.storage_limit_bytes !== 0 && (
          <ProgressBar
            label="Storage"
            used={usage.storage_used_bytes}
            limit={usage.storage_limit_bytes}
            formatValue={formatBytes}
            percentage={storagePercentage}
            colorClass={getProgressColor(storagePercentage)}
          />
        )}

        {/* Reset info */}
        <p className="text-xs text-muted-foreground pt-1">
          {isUnlimited ? "Unlimited usage" : `Resets in ${daysUntilReset} day${daysUntilReset !== 1 ? "s" : ""}`}
        </p>

        {/* Warning states */}
        {isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Limit reached</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                Upgrade or get a top-up pack to continue
              </p>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Running low on usage this month
            </p>
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {tier === "free" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-cobalt border-cobalt hover:bg-cobalt hover:text-white"
            onClick={() => navigate("/#pricing")}
          >
            Get more <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        {/* Top-up CTA for paid users near limit */}
        {tier !== "free" && isNearLimit && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate("/#pricing")}
          >
            Get more <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
