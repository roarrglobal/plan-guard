import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, startOfWeek, addDays } from "date-fns";
import { Plus, Flame, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  category: string | null;
  frequency: string;
  current_streak: number | null;
  best_streak: number | null;
  is_active: boolean | null;
}

interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_at: string;
}

const CATEGORIES = [
  "Health",
  "Productivity",
  "Mindfulness",
  "Learning",
  "Fitness",
  "Custom",
];

export default function HabitsPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Create form
  const [newHabit, setNewHabit] = useState({
    name: "",
    category: "",
    frequency: "daily",
    why_it_matters: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    const [habitsRes, completionsRes] = await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("habit_completions")
        .select("*")
        .gte("completed_at", format(startOfWeek(new Date()), "yyyy-MM-dd")),
    ]);

    if (habitsRes.error) {
      toast({
        title: "Error loading habits",
        description: habitsRes.error.message,
        variant: "destructive",
      });
    } else {
      setHabits(habitsRes.data || []);
    }

    if (!completionsRes.error) {
      setCompletions(completionsRes.data || []);
    }

    setIsLoading(false);
  };

  const createHabit = async () => {
    if (!user || !newHabit.name) return;

    const { error } = await supabase
      .from("habits")
      .insert([{
        user_id: user.id,
        name: newHabit.name,
        category: newHabit.category || null,
        frequency: newHabit.frequency,
        why_it_matters: newHabit.why_it_matters || null,
      }]);

    if (error) {
      toast({
        title: "Error creating habit",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Habit created" });
      setNewHabit({ name: "", category: "", frequency: "daily", why_it_matters: "" });
      setIsCreateOpen(false);
      fetchData();
    }
  };

  const toggleCompletion = async (habitId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const existing = completions.find(
      (c) => c.habit_id === habitId && c.completed_at === today
    );

    if (existing) {
      // Remove completion
      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("id", existing.id);

      if (!error) {
        setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
        toast({ title: "Completion removed" });
      }
    } else {
      // Add completion
      const { data, error } = await supabase
        .from("habit_completions")
        .insert([{
          user_id: user!.id,
          habit_id: habitId,
          completed_at: today,
        }])
        .select()
        .single();

      if (!error && data) {
        setCompletions((prev) => [...prev, data]);
        toast({ title: "Habit completed! 🎉" });
      }
    }

    // Refresh to get updated streaks
    fetchData();
  };

  const isCompletedToday = (habitId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return completions.some(
      (c) => c.habit_id === habitId && c.completed_at === today
    );
  };

  const getWeekCompletions = (habitId: string) => {
    const weekStart = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const date = format(addDays(weekStart, i), "yyyy-MM-dd");
      return completions.some(
        (c) => c.habit_id === habitId && c.completed_at === date
      );
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Habits</h1>
            <p className="text-sm text-muted-foreground mt-1">Build consistency, track progress</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Habit name</Label>
                  <Input
                    value={newHabit.name}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Morning meditation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newHabit.category}
                    onValueChange={(value) => setNewHabit(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={newHabit.frequency}
                    onValueChange={(value) => setNewHabit(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Why this matters (optional)</Label>
                  <Textarea
                    value={newHabit.why_it_matters}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, why_it_matters: e.target.value }))}
                    placeholder="Your motivation for building this habit..."
                  />
                </div>
                <Button onClick={createHabit} className="w-full" disabled={!newHabit.name}>
                  Create Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Today's Habits */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Today's Habits</h2>
          
          {habits.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">No habits yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building positive habits today
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const completed = isCompletedToday(habit.id);
                const weekStatus = getWeekCompletions(habit.id);
                
                return (
                  <div
                    key={habit.id}
                    className={cn(
                      "bg-card border rounded-lg p-4 transition-colors",
                      completed && "border-green-200 bg-green-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleCompletion(habit.id)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5",
                            completed
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-muted-foreground/30 hover:border-primary"
                          )}
                        >
                          {completed && <Check className="w-4 h-4" />}
                        </button>
                        <div>
                          <h3 className={cn(
                            "font-medium",
                            completed && "text-muted-foreground line-through"
                          )}>
                            {habit.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-muted-foreground">
                              {habit.current_streak || 0} day streak
                            </span>
                            {habit.best_streak && habit.best_streak > 0 && (
                              <span className="text-xs text-muted-foreground">
                                | Best: {habit.best_streak} days
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Week view */}
                      <div className="flex gap-1">
                        {weekStatus.map((done, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "w-4 h-4 rounded-full",
                              done ? "bg-primary" : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
