import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProBadge } from "./ProBadge";

interface LockedFeatureProps {
  children: React.ReactNode;
  onUnlockClick?: () => void;
  showProBadge?: boolean;
  className?: string;
}

export function LockedFeature({ 
  children, 
  onUnlockClick,
  showProBadge = true,
  className 
}: LockedFeatureProps) {
  return (
    <div 
      className={cn(
        "relative opacity-60 pointer-events-none",
        className
      )}
    >
      {children}
      
      {/* Lock overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto"
        onClick={onUnlockClick}
      >
        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          {showProBadge && <ProBadge />}
        </div>
      </div>
    </div>
  );
}
