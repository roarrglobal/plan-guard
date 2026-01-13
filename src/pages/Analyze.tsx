import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { AnalysisInput } from "@/components/AnalysisInput";
import { AnalysisLoading } from "@/components/analysis/AnalysisLoading";
import { AnalysisResults, type AnalysisResult } from "@/components/analysis/AnalysisResults";
import { AnalysisInputSelectors } from "@/components/analysis/AnalysisInputSelectors";
import { UsageWarningBanner } from "@/components/usage/UsageWarningBanner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUsage } from "@/hooks/useUsage";
import LimitReachedModal from "@/components/usage/LimitReachedModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Analyze() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { canUseFeature, tier, refetch: refetchUsage } = useUsage();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [sourceJournalId, setSourceJournalId] = useState<string | null>(null);
  
  // New selector states
  const [category, setCategory] = useState("other");
  const [stakes, setStakes] = useState("medium");
  const [timeline, setTimeline] = useState("short");
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Check for prefilled content from journal or decision
    const state = location.state as { 
      prefillContent?: string; 
      sourceJournalId?: string;
      sourceDecisionId?: string;
      autoAnalyze?: boolean;
      category?: string;
      stakes?: string;
    } | null;
    
    if (state?.prefillContent) {
      setInput(state.prefillContent);
      
      if (state.sourceJournalId) {
        setSourceJournalId(state.sourceJournalId);
      }
      
      // Pre-fill category and stakes if provided
      if (state.category) {
        setCategory(state.category);
      }
      if (state.stakes) {
        setStakes(state.stakes);
      }
      
      // Clear location state
      window.history.replaceState({}, document.title);
      
      // Auto-analyze if requested (from decision or journal)
      if (state.autoAnalyze) {
        handleAnalyze(state.prefillContent);
      }
    }
    
    // Check for stored input from landing page
    const storedInput = sessionStorage.getItem("snag_input");
    if (storedInput && !state?.prefillContent) {
      setInput(storedInput);
      sessionStorage.removeItem("snag_input");
      // Auto-start analysis
      handleAnalyze(storedInput);
    }
  }, [location]);

  const handleAnalyze = async (text: string) => {
    // Check usage limit before proceeding
    const canAnalyze = await canUseFeature("analysis");
    if (!canAnalyze) {
      setLimitModalOpen(true);
      return;
    }

    setInput(text);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-plan', {
        body: { plan: text }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast({
          title: "Analysis failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.error) {
        toast({
          title: "Analysis failed",
          description: data.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setResult(data);
      
      // Refetch usage to update the count
      refetchUsage();
      
      // Track usage in localStorage as backup
      const usage = parseInt(localStorage.getItem("snag_usage") || "0");
      localStorage.setItem("snag_usage", String(usage + 1));
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setInput("");
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Create an account to save your analyses",
      });
      navigate("/login");
      return;
    }

    if (!result) return;

    try {
      // Use user-selected category or AI-detected category
      const selectedCategory = category || (result as any).category || "other";
      
      const { error } = await supabase.from("analyses").insert([{
        user_id: user.id,
        original_input: input,
        result: JSON.parse(JSON.stringify(result)),
        title: input.slice(0, 100),
        category: selectedCategory,
      }]);

      if (error) {
        toast({
          title: "Failed to save",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis saved",
          description: "View it in your dashboard",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to save",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <AnalysisLoading />;
  }

  if (result) {
    return (
      <AnalysisResults
        result={result}
        originalInput={input}
        onNewAnalysis={handleNewAnalysis}
        onSave={handleSave}
        isLoggedIn={!!user}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[18px] font-bold text-primary">Snag</span>
          <div className="w-9" />
        </header>

        {/* Input area */}
        <main className="flex-1 flex flex-col p-4">
          <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
            {/* Usage Warning */}
            <UsageWarningBanner onUpgrade={() => navigate("/settings")} />
            
            <h2 className="text-[20px] font-semibold text-foreground mb-4 text-center">
              What's your plan?
            </h2>
            
            <AnalysisInput onSubmit={handleAnalyze} />
            
            {/* Collapsible Options */}
            <Collapsible open={showOptions} onOpenChange={setShowOptions} className="mt-4">
              <CollapsibleTrigger className="flex items-center justify-center gap-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {showOptions ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide options
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Add context (category, stakes, timeline)
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <AnalysisInputSelectors
                  category={category}
                  onCategoryChange={setCategory}
                  stakes={stakes}
                  onStakesChange={setStakes}
                  timeline={timeline}
                  onTimelineChange={setTimeline}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </main>
      </div>

      <LimitReachedModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        limitType="analysis"
        currentTier={tier}
      />
    </>
  );
}
