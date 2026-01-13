import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UsageData {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  analyses_used: number;
  analyses_limit: number;
  documents_used: number;
  documents_limit: number;
  storage_used_bytes: number;
  storage_limit_bytes: number;
}

export interface TierLimits {
  tier: string;
  analyses_monthly: number;
  documents_monthly: number;
  storage_bytes: number;
  max_file_bytes: number;
  max_words: number;
}

export function useUsage() {
  const { user, profile } = useAuth();

  const { data: usage, isLoading, refetch } = useQuery({
    queryKey: ["usage", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Call the get_or_create_usage function via RPC
      const { data, error } = await supabase
        .rpc("get_or_create_usage", { p_user_id: user.id });

      if (error) {
        console.error("Error fetching usage:", error);
        return null;
      }

      return data as UsageData;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  const { data: tierLimits } = useQuery({
    queryKey: ["tierLimits", profile?.subscription_tier],
    queryFn: async () => {
      const tier = profile?.subscription_tier || "free";
      const { data, error } = await supabase
        .from("tier_limits")
        .select("*")
        .eq("tier", tier)
        .maybeSingle();

      if (error) {
        console.error("Error fetching tier limits:", error);
        return null;
      }

      return data as TierLimits;
    },
    enabled: !!profile,
  });

  // Calculate days until reset
  const daysUntilReset = usage?.period_end
    ? Math.max(0, Math.ceil((new Date(usage.period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Helper to check if user can perform action
  const canUseFeature = async (feature: "analysis" | "document_upload"): Promise<boolean> => {
    if (!user?.id) return false;

    const { data, error } = await supabase
      .rpc("can_use_feature", { p_user_id: user.id, p_feature: feature });

    if (error) {
      console.error("Error checking feature:", error);
      return false;
    }

    return data as boolean;
  };

  // Synchronous check using cached usage data
  const canUseFeatureSync = (feature: "analysis" | "document_upload"): boolean => {
    if (!usage) return true; // Allow if no usage data yet
    
    // Unlimited check
    if (usage.analyses_limit === -1) return true;
    
    if (feature === "analysis") {
      return usage.analyses_used < usage.analyses_limit;
    } else if (feature === "document_upload") {
      if (usage.documents_limit === 0) return false; // Free tier
      return usage.documents_used < usage.documents_limit;
    }
    
    return true;
  };

  // Check storage limit
  const canUploadFile = (fileSize: number): boolean => {
    if (!usage) return true;
    if (usage.storage_limit_bytes === -1) return true;
    if (usage.storage_limit_bytes === 0) return false; // Free tier
    return (usage.storage_used_bytes + fileSize) <= usage.storage_limit_bytes;
  };

  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    if (bytes === -1) return "Unlimited";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Get percentage used
  const getPercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // No limit means 100%
    return Math.min(100, Math.round((used / limit) * 100));
  };

  // Get color based on percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-amber-500";
    return "bg-emerald-600";
  };

  return {
    usage,
    tierLimits,
    isLoading,
    daysUntilReset,
    canUseFeature,
    canUseFeatureSync,
    canUploadFile,
    formatBytes,
    getPercentage,
    getProgressColor,
    refetch,
    tier: profile?.subscription_tier || "free",
    isUnlimited: usage?.analyses_limit === -1,
  };
}
