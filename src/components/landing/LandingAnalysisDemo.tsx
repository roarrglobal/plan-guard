import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, ArrowRight, Loader2, Eye, AlertTriangle, Bell, StopCircle, HelpCircle, Check, UserPlus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Example decisions for the demo
const exampleDecisions = [
  { label: "Career move", text: "I'm thinking about leaving my job to start a company. I have 6 months of savings and a product idea I've validated with 20 potential customers." },
  { label: "Product launch", text: "We're considering launching our MVP next month, but only 3 of our 5 core features are ready. Should we launch now or wait?" },
  { label: "Investment", text: "I'm thinking of investing 20% of my savings into crypto. I've done research but the market seems volatile." },
  { label: "Relocation", text: "My company is offering a transfer to Singapore with a 40% raise but I'd be leaving my family and friends behind." },
  { label: "Partnership", text: "A potential business partner wants 40% equity for bringing sales expertise. I have the product but need distribution." },
  { label: "Major purchase", text: "Considering buying a house at the top of my budget. Interest rates might go down but prices are stable." }
];

interface AnalysisResult {
  blind_spots: Array<{ blind_spot: string; why_it_matters: string; how_to_test: string }>;
  failure_modes: Array<{ what_fails: string; mechanism: string; likelihood: string; impact: string; mitigation: string }>;
  warning_signals: Array<{ signal: string; timeframe: string }>;
  kill_criteria: Array<{ condition: string; action: string; threshold: string }>;
  unasked_question: string;
}

export function LandingAnalysisDemo() {
  const navigate = useNavigate();
  const [demoText, setDemoText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(() => {
    return localStorage.getItem("snag_free_trial_used") === "true";
  });

  const handleAnalyze = async () => {
    if (!demoText.trim() || demoText.trim().length < 20) {
      setError("Please describe your decision in at least 20 characters.");
      return;
    }

    // Check if user already used their free trial
    if (hasUsedFreeTrial) {
      // Redirect to signup
      sessionStorage.setItem("snag_input", demoText);
      navigate("/login", { state: { prefillDecision: demoText } });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-plan', {
        body: { plan: demoText }
      });

      if (fnError) {
        console.error('Analysis error:', fnError);
        setError("Something went wrong. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      if (data.error) {
        setError(data.error);
        setIsAnalyzing(false);
        return;
      }

      setResult(data);
      // Mark free trial as used
      localStorage.setItem("snag_free_trial_used", "true");
      setHasUsedFreeTrial(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError("Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTryAnother = () => {
    // For second analysis, redirect to signup
    sessionStorage.setItem("snag_input", "");
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/login");
  };

  // Loading state
  if (isAnalyzing) {
    return (
      <div className="bg-background border-2 border-border rounded-2xl p-6 md:p-7 shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-muted rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-6 text-foreground font-medium">Analyzing your decision...</p>
          <p className="text-sm text-muted-foreground mt-2">This takes about 30 seconds</p>
        </div>
      </div>
    );
  }

  // Results state
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border-2 border-border rounded-2xl p-6 md:p-7 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-semibold">Your Analysis</span>
          </div>
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">Complete</span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {/* Blind Spots */}
          <div className="border-l-4 border-primary pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Blind Spots</h4>
            </div>
            {result.blind_spots?.slice(0, 2).map((bs, i) => (
              <p key={i} className="text-sm text-muted-foreground mb-1">
                • {bs.blind_spot}
              </p>
            ))}
          </div>

          {/* Failure Mode */}
          <div className="border-l-4 border-destructive pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h4 className="font-semibold text-sm">Top Failure Mode</h4>
            </div>
            {result.failure_modes?.[0] && (
              <>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>{result.failure_modes[0].what_fails}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.failure_modes[0].mechanism}
                </p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                  result.failure_modes[0].likelihood === "High" 
                    ? "bg-destructive/10 text-destructive" 
                    : result.failure_modes[0].likelihood === "Medium"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {result.failure_modes[0].likelihood} Likelihood
                </span>
              </>
            )}
          </div>

          {/* Warning Signal */}
          <div className="border-l-4 border-warning pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-warning" />
              <h4 className="font-semibold text-sm">Warning Signal</h4>
            </div>
            {result.warning_signals?.[0] && (
              <p className="text-sm text-muted-foreground">
                {result.warning_signals[0].signal} — <span className="italic">{result.warning_signals[0].timeframe}</span>
              </p>
            )}
          </div>

          {/* Unasked Question */}
          <div className="border-l-4 border-secondary pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-secondary" />
              <h4 className="font-semibold text-sm">The Unasked Question</h4>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "{result.unasked_question}"
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center mb-4">
            🎉 That's just a preview! Sign up to see the full analysis, save it, and run more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSignUp}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up to Save & Continue
            </Button>
            <Button 
              onClick={handleTryAnother}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Another (requires signup)
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Input state
  return (
    <div className="bg-background border-2 border-border rounded-2xl p-6 md:p-7 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <span className="font-semibold">Try Snag — Free</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">What decision are you considering?</p>
      
      <Textarea
        value={demoText}
        onChange={(e) => {
          setDemoText(e.target.value);
          if (error) setError(null);
        }}
        placeholder="Describe your decision in a few sentences..."
        className="min-h-[120px] mb-4 resize-none"
      />

      {error && (
        <p className="text-sm text-destructive mb-3">{error}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {exampleDecisions.map((ex, i) => (
          <button
            key={i}
            onClick={() => setDemoText(ex.text)}
            className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <Button 
        onClick={handleAnalyze}
        disabled={!demoText.trim() || demoText.trim().length < 20}
        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6"
      >
        {hasUsedFreeTrial ? (
          <>Sign Up to Analyze <ArrowRight className="w-4 h-4 ml-2" /></>
        ) : (
          <>Stress-Test This Decision <ArrowRight className="w-4 h-4 ml-2" /></>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        {hasUsedFreeTrial 
          ? "Create a free account to continue analyzing decisions."
          : "Your first analysis is free. No signup required."}
      </p>

      {/* Dev/Testing: Reset free trial */}
      {hasUsedFreeTrial && (
        <button
          onClick={() => {
            localStorage.removeItem("snag_free_trial_used");
            setHasUsedFreeTrial(false);
            setResult(null);
          }}
          className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground mt-2 underline"
        >
          Reset demo (testing only)
        </button>
      )}
    </div>
  );
}
