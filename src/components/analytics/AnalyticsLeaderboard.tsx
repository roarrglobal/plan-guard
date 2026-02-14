import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  decisions: any[];
  outcomes: any[];
  members: any[];
}

export function AnalyticsLeaderboard({ decisions, outcomes, members }: Props) {
  // Most active by decisions created
  const activityMap: Record<string, number> = {};
  decisions.forEach((d) => { activityMap[d.created_by] = (activityMap[d.created_by] || 0) + 1; });
  const byActivity = Object.entries(activityMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([userId, count]) => {
      const m = members.find((m: any) => m.user_id === userId);
      return { name: m?.display_name || "Team Member", count };
    });

  // Best predictors (3+ outcomes)
  const predMap: Record<string, { correct: number; total: number }> = {};
  outcomes.forEach((o: any) => {
    if (!predMap[o.user_id]) predMap[o.user_id] = { correct: 0, total: 0 };
    const hits = (o.predictions_hit || []) as any[];
    const misses = (o.predictions_missed || []) as any[];
    predMap[o.user_id].correct += hits.length;
    predMap[o.user_id].total += hits.length + misses.length;
  });

  // Count outcomes per user
  const outcomeCountMap: Record<string, number> = {};
  outcomes.forEach((o: any) => { outcomeCountMap[o.user_id] = (outcomeCountMap[o.user_id] || 0) + 1; });

  const byAccuracy = Object.entries(predMap)
    .filter(([uid]) => (outcomeCountMap[uid] || 0) >= 3)
    .map(([userId, d]) => ({
      name: members.find((m: any) => m.user_id === userId)?.display_name || "Team Member",
      accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      outcomes: outcomeCountMap[userId] || 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  const max = byActivity[0]?.count || 1;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Most Active</CardTitle></CardHeader>
        <CardContent>
          {byActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {byActivity.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-foreground w-6 text-right">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4" /> Best Predictors</CardTitle></CardHeader>
        <CardContent>
          {byAccuracy.length === 0 ? (
            <p className="text-sm text-muted-foreground">Need members with 3+ outcomes</p>
          ) : (
            <div className="space-y-3">
              {byAccuracy.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{c.outcomes} outcomes</span>
                    <span className={cn("text-sm font-medium", c.accuracy >= 70 ? "text-[hsl(160,84%,39%)]" : c.accuracy >= 50 ? "text-warning" : "text-destructive")}>
                      {c.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
