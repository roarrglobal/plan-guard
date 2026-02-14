import { useOutletContext } from "react-router-dom";
import { useTeamMembers } from "@/hooks/useTeams";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, Clock, AlertTriangle, Users, TrendingUp, PieChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from "recharts";
import type { Team } from "@/hooks/useTeams";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
];

export default function TeamAnalyticsPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { members } = useTeamMembers(team?.id);
  const activeMembers = members.filter((m) => m.status === "active");

  const { data: decisions = [] } = useQuery({
    queryKey: ["team-analytics-decisions", team?.id],
    queryFn: async () => {
      if (!team) return [];
      const { data } = await supabase
        .from("team_decisions")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: true });
      return (data || []) as any[];
    },
    enabled: !!team?.id,
  });

  // Stats
  const total = decisions.length;
  const open = decisions.filter((d) => d.status === "open").length;
  const inProgress = decisions.filter((d) => d.status === "in_progress").length;
  const resolved = decisions.filter((d) => d.status === "resolved").length;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  decisions.forEach((d) => {
    const cat = d.category || "general";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Stakes breakdown
  const stakesMap: Record<string, number> = { low: 0, medium: 0, high: 0 };
  decisions.forEach((d) => { stakesMap[d.stakes || "medium"]++; });
  const stakesData = Object.entries(stakesMap).map(([name, value]) => ({ name, value }));

  // Activity over last 14 days
  const activityData = Array.from({ length: 14 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 13 - i));
    const dayStr = format(day, "yyyy-MM-dd");
    const count = decisions.filter((d) => format(new Date(d.created_at), "yyyy-MM-dd") === dayStr).length;
    return { date: format(day, "MMM d"), count };
  });

  // Top contributors
  const contributorMap: Record<string, number> = {};
  decisions.forEach((d) => {
    contributorMap[d.created_by] = (contributorMap[d.created_by] || 0) + 1;
  });
  const topContributors = Object.entries(contributorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([userId, count]) => {
      const member = activeMembers.find((m) => m.user_id === userId);
      return { name: member?.display_name || "Team Member", count };
    });

  // Resolution rate
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Avg time to resolve (days)
  const resolvedDecisions = decisions.filter((d) => d.resolved_at);
  const avgResolveDays = resolvedDecisions.length > 0
    ? Math.round(
        resolvedDecisions.reduce((acc, d) => {
          const diff = new Date(d.resolved_at).getTime() - new Date(d.created_at).getTime();
          return acc + diff / (1000 * 60 * 60 * 24);
        }, 0) / resolvedDecisions.length
      )
    : null;

  const statusPieData = [
    { name: "Open", value: open },
    { name: "In Progress", value: inProgress },
    { name: "Resolved", value: resolved },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Decision patterns, activity, and team health</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Decisions", value: total, icon: BarChart3, accent: "bg-primary/10 text-primary" },
          { label: "Open", value: open, icon: Clock, accent: "bg-warning/10 text-warning" },
          { label: "Resolved", value: resolved, icon: CheckCircle2, accent: "bg-success/10 text-success" },
          { label: "Members", value: activeMembers.length, icon: Users, accent: "bg-secondary/50 text-secondary-foreground" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.accent}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{resolutionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Resolution Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{avgResolveDays !== null ? `${avgResolveDays}d` : "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg. Time to Resolve</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{inProgress}</p>
            <p className="text-xs text-muted-foreground mt-1">In Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity chart */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Decision Activity (14 days)</CardTitle></CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No decisions yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChart className="w-4 h-4" /> Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {statusPieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No decisions yet</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <RechartsPie>
                    <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {statusPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusPieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-medium text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category and stakes */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">By Stakes</CardTitle></CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-3">
                {stakesData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        s.name === "high" ? "bg-destructive/10 text-destructive" :
                        s.name === "medium" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }>
                        {s.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-8 text-right">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top contributors */}
      <Card>
        <CardHeader><CardTitle className="text-base">Top Contributors</CardTitle></CardHeader>
        <CardContent>
          {topContributors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {topContributors.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${topContributors[0]?.count ? (c.count / topContributors[0].count) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-6 text-right">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
