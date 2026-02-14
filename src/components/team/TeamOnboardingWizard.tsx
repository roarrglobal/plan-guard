import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users, Rocket, FileText, Zap, Plus, X, Check, ArrowRight, ArrowLeft,
  Mail, Shield, Eye, UserPlus, Sparkles
} from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";
import { getDeptStyle } from "@/lib/departments";
import { useDecisionTemplates } from "@/hooks/useDecisionTemplates";
import type { Team } from "@/hooks/useTeams";

interface TeamOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
}

const STEPS = [
  { id: "welcome", label: "Welcome", icon: Rocket },
  { id: "invite", label: "Invite", icon: UserPlus },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "decide", label: "First Decision", icon: Zap },
];

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", desc: "Full management access", icon: Shield },
  { value: "member", label: "Member", desc: "Create & manage own decisions", icon: Users },
  { value: "viewer", label: "Viewer", desc: "Read-only access", icon: Eye },
];

export function TeamOnboardingWizard({ open, onOpenChange, team }: TeamOnboardingWizardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Invite step state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [invitedEmails, setInvitedEmails] = useState<{ email: string; role: string }[]>([]);
  const [isSendingInvites, setIsSendingInvites] = useState(false);

  // Templates step state
  const { data: templates = [] } = useDecisionTemplates(team?.id);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const filteredTemplates = selectedDept
    ? templates.filter(t => t.department === selectedDept)
    : templates.slice(0, 6);

  const addInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    if (invitedEmails.some(e => e.email === email)) {
      toast.error("Already added");
      return;
    }
    setInvitedEmails(prev => [...prev, { email, role: inviteRole }]);
    setInviteEmail("");
  };

  const removeInvite = (email: string) => {
    setInvitedEmails(prev => prev.filter(e => e.email !== email));
  };

  const sendInvites = async () => {
    if (!user || invitedEmails.length === 0) return;
    setIsSendingInvites(true);

    let sent = 0;
    for (const invite of invitedEmails) {
      const token = crypto.randomUUID();
      const { error } = await supabase.from("team_invitations").insert({
        team_id: team.id,
        email: invite.email,
        role: invite.role as any,
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
    }
    setIsSendingInvites(false);
    setStep(2);
  };

  const handleFinish = () => {
    onOpenChange(false);
    // Mark onboarding complete in team settings
    supabase
      .from("teams")
      .update({ settings: { ...(team.settings || {}), onboarding_completed: true } })
      .eq("id", team.id)
      .then(() => {});
  };

  const goToNewDecision = (templateId?: string) => {
    onOpenChange(false);
    supabase
      .from("teams")
      .update({ settings: { ...(team.settings || {}), onboarding_completed: true } })
      .eq("id", team.id)
      .then(() => {});
    const path = templateId
      ? `/team/${team.slug}/decisions/new?template=${templateId}`
      : `/team/${team.slug}/decisions/new`;
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        {/* Step indicator */}
        <div className="flex items-center gap-0 border-b border-border px-6 pt-5 pb-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 mt-[-12px] ${isDone ? "bg-primary/30" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-5 min-h-[320px] flex flex-col">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Welcome to {team.name}</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Let's set up your team workspace in under 2 minutes. You'll invite members,
                  explore decision templates, and run your first analysis.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full max-w-xs pt-2">
                {[
                  { icon: UserPlus, label: "Invite team" },
                  { icon: FileText, label: "Pick templates" },
                  { icon: Zap, label: "First decision" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Invite Members */}
          {step === 1 && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Invite your team</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Add colleagues who should be part of decision-making. You can always invite more later.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    onKeyDown={(e) => e.key === "Enter" && addInvite()}
                    className="bg-input"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="h-10 rounded-md border border-input bg-input px-2 text-sm text-foreground"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <Button size="icon" onClick={addInvite} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {invitedEmails.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-auto">
                  {invitedEmails.map((inv) => (
                    <div
                      key={inv.email}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{inv.email}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">{inv.role}</Badge>
                      </div>
                      <button onClick={() => removeInvite(inv.email)} className="p-1 hover:bg-muted rounded">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {invitedEmails.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-6">
                  <p className="text-xs text-muted-foreground">No invites added yet. Add emails above or skip this step.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Templates */}
          {step === 2 && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Explore templates</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Templates provide department-specific blind spots and failure modes for better analysis.
                </p>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <Button
                  size="sm"
                  variant={!selectedDept ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => setSelectedDept(null)}
                >
                  All
                </Button>
                {DEPARTMENTS.map((d) => {
                  const style = getDeptStyle(d.value);
                  return (
                    <Button
                      key={d.value}
                      size="sm"
                      variant={selectedDept === d.value ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => setSelectedDept(d.value)}
                    >
                      {d.label}
                    </Button>
                  );
                })}
              </div>

              <div className="space-y-2 max-h-44 overflow-auto">
                {filteredTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No templates found</p>
                ) : (
                  filteredTemplates.map((t) => {
                    const style = getDeptStyle(t.department);
                    return (
                      <button
                        key={t.id}
                        onClick={() => goToNewDecision(t.id)}
                        className="w-full p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                            <FileText className={`w-4 h-4 ${style.text}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-foreground">{t.name}</span>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{t.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Step 3: First Decision */}
          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Run your first decision</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Capture a decision your team is facing and let Snag surface blind spots,
                  failure modes, and warning signals.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                <Button onClick={() => goToNewDecision()} className="flex-col h-auto py-4 gap-2">
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">From Scratch</span>
                </Button>
                <Button variant="outline" onClick={() => setStep(2)} className="flex-col h-auto py-4 gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">Use Template</span>
                </Button>
              </div>
              <button
                onClick={handleFinish}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                I'll do this later
              </button>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <div>
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step === 0 && (
              <Button onClick={() => setStep(1)}>
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            {step === 1 && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Skip
                </Button>
                <Button
                  onClick={sendInvites}
                  disabled={invitedEmails.length === 0 || isSendingInvites}
                >
                  {isSendingInvites ? "Sending..." : `Send ${invitedEmails.length} Invite${invitedEmails.length !== 1 ? "s" : ""}`}
                  {!isSendingInvites && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </>
            )}
            {step === 2 && (
              <Button onClick={() => setStep(3)}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
