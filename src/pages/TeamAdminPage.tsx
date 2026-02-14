import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers, useTeamInvitations } from "@/hooks/useTeams";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Users, ListChecks, BarChart3, Zap, Settings, UserPlus, Trash2,
  Calendar, Shield, ShieldCheck, Eye, Clock, ArrowRight, Search,
  Download, Mail
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import type { Team } from "@/hooks/useTeams";

const roleBadgeClass: Record<string, string> = {
  owner: "bg-foreground text-background",
  admin: "bg-primary text-primary-foreground",
  member: "bg-muted text-muted-foreground",
  viewer: "bg-muted/60 text-muted-foreground",
};

const roleIcons: Record<string, typeof Shield> = {
  owner: ShieldCheck,
  admin: Shield,
  member: Users,
  viewer: Eye,
};

export default function TeamAdminPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { members, refetch: refetchMembers } = useTeamMembers(team?.id);
  const { invitations, refetch: refetchInvitations } = useTeamInvitations(team?.id);
  const { can, isAdmin } = useTeamPermissions(team?.id);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const activeMembers = members.filter((m) => m.status === "active");

  // Access control
  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">Only team owners and admins can access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  // Queries
  const { data: totalDecisions = 0 } = useQuery({
    queryKey: ["admin-decisions-count", team?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("team_decisions")
        .select("id", { count: "exact", head: true })
        .eq("team_id", team.id);
      return count || 0;
    },
    enabled: !!team?.id,
  });

  const { data: totalAnalyses = 0 } = useQuery({
    queryKey: ["admin-analyses-count", team?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("team_analyses")
        .select("id", { count: "exact", head: true })
        .eq("team_id", team.id);
      return count || 0;
    },
    enabled: !!team?.id,
  });

  const { data: totalOutcomes = 0 } = useQuery({
    queryKey: ["admin-outcomes-count", team?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("team_outcomes")
        .select("id", { count: "exact", head: true })
        .eq("team_id", team.id);
      return count || 0;
    },
    enabled: !!team?.id,
  });

  const { data: usage } = useQuery({
    queryKey: ["admin-usage", team?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_or_create_team_usage", { p_team_id: team.id });
      return data as any;
    },
    enabled: !!team?.id,
  });

  const { data: memberDecisionCounts = {} } = useQuery({
    queryKey: ["admin-member-decisions", team?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_decisions")
        .select("created_by")
        .eq("team_id", team.id);
      const counts: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        counts[d.created_by] = (counts[d.created_by] || 0) + 1;
      });
      return counts;
    },
    enabled: !!team?.id,
  });

  // Trial info
  const trialEndsAt = team.trial_ends_at ? new Date(team.trial_ends_at) : null;
  const trialExpired = trialEndsAt ? isPast(trialEndsAt) : false;
  const trialDaysLeft = trialEndsAt ? Math.max(0, differenceInDays(trialEndsAt, new Date())) : 0;

  // Filter members
  const filteredMembers = activeMembers.filter((m) => {
    if (!memberSearch) return true;
    const q = memberSearch.toLowerCase();
    return (m.display_name || "").toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q);
  });

  // Invite handler
  const handleBulkInvite = async () => {
    if (!user || !team) return;
    setIsSending(true);
    const emails = inviteEmails
      .split(/[,\n]/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@"));

    if (emails.length === 0) {
      toast.error("Enter at least one valid email");
      setIsSending(false);
      return;
    }

    let sent = 0;
    for (const email of emails) {
      const token = crypto.randomUUID();
      const { error } = await supabase.from("team_invitations").insert({
        team_id: team.id,
        email,
        role: inviteRole as any,
        token,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (!error) sent++;
    }

    if (sent > 0) {
      toast.success(`${sent} invitation${sent > 1 ? "s" : ""} sent!`);
      await supabase.from("team_activity").insert({
        team_id: team.id,
        user_id: user.id,
        action_type: "members_invited",
        entity_type: "invitation",
        metadata: { count: sent },
      });
      setInviteEmails("");
      setInviteMessage("");
      setInviteOpen(false);
      refetchInvitations();
    }
    setIsSending(false);
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from("team_members")
      .update({ role: newRole as any })
      .eq("id", memberId);
    if (error) toast.error(error.message);
    else {
      toast.success("Role updated");
      refetchMembers();
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName || "this member"} from the team?`)) return;
    const { error } = await supabase.from("team_members").delete().eq("id", memberId);
    if (error) toast.error(error.message);
    else {
      toast.success("Member removed");
      refetchMembers();
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    const { error } = await supabase.from("team_invitations").delete().eq("id", inviteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Invitation cancelled");
      refetchInvitations();
    }
  };

  const exportMembersCsv = () => {
    const rows = [["Name", "Email", "Role", "Joined", "Decisions", "Last Active"]];
    activeMembers.forEach((m) => {
      rows.push([
        m.display_name || "Unknown",
        m.email || "",
        m.role,
        m.joined_at ? format(new Date(m.joined_at), "yyyy-MM-dd") : "",
        String(memberDecisionCounts[m.user_id] || 0),
        (m as any).last_active_at ? format(new Date((m as any).last_active_at), "yyyy-MM-dd") : "",
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${team.slug}-members.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage {team.name}</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1" /> Invite Members
        </Button>
      </div>

      {/* Section 1: Team Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Trial Status</p>
            {trialExpired ? (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Expired</Badge>
            ) : team.subscription_status === "active" ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">Active</Badge>
            ) : (
              <div>
                <p className="text-xl font-bold text-foreground">{trialDaysLeft} days</p>
                <p className="text-[10px] text-muted-foreground">remaining</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Members</p>
            <p className="text-xl font-bold text-foreground">{activeMembers.length}</p>
            <p className="text-[10px] text-muted-foreground">
              {invitations.length > 0 && `${invitations.length} pending`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Decisions</p>
            <p className="text-xl font-bold text-foreground">{totalDecisions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Deep Snags</p>
            <p className="text-xl font-bold text-foreground">{usage?.deep_snags_used || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Member Management */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Member Management</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search..."
                className="h-8 w-40 pl-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportMembersCsv} className="h-8">
              <Download className="w-3.5 h-3.5 mr-1" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Member</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Joined</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Decisions</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Last Active</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((m) => {
                  const RoleIcon = roleIcons[m.role] || Users;
                  return (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={m.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-muted">
                              {(m.display_name || "U")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{m.display_name || "User"}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{m.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {m.role === "owner" ? (
                          <Badge className={roleBadgeClass.owner}>owner</Badge>
                        ) : can("change_member_role") ? (
                          <Select value={m.role} onValueChange={(v) => handleChangeRole(m.id, v)}>
                            <SelectTrigger className="h-7 w-24 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={roleBadgeClass[m.role] || ""} variant="outline">{m.role}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {m.joined_at ? format(new Date(m.joined_at), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-foreground">
                        {memberDecisionCounts[m.user_id] || 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {(m as any).last_active_at
                          ? format(new Date((m as any).last_active_at), "MMM d, yyyy")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {can("remove_member") && m.role !== "owner" && m.user_id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(m.id, m.display_name || "")}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-border">
            {filteredMembers.map((m) => (
              <div key={m.id} className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={m.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-muted">
                      {(m.display_name || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.display_name || "User"}</p>
                    <p className="text-[10px] text-muted-foreground">{m.email || ""}</p>
                  </div>
                  <Badge className={roleBadgeClass[m.role] || ""} variant="outline">{m.role}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{memberDecisionCounts[m.user_id] || 0} decisions</span>
                  <span>Joined {m.joined_at ? format(new Date(m.joined_at), "MMM d") : "—"}</span>
                </div>
                {can("remove_member") && m.role !== "owner" && m.user_id !== user?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-7 text-xs"
                    onClick={() => handleRemoveMember(m.id, m.display_name || "")}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires {format(new Date(inv.expires_at), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge variant="outline">{inv.role}</Badge>
                <button
                  onClick={() => handleCancelInvite(inv.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Section 3: Usage Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Deep Snags", value: usage?.deep_snags_used || 0, icon: Zap },
              { label: "Quick Snags", value: usage?.quick_snags_used || 0, icon: Zap },
              { label: "Decisions", value: totalDecisions, icon: ListChecks },
              { label: "Outcomes", value: totalOutcomes, icon: BarChart3 },
              { label: "Analyses", value: totalAnalyses, icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Invite Members", icon: UserPlus, action: () => setInviteOpen(true) },
              { label: "All Decisions", icon: ListChecks, action: () => navigate(`/team/${team.slug}/decisions`) },
              { label: "Team Analytics", icon: BarChart3, action: () => navigate(`/team/${team.slug}/analytics`) },
              { label: "Team Settings", icon: Settings, action: () => navigate(`/team/${team.slug}/settings`) },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors text-left group"
              >
                <item.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>Add colleagues to {team.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Emails</Label>
              <Textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="Enter emails, one per line or comma-separated"
                rows={3}
                className="resize-none"
              />
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
            <div className="space-y-2">
              <Label>Personal Message (optional)</Label>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Hey, join our team on Snag..."
                rows={2}
                className="resize-none"
              />
            </div>
            <Button onClick={handleBulkInvite} disabled={!inviteEmails.trim() || isSending} className="w-full">
              {isSending ? "Sending..." : "Send Invitations"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
