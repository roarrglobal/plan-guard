import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function ProBadge({ className, size = "sm" }: ProBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center font-semibold uppercase tracking-wide rounded-full bg-primary text-primary-foreground",
      size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5",
      className
    )}>
      Pro
    </span>
  );
}
