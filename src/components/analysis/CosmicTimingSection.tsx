import { Sparkles, Calendar, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { AnalysisSection } from "./AnalysisSection";

export interface CosmicTiming {
  planetary_transits: { transit: string; relevance: string; influence: "favorable" | "neutral" | "unfavorable" }[];
  numerology_timing: { personal_year: number; personal_month: number; interpretation: string };
  favorable_periods: { period: string; reason: string }[];
  unfavorable_periods: { period: string; reason: string }[];
  timing_recommendation: string;
}

interface CosmicTimingSectionProps {
  cosmicTiming: CosmicTiming;
}

export function CosmicTimingSection({ cosmicTiming }: CosmicTimingSectionProps) {
  return (
    <AnalysisSection title="Cosmic Timing" accentColor="cobalt">
      <div className="space-y-4">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
            From Your Cosmic Readings
          </span>
        </div>

        {/* Planetary Transits */}
        {cosmicTiming.planetary_transits?.length > 0 && (
          <div>
            <h4 className="text-[13px] font-semibold text-[#333333] mb-2 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#0047AB]" />
              Relevant Planetary Transits
            </h4>
            <ul className="space-y-2">
              {cosmicTiming.planetary_transits.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px]">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    t.influence === "favorable" ? "bg-emerald-500" :
                    t.influence === "unfavorable" ? "bg-red-500" : "bg-amber-500"
                  }`} />
                  <div>
                    <span className="font-medium text-[#333333]">{t.transit}</span>
                    <p className="text-[13px] text-[#666666]">{t.relevance}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Numerology Timing */}
        {cosmicTiming.numerology_timing && (
          <div className="p-3 rounded-lg bg-[#F5F0FF] border border-[#E0D4F5]">
            <h4 className="text-[13px] font-semibold text-[#333333] mb-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#6B21A8]" />
              Numerology Timing
            </h4>
            <p className="text-[13px] text-[#555555]">
              Personal Year <span className="font-bold">#{cosmicTiming.numerology_timing.personal_year}</span>
              {cosmicTiming.numerology_timing.personal_month > 0 && (
                <> · Personal Month <span className="font-bold">#{cosmicTiming.numerology_timing.personal_month}</span></>
              )}
            </p>
            <p className="text-[13px] text-[#666666] mt-1">{cosmicTiming.numerology_timing.interpretation}</p>
          </div>
        )}

        {/* Favorable Periods */}
        {cosmicTiming.favorable_periods?.length > 0 && (
          <div>
            <h4 className="text-[13px] font-semibold text-emerald-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Favorable Periods
            </h4>
            <ul className="space-y-1.5">
              {cosmicTiming.favorable_periods.map((p, i) => (
                <li key={i} className="text-[14px] text-[#333333] flex items-start gap-2">
                  <span className="text-emerald-500 font-medium">✓</span>
                  <span><span className="font-medium">{p.period}:</span> {p.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unfavorable Periods */}
        {cosmicTiming.unfavorable_periods?.length > 0 && (
          <div>
            <h4 className="text-[13px] font-semibold text-red-700 mb-2 flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5" />
              Periods of Caution
            </h4>
            <ul className="space-y-1.5">
              {cosmicTiming.unfavorable_periods.map((p, i) => (
                <li key={i} className="text-[14px] text-[#333333] flex items-start gap-2">
                  <span className="text-red-500 font-medium">✗</span>
                  <span><span className="font-medium">{p.period}:</span> {p.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timing Recommendation */}
        {cosmicTiming.timing_recommendation && (
          <div className="p-3 rounded-lg bg-[#F0F7FF] border border-[#CCE0FF]">
            <h4 className="text-[13px] font-semibold text-[#0047AB] mb-1">
              ✨ Timing Recommendation
            </h4>
            <p className="text-[14px] text-[#333333] leading-relaxed">
              {cosmicTiming.timing_recommendation}
            </p>
          </div>
        )}
      </div>
    </AnalysisSection>
  );
}