import { Lock, Target, Search, BarChart3, FileUp, Lightbulb, Users, Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type FeatureKey = 
  | "deep_snag" 
  | "post_mortem" 
  | "framework" 
  | "visual_export" 
  | "document_upload" 
  | "patterns" 
  | "team_workspace";

interface FeatureConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  benefits: string[];
  upgradeTo: "pro" | "team";
}

const featureConfigs: Record<FeatureKey, FeatureConfig> = {
  deep_snag: {
    title: "Deep Snag — Pre-Mortem Analysis",
    description: "Find blind spots, failure modes, and warning signals before you commit to big decisions.",
    icon: Target,
    benefits: [
      "50 Deep Snags per month",
      "Full pre-mortem framework",
      "AI-powered blind spot detection",
      "Export and share analyses",
    ],
    upgradeTo: "pro",
  },
  post_mortem: {
    title: "Post-Mortem Analysis",
    description: "Learn from what happened. Extract insights. Never make the same mistake twice.",
    icon: Search,
    benefits: [
      "25 Post-Mortems per month",
      "Structured retrospective framework",
      "Visual framework exports",
      "Action item tracking",
    ],
    upgradeTo: "pro",
  },
  framework: {
    title: "Business Frameworks",
    description: "Access SWOT, Porter's Five Forces, and other strategic analysis tools.",
    icon: BarChart3,
    benefits: [
      "Unlimited framework analyses",
      "SWOT, Porter's 5 Forces, Pre-Mortem",
      "AI-powered insights",
      "Visual exports",
    ],
    upgradeTo: "pro",
  },
  visual_export: {
    title: "Visual Frameworks",
    description: "Generate professional visuals — risk matrices, fishbone diagrams, decision trees.",
    icon: Image,
    benefits: [
      "Unlimited visual exports",
      "PNG and PDF downloads",
      "Multiple framework types",
      "Shareable images",
    ],
    upgradeTo: "pro",
  },
  document_upload: {
    title: "Document Analysis",
    description: "Upload contracts, offers, proposals. Let Snag analyze them for you.",
    icon: FileUp,
    benefits: [
      "10 uploads per month",
      "PDF, DOCX, image analysis",
      "AI extracts key decision points",
      "Integrated with Deep Snag",
    ],
    upgradeTo: "pro",
  },
  patterns: {
    title: "Personal Decision Intelligence",
    description: "See patterns in YOUR decision-making. Know your success rates. Get AI insights.",
    icon: Lightbulb,
    benefits: [
      "Monthly pattern reports",
      "Decision success tracking",
      "AI-powered insights",
      "Outcome analysis",
    ],
    upgradeTo: "pro",
  },
  team_workspace: {
    title: "Team Workspace",
    description: "Collaborate with your team. Share analyses. Think better together.",
    icon: Users,
    benefits: [
      "Up to 5 team members",
      "Shared workspace",
      "Team retrospectives",
      "Team analytics",
    ],
    upgradeTo: "team",
  },
};

const pricingInfo = {
  pro: { monthly: 12, annual: 9 },
  team: { monthly: 59, annual: 44 },
  business: { monthly: 199, annual: 149 },
};

interface FeatureUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: FeatureKey;
  reason?: "trial_used" | "limit_reached" | "pro_feature" | "team_feature";
}

export function FeatureUpgradeModal({
  open,
  onOpenChange,
  feature,
  reason,
}: FeatureUpgradeModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  
  const config = featureConfigs[feature];
  const Icon = config.icon;
  const pricing = pricingInfo[config.upgradeTo];
  const price = billingPeriod === "monthly" ? pricing.monthly : pricing.annual;

  const getReasonText = () => {
    switch (reason) {
      case "trial_used":
        return "You've used your free trial";
      case "limit_reached":
        return "You've reached your monthly limit";
      default:
        return `This is a ${config.upgradeTo === "team" ? "Team" : "Pro"} feature`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Lock className="w-5 h-5 text-primary" />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Icon className="w-8 h-8 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">{getReasonText()}</p>
              <p className="text-sm text-foreground">{config.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Upgrade to {config.upgradeTo === "team" ? "Team" : "Pro"} and get:
            </p>
            <ul className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-primary font-bold">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center gap-4 py-3 border-y border-border">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ${pricing.monthly}/month
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                billingPeriod === "annual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ${pricing.annual}/month
              <span className="ml-1 text-xs text-emerald-600 font-bold">Save 25%</span>
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Maybe later
            </Button>
            <Button
              onClick={() => {
                // TODO: Integrate with Stripe when available
                console.log("Upgrade clicked - Stripe not configured");
                onOpenChange(false);
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Upgrade Now — ${price}/mo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
