import { Target, Eye, Flame } from "lucide-react";
import { useMemo } from "react";
import type { Json } from "@/integrations/supabase/types";

interface Analysis {
  id: string;
  original_input: string;
  result: Json;
  category: string | null;
  created_at: string;
}

interface DashboardStatsCardsProps {
  analyses: Analysis[];
}

export function DashboardStatsCards({ analyses }: DashboardStatsCardsProps) {
  const stats = useMemo(() => {
    const totalSnags = analyses.length;

    // Count blind spots across all analyses
    const blindSpotsCount = analyses.reduce((count, analysis) => {
      const result = analysis.result as any;
      const blindSpots = result?.blind_spots;
      return count + (Array.isArray(blindSpots) ? blindSpots.length : 0);
    }, 0);

    // Calculate this month's count for trend
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = analyses.filter(
      (a) => new Date(a.created_at) >= startOfMonth
    ).length;

    // Calculate streak (consecutive days with analyses)
    const calculateStreak = () => {
      if (analyses.length === 0) return 0;

      const sortedDates = analyses
        .map((a) => new Date(a.created_at).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index) // unique dates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // newest first

      let streak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      // Check if started today or yesterday
      if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
        return 0;
      }

      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(
          expectedDate.getDate() - streak - (sortedDates[0] === yesterday ? 1 : 0)
        );

        if (currentDate.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    };

    const streak = calculateStreak();

    return { totalSnags, blindSpotsCount, thisMonthCount, streak };
  }, [analyses]);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mb-6">
      {/* Card 1 - Your Snags */}
      <div className="min-w-[140px] flex-1 bg-white border border-[#E5E5E5] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-[#0047AB]" />
        </div>
        <p
          className="text-[36px] font-bold text-[#1A1A1A] leading-none"
          style={{ fontFamily: "Inter" }}
        >
          {stats.totalSnags}
        </p>
        <p className="text-[13px] text-[#666666] mt-1">decisions analyzed</p>
        {stats.thisMonthCount > 0 && (
          <p className="text-[12px] font-medium text-[#059669] mt-2">
            +{stats.thisMonthCount} this month
          </p>
        )}
      </div>

      {/* Card 2 - Blind Spots Found */}
      <div className="min-w-[140px] flex-1 bg-white border border-[#E5E5E5] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-[#D64045]" />
        </div>
        <p
          className="text-[36px] font-bold text-[#D64045] leading-none"
          style={{ fontFamily: "Inter" }}
        >
          {stats.blindSpotsCount}
        </p>
        <p className="text-[13px] text-[#666666] mt-1">blind spots surfaced</p>
      </div>

      {/* Card 3 - Decision Streak */}
      <div className="min-w-[140px] flex-1 bg-white border border-[#E5E5E5] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-[#D97706]" />
        </div>
        <p
          className="text-[36px] font-bold text-[#D97706] leading-none"
          style={{ fontFamily: "Inter" }}
        >
          {stats.streak > 0 ? `${stats.streak}` : "0"}
        </p>
        <p className="text-[13px] text-[#666666] mt-1">
          day{stats.streak !== 1 ? "s" : ""} streak
        </p>
      </div>
    </div>
  );
}
