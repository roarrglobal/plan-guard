import { useState } from "react";
import { ChevronDown, AlertTriangle, Eye, Gauge, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisCardProps {
  title: string;
  icon: "blindspots" | "failures" | "warnings" | "kill" | "question";
  children: React.ReactNode;
  defaultOpen?: boolean;
  highlight?: boolean;
  className?: string;
}

const iconMap = {
  blindspots: Eye,
  failures: AlertTriangle,
  warnings: Gauge,
  kill: XCircle,
  question: HelpCircle,
};

const colorMap = {
  blindspots: "text-warning",
  failures: "text-destructive",
  warnings: "text-primary",
  kill: "text-destructive",
  question: "text-accent",
};

export function AnalysisCard({
  title,
  icon,
  children,
  defaultOpen = true,
  highlight = false,
  className,
}: AnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = iconMap[icon];

  return (
    <div
      className={cn(
        "analysis-card overflow-hidden",
        highlight && "ring-2 ring-accent/50 bg-accent/5",
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 touch-target text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5", colorMap[icon])} />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-border pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
