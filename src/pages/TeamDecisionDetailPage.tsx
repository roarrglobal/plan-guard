import { useState, useEffect } from "react";
import { useParams, useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers } from "@/hooks/useTeams";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Clock, CheckCircle2, AlertTriangle, Zap, Eye, Lock, Shield, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Team } from "@/hooks/useTeams";
import { SnagAnalysisDisplay } from "@/components/team/decisions/SnagAnalysisDisplay";
import { AnalysisLoadingState } from "@/components/team/decisions/AnalysisLoadingState";
import type { SnagAnalysis } from "@/components/team/decisions/SnagAnalysisDisplay";
import { DecisionComments } from "@/components/team/decisions/DecisionComments";
import { TeamActivityFeed } from "@/components/team/TeamActivityFeed";

const stakesColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

const visibilityIcons: Record<string, any> = {
  private: Lock,
  team: Eye,
  leadership: Shield,
};

export default function TeamDecisionDetailPage() {
  const { decisionId } = useParams<{ decisionId: string }>();
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const { can } = useTeamPermissions(team?.id);
  const { members } = useTeamMembers(team?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<string>("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState("standard");

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

  const { data: analyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ["team-decision-analyses", decisionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_analyses")
        .select("*")
        .eq("decision_id", decisionId!)
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!decisionId,
  });

  // Auto-trigger analysis from URL param
  useEffect(() => {
    const analyzeParam = searchParams.get("analyze");
    if (analyzeParam && decision && !isAnalyzing) {
      setSearchParams({});
      handleRunAnalysis(analyzeParam);
    }
  }, [decision, searchParams]);

  const creatorName = members.find((m) => m.user_id === decision?.created_by)?.display_name || "Team Member";
  const canEdit = (decision?.created_by === user?.id && can("edit_own_decision")) || can("edit_any_decision");
  const canDelete = (decision?.created_by === user?.id && can("delete_own_decision")) || can("delete_any_decision");

  const handleRunAnalysis = async (type?: string) => {
    if (!decision || !team || !user) return;
    const aType = type || analysisType;
    setIsAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("analyze-decision", {
        body: {
          decision_id: decision.id,
          team_id: team.id,
          analysis_type: aType,
        },
      });

      if (response.error) {
        toast.error(response.error.message || "Analysis failed");
      } else {
        toast.success("Analysis complete!");
        queryClient.invalidateQueries({ queryKey: ["team-decision-analyses", decisionId] });
        // Log activity
        await supabase.from("team_activity").insert({
          team_id: team.id,
          user_id: user.id,
          action_type: "analysis_run",
          entity_type: "decision",
          entity_id: decision.id,
          metadata: { title: decision.decision_text, analysis_type: aType },
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!decision) return;
    setIsSaving(true);
    const updates: any = { status, outcome_notes: outcomeNotes || null };
    if (status === "resolved" && !decision.resolved_at) updates.resolved_at = new Date().toISOString();
    if (status === "decided" && !decision.decided_at) updates.decided_at = new Date().toISOString();

    const { error } = await supabase.from("team_decisions").update(updates).eq("id", decision.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Decision updated");
      queryClient.invalidateQueries({ queryKey: ["team-decision", decisionId] });
      queryClient.invalidateQueries({ queryKey: ["team-decisions", team.id] });
      // Log status change activity
      if (status !== decision.status) {
        await supabase.from("team_activity").insert({
          team_id: team.id,
          user_id: user!.id,
          action_type: "status_changed",
          entity_type: "decision",
          entity_id: decision.id,
          metadata: { title: decision.decision_text, old_status: decision.status, new_status: status },
        });
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!decision || !confirm("Delete this decision and all analyses?")) return;
    const { error } = await supabase.from("team_decisions").delete().eq("id", decision.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Decision deleted");
      navigate(`/team/${team.slug}/decisions`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!decision) {
    return <div className="p-8 text-center text-muted-foreground">Decision not found</div>;
  }

  const VisIcon = visibilityIcons[decision.visibility] || Eye;
  const latestAnalysis = analyses[0];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/team/${team.slug}/decisions`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Decisions
      </button>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{decision.decision_text}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-sm text-muted-foreground">by {creatorName}</span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">{format(new Date(decision.created_at), "MMM d, yyyy")}</span>
          <Badge variant="outline" className="capitalize">{decision.category}</Badge>
          <Badge variant="outline" className={stakesColors[decision.stakes] || ""}>{decision.stakes} stakes</Badge>
          <Badge variant="outline" className="gap-1 capitalize">
            <VisIcon className="w-3 h-3" /> {decision.visibility || "team"}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={latestAnalysis ? "analysis" : "overview"}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">
            Analysis {analyses.length > 0 && `(${analyses.length})`}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {decision.description && (
            <Card>
              <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.description}</p>
              </CardContent>
            </Card>
          )}

          {(decision.reversibility || decision.timeline || decision.input_context) && (
            <Card>
              <CardHeader><CardTitle className="text-base">Context</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {decision.reversibility && (
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Reversibility</p>
                      <p className="text-foreground capitalize">{decision.reversibility}</p>
                    </div>
                  )}
                  {decision.timeline && (
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Timeline</p>
                      <p className="text-foreground capitalize">{decision.timeline.replace("_", " ")}</p>
                    </div>
                  )}
                  {decision.deadline && (
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Deadline</p>
                      <p className="text-foreground">{format(new Date(decision.deadline), "MMM d, yyyy")}</p>
                    </div>
                  )}
                </div>
                {decision.input_context && (
                  <div>
                    <p className="text-muted-foreground text-xs font-medium mb-1">Additional Context</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{decision.input_context}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status update */}
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
                      <SelectItem value="decided">Decided</SelectItem>
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

          {/* Comments section */}
          <DecisionComments decisionId={decisionId!} teamId={team.id} members={members} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 mt-4">
          {/* Run analysis action */}
          {canEdit && !isAnalyzing && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick Snag</SelectItem>
                    <SelectItem value="standard">Standard Snag</SelectItem>
                    <SelectItem value="deep">Deep Snag</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleRunAnalysis()} size="sm">
                  <Zap className="w-4 h-4 mr-1" /> Run Analysis
                </Button>
                {analyses.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {analyses.length} analysis{analyses.length !== 1 ? "es" : ""} run
                  </span>
                )}
              </CardContent>
            </Card>
          )}

          {isAnalyzing && <AnalysisLoadingState analysisType={analysisType} />}

          {!isAnalyzing && analyses.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No analyses yet. Run a SNAG analysis to identify blind spots and risks.
                </p>
              </CardContent>
            </Card>
          )}

          {!isAnalyzing && analyses.map((a: any) => (
            <div key={a.id} className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] capitalize">{a.analysis_type} snag</Badge>
                <span>{format(new Date(a.created_at), "MMM d, yyyy h:mm a")}</span>
                {a.processing_time_ms && <span>· {(a.processing_time_ms / 1000).toFixed(1)}s</span>}
                {a.user_id !== user?.id && (
                  <span>· by {members.find((m) => m.user_id === a.user_id)?.display_name || "Team member"}</span>
                )}
              </div>
              <SnagAnalysisDisplay
                analysis={a.output_json as SnagAnalysis}
                showStakeholders={a.analysis_type === "deep"}
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <TeamActivityFeed
            teamId={team.id}
            teamSlug={team.slug}
            members={members}
            showHeader={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
