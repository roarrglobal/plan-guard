import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnagLogo } from "@/components/SnagLogo";
import { AnalysisInput } from "@/components/AnalysisInput";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ResultsView, type AnalysisResult } from "@/components/ResultsView";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Fallback mock analysis for demo purposes
const mockAnalysis: AnalysisResult = {
  blind_spots: [
    "You're assuming users will understand the value proposition without education",
    "Competitor response hasn't been factored into your timeline",
    "Team capacity during holiday season may be 30-40% lower than planned",
  ],
  failure_modes: [
    {
      what: "Launch delays push past market window",
      mechanism: "Integration complexity causes cascading delays. Each dependency failure compounds timeline by 2-3 weeks.",
      likelihood: "High",
      impact: "Competitors capture early adopters. Marketing momentum lost. Team morale drops.",
    },
    {
      what: "User acquisition costs exceed budget",
      mechanism: "CAC assumptions based on best-case scenarios. Reality shows 2-3x higher costs in competitive markets.",
      likelihood: "Medium",
      impact: "Runway shortened by 40%. Forced to raise bridge funding at worse terms.",
    },
    {
      what: "Core feature fails to resonate",
      mechanism: "Product-market fit assumed but not validated. Users want different primary use case.",
      likelihood: "Medium",
      impact: "Pivot required within 6 months. Existing users churned. Team requires restructuring.",
    },
  ],
  warning_signals: [
    "Sprint velocity drops below 70% for two consecutive weeks",
    "User interviews reveal confusion about core value proposition",
    "Key team member starts updating LinkedIn profile",
    "Beta users stop logging in after day 3",
    "Customer support tickets per user exceed 0.5 in first week",
  ],
  kill_criteria: [
    "If day-7 retention drops below 20% by end of month 2, consider major pivot",
    "If CAC exceeds $50 with no improvement trend by week 6, pause paid acquisition",
    "If NPS drops below 20 after 500 users, halt growth initiatives for product fixes",
  ],
  unasked_question:
    "What happens to this plan if your biggest assumption—that users will pay before seeing results—turns out to be wrong?",
};

export default function Analyze() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Check for stored input from landing page
    const storedInput = sessionStorage.getItem("snag_input");
    if (storedInput) {
      setInput(storedInput);
      sessionStorage.removeItem("snag_input");
      // Auto-start analysis
      handleAnalyze(storedInput);
    }
  }, []);

  const handleAnalyze = async (text: string) => {
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
      
      // Track usage
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

  const handleSave = () => {
    toast({
      title: "Login required",
      description: "Create an account to save your analyses",
    });
    navigate("/login");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (result) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between p-4 safe-top">
            <Button variant="ghost" size="icon" onClick={handleNewAnalysis}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <SnagLogo size="sm" />
            <div className="w-11" /> {/* Spacer for centering */}
          </div>
        </header>

        <ResultsView
          result={result}
          originalInput={input}
          onNewAnalysis={handleNewAnalysis}
          onSave={handleSave}
          isLoggedIn={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 safe-top border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <SnagLogo size="sm" />
        <div className="w-11" /> {/* Spacer for centering */}
      </header>

      {/* Input area */}
      <main className="flex-1 flex flex-col p-4">
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            What's your plan?
          </h2>
          <AnalysisInput onSubmit={handleAnalyze} />
        </div>
      </main>
    </div>
  );
}
