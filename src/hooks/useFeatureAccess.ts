import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FeatureType = 
  | "deep_snag" 
  | "post_mortem" 
  | "framework" 
  | "visual_export" 
  | "document_upload" 
  | "patterns" 
  | "team_workspace" 
  | "journal" 
  | "decision" 
  | "habit";

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: "trial_used" | "limit_reached" | "daily_limit" | "pro_feature" | "team_feature" | "no_profile";
  remaining?: number;
  limit?: number;
  unlimited?: boolean;
  is_trial?: boolean;
  can_topup?: boolean;
  upgrade_to?: "pro" | "team" | "business";
  tier: string;
}

export function useFeatureAccess(feature: FeatureType) {
  const { user, profile } = useAuth();
  const [access, setAccess] = useState<FeatureAccessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    if (!user?.id) {
      setAccess(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc("check_feature_access", { p_user_id: user.id, p_feature: feature });

      if (error) {
        console.error("Error checking feature access:", error);
        // Default to allowed if check fails
        setAccess({ allowed: true, tier: profile?.subscription_tier || "free" } as FeatureAccessResult);
      } else {
        setAccess(data as unknown as FeatureAccessResult);
      }
    } catch (err) {
      console.error("Feature access check failed:", err);
      setAccess({ allowed: true, tier: profile?.subscription_tier || "free" });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, feature, profile?.subscription_tier]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return { access, isLoading, refetch: checkAccess };
}

// Hook to check multiple features at once
export function useMultipleFeatureAccess(features: FeatureType[]) {
  const { user, profile } = useAuth();
  const [accessMap, setAccessMap] = useState<Record<FeatureType, FeatureAccessResult | null>>({} as any);
  const [isLoading, setIsLoading] = useState(true);

  const checkAll = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const results: Record<FeatureType, FeatureAccessResult | null> = {} as any;

    await Promise.all(
      features.map(async (feature) => {
        try {
          const { data, error } = await supabase
            .rpc("check_feature_access", { p_user_id: user.id, p_feature: feature });

          if (error) {
            results[feature] = { allowed: true, tier: profile?.subscription_tier || "free" } as FeatureAccessResult;
          } else {
            results[feature] = data as unknown as FeatureAccessResult;
          }
        } catch {
          results[feature] = { allowed: true, tier: profile?.subscription_tier || "free" };
        }
      })
    );

    setAccessMap(results);
    setIsLoading(false);
  }, [user?.id, features, profile?.subscription_tier]);

  useEffect(() => {
    checkAll();
  }, [checkAll]);

  return { accessMap, isLoading, refetch: checkAll };
}

// Sync check based on profile tier (for quick UI decisions)
export function useTierCheck() {
  const { profile } = useAuth();
  
  const tier = profile?.subscription_tier || "free";
  const isFree = tier === "free";
  const isPro = tier === "pro";
  const isTeam = tier === "team";
  const isBusiness = tier === "business";
  const isPaid = !isFree;

  return {
    tier,
    isFree,
    isPro,
    isTeam,
    isBusiness,
    isPaid,
    hasProFeatures: isPro || isTeam || isBusiness,
    hasTeamFeatures: isTeam || isBusiness,
    hasBusinessFeatures: isBusiness,
  };
}
