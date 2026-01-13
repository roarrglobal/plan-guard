import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, ArrowRight } from "lucide-react";

interface LimitReachedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType: "analysis" | "document" | "storage";
  currentTier: string;
}

const limitMessages = {
  analysis: {
    title: "Analysis Limit Reached",
    description: "You've used all your analyses for this month.",
    icon: AlertTriangle,
  },
  document: {
    title: "Document Upload Limit Reached", 
    description: "You've used all your document uploads for this month.",
    icon: AlertTriangle,
  },
  storage: {
    title: "Storage Limit Reached",
    description: "You've reached your storage limit.",
    icon: AlertTriangle,
  },
};

const tierUpgrades: Record<string, { next: string; price: string }> = {
  free: { next: "Pro", price: "$9/mo" },
  pro: { next: "Team", price: "$49/mo" },
  team: { next: "Business", price: "$149/mo" },
  business: { next: "Enterprise", price: "Custom" },
};

export default function LimitReachedModal({
  open,
  onOpenChange,
  limitType,
  currentTier,
}: LimitReachedModalProps) {
  const navigate = useNavigate();
  const { title, description, icon: Icon } = limitMessages[limitType];
  const upgrade = tierUpgrades[currentTier] || tierUpgrades.free;

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/#pricing");
  };

  const handleTopUp = () => {
    onOpenChange(false);
    // TODO: Implement top-up flow
    navigate("/#pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
            <Icon className="w-7 h-7 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Options */}
          <div className="space-y-3">
            {/* Top-up option */}
            {limitType === "analysis" && currentTier !== "free" && (
              <button
                onClick={handleTopUp}
                className="w-full p-4 rounded-lg border border-border hover:border-cobalt/50 hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Get a top-up pack</p>
                    <p className="text-sm text-muted-foreground">$5 for 25 analyses</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-cobalt transition-colors" />
                </div>
              </button>
            )}

            {/* Upgrade option */}
            {currentTier !== "enterprise" && (
              <button
                onClick={handleUpgrade}
                className="w-full p-4 rounded-lg border-2 border-crimson bg-crimson/5 hover:bg-crimson/10 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-crimson/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-crimson" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Upgrade to {upgrade.next}</p>
                    <p className="text-sm text-muted-foreground">Starting at {upgrade.price}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-crimson group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}

            {/* Wait option */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Or wait until your usage resets next month
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
