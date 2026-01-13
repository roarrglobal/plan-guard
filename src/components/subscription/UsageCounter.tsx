import { cn } from "@/lib/utils";

interface UsageCounterProps {
  used: number;
  limit: number;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function UsageCounter({
  used,
  limit,
  label,
  showLabel = false,
  size = "sm",
  className,
}: UsageCounterProps) {
  // Handle unlimited
  if (limit === -1) {
    return showLabel && label ? (
      <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm", className)}>
        {label}: ∞
      </span>
    ) : null;
  }

  const percentage = Math.min(100, Math.round((used / limit) * 100));
  
  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-amber-500";
    return "text-muted-foreground";
  };

  return (
    <span className={cn(
      getColor(),
      size === "sm" ? "text-xs" : "text-sm",
      "font-medium tabular-nums",
      className
    )}>
      {showLabel && label && `${label}: `}
      {used}/{limit}
    </span>
  );
}

// Compact inline usage badge for sidebar/nav
export function UsageBadge({
  used,
  limit,
  className,
}: {
  used: number;
  limit: number;
  className?: string;
}) {
  if (limit === -1) return null;

  const percentage = Math.min(100, Math.round((used / limit) * 100));
  
  const getBgColor = () => {
    if (percentage >= 100) return "bg-destructive/10 text-destructive";
    if (percentage >= 90) return "bg-red-100 text-red-600";
    if (percentage >= 70) return "bg-amber-100 text-amber-600";
    return "bg-muted text-muted-foreground";
  };

  return (
    <span className={cn(
      "text-[10px] font-medium px-1.5 py-0.5 rounded tabular-nums",
      getBgColor(),
      className
    )}>
      {used}/{limit}
    </span>
  );
}
