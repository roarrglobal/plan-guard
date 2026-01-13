import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Calendar,
  MoreVertical,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  outcome_notes: string | null;
  ai_nudge: string | null;
  created_at: string;
  deep_snag_id: string | null;
}

const STAKES_COLORS: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const OUTCOME_OPTIONS = [
  { value: "success", label: "Success", icon: CheckCircle2, color: "text-emerald-600" },
  { value: "partial", label: "Partial Success", icon: AlertCircle, color: "text-amber-600" },
  { value: "failure", label: "Didn't Work Out", icon: AlertCircle, color: "text-red-600" },
  { value: "changed", label: "Circumstances Changed", icon: Zap, color: "text-blue-600" },
];

export default function DecisionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [decision, setDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOutcomeDialog, setShowOutcomeDialog] = useState(false);
  const [outcomeStatus, setOutcomeStatus] = useState<string>("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user && id) {
      fetchDecision();
    }
  }, [user, authLoading, id, navigate]);

  const fetchDecision = async () => {
    if (!id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("decisions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Decision not found",
        description: "This decision doesn't exist or you don't have access.",
        variant: "destructive",
      });
      navigate("/decisions");
    } else {
      setDecision(data);
      if (data.outcome_status) {
        setOutcomeStatus(data.outcome_status);
        setOutcomeNotes(data.outcome_notes || "");
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!decision) return;
    
    const { error } = await supabase
      .from("decisions")
      .delete()
      .eq("id", decision.id);

    if (error) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Decision deleted",
      });
      navigate("/decisions");
    }
  };

  const handleDeepSnag = () => {
    if (!decision) return;
    navigate("/analyze", { 
      state: { 
        prefillContent: decision.decision_text,
        sourceDecisionId: decision.id 
      } 
    });
  };

  const handleLogOutcome = async () => {
    if (!decision || !outcomeStatus) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from("decisions")
      .update({
        outcome_status: outcomeStatus,
        outcome_notes: outcomeNotes,
        outcome_logged_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", decision.id);

    if (error) {
      toast({
        title: "Failed to save outcome",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Outcome logged",
        description: "Great job tracking your decision!",
      });
      fetchDecision();
      setShowOutcomeDialog(false);
    }
    setIsSaving(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!decision) {
    return null;
  }

  const isPending = decision.status === "pending";
  const isMade = decision.status === "made";
  const isCompleted = decision.status === "completed";
  const outcomeIsDue = decision.outcome_check_date && 
    new Date(decision.outcome_check_date) <= new Date();

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/decisions")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Decisions</span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/decisions/new?edit=${decision.id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="bg-background border border-border rounded-2xl p-6 mb-6">
          {/* Status & Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
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
            <Badge variant={isPending ? "default" : isMade ? "secondary" : "outline"} className="text-xs">
              {isPending ? "Captured" : isMade ? "Awaiting Outcome" : "Completed"}
            </Badge>
          </div>

          {/* Decision Text */}
          <h1 className="text-xl font-semibold text-foreground mb-4">
            {decision.decision_text}
          </h1>

          {/* AI Nudge */}
          {decision.ai_nudge && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary mb-1">AI Reflection</p>
                  <p className="text-sm text-foreground">{decision.ai_nudge}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chosen Option */}
          {decision.chosen_option && (
            <div className="bg-muted rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-1">Chosen Option</p>
              <p className="text-foreground font-medium">{decision.chosen_option}</p>
              {decision.confidence && (
                <p className="text-xs text-muted-foreground mt-1">
                  Confidence: {decision.confidence}/5
                </p>
              )}
            </div>
          )}

          {/* Outcome */}
          {isCompleted && decision.outcome_status && (
            <div className="bg-muted rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-1">Outcome</p>
              <div className="flex items-center gap-2 mb-2">
                {OUTCOME_OPTIONS.find(o => o.value === decision.outcome_status)?.icon && (
                  <span className={OUTCOME_OPTIONS.find(o => o.value === decision.outcome_status)?.color}>
                    {(() => {
                      const opt = OUTCOME_OPTIONS.find(o => o.value === decision.outcome_status);
                      if (opt) {
                        const Icon = opt.icon;
                        return <Icon className="w-5 h-5" />;
                      }
                      return null;
                    })()}
                  </span>
                )}
                <p className="text-foreground font-medium capitalize">{decision.outcome_status}</p>
              </div>
              {decision.outcome_notes && (
                <p className="text-sm text-muted-foreground">{decision.outcome_notes}</p>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              Captured {formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })}
            </span>
            {decision.outcome_check_date && !isCompleted && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Check by {format(new Date(decision.outcome_check_date), "MMM d, yyyy")}
              </span>
            )}
            {decision.deep_snag_id && (
              <button 
                onClick={() => navigate(`/analysis/${decision.deep_snag_id}`)}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Target className="w-4 h-4" />
                View Deep Snag
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Deep Snag CTA for pending decisions */}
          {isPending && !decision.deep_snag_id && (
            <Button 
              onClick={handleDeepSnag}
              className="w-full bg-secondary hover:bg-secondary/90"
              size="lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Deep Snag This Decision
            </Button>
          )}

          {/* Outcome CTA for made decisions */}
          {isMade && outcomeIsDue && (
            <Button 
              onClick={() => setShowOutcomeDialog(true)}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Log Outcome
            </Button>
          )}

          {isMade && !outcomeIsDue && (
            <Button 
              onClick={() => setShowOutcomeDialog(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Clock className="w-5 h-5 mr-2" />
              Log Outcome Early
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Decision?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this decision
              and any associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Outcome Dialog */}
      <Dialog open={showOutcomeDialog} onOpenChange={setShowOutcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How did it turn out?</DialogTitle>
            <DialogDescription>
              Recording outcomes helps you learn from your decisions over time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={outcomeStatus} onValueChange={setOutcomeStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome..." />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <opt.icon className={cn("w-4 h-4", opt.color)} />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="What did you learn? What would you do differently?"
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOutcomeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleLogOutcome}
              disabled={!outcomeStatus || isSaving}
            >
              {isSaving ? "Saving..." : "Save Outcome"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
