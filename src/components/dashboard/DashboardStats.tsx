import { Target, Eye, Briefcase, Plane, Heart, Building2, HelpCircle } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface Analysis {
  id: string;
  original_input: string;
  result: Json;
  category: string | null;
}

interface DashboardStatsProps {
  analyses: Analysis[];
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  career: Briefcase,
  business: Building2,
  personal: Heart,
  travel: Plane,
  other: HelpCircle,
};

export function DashboardStats({ analyses }: DashboardStatsProps) {
  // Calculate stats
  const totalSnags = analyses.length;
  
  // Count blind spots across all analyses
  const blindSpotsCount = analyses.reduce((count, analysis) => {
    const result = analysis.result as any;
    const blindSpots = result?.blind_spots;
    return count + (Array.isArray(blindSpots) ? blindSpots.length : 0);
  }, 0);

  // Find top category
  const categoryCounts = analyses.reduce((acc, a) => {
    const cat = a.category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const TopCategoryIcon = topCategory ? CATEGORY_ICONS[topCategory[0]] || HelpCircle : Target;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* Total Snags */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
        <div className="flex items-start justify-between mb-2">
          <Target className="w-5 h-5 text-[#0047AB]" />
        </div>
        <p className="text-[28px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
          {totalSnags}
        </p>
        <p className="text-[12px] text-[#666666]">
          decisions stress-tested
        </p>
      </div>

      {/* Blind Spots Found */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
        <div className="flex items-start justify-between mb-2">
          <Eye className="w-5 h-5 text-[#D64045]" />
        </div>
        <p className="text-[28px] font-bold text-[#D64045]" style={{ fontFamily: 'Inter' }}>
          {blindSpotsCount}
        </p>
        <p className="text-[12px] text-[#666666]">
          blind spots surfaced
        </p>
      </div>

      {/* Top Category */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
        <div className="flex items-start justify-between mb-2">
          <TopCategoryIcon className="w-5 h-5 text-[#0047AB]" />
        </div>
        <p className="text-[16px] font-bold text-[#0047AB] capitalize" style={{ fontFamily: 'Inter' }}>
          {topCategory ? topCategory[0] : "—"}
        </p>
        <p className="text-[12px] text-[#666666]">
          most-snagged area
        </p>
      </div>
    </div>
  );
}
