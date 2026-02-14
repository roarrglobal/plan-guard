import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers } from "@/hooks/useTeams";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, ListChecks, BarChart3, Zap, Plus, ArrowRight, AlertTriangle, Timer, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isPast, differenceInDays } from "date-fns";
import type { Team } from "@/hooks/useTeams";
import { TeamActivityFeed } from "@/components/team/TeamActivityFeed";
import { DecisionStatusBadge } from "@/components/team/decisions/DecisionStatusBadge";
import { QuickSnagModal } from "@/components/team/QuickSnagModal";
import { TeamOnboardingWizard } from "@/components/team/TeamOnboardingWizard";

export default function TeamDashboardPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const { members } = useTeamMembers(team?.id);
  const navigate = useNavigate();
  const activeMembers = members.filter((m) => m.status === "active");
  const [quickSnagOpen, setQuickSnagOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuickSnagOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { data: decisions = [] } = useQuery({
    queryKey: ["team-decisions-dash", team?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_decisions")
        .select("id, decision_text, status, stakes, category, created_at, outcome_check_date")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data || []) as any[];
    },
    enabled: !!team?.id,
  });

  const { data: analysisCount = 0 } = useQuery({
    queryKey: ["team-analyses-count", team?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("team_analyses")
        .select("id", { count: "exact", head: true })
        .eq("team_id", team.id);
      return count || 0;
    },
    enabled: !!team?.id,
  });

  const { data: totalDecisions = 0 } = useQuery({
    queryKey: ["team-decisions-count", team?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("team_decisions")
        .select("id", { count: "exact", head: true })
        .eq("team_id", team.id);
      return count || 0;
    },
    enabled: !!team?.id,
  });

  // Show onboarding wizard for new teams
  const onboardingCompleted = (team?.settings as any)?.onboarding_completed === true;
  const showOnboarding = !onboardingCompleted && totalDecisions === 0 && activeMembers.length <= 1;

  useEffect(() => {
    if (showOnboarding) setOnboardingOpen(true);
  }, [showOnboarding]);

  const { data: usage } = useQuery({
    queryKey: ["team-usage-dash", team?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_or_create_team_usage", { p_team_id: team.id });
      return data as any;
    },
    enabled: !!team?.id,
  });

  // Pending outcomes
  const pendingOutcomes = decisions.filter(
    (d: any) => d.outcome_check_date && (d.status === "tracking" || d.status === "decided")
  );

  const recentDecisions = decisions.slice(0, 5);
  const deepSnagUsed = usage?.deep_snags_used || 0;
  const usagePercent = Math.round((deepSnagUsed / 200) * 100);

  const stakesColors: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-primary/10 text-primary",
    high: "bg-destructive/10 text-destructive",
    critical: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeMembers.length} member{activeMembers.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setQuickSnagOpen(true)} className="hidden sm:flex">
            <Zap className="w-4 h-4 mr-1" /> Quick Snag <kbd className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </Button>
          <Button onClick={() => navigate(`/team/${team.slug}/decisions/new`)}>
            <Plus className="w-4 h-4 mr-1" /> New Decision
          </Button>
        </div>
      </div>

      {/* Quick Snag inline widget */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="p-4">
          <button
            onClick={() => setQuickSnagOpen(true)}
            className="w-full text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                What decision are you facing? <span className="text-xs text-muted-foreground/60">Press ⌘K</span>
              </p>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Members", value: activeMembers.length, icon: Users },
          { label: "Decisions", value: totalDecisions, icon: ListChecks },
          { label: "Analyses", value: analysisCount, icon: BarChart3 },
          { label: "Open", value: decisions.filter((d: any) => ["open", "in_progress", "draft"].includes(d.status)).length, icon: Zap },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left column - 3/5 */}
        <div className="md:col-span-3 space-y-6">
          {/* Pending Outcomes */}
          {pendingOutcomes.length > 0 && (
            <Card className="border-warning/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="w-4 h-4 text-warning" />
                  Pending Outcomes ({pendingOutcomes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingOutcomes.map((d: any) => {
                  const checkDate = new Date(d.outcome_check_date);
                  const overdue = isPast(checkDate);
                  const daysLeft = differenceInDays(checkDate, new Date());
                  return (
                    <button
                      key={d.id}
                      onClick={() => navigate(`/team/${team.slug}/decisions/${d.id}`)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-3"
                    >
                      <ClipboardCheck className={`w-4 h-4 shrink-0 ${overdue ? "text-destructive" : "text-warning"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{d.decision_text}</p>
                        <p className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                          {overdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days until check-in`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Recent Decisions */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Decisions</CardTitle>
              <button
                onClick={() => navigate(`/team/${team.slug}/decisions`)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentDecisions.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No decisions yet.</p>
              )}
              {recentDecisions.map((d: any) => (
                <button
                  key={d.id}
                  onClick={() => navigate(`/team/${team.slug}/decisions/${d.id}`)}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground truncate">{d.decision_text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(d.created_at), "MMM d")}
                    </span>
                    <DecisionStatusBadge status={d.status} />
                    <Badge variant="outline" className={`text-[10px] py-0 ${stakesColors[d.stakes] || ""}`}>
                      {d.stakes}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column - 2/5 */}
        <div className="md:col-span-2 space-y-6">
          {/* Usage Widget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Deep Snags</span>
                  <span className="font-medium text-foreground">{deepSnagUsed}/200</span>
                </div>
                <Progress value={usagePercent} className="h-2" />
                {usagePercent >= 80 && (
                  <p className="text-xs text-warning mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Approaching limit
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quick Snags</span>
                <span className="font-medium text-foreground">{usage?.quick_snags_used || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <TeamActivityFeed
            teamId={team.id}
            teamSlug={team.slug}
            members={members}
            limit={10}
          />
        </div>
      </div>

      <QuickSnagModal
        open={quickSnagOpen}
        onOpenChange={setQuickSnagOpen}
        teamId={team.id}
        teamSlug={team.slug}
      />

      <TeamOnboardingWizard
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        team={team}
      />
    </div>
  );
}
