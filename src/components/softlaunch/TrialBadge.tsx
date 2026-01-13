import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSoftLaunch } from "@/hooks/useSoftLaunch";

interface TrialBadgeProps {
  className?: string;
}

export function TrialBadge({ className }: TrialBadgeProps) {
  const { trialDaysRemaining, isTrialExpired, waitlistJoined } = useSoftLaunch();

  if (isTrialExpired) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-muted text-muted-foreground",
        className
      )}>
        <span>Free Plan</span>
      </div>
    );
  }

  if (waitlistJoined) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-primary/10 text-primary",
        className
      )}>
        <span>On Waitlist ✓</span>
      </div>
    );
  }

  const isUrgent = trialDaysRemaining <= 1;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      isUrgent 
        ? "bg-amber-100 text-amber-900" 
        : "bg-primary/10 text-primary",
      className
    )}>
      <Clock className="w-3 h-3" />
      <span>
        Free Trial: {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""} left
      </span>
    </div>
  );
}
