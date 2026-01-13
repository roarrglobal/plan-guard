import { cn } from "@/lib/utils";

interface UsageCounterProps {
  used: number;
  limit: number;
  label: string;
  className?: string;
}

export function UsageCounter({ used, limit, label, className }: UsageCounterProps) {
  const isAtLimit = used >= limit;
  const isNearLimit = used >= limit - 1 && !isAtLimit;

  return (
    <span className={cn(
      "text-xs",
      isAtLimit ? "text-destructive font-medium" : 
      isNearLimit ? "text-amber-600" : 
      "text-muted-foreground",
      className
    )}>
      {used}/{limit} {label}
    </span>
  );
}
