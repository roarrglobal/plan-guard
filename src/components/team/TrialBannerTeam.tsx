import { useState } from "react";
import { X, Clock } from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import type { Team } from "@/hooks/useTeams";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TrialBannerTeamProps {
  team: Team;
}

export function TrialBannerTeam({ team }: TrialBannerTeamProps) {
  const [dismissed, setDismissed] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  if (!team.trial_ends_at || team.subscription_status === "active") return null;

  const trialEndsAt = new Date(team.trial_ends_at);
  const expired = isPast(trialEndsAt);
  const daysLeft = Math.max(0, differenceInDays(trialEndsAt, new Date()));

  if (dismissed && !expired) return null;

  return (
    <>
      <div className={`flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium ${
        expired
          ? "bg-destructive/10 text-destructive"
          : "bg-primary/10 text-primary"
      }`}>
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>
          {expired
            ? "Your trial has ended."
            : `Trial: ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
          {" · "}
          Full access to all features
        </span>
        <button
          onClick={() => setInfoOpen(true)}
          className="underline underline-offset-2 hover:no-underline"
        >
          {expired ? "Subscribe" : "What happens after?"}
        </button>
        {!expired && (
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 rounded hover:bg-primary/10 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{expired ? "Your Trial Has Ended" : "After Your Trial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>When your 15-day trial ends:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>All your data is <strong className="text-foreground">preserved</strong></li>
              <li>You can still <strong className="text-foreground">view</strong> everything</li>
              <li>Creating new decisions and analyses will be limited</li>
              <li>Subscribe to keep full access</li>
            </ul>
            <div className="pt-2 flex gap-2">
              <Button className="flex-1" onClick={() => setInfoOpen(false)}>
                {expired ? "Subscribe Now" : "Got It"}
              </Button>
              {expired && (
                <Button variant="outline" className="flex-1" onClick={() => setInfoOpen(false)}>
                  Continue Limited
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
