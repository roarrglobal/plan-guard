import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Plus, 
  Search,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Decision {
  id: string;
  decision_text: string;
  options: unknown;
  stakes: string | null;
  category: string | null;
  deadline: string | null;
  status: string;
  chosen_option: string | null;
  confidence: number | null;
  outcome_check_date: string | null;
  outcome_status: string | null;
  ai_nudge: string | null;
  created_at: string;
  deep_snag_id: string | null;
}

const STATUS_TABS = [
  { id: "pending", label: "Captured", icon: Zap },
  { id: "made", label: "Pending Outcomes", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];

const STAKES_COLORS: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const OUTCOME_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  success: { bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="w-4 h-4" /> },
  partial: { bg: "bg-amber-100", text: "text-amber-700", icon: <AlertCircle className="w-4 h-4" /> },
  failure: { bg: "bg-red-100", text: "text-red-700", icon: <AlertCircle className="w-4 h-4" /> },
  changed: { bg: "bg-blue-100", text: "text-blue-700", icon: <Zap className="w-4 h-4" /> },
};

export default function DecisionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const activeStatus = searchParams.get("status") || "pending";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      fetchDecisions();
    }
  }, [user, authLoading, navigate]);

  const fetchDecisions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("decisions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading decisions",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setDecisions(data || []);
    }
    setIsLoading(false);
  };

  const filteredDecisions = decisions.filter((decision) => {
    const matchesStatus = decision.status === activeStatus;
    const matchesSearch = decision.decision_text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get pending outcome decisions that are due soon
  const pendingOutcomes = decisions.filter(d => 
    d.status === "made" && 
    d.outcome_check_date && 
    new Date(d.outcome_check_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const handleStatusChange = (status: string) => {
    searchParams.set("status", status);
    setSearchParams(searchParams);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Decisions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {decisions.filter(d => d.status === "pending").length} pending • {decisions.filter(d => d.status === "made").length} awaiting outcomes
            </p>
          </div>
          <Button onClick={() => navigate("/decisions/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Capture Decision
          </Button>
        </div>

        {/* Pending Outcomes Alert */}
        {pendingOutcomes.length > 0 && activeStatus !== "made" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">
                  {pendingOutcomes.length} decision{pendingOutcomes.length !== 1 ? "s" : ""} due for outcome check
                </p>
                <p className="text-sm text-amber-700">
                  How did your decisions turn out?
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("made")}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Review
              </Button>
            </div>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto -mx-4 px-4">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = decisions.filter(d => d.status === tab.id).length;
            const isActive = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-muted-foreground hover:bg-muted border border-border"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs",
                  isActive ? "bg-white/20" : "bg-muted"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Decisions List */}
        {filteredDecisions.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {decisions.length === 0 ? "No decisions yet" : "No decisions found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {decisions.length === 0
                ? "Start capturing decisions to track their outcomes."
                : "Try adjusting your search or filters."}
            </p>
            {decisions.length === 0 && (
              <Button onClick={() => navigate("/decisions/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Capture First Decision
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDecisions.map((decision) => (
              <button
                key={decision.id}
                onClick={() => navigate(`/decisions/${decision.id}`)}
                className="w-full bg-white border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {decision.stakes && (
                        <Badge className={cn("text-xs", STAKES_COLORS[decision.stakes])}>
                          {decision.stakes} stakes
                        </Badge>
                      )}
                      {decision.category && (
                        <Badge variant="outline" className="text-xs">
                          {decision.category}
                        </Badge>
                      )}
                      {decision.outcome_status && OUTCOME_COLORS[decision.outcome_status] && (
                        <Badge className={cn(
                          "text-xs flex items-center gap-1",
                          OUTCOME_COLORS[decision.outcome_status].bg,
                          OUTCOME_COLORS[decision.outcome_status].text
                        )}>
                          {OUTCOME_COLORS[decision.outcome_status].icon}
                          {decision.outcome_status}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground line-clamp-2 mb-2">
                      {decision.decision_text}
                    </p>

                    {/* AI Nudge preview */}
                    {decision.ai_nudge && activeStatus === "pending" && (
                      <p className="text-xs text-primary italic mb-2 line-clamp-1">
                        💡 {decision.ai_nudge}
                      </p>
                    )}

                    {/* Chosen option for made decisions */}
                    {decision.chosen_option && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Chose: <span className="font-medium text-foreground">{decision.chosen_option}</span>
                        {decision.confidence && ` (${decision.confidence}/5 confidence)`}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })}
                      </span>
                      {decision.outcome_check_date && decision.status === "made" && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Check {format(new Date(decision.outcome_check_date), "MMM d")}
                        </span>
                      )}
                      {decision.deep_snag_id && (
                        <span className="flex items-center gap-1 text-primary">
                          <Target className="w-3 h-3" />
                          Deep Snagged
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
