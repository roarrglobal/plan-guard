import { useOutletContext, useNavigate } from "react-router-dom";
import { useTeamMembers } from "@/hooks/useTeams";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ListChecks, BarChart3, Zap, Plus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Team } from "@/hooks/useTeams";
import { TeamActivityFeed } from "@/components/team/TeamActivityFeed";

export default function TeamDashboardPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { members } = useTeamMembers(team?.id);
  const navigate = useNavigate();
  const activeMembers = members.filter((m) => m.status === "active");

  const { data: decisions = [] } = useQuery({
    queryKey: ["team-decisions-dash", team?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_decisions")
        .select("id, decision_text, status, stakes, category, created_at")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false })
        .limit(5);
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

  const stakesColors: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-primary/10 text-primary",
    high: "bg-destructive/10 text-destructive",
    critical: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeMembers.length} member{activeMembers.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => navigate(`/team/${team.slug}/decisions/new`)}>
          <Plus className="w-4 h-4 mr-1" /> New Decision
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Members", value: activeMembers.length, icon: Users },
          { label: "Decisions", value: totalDecisions, icon: ListChecks },
          { label: "Analyses", value: analysisCount, icon: BarChart3 },
          { label: "Open", value: decisions.filter((d) => d.status === "open").length, icon: Zap },
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

      <div className="grid md:grid-cols-2 gap-6">
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
            {decisions.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No decisions yet.</p>
            )}
            {decisions.map((d) => (
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
                  <Badge variant="outline" className={`text-[10px] py-0 ${stakesColors[d.stakes] || ""}`}>
                    {d.stakes}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] py-0 capitalize">{d.status.replace("_", " ")}</Badge>
                </div>
              </button>
            ))}
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
  );
}
