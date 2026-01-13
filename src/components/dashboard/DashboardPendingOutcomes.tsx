import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingDecision {
  id: string;
  decision_text: string;
  created_at: string;
  outcome_check_date: string | null;
}

export function DashboardPendingOutcomes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<PendingDecision[]>([]);

  useEffect(() => {
    if (user) {
      fetchPendingDecisions();
    }
  }, [user]);

  const fetchPendingDecisions = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from("decisions")
      .select("id, decision_text, created_at, outcome_check_date")
      .eq("status", "made")
      .is("outcome_status", null)
      .or(`outcome_check_date.lte.${today},outcome_check_date.is.null`)
      .order("outcome_check_date", { ascending: true })
      .limit(3);

    if (data) {
      setDecisions(data);
    }
  };

  if (decisions.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Check In On These
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/decisions?tab=made")}
          className="text-xs"
        >
          View all
        </Button>
      </div>
      
      <div className="space-y-2">
        {decisions.map((decision) => {
          const daysSince = differenceInDays(new Date(), new Date(decision.created_at));
          
          return (
            <button
              key={decision.id}
              onClick={() => navigate(`/decisions/${decision.id}/outcome`)}
              className="w-full bg-card border border-border rounded-lg p-3 text-left hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2">
                    {decision.decision_text.slice(0, 80)}
                    {decision.decision_text.length > 80 && "..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Decided {daysSince} days ago
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    How did it go?
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
