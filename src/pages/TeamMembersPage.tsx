import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers, useTeamInvitations } from "@/hooks/useTeams";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Trash2, Clock, Mail } from "lucide-react";
import type { Team } from "@/hooks/useTeams";
import { format } from "date-fns";

const roleBadgeClass: Record<string, string> = {
  owner: "bg-foreground text-background",
  admin: "bg-primary text-primary-foreground",
  member: "bg-muted text-muted-foreground",
  viewer: "bg-muted/60 text-muted-foreground",
};

export default function TeamMembersPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const { members, refetch: refetchMembers } = useTeamMembers(team?.id);
  const { invitations, refetch: refetchInvitations } = useTeamInvitations(team?.id);
  const { can } = useTeamPermissions(team?.id);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isSending, setIsSending] = useState(false);

  const activeMembers = members.filter((m) => m.status === "active");

  const handleInvite = async () => {
    if (!user || !team) return;
    setIsSending(true);
    const { error } = await supabase.from("team_invitations").insert({
      team_id: team.id,
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole as any,
      invited_by: user.id,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteOpen(false);
      refetchInvitations();
    }
    setIsSending(false);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName || "this member"} from the team?`)) return;
    const { error } = await supabase.from("team_members").delete().eq("id", memberId);
    if (error) toast.error(error.message);
    else { toast.success("Member removed"); refetchMembers(); }
  };

  const handleCancelInvite = async (inviteId: string) => {
    const { error } = await supabase.from("team_invitations").delete().eq("id", inviteId);
    if (error) toast.error(error.message);
    else { toast.success("Invitation cancelled"); refetchInvitations(); }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground">{activeMembers.length} active member{activeMembers.length !== 1 ? "s" : ""}</p>
        </div>
        {can("invite_member") && (
          <Button onClick={() => setInviteOpen(true)} size="sm">
            <UserPlus className="w-4 h-4 mr-2" /> Invite
          </Button>
        )}
      </div>

      {/* Members list */}
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {activeMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-4">
              <Avatar className="w-9 h-9">
                <AvatarImage src={m.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-muted">
                  {(m.display_name || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.display_name || "User"}</p>
                {m.joined_at && <p className="text-xs text-muted-foreground">Joined {format(new Date(m.joined_at), "MMM d, yyyy")}</p>}
              </div>
              <Badge className={roleBadgeClass[m.role] || ""} variant="outline">
                {m.role}
              </Badge>
              {can("remove_member") && m.role !== "owner" && m.user_id !== user?.id && (
                <button onClick={() => handleRemoveMember(m.id, m.display_name || "")} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending invitations */}
      {can("view_invitations") && invitations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Pending Invitations</CardTitle></CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">Expires {format(new Date(inv.expires_at), "MMM d, yyyy")}</p>
                </div>
                <Badge variant="outline">{inv.role}</Badge>
                <button onClick={() => handleCancelInvite(inv.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invite modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join {team.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim() || isSending} className="w-full">
              {isSending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
