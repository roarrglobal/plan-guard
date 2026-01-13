import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Zap, Target, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function DashboardDailyPrompt() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const handleAction = (action: "journal" | "decision" | "snag" | "postmortem") => {
    const text = input.trim();
    
    switch (action) {
      case "journal":
        navigate("/journal/new", { state: { prefill: text } });
        break;
      case "decision":
        navigate("/decisions/new", { state: { prefill: text } });
        break;
      case "snag":
        navigate("/analyze", { state: { prefill: text } });
        break;
      case "postmortem":
        navigate("/post-mortem/new", { state: { prefill: text } });
        break;
    }
  };

  return (
    <div className="bg-gradient-to-b from-muted/50 to-background border rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-3">
        What's on your mind today?
      </h2>
      
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Capture a thought, decision, or reflection..."
        className="min-h-[80px] bg-background/80 resize-none mb-4"
      />
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAction("journal")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <PenLine className="w-4 h-4" />
          Journal this
        </button>
        <button
          onClick={() => handleAction("decision")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Zap className="w-4 h-4" />
          It's a decision
        </button>
        <button
          onClick={() => handleAction("snag")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Target className="w-4 h-4" />
          Stress-test it
        </button>
        <button
          onClick={() => handleAction("postmortem")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Search className="w-4 h-4" />
          Analyze what happened
        </button>
      </div>
    </div>
  );
}
