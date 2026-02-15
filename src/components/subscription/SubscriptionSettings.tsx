import { Check, CreditCard, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { useTierCheck } from "@/hooks/useFeatureAccess";
import { UsageCounter } from "./UsageCounter";

const tierDisplayNames: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
  business: "Business",
};

const tierPricing: Record<string, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  pro: { monthly: 12, annual: 9 },
  team: { monthly: 59, annual: 44 },
  business: { monthly: 199, annual: 149 },
};

export function SubscriptionSettings() {
  const { profile } = useAuth();
  const { usage, daysUntilReset } = useUsage();
  const { tier, isFree, isPro, isTeam, isBusiness } = useTierCheck();

  const isIndividual = profile?.user_type === "individual" || !profile?.user_type;
  
  // For individuals, cap displayed tier at Pro (they can't have team/business)
  const effectiveTier = isIndividual && (tier === "team" || tier === "business") ? "pro" : tier;
  const tierName = tierDisplayNames[effectiveTier] || "Free";
  const subscriptionStatus = (profile as any)?.subscription_status || "active";
  const isTrialing = subscriptionStatus === "trialing";

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-foreground">
                {tierName} {isTrialing && <span className="text-sm font-normal text-amber-600">(Trial)</span>}
              </p>
              {!isFree && (
                <p className="text-sm text-muted-foreground">
                  ${tierPricing[effectiveTier]?.monthly}/month • Renews in {daysUntilReset} days
                </p>
              )}
              {isFree && (
                <p className="text-sm text-muted-foreground">
                  Limited features • Upgrade for more
                </p>
              )}
            </div>
            {isFree && (
              <Button className="bg-primary hover:bg-primary/90">
                Upgrade to Pro
              </Button>
            )}
          </div>

          {/* Usage Stats for Paid Users */}
          {!isFree && usage && (
            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-sm font-medium text-foreground">This month's usage:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Deep Snags</span>
                  <UsageCounter 
                    used={usage.analyses_used || 0} 
                    limit={usage.analyses_limit} 
                    size="md" 
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Post-Mortems</span>
                  <UsageCounter 
                    used={(usage as any).post_mortems_used || 0} 
                    limit={(usage as any).post_mortems_limit || 0} 
                    size="md" 
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Documents</span>
                  <UsageCounter 
                    used={usage.documents_used || 0} 
                    limit={usage.documents_limit} 
                    size="md" 
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Resets</span>
                  <span className="text-sm font-medium">{daysUntilReset} days</span>
                </div>
              </div>
            </div>
          )}

          {/* Free User Limits */}
          {isFree && (
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-sm font-medium text-foreground">Your limits:</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  3 journal entries/day
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  3 decision captures/day
                </li>
                <li className="flex items-center gap-2">
                  <span className={
                    (profile as any)?.lifetime_deep_snags_used >= 1 
                      ? "w-4 h-4 text-center text-muted-foreground" 
                      : "w-4 h-4"
                  }>
                    {(profile as any)?.lifetime_deep_snags_used >= 1 ? "✓" : "○"}
                  </span>
                  1 Deep Snag (trial) {(profile as any)?.lifetime_deep_snags_used >= 1 && "(used)"}
                </li>
                <li className="flex items-center gap-2">
                  <span className={
                    (profile as any)?.lifetime_post_mortems_used >= 1 
                      ? "w-4 h-4 text-center text-muted-foreground" 
                      : "w-4 h-4"
                  }>
                    {(profile as any)?.lifetime_post_mortems_used >= 1 ? "✓" : "○"}
                  </span>
                  1 Post-Mortem (trial) {(profile as any)?.lifetime_post_mortems_used >= 1 && "(used)"}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  30-day history retention
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {!isBusiness && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upgrade Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isFree && (
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => console.log("Upgrade to Pro")}
              >
                <span>Upgrade to Pro — $12/month</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            )}
            {!isIndividual && (isFree || isPro) && (
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => console.log("Upgrade to Team")}
              >
                <span>Upgrade to Team — $59/month</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            )}
            {!isIndividual && (isFree || isPro || isTeam) && (
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => console.log("Upgrade to Business")}
              >
                <span>Upgrade to Business — $199/month</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Billing Management (for paid users) */}
      {!isFree && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => console.log("Manage payment method")}
            >
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Manage payment method
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-destructive"
              onClick={() => console.log("Cancel subscription")}
            >
              Cancel subscription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
