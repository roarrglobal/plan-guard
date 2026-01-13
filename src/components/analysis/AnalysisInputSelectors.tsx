import { cn } from "@/lib/utils";
import { Briefcase, User, Plane, Lightbulb, Target, Clock, AlertTriangle } from "lucide-react";

interface AnalysisInputSelectorsProps {
  category: string;
  onCategoryChange: (category: string) => void;
  stakes: string;
  onStakesChange: (stakes: string) => void;
  timeline: string;
  onTimelineChange: (timeline: string) => void;
}

const CATEGORIES = [
  { id: "career", label: "Career", icon: Briefcase },
  { id: "business", label: "Business", icon: Target },
  { id: "personal", label: "Personal", icon: User },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "other", label: "Other", icon: Lightbulb },
];

const STAKES = [
  { id: "low", label: "Low", description: "Easily reversible" },
  { id: "medium", label: "Medium", description: "Some effort to undo" },
  { id: "high", label: "High", description: "Hard to reverse" },
];

const TIMELINES = [
  { id: "immediate", label: "This week" },
  { id: "short", label: "1-3 months" },
  { id: "medium", label: "3-12 months" },
  { id: "long", label: "1+ years" },
];

export function AnalysisInputSelectors({
  category,
  onCategoryChange,
  stakes,
  onStakesChange,
  timeline,
  onTimelineChange,
}: AnalysisInputSelectorsProps) {
  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stakes Selection */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Stakes Level
        </label>
        <div className="flex gap-2">
          {STAKES.map((stake) => {
            const isSelected = stakes === stake.id;
            return (
              <button
                key={stake.id}
                type="button"
                onClick={() => onStakesChange(stake.id)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all text-center",
                  isSelected
                    ? stake.id === "high"
                      ? "bg-destructive text-destructive-foreground"
                      : stake.id === "medium"
                      ? "bg-warning text-warning-foreground"
                      : "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                )}
              >
                {stake.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Selection */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timeline
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMELINES.map((tl) => {
            const isSelected = timeline === tl.id;
            return (
              <button
                key={tl.id}
                type="button"
                onClick={() => onTimelineChange(tl.id)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                )}
              >
                {tl.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
