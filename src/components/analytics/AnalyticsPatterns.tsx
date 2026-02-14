import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Shield, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  outcomes: any[];
  decisions: any[];
}

function accuracyColor(rate: number) {
  if (rate >= 70) return "text-[hsl(160,84%,39%)]";
  if (rate >= 50) return "text-warning";
  return "text-destructive";
}

export function AnalyticsPatterns({ outcomes, decisions }: Props) {
  const hasEnoughData = outcomes.length >= 5;

  if (!hasEnoughData) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4" /> Team Patterns</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {outcomes.length === 0
              ? "Track outcomes to reveal team patterns."
              : `${5 - outcomes.length} more outcome${5 - outcomes.length > 1 ? "s" : ""} needed to unlock insights.`}
          </p>
          <Progress value={(outcomes.length / 5) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">{outcomes.length}/5 outcomes logged</p>
        </CardContent>
      </Card>
    );
  }

  // Top blind spots from predictions_hit
  const blindSpotMap: Record<string, { hit: number; total: number }> = {};
  outcomes.forEach((o: any) => {
    const hits = (o.predictions_hit || []) as any[];
    hits.forEach((h: any) => {
      const label = typeof h === "string" ? h : h?.label || h?.text || "Unknown";
      if (!blindSpotMap[label]) blindSpotMap[label] = { hit: 0, total: 0 };
      blindSpotMap[label].hit++;
      blindSpotMap[label].total++;
    });
    const misses = (o.predictions_missed || []) as any[];
    misses.forEach((m: any) => {
      const label = typeof m === "string" ? m : m?.label || m?.text || "Unknown";
      if (!blindSpotMap[label]) blindSpotMap[label] = { hit: 0, total: 0 };
      blindSpotMap[label].total++;
    });
  });
  const topBlindSpots = Object.entries(blindSpotMap)
    .sort(([, a], [, b]) => b.hit - a.hit)
    .slice(0, 3);

  // Category accuracy
  const catAccuracy: Record<string, { correct: number; total: number; decisions: number }> = {};
  outcomes.forEach((o: any) => {
    const decision = decisions.find((d: any) => d.id === o.decision_id);
    const cat = decision?.category || "other";
    if (!catAccuracy[cat]) catAccuracy[cat] = { correct: 0, total: 0, decisions: 0 };
    catAccuracy[cat].decisions++;
    const hits = (o.predictions_hit || []) as any[];
    const misses = (o.predictions_missed || []) as any[];
    catAccuracy[cat].correct += hits.length;
    catAccuracy[cat].total += hits.length + misses.length;
  });
  const catRows = Object.entries(catAccuracy)
    .map(([cat, d]) => ({ cat: cat.charAt(0).toUpperCase() + cat.slice(1), accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0, decisions: d.decisions }))
    .sort((a, b) => b.decisions - a.decisions);

  // Strengths & weaknesses
  const best = catRows.filter((r) => r.accuracy >= 70).map((r) => r.cat);
  const worst = catRows.filter((r) => r.accuracy < 50 && r.decisions >= 2).map((r) => r.cat);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Top Blind Spots */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> Top Blind Spots</CardTitle>
        </CardHeader>
        <CardContent>
          {topBlindSpots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No patterns detected yet</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Your team frequently misses:</p>
              {topBlindSpots.map(([label, data]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-foreground truncate flex-1">{label}</span>
                  <Badge variant="outline" className="text-xs ml-2">Hit {data.hit}/{data.total}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accuracy by Category */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Accuracy by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {catRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data</p>
          ) : (
            <div className="space-y-2">
              {catRows.map((r) => (
                <div key={r.cat} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{r.cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{r.decisions} decisions</span>
                    <span className={cn("font-medium", accuracyColor(r.accuracy))}>{r.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-[hsl(160,84%,39%)]" /> Team Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          {best.length === 0 ? (
            <p className="text-sm text-muted-foreground">More data needed to identify strengths</p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground mb-2">Where your team excels:</p>
              {best.map((b) => (
                <Badge key={b} variant="outline" className="mr-1 mb-1 border-[hsl(160,84%,39%)]/30 text-[hsl(160,84%,39%)]">{b}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /> Areas to Improve</CardTitle>
        </CardHeader>
        <CardContent>
          {worst.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weak areas detected</p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground mb-2">Watch out for:</p>
              {worst.map((w) => (
                <Badge key={w} variant="outline" className="mr-1 mb-1 border-destructive/30 text-destructive">{w}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
