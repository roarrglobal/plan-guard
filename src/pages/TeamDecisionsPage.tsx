import { useState, useEffect } from "react";
import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers } from "@/hooks/useTeams";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ListChecks, Search, Eye, Lock, Shield, Zap } from "lucide-react";
import { format } from "date-fns";
import type { Team } from "@/hooks/useTeams";
import { useQuery } from "@tanstack/react-query";
import { DecisionStatusBadge } from "@/components/team/decisions/DecisionStatusBadge";
import { QuickSnagModal } from "@/components/team/QuickSnagModal";

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

export default function TeamDecisionsPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const { members } = useTeamMembers(team?.id);
  const { can } = useTeamPermissions(team?.id);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stakesFilter, setStakesFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickSnagOpen, setQuickSnagOpen] = useState(false);

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

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ["team-decisions", team?.id],
    queryFn: async () => {
      if (!team) return [];
      const { data } = await supabase
        .from("team_decisions")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false });
      return (data || []).map((d: any) => {
        const member = members.find((m) => m.user_id === d.created_by);
        return { ...d, creator_name: member?.display_name || "Team Member" };
      });
    },
    enabled: !!team?.id,
  });

  const filtered = decisions.filter((d: any) => {
    if (filter !== "all" && d.status !== filter) return false;
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    if (stakesFilter !== "all" && d.stakes !== stakesFilter) return false;
    if (searchQuery && !d.decision_text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const { data: usage } = useQuery({
    queryKey: ["team-usage", team?.id],
    queryFn: async () => {
      if (!team) return null;
      const { data } = await supabase.rpc("get_or_create_team_usage", { p_team_id: team.id });
      return data as any;
    },
    enabled: !!team?.id,
  });

  const usagePercent = usage ? Math.round(((usage.deep_snags_used || 0) / 200) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Decisions</h1>
          <p className="text-sm text-muted-foreground">
            {decisions.length} decision{decisions.length !== 1 ? "s" : ""}
            {usage && (
              <span className="ml-2">
                · {usage.deep_snags_used || 0}/200 Deep Snags
                {usagePercent >= 80 && <span className="text-warning ml-1">⚠️</span>}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setQuickSnagOpen(true)}>
            <Zap className="w-4 h-4 mr-1" /> Quick Snag
          </Button>
          {can("create_decision") && (
            <Button onClick={() => navigate(`/team/${team.slug}/decisions/new`)} className="bg-primary">
              <Plus className="w-4 h-4 mr-2" /> New Decision
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="strategy">Strategy</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stakesFilter} onValueChange={setStakesFilter}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Stakes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stakes</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "draft", label: "Draft" },
          { value: "open", label: "Open" },
          { value: "decided", label: "Decided" },
          { value: "tracking", label: "Tracking" },
          { value: "completed", label: "Completed" },
          { value: "canceled", label: "Canceled" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Decision list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-4"><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ListChecks className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {decisions.length === 0 ? "No decisions yet. Create one to get started." : "No matching decisions."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d: any) => {
            const VisIcon = visibilityIcons[d.visibility] || Eye;
            return (
              <Link key={d.id} to={`/team/${team.slug}/decisions/${d.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{d.decision_text}</p>
                        {d.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{d.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{d.creator_name}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(d.created_at), "MMM d")}</span>
                          <DecisionStatusBadge status={d.status} />
                          <Badge variant="outline" className={`text-[10px] ${stakesColors[d.stakes] || ""}`}>
                            {d.stakes}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">{d.category}</Badge>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <VisIcon className="w-2.5 h-2.5" /> {d.visibility || "team"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <QuickSnagModal
        open={quickSnagOpen}
        onOpenChange={setQuickSnagOpen}
        teamId={team.id}
        teamSlug={team.slug}
      />
    </div>
  );
}
