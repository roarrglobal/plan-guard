import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  className?: string;
}

export function TrialBanner({ className }: TrialBannerProps) {
  const { profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const trialEndsAt = profile?.subscription_status === "trialing" 
    ? profile.trial_ends_at 
    : null;

  useEffect(() => {
    if (!trialEndsAt) return;

    const updateTime = () => {
      const now = new Date();
      const end = new Date(trialEndsAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Trial ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      if (days > 0) {
        setTimeRemaining(`${days} day${days > 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`);
      } else {
        setTimeRemaining(`${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  if (!trialEndsAt || dismissed) return null;

  const hoursRemaining = Math.floor(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60)
  );
  const isUrgent = hoursRemaining <= 6;

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 text-sm",
      isUrgent 
        ? "bg-amber-100 border-amber-200 text-amber-900" 
        : "bg-primary/10 border-primary/20 text-primary",
      "border-b",
      className
    )}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span className="font-medium">
          Pro Trial: {timeRemaining} remaining
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isUrgent ? "default" : "outline"}
          className="h-7 text-xs"
          onClick={() => {
            // TODO: Navigate to upgrade
            console.log("Upgrade clicked");
          }}
        >
          Upgrade Now
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-black/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
