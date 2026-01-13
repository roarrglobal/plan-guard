import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FromJournalBadgeProps {
  journalEntryId: string;
  onClick?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

export function FromJournalBadge({ 
  journalEntryId, 
  onClick, 
  className,
  compact = false 
}: FromJournalBadgeProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(journalEntryId);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 bg-primary/5 text-primary border border-primary/20 rounded-full font-medium transition-colors hover:bg-primary/10",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <BookOpen className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
      <span>From Journal</span>
    </button>
  );
}

interface AnalysisLinkedBadgeProps {
  type: "pre_mortem" | "post_mortem";
  analysisId: string;
  onClick?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

export function AnalysisLinkedBadge({
  type,
  analysisId,
  onClick,
  className,
  compact = false,
}: AnalysisLinkedBadgeProps) {
  const isPreMortem = type === "pre_mortem";
  const icon = isPreMortem ? "🎯" : "🔍";
  const label = isPreMortem ? "Pre-Mortem run" : "Post-Mortem run";
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(analysisId);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        isPreMortem 
          ? "bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10"
          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
