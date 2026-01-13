import { useNavigate } from "react-router-dom";
import { SnagLogo } from "@/components/SnagLogo";
import { AnalysisInput } from "@/components/AnalysisInput";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const handleAnalyze = (text: string) => {
    // Store the input and navigate to analysis
    sessionStorage.setItem("snag_input", text);
    navigate("/analyze");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 safe-top">
        <SnagLogo size="md" />
        <Button variant="ghost" onClick={() => navigate("/login")}>
          Login
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col px-4 pb-8">
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
              Find the snag
              <br />
              <span className="text-primary">before it finds you.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Stress-test any plan in 2 minutes. Free to try.
            </p>
          </div>

          {/* Input */}
          <AnalysisInput onSubmit={handleAnalyze} compact />

          {/* Free trial note */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            No signup required for your first 3 analyses
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto w-full">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">2 min analysis</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">AI-powered</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Find blind spots</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-border">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <button className="hover:text-foreground transition-colors">How it works</button>
          <button className="hover:text-foreground transition-colors">Pricing</button>
          <button 
            className="hover:text-foreground transition-colors"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </footer>
    </div>
  );
}
