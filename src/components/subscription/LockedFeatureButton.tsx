import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FeatureUpgradeModal } from "./FeatureUpgradeModal";

type FeatureKey = 
  | "deep_snag" 
  | "post_mortem" 
  | "framework" 
  | "visual_export" 
  | "document_upload" 
  | "patterns" 
  | "team_workspace";

interface LockedFeatureButtonProps {
  feature: FeatureKey;
  reason?: "trial_used" | "limit_reached" | "pro_feature" | "team_feature";
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LockedFeatureButton({
  feature,
  reason = "pro_feature",
  children,
  className,
  variant = "outline",
  size = "default",
}: LockedFeatureButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className={cn(
          "relative opacity-80 hover:opacity-100",
          className
        )}
      >
        {children}
        <Lock className="w-3.5 h-3.5 ml-1.5 text-muted-foreground" />
      </Button>

      <FeatureUpgradeModal
        open={showModal}
        onOpenChange={setShowModal}
        feature={feature}
        reason={reason}
      />
    </>
  );
}
