import { useState, useEffect, useMemo } from "react";
import { X, Target, Eye, TrendingUp, Calendar, Briefcase, Building2, Heart, Plane, HelpCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface Analysis {
  id: string;
  original_input: string;
  result: Json;
  category: string | null;
  created_at: string;
}

interface MonthlyRecapModalProps {
  analyses: Analysis[];
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  career: { icon: Briefcase, color: "#0047AB", bgColor: "#EBF2FF" },
  business: { icon: Building2, color: "#059669", bgColor: "#D1FAE5" },
  personal: { icon: Heart, color: "#7C3AED", bgColor: "#EDE9FE" },
  travel: { icon: Plane, color: "#D97706", bgColor: "#FEF3C7" },
  other: { icon: HelpCircle, color: "#666666", bgColor: "#F3F4F6" },
};

export function MonthlyRecapModal({ analyses, onClose }: MonthlyRecapModalProps) {
  // Get last month's data
  const lastMonth = subMonths(new Date(), 1);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);
  const monthName = format(lastMonth, "MMMM yyyy");

  // Filter analyses from last month
  const lastMonthAnalyses = useMemo(() => {
    return analyses.filter((a) => {
      const date = new Date(a.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
  }, [analyses, lastMonthStart, lastMonthEnd]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = lastMonthAnalyses.length;
    
    // Category breakdown
    const categories = lastMonthAnalyses.reduce((acc, a) => {
      const cat = a.category || "other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count blind spots
    const blindSpots = lastMonthAnalyses.reduce((count, a) => {
      const result = a.result as any;
      return count + (Array.isArray(result?.blind_spots) ? result.blind_spots.length : 0);
    }, 0);

    // Count failure modes and find most common
    const failureModeFrequency: Record<string, number> = {};
    lastMonthAnalyses.forEach((a) => {
      const result = a.result as any;
      if (Array.isArray(result?.failure_modes)) {
        result.failure_modes.forEach((fm: any) => {
          const likelihood = fm.likelihood || "Medium";
          failureModeFrequency[likelihood] = (failureModeFrequency[likelihood] || 0) + 1;
        });
      }
    });

    const mostCommonLikelihood = Object.entries(failureModeFrequency)
      .sort((a, b) => b[1] - a[1])[0];

    // Find top category
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      categories,
      blindSpots,
      mostCommonLikelihood: mostCommonLikelihood?.[0] || null,
      topCategory: topCategory?.[0] || null,
    };
  }, [lastMonthAnalyses]);

  // Sort categories by count for display
  const sortedCategories = useMemo(() => {
    return Object.entries(stats.categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [stats.categories]);

  if (lastMonthAnalyses.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-[400px] w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-[#0047AB] to-[#7C3AED] px-6 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-[14px] font-medium opacity-90">Monthly Recap</span>
          </div>
          
          <h2 className="text-[24px] font-bold" style={{ fontFamily: 'Inter' }}>
            Your {monthName}
          </h2>
        </div>

        {/* Stats */}
        <div className="px-6 py-6 space-y-6">
          {/* Main stat */}
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EBF2FF] mb-3">
              <Target className="w-8 h-8 text-[#0047AB]" />
            </div>
            <p className="text-[40px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
              {stats.total}
            </p>
            <p className="text-[15px] text-[#666666]">
              decision{stats.total !== 1 ? "s" : ""} stress-tested
            </p>
          </div>

          {/* Secondary stats row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FEF2F2] rounded-xl p-4 text-center">
              <Eye className="w-5 h-5 text-[#D64045] mx-auto mb-2" />
              <p className="text-[24px] font-bold text-[#D64045]">{stats.blindSpots}</p>
              <p className="text-[12px] text-[#666666]">blind spots found</p>
            </div>
            
            <div className="bg-[#F0FDF4] rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-[#059669] mx-auto mb-2" />
              <p className="text-[14px] font-bold text-[#059669] capitalize">
                {stats.mostCommonLikelihood || "—"}
              </p>
              <p className="text-[12px] text-[#666666]">risk level trend</p>
            </div>
          </div>

          {/* Category breakdown */}
          {sortedCategories.length > 0 && (
            <div>
              <p className="text-[13px] font-semibold text-[#666666] mb-3">Category Breakdown</p>
              <div className="space-y-2">
                {sortedCategories.map(([category, count]) => {
                  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
                  const Icon = config.icon;
                  const percentage = Math.round((count / stats.total) * 100);
                  
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-medium text-[#333333] capitalize">
                            {category}
                          </span>
                          <span className="text-[12px] text-[#666666]">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#F2F2F2] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: config.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Motivational message */}
          <div className="bg-[#F8F8F8] rounded-xl p-4 text-center">
            <p className="text-[14px] text-[#333333]">
              {stats.total >= 10 
                ? "🏆 Incredible month! You're building serious decision-making skills."
                : stats.total >= 5
                ? "💪 Great progress! Keep stress-testing those important decisions."
                : "🎯 Every decision analyzed is a step toward better judgment."}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-[#0047AB] text-white font-medium py-3 rounded-xl hover:bg-[#003A8C] transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to manage showing the monthly recap
export function useMonthlyRecap() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkShowRecap = () => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
      const lastShownMonth = localStorage.getItem("snag_recap_shown");
      
      // Show if it's the first 7 days of the month and we haven't shown it this month
      const isFirstWeek = now.getDate() <= 7;
      const notShownThisMonth = lastShownMonth !== currentMonth;
      
      // Also check if last month had any activity (we'll check this in the component)
      if (isFirstWeek && notShownThisMonth) {
        setShouldShow(true);
      }
    };

    // Delay check slightly to let data load
    const timer = setTimeout(checkShowRecap, 1000);
    return () => clearTimeout(timer);
  }, []);

  const markAsShown = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    localStorage.setItem("snag_recap_shown", currentMonth);
    setShouldShow(false);
  };

  return { shouldShow, markAsShown };
}
