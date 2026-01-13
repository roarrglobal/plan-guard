import { Lightbulb } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface Analysis {
  id: string;
  original_input: string;
  result: Json;
  category: string | null;
  created_at: string;
}

interface DashboardInsightsProps {
  analyses: Analysis[];
}

export function DashboardInsights({ analyses }: DashboardInsightsProps) {
  if (analyses.length < 5) return null;

  // Generate insights based on analysis patterns
  const insights: string[] = [];

  // Category analysis
  const categoryCounts = analyses.reduce((acc, a) => {
    const cat = a.category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  
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

  const recentTopCategory = Object.entries(recentCategoryCounts).sort((a, b) => b[1] - a[1])[0];

  // Generate insight based on patterns
  if (recentTopCategory && recentCategoryCounts[recentTopCategory[0]] >= 3) {
    const categoryLabels: Record<string, string> = {
      career: "career",
      business: "business",
      personal: "personal",
      travel: "travel",
      other: "miscellaneous",
    };
    
    insights.push(
      `You've analyzed ${recentCategoryCounts[recentTopCategory[0]]} ${categoryLabels[recentTopCategory[0]]} decisions this month. Big changes ahead?`
    );
  }

  // Check for missing categories
  const hasPersonal = categoryCounts.personal > 0;
  const hasCareer = categoryCounts.career > 0;
  const hasBusiness = categoryCounts.business > 0;

  if (!hasPersonal && (hasCareer || hasBusiness)) {
    insights.push(
      "You haven't stress-tested any personal decisions. Work-life balance check?"
    );
  }

  // Count total blind spots
  const totalBlindSpots = analyses.reduce((count, a) => {
    const result = a.result as any;
    return count + (Array.isArray(result?.blind_spots) ? result.blind_spots.length : 0);
  }, 0);

  if (totalBlindSpots > 20) {
    const avgBlindSpots = Math.round(totalBlindSpots / analyses.length);
    insights.push(
      `Your analyses have surfaced ${totalBlindSpots} blind spots — an average of ${avgBlindSpots} per decision.`
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="bg-[#F0F7FF] border-l-[3px] border-[#0047AB] rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-[#0047AB] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-[#0047AB] mb-1">
            Patterns in Your Thinking
          </p>
          <p className="text-[14px] text-[#333333] leading-relaxed">
            {insights[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
