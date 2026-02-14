import { Badge } from "@/components/ui/badge";
import { Clock, FileEdit, Loader2, Zap, Timer, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { icon: any; label: string; className: string; animate?: boolean }> = {
  draft: {
    icon: FileEdit,
    label: "Draft",
    className: "border-border text-muted-foreground bg-transparent",
  },
  analyzing: {
    icon: Loader2,
    label: "Analyzing",
    className: "border-warning/50 text-warning bg-warning/10",
    animate: true,
  },
  open: {
    icon: Clock,
    label: "Open",
    className: "border-primary/50 text-primary bg-primary/10",
  },
  decided: {
    icon: Zap,
    label: "Decided",
    className: "border-[hsl(215,100%,50%)]/50 text-[hsl(215,100%,50%)] bg-[hsl(215,100%,50%)]/10",
  },
  tracking: {
    icon: Timer,
    label: "Tracking",
    className: "border-[hsl(215,100%,50%)]/50 text-[hsl(215,100%,50%)] bg-transparent",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    className: "border-[hsl(160,84%,39%)]/50 text-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%)]/10",
  },
  canceled: {
    icon: XCircle,
    label: "Canceled",
    className: "border-border text-muted-foreground bg-muted",
  },
  resolved: {
    icon: CheckCircle2,
    label: "Resolved",
    className: "border-[hsl(160,84%,39%)]/50 text-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%)]/10",
  },
  in_progress: {
    icon: Clock,
    label: "In Progress",
    className: "border-warning/50 text-warning bg-warning/10",
  },
};

interface DecisionStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function DecisionStatusBadge({ status, size = "sm", className }: DecisionStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium",
        size === "sm" ? "text-[10px] py-0 px-1.5" : "text-xs py-0.5 px-2",
        config.className,
        className
      )}
    >
      <Icon className={cn("w-3 h-3", config.animate && "animate-spin")} />
      {config.label}
    </Badge>
  );
}

export { statusConfig };
