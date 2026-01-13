import { useState } from "react";
import { Sparkles, Loader2, X, Lightbulb, Heart, Target, Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface JournalAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: {
    id: string;
    content: any;
    entry_type: string;
    mood?: string | null;
  };
}

interface AnalysisResult {
  summary?: string;
  emotional_landscape?: {
    primary_mood?: string;
    underlying_emotions?: string[];
    emotional_trajectory?: string;
    energy_level?: string;
  };
  key_themes?: Array<{
    theme: string;
    significance: string;
    pattern_note?: string;
  }>;
  insights?: Array<{
    insight: string;
    evidence?: string;
    action_potential?: string;
  }>;
  blind_spots?: Array<{
    area: string;
    gentle_prompt: string;
  }>;
  gratitude_analysis?: {
    depth_score?: string;
    specificity?: string;
    suggestions?: string[];
  };
  manifestation_analysis?: {
    clarity_score?: string;
    alignment_check?: string;
    potential_blockers?: string[];
    amplifiers?: string[];
  };
  growth_opportunities?: Array<{
    area: string;
    current_state?: string;
    next_step?: string;
  }>;
  reflection_prompts?: string[];
  affirmation?: string;
}

export function JournalAnalysisModal({
  open,
  onOpenChange,
  entry,
}: JournalAnalysisModalProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-journal", {
        body: {
          content: entry.content,
          entryType: entry.entry_type,
          mood: entry.mood,
        },
      });

      if (error) throw error;
      
      setAnalysis(data);
    } catch (err) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => setAnalysis(null), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Journal Analysis
          </DialogTitle>
        </DialogHeader>

        {!analysis && !isAnalyzing && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Analyze This Entry</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Get AI-powered insights about your thoughts, emotions, and patterns in this journal entry.
            </p>
            <Button onClick={handleAnalyze} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Analysis
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing your entry...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-5">
            {/* Summary */}
            {analysis.summary && (
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm">{analysis.summary}</p>
              </div>
            )}

            {/* Emotional Landscape */}
            {analysis.emotional_landscape && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Emotional Landscape
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {analysis.emotional_landscape.primary_mood && (
                    <div className="bg-pink-50 rounded-lg p-3">
                      <p className="text-xs text-pink-600 font-medium">Primary Mood</p>
                      <p className="text-sm text-pink-800 capitalize">{analysis.emotional_landscape.primary_mood}</p>
                    </div>
                  )}
                  {analysis.emotional_landscape.energy_level && (
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs text-amber-600 font-medium">Energy Level</p>
                      <p className="text-sm text-amber-800 capitalize">{analysis.emotional_landscape.energy_level}</p>
                    </div>
                  )}
                </div>
                {analysis.emotional_landscape.underlying_emotions && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {analysis.emotional_landscape.underlying_emotions.map((emotion, idx) => (
                      <span key={idx} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {emotion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key Themes */}
            {analysis.key_themes && analysis.key_themes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Key Themes
                </h4>
                <div className="space-y-2">
                  {analysis.key_themes.map((theme, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="font-medium text-sm text-blue-800">{theme.theme}</p>
                      <p className="text-xs text-blue-600 mt-1">{theme.significance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {analysis.insights && analysis.insights.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Insights
                </h4>
                <div className="space-y-2">
                  {analysis.insights.map((insight, idx) => (
                    <div key={idx} className="bg-card border rounded-lg p-3">
                      <p className="text-sm font-medium">{insight.insight}</p>
                      {insight.action_potential && (
                        <p className="text-xs text-muted-foreground mt-1">→ {insight.action_potential}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blind Spots */}
            {analysis.blind_spots && analysis.blind_spots.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Questions to Explore</h4>
                <div className="space-y-2">
                  {analysis.blind_spots.map((spot, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">{spot.area}</p>
                      <p className="text-sm italic">"{spot.gentle_prompt}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Opportunities */}
            {analysis.growth_opportunities && analysis.growth_opportunities.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Growth Opportunities</h4>
                <div className="space-y-2">
                  {analysis.growth_opportunities.map((opp, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-800">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">{opp.area}</p>
                        {opp.next_step && (
                          <p className="text-xs text-green-600 mt-0.5">Next step: {opp.next_step}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reflection Prompts */}
            {analysis.reflection_prompts && analysis.reflection_prompts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">For Further Reflection</h4>
                <ul className="space-y-1.5">
                  {analysis.reflection_prompts.map((prompt, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Affirmation */}
            {analysis.affirmation && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-center">
                <p className="text-sm font-medium italic">✨ {analysis.affirmation}</p>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Close
              </Button>
              <Button onClick={handleAnalyze} variant="secondary" className="flex-1 gap-2">
                <Sparkles className="w-4 h-4" />
                Re-analyze
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
