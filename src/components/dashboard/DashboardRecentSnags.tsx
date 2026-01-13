import { ChevronRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface Analysis {
  id: string;
  title: string | null;
  original_input: string;
  result: Json;
  created_at: string;
  category: string | null;
}

interface DashboardRecentSnagsProps {
  analyses: Analysis[];
  onViewAll: () => void;
  onSelectAnalysis: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  career: { bg: "#0047AB15", text: "#0047AB" },
  business: { bg: "#05966915", text: "#059669" },
  personal: { bg: "#7C3AED15", text: "#7C3AED" },
  travel: { bg: "#D9770615", text: "#D97706" },
  other: { bg: "#66666615", text: "#666666" },
};

export function DashboardRecentSnags({
  analyses,
  onViewAll,
  onSelectAnalysis,
}: DashboardRecentSnagsProps) {
  const navigate = useNavigate();

  if (analyses.length === 0) {
    return <DashboardRecentSnagsEmpty />;
  }

  const recentAnalyses = analyses.slice(0, 3);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-[16px] font-semibold text-[#1A1A1A]"
          style={{ fontFamily: "Inter" }}
        >
          Recent Snags
        </h2>
        {analyses.length > 3 && (
          <button
            onClick={onViewAll}
            className="text-[14px] font-medium text-[#0047AB] hover:underline"
          >
            View all →
          </button>
        )}
      </div>

      <div className="space-y-3">
        {recentAnalyses.map((analysis) => {
          const category = analysis.category || "other";
          const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

          return (
            <button
              key={analysis.id}
              onClick={() => onSelectAnalysis(analysis.id)}
              className="w-full bg-white border border-[#E5E5E5] rounded-lg p-4 text-left hover:border-[#CCCCCC] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Category pill */}
                  <span
                    className="inline-block text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {category}
                  </span>

                  {/* Preview text */}
                  <p className="text-[15px] text-[#333333] line-clamp-2 mb-2">
                    {analysis.original_input.slice(0, 80)}
                    {analysis.original_input.length > 80 && "..."}
                  </p>

                  {/* Date */}
                  <p className="text-[13px] text-[#999999]">
                    {formatDistanceToNow(new Date(analysis.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#CCCCCC] flex-shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DashboardRecentSnagsEmpty() {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col items-center justify-center py-8 text-center">
      {/* Illustration */}
      <div className="w-16 h-16 rounded-full bg-[#F0F7FF] flex items-center justify-center mb-4">
        <Target className="w-8 h-8 text-[#0047AB] opacity-60" strokeWidth={1.5} />
      </div>

      <p className="text-[15px] text-[#666666] mb-4 max-w-[280px]">
        No snags yet. What decision is keeping you up at night?
      </p>

      <button
        onClick={() => navigate("/analyze")}
        className="bg-[#BE3455] text-white rounded-lg px-6 py-3 text-[14px] font-medium hover:bg-[#A62D4A] transition-colors"
      >
        Run Your First Snag
      </button>
    </div>
  );
}
