import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, BarChart3, CheckCircle2, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  decision_volume: { current: number; previous: number };
  completion: { completed: number; total: number };
  prediction_accuracy: { correct: number; total: number; outcome_count: number };
  avg_satisfaction: { score: number; previous: number };
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (previous === 0) return <TrendingUp className="w-3.5 h-3.5 text-[hsl(160,84%,39%)]" />;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return <span className="flex items-center gap-0.5 text-xs font-medium text-[hsl(160,84%,39%)]"><TrendingUp className="w-3.5 h-3.5" />↑{pct}%</span>;
  if (pct < 0) return <span className="flex items-center gap-0.5 text-xs font-medium text-destructive"><TrendingDown className="w-3.5 h-3.5" />↓{Math.abs(pct)}%</span>;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

function completionColor(rate: number) {
  if (rate >= 60) return "text-[hsl(160,84%,39%)]";
  if (rate >= 30) return "text-warning";
  return "text-destructive";
}

export function AnalyticsKeyMetrics({ data }: { data: AnalyticsData | null }) {
  const completionRate = data && data.completion.total > 0
    ? Math.round((data.completion.completed / data.completion.total) * 100) : 0;

  const predictionRate = data && data.prediction_accuracy.total > 0
    ? Math.round((data.prediction_accuracy.correct / data.prediction_accuracy.total) * 100) : null;

  const cards = [
    {
      label: "Decisions This Period",
      value: data?.decision_volume.current ?? 0,
      icon: BarChart3,
      accent: "bg-primary/10 text-primary",
      extra: data ? <TrendBadge current={data.decision_volume.current} previous={data.decision_volume.previous} /> : null,
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: CheckCircle2,
      accent: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]",
      extra: data ? <span className={cn("text-xs", completionColor(completionRate))}>{data.completion.completed} of {data.completion.total} tracked</span> : null,
    },
    {
      label: "Prediction Accuracy",
      value: predictionRate !== null && (data?.prediction_accuracy.outcome_count ?? 0) >= 5 ? `${predictionRate}%` : "—",
      icon: Target,
      accent: "bg-primary/10 text-primary",
      extra: data && (data.prediction_accuracy.outcome_count ?? 0) < 5
        ? <span className="text-xs text-muted-foreground">Need {5 - (data.prediction_accuracy.outcome_count ?? 0)} more outcomes</span>
        : data ? <span className="text-xs text-muted-foreground">Based on {data.prediction_accuracy.outcome_count} decisions</span> : null,
    },
    {
      label: "Avg. Satisfaction",
      value: data && data.avg_satisfaction.score > 0 ? data.avg_satisfaction.score.toFixed(1) : "—",
      icon: Star,
      accent: "bg-warning/10 text-warning",
      extra: data && data.avg_satisfaction.score > 0 && data.avg_satisfaction.previous > 0
        ? <TrendBadge current={data.avg_satisfaction.score} previous={data.avg_satisfaction.previous} />
        : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", c.accent)}>
                <c.icon className="w-4 h-4" />
              </div>
              {c.extra}
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
