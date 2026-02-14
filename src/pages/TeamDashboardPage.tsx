import { useOutletContext } from "react-router-dom";
import { useTeamMembers } from "@/hooks/useTeams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ListChecks, BarChart3, Zap } from "lucide-react";
import type { Team } from "@/hooks/useTeams";

export default function TeamDashboardPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { members } = useTeamMembers(team?.id);
  const activeMembers = members.filter((m) => m.status === "active");

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{activeMembers.length} member{activeMembers.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Members", value: activeMembers.length, icon: Users },
          { label: "Decisions", value: "—", icon: ListChecks },
          { label: "Analyses", value: "—", icon: BarChart3 },
          { label: "Streak", value: "—", icon: Zap },
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

      {/* Placeholder sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Decisions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Team decisions will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Team Activity</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Recent team activity will appear here.</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">Team actions coming soon — invite members, start a decision, run a framework.</p>
        </CardContent>
      </Card>
    </div>
  );
}
