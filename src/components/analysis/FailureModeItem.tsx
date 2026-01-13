import { cn } from "@/lib/utils";

interface FailureMode {
  what: string;
  mechanism: string;
  likelihood: "High" | "Medium" | "Low";
  impact: string;
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

  return (
    <div className="py-3 border-b border-[#E5E5E5] last:border-b-0">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-[15px] font-semibold text-[#333333]">
          {index}.
        </span>
        <span className="text-[15px] font-semibold text-[#333333]">
          {mode.what}
        </span>
      </div>

      <div className="space-y-2 pl-5">
        <div>
          <span className="text-[13px] font-semibold text-[#666666]">
            Mechanism:{" "}
          </span>
          <span className="text-[15px] text-[#333333]">{mode.mechanism}</span>
        </div>

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

        <div>
          <span className="text-[13px] font-semibold text-[#666666]">
            Impact:{" "}
          </span>
          <span className="text-[15px] text-[#333333]">{mode.impact}</span>
        </div>
      </div>
    </div>
  );
}
