import { useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers } from "@/hooks/useTeams";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Team } from "@/hooks/useTeams";

export default function TeamDecisionDetailPage() {
  const { decisionId } = useParams<{ decisionId: string }>();
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const { can } = useTeamPermissions(team?.id);
  const { members } = useTeamMembers(team?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: decision, isLoading } = useQuery({
    queryKey: ["team-decision", decisionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_decisions")
        .select("*")
        .eq("id", decisionId!)
        .maybeSingle();
      if (data) {
        setStatus((data as any).status);
        setOutcomeNotes((data as any).outcome_notes || "");
      }
      return data as any;
    },
    enabled: !!decisionId,
  });

  const creatorName = members.find((m) => m.user_id === decision?.created_by)?.display_name || "Team Member";
  const canEdit = (decision?.created_by === user?.id && can("edit_own_decision")) || can("edit_any_decision");
  const canDelete = (decision?.created_by === user?.id && can("delete_own_decision")) || can("delete_any_decision");

  const handleSave = async () => {
    if (!decision) return;
    setIsSaving(true);
    const updates: any = { status, outcome_notes: outcomeNotes || null };
    if (status === "resolved" && !decision.resolved_at) updates.resolved_at = new Date().toISOString();
    
    const { error } = await supabase.from("team_decisions").update(updates).eq("id", decision.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Decision updated");
      queryClient.invalidateQueries({ queryKey: ["team-decision", decisionId] });
      queryClient.invalidateQueries({ queryKey: ["team-decisions", team.id] });
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!decision || !confirm("Delete this decision?")) return;
    const { error } = await supabase.from("team_decisions").delete().eq("id", decision.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Decision deleted");
      navigate(`/team/${team.slug}/decisions`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="p-8 text-center text-muted-foreground">Decision not found</div>
    );
  }

  const statusIcon = { open: Clock, in_progress: AlertTriangle, resolved: CheckCircle2 }[decision.status] || Clock;
  const StatusIcon = statusIcon;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(`/team/${team.slug}/decisions`)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Decisions
      </button>

      <div>
        <h1 className="text-xl font-bold text-foreground">{decision.decision_text}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-sm text-muted-foreground">by {creatorName}</span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">{format(new Date(decision.created_at), "MMM d, yyyy")}</span>
          <Badge variant="outline">{decision.category}</Badge>
          <Badge variant="outline">{decision.stakes} stakes</Badge>
        </div>
      </div>

      {decision.description && (
        <Card>
          <CardHeader><CardTitle className="text-base">Context</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.description}</p>
          </CardContent>
        </Card>
      )}

      {canEdit && (
        <Card>
          <CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Outcome / Notes</Label>
              <Textarea
                placeholder="What was decided? What happened?"
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              {canDelete && (
                <Button variant="destructive" size="icon" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {decision.resolved_at && (
        <Card className="border-success/30">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Resolved</p>
              <p className="text-xs text-muted-foreground">{format(new Date(decision.resolved_at), "MMM d, yyyy")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
