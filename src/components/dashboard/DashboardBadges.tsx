import { Award, Flame, Brain, Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardBadgesProps {
  totalAnalyses: number;
  thisMonthCount: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  threshold: number;
  checkFn: (total: number, monthly: number) => boolean;
}

const BADGES: Badge[] = [
  {
    id: "first_snag",
    name: "First Snag",
    description: "Completed your first analysis",
    icon: Award,
    color: "#0047AB",
    bgColor: "#EBF2FF",
    threshold: 1,
    checkFn: (total) => total >= 1,
  },
  {
    id: "habit_forming",
    name: "Habit Forming",
    description: "5 analyses in one month",
    icon: Flame,
    color: "#D97706",
    bgColor: "#FEF3C7",
    threshold: 5,
    checkFn: (_, monthly) => monthly >= 5,
  },
  {
    id: "strategic_thinker",
    name: "Strategic Thinker",
    description: "25 lifetime analyses",
    icon: Brain,
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    threshold: 25,
    checkFn: (total) => total >= 25,
  },
  {
    id: "decision_master",
    name: "Decision Master",
    description: "100 lifetime analyses",
    icon: Crown,
    color: "#059669",
    bgColor: "#D1FAE5",
    threshold: 100,
    checkFn: (total) => total >= 100,
  },
];

export function DashboardBadges({ totalAnalyses, thisMonthCount }: DashboardBadgesProps) {
  const earnedBadges = BADGES.filter((badge) => badge.checkFn(totalAnalyses, thisMonthCount));

  if (earnedBadges.length === 0) return null;

  return (
    <div className="flex gap-2 mb-6">
      {earnedBadges.map((badge) => {
        const Icon = badge.icon;
        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-help transition-transform hover:scale-110"
                style={{ backgroundColor: badge.bgColor }}
              >
                <Icon className="w-5 h-5" style={{ color: badge.color }} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{badge.name}</p>
              <p className="text-[12px] text-muted-foreground">{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
