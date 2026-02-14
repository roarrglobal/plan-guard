import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Activity, Zap, MessageSquare, UserPlus, CheckCircle2, Edit, Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TeamActivityFeedProps {
  teamId: string;
  teamSlug: string;
  members: Array<{ user_id: string; display_name?: string | null }>;
  limit?: number;
  showHeader?: boolean;
}

interface ActivityItem {
  id: string;
  team_id: string;
  user_id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

const ACTION_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  decision_created: { icon: Zap, label: "created a decision", color: "text-primary" },
  analysis_run: { icon: Zap, label: "ran analysis", color: "text-amber-500" },
  status_changed: { icon: Edit, label: "updated status", color: "text-blue-500" },
  comment_added: { icon: MessageSquare, label: "commented", color: "text-green-600" },
  member_joined: { icon: UserPlus, label: "joined the team", color: "text-primary" },
  decision_resolved: { icon: CheckCircle2, label: "resolved a decision", color: "text-green-600" },
  decision_deleted: { icon: Trash2, label: "deleted a decision", color: "text-destructive" },
};

export function TeamActivityFeed({ teamId, teamSlug, members, limit = 20, showHeader = true }: TeamActivityFeedProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["team-activity", teamId, limit],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_activity")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(limit);
      return (data || []) as ActivityItem[];
    },
    enabled: !!teamId,
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`activity-${teamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_activity", filter: `team_id=eq.${teamId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["team-activity", teamId] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [teamId, queryClient]);

  const getMemberName = (userId: string) =>
    members.find((m) => m.user_id === userId)?.display_name || "Team Member";

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleClick = (item: ActivityItem) => {
    if (item.entity_type === "decision" && item.entity_id) {
      navigate(`/team/${teamSlug}/decisions/${item.entity_id}`);
    }
  };

  const content = (
    <div className="space-y-1">
      {isLoading && (
        <p className="text-sm text-muted-foreground text-center py-6">Loading activity...</p>
      )}
      {!isLoading && activities.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No activity yet. Create a decision to get started.
        </p>
      )}
      {activities.map((item) => {
        const config = ACTION_CONFIG[item.action_type] || { icon: Activity, label: item.action_type, color: "text-muted-foreground" };
        const Icon = config.icon;
        const name = getMemberName(item.user_id);
        const meta = item.metadata || {};
        const isClickable = item.entity_type === "decision" && item.entity_id;

        return (
          <div
            key={item.id}
            onClick={() => isClickable && handleClick(item)}
            className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
              isClickable ? "cursor-pointer hover:bg-muted/50" : ""
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-muted ${config.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{name}</span>{" "}
                <span className="text-muted-foreground">{config.label}</span>
                {meta.title && (
                  <>
                    {" "}
                    <span className="font-medium text-foreground">"{meta.title}"</span>
                  </>
                )}
                {meta.analysis_type && (
                  <Badge variant="outline" className="ml-1.5 text-[10px] capitalize py-0">
                    {meta.analysis_type}
                  </Badge>
                )}
                {meta.new_status && (
                  <Badge variant="outline" className="ml-1.5 text-[10px] capitalize py-0">
                    {meta.new_status.replace("_", " ")}
                  </Badge>
                )}
              </p>
              {meta.preview && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{meta.preview}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (!showHeader) return content;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Team Activity
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
