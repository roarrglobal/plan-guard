import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnagLogo } from "@/components/SnagLogo";
import { format } from "date-fns";

interface Analysis {
  id: string;
  input: string;
  createdAt: Date;
}

// Mock data for demo
const mockAnalyses: Analysis[] = [
  {
    id: "1",
    input: "Launch a SaaS product for small business accounting by Q2 with a team of 3 engineers",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: "2",
    input: "Expand to European market before end of year with existing product",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
  },
  {
    id: "3",
    input: "Hire 5 sales reps and hit $1M ARR in next 6 months",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [analyses] = useState<Analysis[]>(mockAnalyses);

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 safe-top">
          <SnagLogo size="md" />
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col p-4">
        {/* New Analysis CTA */}
        <Button
          variant="hero"
          size="xl"
          className="w-full mb-6"
          onClick={() => navigate("/analyze")}
        >
          <Plus className="w-5 h-5" />
          New Analysis
        </Button>

        {/* Usage indicator */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-primary font-medium">
            Pro Plan • Unlimited analyses
          </p>
        </div>

        {/* Past analyses */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Past Analyses</h2>

          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No analyses yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start by analyzing your first plan
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                  className="w-full analysis-card hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium leading-snug">
                        {truncateText(analysis.input)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(analysis.createdAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
