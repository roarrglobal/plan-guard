import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Plus, Flame, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  current_streak: number | null;
}

interface HabitCompletion {
  habit_id: string;
}

export function DashboardTodaysHabits() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");

    const [habitsRes, completionsRes] = await Promise.all([
      supabase
        .from("habits")
        .select("id, name, current_streak")
        .eq("is_active", true)
        .limit(5),
      supabase
        .from("habit_completions")
        .select("habit_id")
        .eq("completed_at", today),
    ]);

    if (habitsRes.data) setHabits(habitsRes.data);
    if (completionsRes.data) setCompletions(completionsRes.data);
    setIsLoading(false);
  };

  const toggleCompletion = async (habitId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const isCompleted = completions.some(c => c.habit_id === habitId);

    if (isCompleted) {
      await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habitId)
        .eq("completed_at", today);
      setCompletions(prev => prev.filter(c => c.habit_id !== habitId));
    } else {
      await supabase
        .from("habit_completions")
        .insert([{ user_id: user!.id, habit_id: habitId, completed_at: today }]);
      setCompletions(prev => [...prev, { habit_id: habitId }]);
    }
    fetchData(); // Refresh to get updated streaks
  };

  if (isLoading) return null;
  if (habits.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Today's Habits</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/habits")}
          className="text-xs gap-1"
        >
          <Plus className="w-3 h-3" />
          Add habit
        </Button>
      </div>
      
      <div className="space-y-2">
        {habits.map((habit) => {
          const isCompleted = completions.some(c => c.habit_id === habit.id);
          
          return (
            <div
              key={habit.id}
              className={cn(
                "flex items-center justify-between bg-card border rounded-lg px-3 py-2.5",
                isCompleted && "border-green-200 bg-green-50/50"
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCompletion(habit.id)}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-muted-foreground/30 hover:border-primary"
                  )}
                >
                  {isCompleted && <Check className="w-3 h-3" />}
                </button>
                <span className={cn(
                  "text-sm",
                  isCompleted && "text-muted-foreground line-through"
                )}>
                  {habit.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="w-3 h-3 text-orange-500" />
                {habit.current_streak || 0} days
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
