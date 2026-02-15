import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface SoftLaunchData {
  trialStartDate: Date | null;
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  deepSnagsUsed: number;
  retrosUsed: number;
  journalsToday: number;
  waitlistJoined: boolean;
  discountCode: string | null;
}

export interface SoftLaunchLimits {
  deepSnags: { used: number; limit: number };
  retros: { used: number; limit: number };
  journalsPerDay: { used: number; limit: number };
  postMortems: { locked: true };
  habits: { viewOnly: true };
  historyLimit: number;
}

const FREE_TRIAL_LIMITS = {
  deepSnags: 1,
  retros: 1,
  journalsPerDay: 3,
  historyLimit: 3,
};

export function useSoftLaunch() {
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  // Get today's journal count
  const { data: journalsToday = 0 } = useQuery({
    queryKey: ["journalsToday", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString());
      
      if (error) {
        console.error("Error fetching journals today:", error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
  });

  // Calculate trial status from profile using trial_ends_at (15-day trial)
  const trialStartDate = profile?.trial_start_date 
    ? new Date(profile.trial_start_date) 
    : null;
  
  const trialEndsAt = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : null;
  
  const trialDaysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  const isTrialExpired = trialEndsAt 
    ? Date.now() > trialEndsAt.getTime()
    : false;

  const deepSnagsUsed = profile?.deep_snags_used ?? 0;
  const retrosUsed = profile?.retros_used ?? 0;
  const waitlistJoined = profile?.waitlist_joined ?? false;
  const discountCode = profile?.discount_code ?? null;
  
  // Check if user has a paid tier (bypasses soft launch limits)
  const tier = profile?.subscription_tier ?? "free";
  const isPaidTier = tier !== "free";

  // Join waitlist mutation
  const joinWaitlistMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Insert into waitlist table
      const { error: waitlistError } = await supabase
        .from("waitlist")
        .insert({
          user_id: user.id,
          email,
          discount_code: "EARLY30",
          source: "trial_limit",
        });

      if (waitlistError && !waitlistError.message.includes("duplicate")) {
        throw waitlistError;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          waitlist_joined: true,
          waitlist_joined_at: new Date().toISOString(),
          discount_code: "EARLY30",
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      await refreshProfile();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Increment deep snags used
  const incrementDeepSnags = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    const { data, error } = await supabase
      .rpc("increment_deep_snags_used", { p_user_id: user.id });
    
    if (error) {
      console.error("Error incrementing deep snags:", error);
      return false;
    }
    
    await refreshProfile();
    return true;
  };

  // Increment retros used
  const incrementRetros = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    const { data, error } = await supabase
      .rpc("increment_retros_used", { p_user_id: user.id });
    
    if (error) {
      console.error("Error incrementing retros:", error);
      return false;
    }
    
    await refreshProfile();
    return true;
  };

  // Check if user can use a feature (paid tiers bypass all soft launch limits)
  const canUseDeepSnag = isPaidTier || (deepSnagsUsed < FREE_TRIAL_LIMITS.deepSnags && !isTrialExpired);
  const canUseRetro = isPaidTier || (retrosUsed < FREE_TRIAL_LIMITS.retros && !isTrialExpired);
  const canUseJournal = isPaidTier || journalsToday < FREE_TRIAL_LIMITS.journalsPerDay;
  const isPostMortemLocked = !isPaidTier; // Only locked for free tier
  const isHabitsViewOnly = !isPaidTier; // Only view-only for free tier

  // Get limits object
  const limits: SoftLaunchLimits = {
    deepSnags: { used: deepSnagsUsed, limit: FREE_TRIAL_LIMITS.deepSnags },
    retros: { used: retrosUsed, limit: FREE_TRIAL_LIMITS.retros },
    journalsPerDay: { used: journalsToday, limit: FREE_TRIAL_LIMITS.journalsPerDay },
    postMortems: { locked: true },
    habits: { viewOnly: true },
    historyLimit: FREE_TRIAL_LIMITS.historyLimit,
  };

  return {
    // Trial status
    trialStartDate,
    trialDaysRemaining,
    isTrialExpired,
    
    // Usage counts
    deepSnagsUsed,
    retrosUsed,
    journalsToday,
    
    // Waitlist status
    waitlistJoined,
    discountCode,
    joinWaitlist: joinWaitlistMutation.mutateAsync,
    isJoiningWaitlist: joinWaitlistMutation.isPending,
    
    // Feature availability
    canUseDeepSnag,
    canUseRetro,
    canUseJournal,
    isPostMortemLocked,
    isHabitsViewOnly,
    
    // Actions
    incrementDeepSnags,
    incrementRetros,
    
    // Limits
    limits,
    
    // Constants
    FREE_TRIAL_LIMITS,
  };
}
