import { Award, Flame, Brain, TrendingUp, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
  progress?: string;
}

interface DashboardAchievementsProps {
  totalAnalyses: number;
  streak: number;
  accuracy: number;
  outcomes: number;
}

export function DashboardAchievements({ totalAnalyses, streak, accuracy, outcomes }: DashboardAchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: "first_snag",
      emoji: "🎯",
      name: "First Snag",
      description: "Complete your first analysis",
      earned: totalAnalyses >= 1,
    },
    {
      id: "streak_7",
      emoji: "🔥",
      name: "7-Day Streak",
      description: "Use Snag 7 days in a row",
      earned: streak >= 7,
      progress: streak < 7 ? `${streak}/7` : undefined,
    },
    {
      id: "pattern_spotter",
      emoji: "🧠",
      name: "Pattern Spotter",
      description: "Track 5 decision outcomes",
      earned: outcomes >= 5,
      progress: outcomes < 5 ? `${outcomes}/5` : undefined,
    },
    {
      id: "accuracy_80",
      emoji: "📈",
      name: "80% Accuracy",
      description: "Achieve 80% accuracy rate",
      earned: accuracy >= 80 && outcomes >= 3,
    },
    {
      id: "decision_master",
      emoji: "👑",
      name: "Decision Master",
      description: "Analyze 50 decisions",
      earned: totalAnalyses >= 50,
      progress: totalAnalyses < 50 ? `${totalAnalyses}/50` : undefined,
    },
  ];

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
        🏆 Achievements
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={cn(
              "min-w-[100px] flex-shrink-0 rounded-2xl p-4 text-center border transition-all",
              a.earned
                ? "bg-card border-primary/30 shadow-sm"
                : "bg-muted/50 border-border opacity-60"
            )}
          >
            <div className="text-3xl mb-2">{a.earned ? a.emoji : "🔒"}</div>
            <p className="text-xs font-semibold text-foreground leading-tight">{a.name}</p>
            {a.earned ? (
              <p className="text-[10px] text-success font-medium mt-1">✓ Earned</p>
            ) : a.progress ? (
              <p className="text-[10px] text-muted-foreground mt-1">{a.progress}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground mt-1">Locked</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
