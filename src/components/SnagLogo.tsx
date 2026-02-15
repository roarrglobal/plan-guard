import { cn } from "@/lib/utils";
import snagLogo from "@/assets/snag-logo-full.png";

interface SnagLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function SnagLogo({ className, size = "md" }: SnagLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-12",
  };

  return (
    <img
      src={snagLogo}
      alt="Snag"
      className={cn(sizeClasses[size], "w-auto", className)}
    />
  );
}
