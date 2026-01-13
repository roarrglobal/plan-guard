import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const OUTCOME_OPTIONS = [
  { id: "great", emoji: "😄", label: "Great" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "poor", emoji: "😔", label: "Poor" },
  { id: "bad", emoji: "😢", label: "Bad" },
];

const CATEGORY_OPTIONS = [
  { id: "meeting", label: "Meeting" },
  { id: "project", label: "Project" },
  { id: "decision", label: "Decision" },
  { id: "day", label: "Day" },
  { id: "conversation", label: "Conversation" },
  { id: "other", label: "Other" },
];

export default function QuickRetroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const prefillCategory = (location.state as { category?: string })?.category || "";

  const [description, setDescription] = useState("");
  const [outcomeRating, setOutcomeRating] = useState<string>("");
  const [whatWorked, setWhatWorked] = useState("");
  const [whatDidnt, setWhatDidnt] = useState("");
  const [lesson, setLesson] = useState("");
  const [category, setCategory] = useState(prefillCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiNudge, setAiNudge] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const isValid = description.trim() && outcomeRating && lesson.trim() && category;

  const handleSubmit = async () => {
    if (!user || !isValid) return;

    setIsSubmitting(true);
    try {
      // First, get AI nudge
      let nudge: string | null = null;
      try {
        const { data: nudgeData } = await supabase.functions.invoke("analyze-journal", {
          body: {
            action: "quick_retro_nudge",
            description,
            whatWorked,
            whatDidnt,
            lesson,
            category,
          },
        });
        nudge = nudgeData?.nudge || null;
      } catch (err) {
        console.error("Failed to get AI nudge:", err);
      }

      // Save the quick retro
      const { data, error } = await supabase
        .from("quick_retros")
        .insert({
          user_id: user.id,
          description,
          outcome_rating: outcomeRating,
          what_worked: whatWorked || null,
          what_didnt: whatDidnt || null,
          lesson,
          category,
          ai_nudge: nudge,
        })
        .select()
        .single();

      if (error) throw error;

      setAiNudge(nudge);
      setSavedId(data.id);
      toast({ title: "Quick Retro saved!" });
    } catch (err) {
      console.error("Failed to save quick retro:", err);
      toast({
        title: "Error saving Quick Retro",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Success state
  if (savedId) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Quick Retro Saved!</h2>
              <p className="text-sm text-muted-foreground">
                Great job reflecting on what happened.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-muted rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">
                  {OUTCOME_OPTIONS.find(o => o.id === outcomeRating)?.emoji}
                </span>
                <span className="text-sm font-medium capitalize">{category}</span>
              </div>
              <p className="text-sm text-foreground mb-3">{description}</p>
              <div className="space-y-2 text-sm">
                {whatWorked && (
                  <p><span className="text-success">✅</span> {whatWorked}</p>
                )}
                {whatDidnt && (
                  <p><span className="text-destructive">❌</span> {whatDidnt}</p>
                )}
                <p><span className="text-primary">💡</span> {lesson}</p>
              </div>
            </div>

            {/* AI Nudge */}
            {aiNudge && (
              <div className="bg-primary/5 border-l-3 border-primary rounded-lg p-4 mb-6">
                <p className="text-sm text-foreground">
                  <span className="font-medium">💭 Quick insight:</span> {aiNudge}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/post-mortem/new", { 
                  state: { 
                    prefillContent: description,
                    prefillWhatWorked: whatWorked,
                    prefillWhatDidnt: whatDidnt,
                    prefillLesson: lesson,
                  } 
                })}
                variant="outline"
                className="w-full gap-2"
              >
                Expand to Full Post-Mortem
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            <h1 className="text-xl font-bold text-foreground">Quick Retro</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* What happened */}
          <div className="space-y-2">
            <Label>What happened?</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what occurred..."
              className="min-h-[80px]"
            />
          </div>

          {/* Outcome rating */}
          <div className="space-y-2">
            <Label>How did it go?</Label>
            <div className="flex gap-2">
              {OUTCOME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setOutcomeRating(option.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all",
                    outcomeRating === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs text-muted-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* What worked */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="text-success">✅</span>
              One thing that worked
            </Label>
            <Input
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="What went well?"
            />
          </div>

          {/* What didn't */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="text-destructive">❌</span>
              One thing that didn't
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              value={whatDidnt}
              onChange={(e) => setWhatDidnt(e.target.value)}
              placeholder="What could have been better?"
            />
          </div>

          {/* Lesson */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="text-primary">💡</span>
              One lesson to carry forward
            </Label>
            <Input
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="What will you do differently next time?"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setCategory(option.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    category === option.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Quick Retro"
            )}
          </Button>

          {/* Link to full post-mortem */}
          <p className="text-center text-sm text-muted-foreground">
            Want deeper analysis?{" "}
            <button
              onClick={() => navigate("/post-mortem/new")}
              className="text-primary hover:underline"
            >
              Run Full Post-Mortem →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
