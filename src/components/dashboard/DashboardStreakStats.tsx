import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Zap, Target, BarChart3 } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";

interface StreakStatsProps {
  analysesCount: number;
}

export function DashboardStreakStats({ analysesCount }: StreakStatsProps) {
  const { user } = useAuth();
  const { usage } = useUsage();
  const [journalStreak, setJournalStreak] = useState(0);
  const [decisionsThisMonth, setDecisionsThisMonth] = useState(0);
  const [outcomesTracked, setOutcomesTracked] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    // Get journal streak (count consecutive days with entries)
    const { data: journalData } = await supabase
      .from("journal_entries")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    if (journalData) {
      // Simple streak calculation
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const hasEntry = journalData.some(entry => 
          entry.created_at.startsWith(dateStr)
        );
        
        if (hasEntry) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      setJournalStreak(streak);
    }

    // Get decisions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count: decisionsCount } = await supabase
      .from("decisions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    setDecisionsThisMonth(decisionsCount || 0);

    // Get outcomes tracked
    const { count: outcomesCount } = await supabase
      .from("decisions")
      .select("*", { count: "exact", head: true })
      .not("outcome_status", "is", null);

    setOutcomesTracked(outcomesCount || 0);
  };

  const stats = [
    {
      icon: Flame,
      value: `${journalStreak}`,
      label: "day journaling streak",
      trend: journalStreak > 7 ? "🔥 On fire!" : undefined,
      color: "text-orange-500",
    },
    {
      icon: Zap,
      value: decisionsThisMonth.toString(),
      label: "decisions this month",
      color: "text-yellow-500",
    },
    {
      icon: Target,
      value: `${usage?.analyses_used || 0}/${usage?.analyses_limit || 50}`,
      label: "deep snags",
      color: "text-primary",
      progress: usage ? (usage.analyses_used || 0) / (usage.analyses_limit || 50) : 0,
    },
    {
      icon: BarChart3,
      value: outcomesTracked.toString(),
      label: "outcomes tracked",
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            {stat.trend && (
              <p className="text-xs font-medium text-orange-500 mt-1">{stat.trend}</p>
            )}
            {stat.progress !== undefined && (
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(stat.progress * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
