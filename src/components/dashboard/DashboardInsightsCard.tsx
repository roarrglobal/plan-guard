import { Lightbulb } from "lucide-react";
import { useMemo } from "react";
import type { Json } from "@/integrations/supabase/types";

interface Analysis {
  id: string;
  original_input: string;
  result: Json;
  category: string | null;
  created_at: string;
}

interface DashboardInsightsCardProps {
  analyses: Analysis[];
}

export function DashboardInsightsCard({ analyses }: DashboardInsightsCardProps) {
  const insight = useMemo(() => {
    if (analyses.length < 5) return null;

    // Recent category trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAnalyses = analyses.filter(
      (a) => new Date(a.created_at) > thirtyDaysAgo
    );

    const recentCategoryCounts = recentAnalyses.reduce((acc, a) => {
      const cat = a.category || "other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(recentCategoryCounts).sort(
      (a, b) => b[1] - a[1]
    );

    if (sortedCategories.length > 0 && sortedCategories[0][1] >= 3) {
      const [category, count] = sortedCategories[0];
      const categoryLabels: Record<string, string> = {
        career: "career",
        business: "business",
        personal: "personal",
        travel: "travel",
        other: "miscellaneous",
      };

      return `You've analyzed ${count} ${categoryLabels[category]} decisions this month. Big moves ahead?`;
    }

    // Fallback insights
    const totalBlindSpots = analyses.reduce((count, a) => {
      const result = a.result as any;
      return count + (Array.isArray(result?.blind_spots) ? result.blind_spots.length : 0);
    }, 0);

    if (totalBlindSpots > 15) {
      return `You've surfaced ${totalBlindSpots} blind spots across your decisions. That's strategic thinking in action.`;
    }

    return null;
  }, [analyses]);

  if (!insight) return null;

  return (
    <div className="bg-[#F0F7FF] border-l-[3px] border-[#0047AB] rounded-lg p-4 mb-6">
      <p
        className="text-[14px] font-semibold text-[#0047AB] mb-1"
        style={{ fontFamily: "Inter" }}
      >
        Pattern Detected
      </p>
      <p className="text-[15px] text-[#333333] leading-relaxed">{insight}</p>
    </div>
  );
}
