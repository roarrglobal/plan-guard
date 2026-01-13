import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisSectionProps {
  title: string;
  accentColor: "cobalt" | "red" | "amber" | "gray";
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const accentColors = {
  cobalt: "border-l-[#0047AB]",
  red: "border-l-[#D64045]",
  amber: "border-l-[#D97706]",
  gray: "border-l-[#666666]",
};

export function AnalysisSection({
  title,
  accentColor,
  children,
  defaultOpen = true,
}: AnalysisSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "bg-white border border-[#E5E5E5] rounded-lg mb-3 overflow-hidden border-l-[3px]",
        accentColors[accentColor]
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 min-h-[48px] text-left"
      >
        <span className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-wide">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-[#999999] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}
