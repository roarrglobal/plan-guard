import { AlertTriangle } from "lucide-react";

export function AnalysisDisclaimer() {
  return (
    <div className="bg-[#FFF9E6] border-l-[3px] border-[#D97706] rounded-r-lg p-3 md:p-4 mx-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
        <p className="text-[13px] text-[#666666] leading-relaxed" style={{ fontFamily: 'Inter' }}>
          This analysis surfaces possibilities, not predictions. Do not rely solely on this output. Consider multiple perspectives, consult professionals where appropriate, and apply your own judgment before making decisions.
        </p>
      </div>
    </div>
  );
}
