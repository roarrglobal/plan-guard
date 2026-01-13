import { cn } from "@/lib/utils";

interface SnagLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SnagLogo({ className, size = "md" }: SnagLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span className={cn("font-bold tracking-tight", sizeClasses[size], className)}>
      <span className="text-primary">S</span>
      <span className="text-foreground">nag</span>
    </span>
  );
}
