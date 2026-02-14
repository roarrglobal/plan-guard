import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers } from "@/hooks/useTeams";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ListChecks, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { Team } from "@/hooks/useTeams";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TeamDecision {
  id: string;
  team_id: string;
  created_by: string;
  decision_text: string;
  description: string | null;
  category: string;
  stakes: string;
  status: string;
  options: any;
  chosen_option: string | null;
  deadline: string | null;
  outcome_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  creator_name?: string;
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  open: { icon: Clock, color: "bg-primary/10 text-primary", label: "Open" },
  in_progress: { icon: AlertTriangle, color: "bg-warning/10 text-warning", label: "In Progress" },
  resolved: { icon: CheckCircle2, color: "bg-success/10 text-success", label: "Resolved" },
};

const stakesColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
};

export default function TeamDecisionsPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const { members } = useTeamMembers(team?.id);
  const { can } = useTeamPermissions(team?.id);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newDecision, setNewDecision] = useState({ text: "", description: "", category: "general", stakes: "medium" });
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState("all");

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ["team-decisions", team?.id],
    queryFn: async () => {
      if (!team) return [];
      const { data } = await supabase
        .from("team_decisions")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false });
      
      // Enrich with creator names
      const enriched = (data || []).map((d: any) => {
        const member = members.find((m) => m.user_id === d.created_by);
        return { ...d, creator_name: member?.display_name || "Team Member" };
      });
      return enriched as TeamDecision[];
    },
    enabled: !!team?.id,
  });

  const filtered = filter === "all" ? decisions : decisions.filter((d) => d.status === filter);

  const handleCreate = async () => {
    if (!user || !team || !newDecision.text.trim()) return;
    setIsCreating(true);

    const { error } = await supabase.from("team_decisions").insert({
      team_id: team.id,
      created_by: user.id,
      decision_text: newDecision.text.trim(),
      description: newDecision.description.trim() || null,
      category: newDecision.category,
      stakes: newDecision.stakes,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Decision created");
      setNewDecision({ text: "", description: "", category: "general", stakes: "medium" });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["team-decisions", team.id] });
    }
    setIsCreating(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Decisions</h1>
          <p className="text-sm text-muted-foreground">{decisions.length} decision{decisions.length !== 1 ? "s" : ""}</p>
        </div>
        {can("create_decision") && (
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Decision
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "open", label: "Open" },
          { value: "in_progress", label: "In Progress" },
          { value: "resolved", label: "Resolved" },
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
              {filter === "all" ? "No decisions yet. Create one to get started." : `No ${filter.replace("_", " ")} decisions.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const statusCfg = statusConfig[d.status] || statusConfig.open;
            const StatusIcon = statusCfg.icon;
            return (
              <Link key={d.id} to={`/team/${team.slug}/decisions/${d.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${statusCfg.color}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{d.decision_text}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{d.creator_name}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(d.created_at), "MMM d")}</span>
                          <Badge variant="outline" className={`text-[10px] ${stakesColors[d.stakes] || ""}`}>
                            {d.stakes} stakes
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{d.category}</Badge>
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

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Team Decision</DialogTitle>
            <DialogDescription>Capture a decision for your team to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>What's the decision?</Label>
              <Input
                placeholder="e.g. Should we expand to APAC market?"
                value={newDecision.text}
                onChange={(e) => setNewDecision({ ...newDecision, text: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Context (optional)</Label>
              <Textarea
                placeholder="Additional context or background..."
                value={newDecision.description}
                onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newDecision.category} onValueChange={(v) => setNewDecision({ ...newDecision, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="hiring">Hiring</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stakes</Label>
                <Select value={newDecision.stakes} onValueChange={(v) => setNewDecision({ ...newDecision, stakes: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={!newDecision.text.trim() || isCreating} className="w-full">
              {isCreating ? "Creating..." : "Create Decision"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
