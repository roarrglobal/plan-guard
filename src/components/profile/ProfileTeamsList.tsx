import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeams, useCurrentTeamRole } from "@/hooks/useTeams";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, LogOut, Shield, Crown, Eye } from "lucide-react";

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="w-3.5 h-3.5" />,
  admin: <Shield className="w-3.5 h-3.5" />,
  viewer: <Eye className="w-3.5 h-3.5" />,
};

const roleBadgeClass: Record<string, string> = {
  owner: "bg-foreground text-background",
  admin: "bg-primary/15 text-primary",
  member: "bg-muted text-muted-foreground",
  viewer: "bg-muted/60 text-muted-foreground",
};

interface TeamWithRole {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function ProfileTeamsList() {
  const { user } = useAuth();
  const { teams, isLoading, refetch } = useTeams();
  const navigate = useNavigate();
  const [leavingTeamId, setLeavingTeamId] = useState<string | null>(null);

  const handleLeaveTeam = async (team: TeamWithRole) => {
    if (!user) return;

    // Check role restrictions
    const { data: memberData } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", team.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const myRole = (memberData as any)?.role;

    if (myRole === "owner") {
      toast.error("You must transfer ownership before leaving this team.");
      return;
    }

    // Check if last admin
    if (myRole === "admin") {
      const { data: admins } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", team.id)
        .in("role", ["owner", "admin"])
        .eq("status", "active");

      if (admins && admins.length <= 1) {
        toast.error("You're the last admin. Promote another member first.");
        return;
      }
    }

    if (!confirm(`Leave ${team.name}? You'll need a new invitation to rejoin.`)) return;

    setLeavingTeamId(team.id);

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", team.id)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to leave team");
    } else {
      toast.success(`Left ${team.name}`);
      refetch();
    }
    setLeavingTeamId(null);
  };

  if (isLoading || teams.length === 0) return null;

  return (
    <section className="bg-card rounded-xl border border-border p-4 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Your Teams
      </h2>

      <div className="divide-y divide-border">
        {teams.map((team) => (
          <TeamRow
            key={team.id}
            team={team}
            userId={user?.id}
            isLeaving={leavingTeamId === team.id}
            onLeave={handleLeaveTeam}
            onNavigate={() => navigate(`/team/${team.slug}/dashboard`)}
          />
        ))}
      </div>
    </section>
  );
}

function TeamRow({
  team,
  userId,
  isLeaving,
  onLeave,
  onNavigate,
}: {
  team: any;
  userId?: string;
  isLeaving: boolean;
  onLeave: (team: any) => void;
  onNavigate: () => void;
}) {
  // We need to get the role for this team
  const { role } = useCurrentTeamRole(team.id);
  const initial = (team.name || "T")[0].toUpperCase();

  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <button
        onClick={onNavigate}
        className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 hover:bg-primary/20 transition-colors"
      >
        {initial}
      </button>
      <div className="flex-1 min-w-0">
        <button onClick={onNavigate} className="text-sm font-medium text-foreground hover:underline truncate block text-left">
          {team.name}
        </button>
        {role && (
          <Badge className={`${roleBadgeClass[role] || ""} text-[10px] mt-0.5`} variant="outline">
            {roleIcons[role]} {role}
          </Badge>
        )}
      </div>
      {role !== "owner" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isLeaving}
          onClick={() => onLeave({ ...team, role })}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
