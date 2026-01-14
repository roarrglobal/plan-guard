import { CheckCircle, AlertTriangle, Search, XCircle, ArrowRight } from "lucide-react";

export interface BottomLine {
  verdict: "proceed_confidently" | "proceed_carefully" | "investigate_first" | "reconsider_seriously";
  reasoning: string;
  change_condition: string;
  next_step: string;
}

interface BottomLineSectionProps {
  bottomLine: BottomLine;
}

const VERDICT_CONFIG = {
  proceed_confidently: {
    icon: CheckCircle,
    emoji: "✅",
    label: "Proceed with confidence",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-800",
  },
  proceed_carefully: {
    icon: AlertTriangle,
    emoji: "⚠️",
    label: "Proceed, but watch closely",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    textColor: "text-amber-800",
  },
  investigate_first: {
    icon: Search,
    emoji: "🔍",
    label: "Investigate before deciding",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    textColor: "text-blue-800",
  },
  reconsider_seriously: {
    icon: XCircle,
    emoji: "⛔",
    label: "Reconsider seriously",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    textColor: "text-red-800",
  },
};

export function BottomLineSection({ bottomLine }: BottomLineSectionProps) {
  const config = VERDICT_CONFIG[bottomLine.verdict] || VERDICT_CONFIG.proceed_carefully;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-5 mb-4`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px] font-bold text-[#666666] uppercase tracking-wider">
          THE BOTTOM LINE
        </span>
      </div>

      {/* Verdict */}
      <div className="flex items-start gap-3 mb-4">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div>
          <p className={`text-[16px] font-bold ${config.textColor}`}>
            {config.emoji} {config.label}
          </p>
          <p className="text-[14px] text-[#333333] mt-1">
            {bottomLine.reasoning}
          </p>
        </div>
      </div>

      {/* Change condition */}
      <div className="bg-white/60 rounded-lg p-3 mb-3">
        <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-1">
          What would change this assessment:
        </p>
        <p className="text-[14px] text-[#333333]">
          {bottomLine.change_condition}
        </p>
      </div>

      {/* Next step */}
      <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
        <ArrowRight className="w-4 h-4 text-[#0047AB] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-1">
            Your next step:
          </p>
          <p className="text-[14px] font-medium text-[#1A1A1A]">
            {bottomLine.next_step}
          </p>
        </div>
      </div>
    </div>
  );
}
