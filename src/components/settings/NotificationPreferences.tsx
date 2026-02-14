import { Bell, Mail, Users, Megaphone, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmailPreferences, useUpdateEmailPreferences } from "@/hooks/useEmailPreferences";
import { toast } from "sonner";

export function NotificationPreferences() {
  const { data: prefs, isLoading } = useEmailPreferences();
  const updatePrefs = useUpdateEmailPreferences();

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updatePrefs.mutateAsync({ [key]: value } as any);
      toast.success("Preferences updated");
    } catch {
      toast.error("Failed to update preferences");
    }
  };

  const handleUnsubscribeAll = async (value: boolean) => {
    try {
      await updatePrefs.mutateAsync({ unsubscribed_all: value });
      toast.success(value ? "Unsubscribed from all emails" : "Email notifications re-enabled");
    } catch {
      toast.error("Failed to update preferences");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14" />)}
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="space-y-6">
      {/* Decision Updates */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Decision Updates
        </h3>
        <div className="analysis-card divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="font-medium text-foreground">Outcome reminders</Label>
                <p className="text-xs text-muted-foreground">Get reminded when it's time to log outcomes</p>
              </div>
            </div>
            <Switch
              checked={prefs.outcome_reminders}
              onCheckedChange={(v) => handleToggle("outcome_reminders", v)}
              disabled={prefs.unsubscribed_all}
            />
          </div>
        </div>
      </section>

      {/* Team Updates */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Team Updates
        </h3>
        <div className="analysis-card divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="font-medium text-foreground">Weekly team digest</Label>
                <p className="text-xs text-muted-foreground">Summary of team decisions every Monday</p>
              </div>
            </div>
            <Switch
              checked={prefs.weekly_digest}
              onCheckedChange={(v) => handleToggle("weekly_digest", v)}
              disabled={prefs.unsubscribed_all}
            />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="font-medium text-foreground">Team activity</Label>
                <p className="text-xs text-muted-foreground">Comments, status changes, and analysis completions</p>
              </div>
            </div>
            <Switch
              checked={prefs.team_activity}
              onCheckedChange={(v) => handleToggle("team_activity", v)}
              disabled={prefs.unsubscribed_all}
            />
          </div>
        </div>
      </section>

      {/* Product Updates */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Product Updates
        </h3>
        <div className="analysis-card divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Megaphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="font-medium text-foreground">Product news</Label>
                <p className="text-xs text-muted-foreground">New features and platform updates</p>
              </div>
            </div>
            <Switch
              checked={prefs.product_updates}
              onCheckedChange={(v) => handleToggle("product_updates", v)}
              disabled={prefs.unsubscribed_all}
            />
          </div>
        </div>
      </section>

      {/* Unsubscribe All */}
      <section>
        <div className="analysis-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <Label className="font-medium text-foreground">Unsubscribe from all</Label>
                <p className="text-xs text-muted-foreground">You'll miss outcome reminders and team updates</p>
              </div>
            </div>
            <Switch
              checked={prefs.unsubscribed_all}
              onCheckedChange={handleUnsubscribeAll}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
