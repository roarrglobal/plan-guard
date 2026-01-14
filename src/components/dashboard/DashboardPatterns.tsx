import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertCircle, Target, HelpCircle, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProBadge } from "@/components/softlaunch/ProBadge";

interface PatternStats {
  totalOutcomes: number;
  predictionAccuracy: number;
  dismissedRisks: string[];
  struggleCategories: string[];
  commonQuestions: string[];
}

export function DashboardPatterns() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<PatternStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPatterns();
    }
  }, [user]);

  const fetchPatterns = async () => {
    try {
      // Get decisions with outcomes
      const { data: decisionsData } = await supabase
        .from("decisions")
        .select("id, outcome_result, risks_materialized, category, outcome_logged_at")
        .eq("status", "completed")
        .not("outcome_result", "is", null)
        .order("outcome_logged_at", { ascending: false });

      const decisions = decisionsData || [];
      
      if (decisions.length < 5) {
        setStats(null);
        setLoading(false);
        return;
      }

      // Calculate prediction accuracy (better or as expected)
      const successfulOutcomes = decisions.filter(
        d => d.outcome_result === "better" || d.outcome_result === "expected"
      ).length;
      const predictionAccuracy = Math.round((successfulOutcomes / decisions.length) * 100);

      // Get analyses to find unasked questions
      const { data: analyses } = await supabase
        .from("analyses")
        .select("result, category")
        .order("created_at", { ascending: false })
        .limit(20);

      // Find risks that materialized
      const materializedRisks = decisions
        .filter(d => d.risks_materialized && d.risks_materialized.length > 0)
        .flatMap(d => d.risks_materialized);

      // Find categories with below-average outcomes
      const categoryOutcomes: Record<string, { total: number; poor: number }> = {};
      decisions.forEach(d => {
        const cat = d.category || "other";
        if (!categoryOutcomes[cat]) {
          categoryOutcomes[cat] = { total: 0, poor: 0 };
        }
        categoryOutcomes[cat].total++;
        if (d.outcome_result === "worse") {
          categoryOutcomes[cat].poor++;
        }
      });

      const struggleCategories = Object.entries(categoryOutcomes)
        .filter(([_, stats]) => stats.poor / stats.total > 0.4)
        .map(([cat]) => cat);

      // Extract common unasked questions themes
      const questions = analyses
        ?.map(a => {
          const result = a.result as any;
          return result?.unasked_question;
        })
        .filter(Boolean)
        .slice(0, 5) || [];

      setStats({
        totalOutcomes: decisions.length,
        predictionAccuracy,
        dismissedRisks: materializedRisks.slice(0, 3),
        struggleCategories,
        commonQuestions: questions,
      });
    } catch (error) {
      console.error("Error fetching patterns:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only show after 5+ outcomes
  if (loading) return null;
  
  if (!stats) {
    return null; // Don't show until 5+ outcomes
  }

  // Check if user is on free tier
  const isFree = profile?.subscription_tier === "free" || !profile?.subscription_tier;

  if (isFree) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
          <Lock className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-center mb-1">My Decision Patterns</p>
          <p className="text-xs text-muted-foreground text-center mb-3">
            Unlock insights after 5+ outcomes logged
          </p>
          <ProBadge />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            My Decision Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="opacity-30">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          My Decision Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prediction Accuracy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-sm">Prediction accuracy</span>
          </div>
          <span className="text-lg font-bold text-emerald-600">
            {stats.predictionAccuracy}%
          </span>
        </div>

        {/* Dismissed Risks */}
        {stats.dismissedRisks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Risks you tend to dismiss</span>
            </div>
            <ul className="space-y-1 ml-6">
              {stats.dismissedRisks.map((risk, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  • {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Struggle Categories */}
        {stats.struggleCategories.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Decision types where you struggle:</p>
            <div className="flex gap-2 flex-wrap">
              {stats.struggleCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full capitalize"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Common Questions */}
        {stats.commonQuestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Common unasked questions</span>
            </div>
            <ul className="space-y-1 ml-6">
              {stats.commonQuestions.slice(0, 3).map((q, i) => (
                <li key={i} className="text-xs text-muted-foreground italic">
                  "{q.slice(0, 60)}..."
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-2">
          Based on {stats.totalOutcomes} logged outcomes
        </p>
      </CardContent>
    </Card>
  );
}
