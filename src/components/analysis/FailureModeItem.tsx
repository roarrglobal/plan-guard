import { cn } from "@/lib/utils";

interface FailureMode {
  what: string;
  mechanism: string;
  likelihood: "High" | "Medium" | "Low";
  impact: string;
  trigger_event?: string;
  second_order_effect?: string;
  third_order_effect?: string;
  confidence?: string;
}

interface FailureModeItemProps {
  mode: FailureMode;
  index: number;
}

export function FailureModeItem({ mode, index }: FailureModeItemProps) {
  const likelihoodColors = {
    High: "text-[#D64045]",
    Medium: "text-[#D97706]",
    Low: "text-[#666666]",
  };

  const confidenceColors: Record<string, string> = {
    "HIGH CONFIDENCE": "text-[#D64045]",
    "MEDIUM CONFIDENCE": "text-[#D97706]",
    "CONTEXT-DEPENDENT": "text-[#666666]",
  };

  return (
    <div className="py-3 border-b border-[#E5E5E5] last:border-b-0">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-[15px] font-semibold text-[#333333]">
          {index}.
        </span>
        <span className="text-[15px] font-semibold text-[#333333]">
          {mode.what}
        </span>
      </div>

      <div className="space-y-2 pl-5">
        {mode.trigger_event && (
          <div>
            <span className="text-[13px] font-semibold text-[#666666]">
              Trigger:{" "}
            </span>
            <span className="text-[15px] text-[#333333]">{mode.trigger_event}</span>
          </div>
        )}

        <div>
          <span className="text-[13px] font-semibold text-[#666666]">
            Mechanism:{" "}
          </span>
          <span className="text-[15px] text-[#333333]">{mode.mechanism}</span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <span className="text-[13px] font-semibold text-[#666666]">
              Likelihood:{" "}
            </span>
            <span
              className={cn(
                "text-[15px] font-medium",
                likelihoodColors[mode.likelihood]
              )}
            >
              {mode.likelihood}
            </span>
          </div>

          {mode.confidence && (
            <div>
              <span className="text-[13px] font-semibold text-[#666666]">
                Confidence:{" "}
              </span>
              <span
                className={cn(
                  "text-[13px] font-medium",
                  confidenceColors[mode.confidence] || "text-[#666666]"
                )}
              >
                {mode.confidence}
              </span>
            </div>
          )}
        </div>

        {mode.second_order_effect && (
          <div>
            <span className="text-[13px] font-semibold text-[#666666]">
              2nd Order Effect:{" "}
            </span>
            <span className="text-[15px] text-[#333333]">{mode.second_order_effect}</span>
          </div>
        )}

        {mode.third_order_effect && (
          <div>
            <span className="text-[13px] font-semibold text-[#666666]">
              3rd Order Effect:{" "}
            </span>
            <span className="text-[15px] text-[#333333]">{mode.third_order_effect}</span>
          </div>
        )}

        {mode.impact && !mode.second_order_effect && (
          <div>
            <span className="text-[13px] font-semibold text-[#666666]">
              Impact:{" "}
            </span>
            <span className="text-[15px] text-[#333333]">{mode.impact}</span>
          </div>
        )}
      </div>
    </div>
  );
}
