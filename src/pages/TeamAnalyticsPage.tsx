import { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useTeamMembers } from "@/hooks/useTeams";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { Team } from "@/hooks/useTeams";

import { AnalyticsKeyMetrics } from "@/components/analytics/AnalyticsKeyMetrics";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { AnalyticsPatterns } from "@/components/analytics/AnalyticsPatterns";
import { AnalyticsTimeline } from "@/components/analytics/AnalyticsTimeline";
import { AnalyticsLeaderboard } from "@/components/analytics/AnalyticsLeaderboard";

const DATE_RANGES = [
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 6 months", value: "180" },
  { label: "Last year", value: "365" },
];

export default function TeamAnalyticsPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { members } = useTeamMembers(team?.id);
  const navigate = useNavigate();
  const activeMembers = members.filter((m) => m.status === "active");

  const [dateRange, setDateRange] = useState("30");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stakesFilter, setStakesFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");

  // Fetch analytics summary
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["team-analytics-summary", team?.id, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_team_analytics", {
        p_team_id: team.id,
        p_days: parseInt(dateRange),
      });
      if (error) throw error;
      return data as any;
    },
    enabled: !!team?.id,
  });

  // Fetch all decisions
  const { data: decisions = [], isLoading: decisionsLoading } = useQuery({
    queryKey: ["team-analytics-decisions", team?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_decisions")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: true });
      return (data || []) as any[];
    },
    enabled: !!team?.id,
  });

  // Fetch outcomes
  const { data: outcomes = [], isLoading: outcomesLoading } = useQuery({
    queryKey: ["team-analytics-outcomes", team?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_outcomes")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: true });
      return (data || []) as any[];
    },
    enabled: !!team?.id,
  });

  // Apply filters
  const filteredDecisions = useMemo(() => {
    let filtered = decisions;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(dateRange));
    filtered = filtered.filter((d) => new Date(d.created_at) >= cutoff);
    if (categoryFilter !== "all") filtered = filtered.filter((d) => (d.category || "other") === categoryFilter);
    if (stakesFilter !== "all") filtered = filtered.filter((d) => d.stakes === stakesFilter);
    if (creatorFilter !== "all") filtered = filtered.filter((d) => d.created_by === creatorFilter);
    return filtered;
  }, [decisions, dateRange, categoryFilter, stakesFilter, creatorFilter]);

  const filteredOutcomes = useMemo(() => {
    const decisionIds = new Set(filteredDecisions.map((d) => d.id));
    return outcomes.filter((o) => decisionIds.has(o.decision_id));
  }, [outcomes, filteredDecisions]);

  // Categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    decisions.forEach((d) => cats.add(d.category || "other"));
    return Array.from(cats).sort();
  }, [decisions]);

  // CSV export
  const exportCSV = () => {
    const headers = ["Title", "Category", "Stakes", "Status", "Created", "Creator", "Outcome", "Satisfaction", "Lesson"];
    const rows = filteredDecisions.map((d) => {
      const outcome = outcomes.find((o) => o.decision_id === d.id);
      const creator = activeMembers.find((m) => m.user_id === d.created_by);
      return [
        `"${(d.decision_text || "").replace(/"/g, '""')}"`,
        d.category || "",
        d.stakes || "",
        d.status || "",
        format(new Date(d.created_at), "yyyy-MM-dd"),
        creator?.display_name || "",
        outcome?.result || "",
        outcome?.satisfaction || "",
        `"${(outcome?.lesson || "").replace(/"/g, '""')}"`,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${team.slug}-decisions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = analyticsLoading || decisionsLoading || outcomesLoading;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  const isEmpty = decisions.length === 0;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Decision patterns, accuracy metrics, and insights</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportCSV} disabled={isEmpty}>
              <FileText className="w-4 h-4 mr-2" /> CSV Data
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <FileText className="w-4 h-4 mr-2" /> PDF Summary (coming soon)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stakesFilter} onValueChange={setStakesFilter}>
          <SelectTrigger className="w-[120px] h-9 text-sm"><SelectValue placeholder="Stakes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stakes</SelectItem>
            {["low", "medium", "high", "critical"].map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={creatorFilter} onValueChange={setCreatorFilter}>
          <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue placeholder="Creator" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {activeMembers.map((m) => <SelectItem key={m.user_id} value={m.user_id}>{m.display_name || "Member"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No decisions analyzed yet</h2>
          <p className="text-sm text-muted-foreground mb-4">Create your first team decision to start tracking patterns.</p>
          <Button onClick={() => navigate(`/team/${team.slug}/decisions/new`)}>
            <Plus className="w-4 h-4 mr-1" /> Create First Decision
          </Button>
        </div>
      ) : (
        <>
          {/* Section 1: Key Metrics */}
          <AnalyticsKeyMetrics data={analytics} />

          {/* Section 2: Charts */}
          <AnalyticsCharts decisions={filteredDecisions} outcomes={filteredOutcomes} />

          {/* Section 3: Patterns */}
          <AnalyticsPatterns outcomes={filteredOutcomes} decisions={filteredDecisions} />

          {/* Section 4: Timeline */}
          <AnalyticsTimeline decisions={decisions} outcomes={outcomes} />

          {/* Section 5: Leaderboard */}
          <AnalyticsLeaderboard decisions={filteredDecisions} outcomes={filteredOutcomes} members={activeMembers} />
        </>
      )}
    </div>
  );
}
