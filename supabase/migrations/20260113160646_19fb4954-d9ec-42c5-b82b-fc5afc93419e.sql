-- Add lifetime usage tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lifetime_deep_snags_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_post_mortems_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_frameworks_used INTEGER DEFAULT 0;

-- Update tier_limits with the new comprehensive limits
UPDATE public.tier_limits SET 
  analyses_monthly = 1,
  post_mortems_monthly = 1,
  frameworks_monthly = 2,
  habits_limit = 3,
  journal_daily = 3,
  decisions_daily = 3
WHERE tier = 'free';

UPDATE public.tier_limits SET 
  analyses_monthly = 50,
  post_mortems_monthly = 25,
  frameworks_monthly = -1,
  habits_limit = 10,
  journal_daily = -1,
  decisions_daily = -1,
  documents_monthly = 10,
  max_file_bytes = 5242880,
  max_words = 10000
WHERE tier = 'pro';

-- Add team tier if not exists
INSERT INTO public.tier_limits (tier, analyses_monthly, documents_monthly, storage_bytes, max_file_bytes, max_words, post_mortems_monthly, frameworks_monthly, habits_limit, journal_daily, decisions_daily)
VALUES ('team', 200, 50, 5368709120, 10485760, 25000, 100, -1, -1, -1, -1)
ON CONFLICT (tier) DO UPDATE SET
  analyses_monthly = 200,
  documents_monthly = 50,
  storage_bytes = 5368709120,
  max_file_bytes = 10485760,
  max_words = 25000,
  post_mortems_monthly = 100,
  frameworks_monthly = -1,
  habits_limit = -1,
  journal_daily = -1,
  decisions_daily = -1;

-- Add business tier if not exists
INSERT INTO public.tier_limits (tier, analyses_monthly, documents_monthly, storage_bytes, max_file_bytes, max_words, post_mortems_monthly, frameworks_monthly, habits_limit, journal_daily, decisions_daily)
VALUES ('business', 1000, 200, 26843545600, 26214400, 50000, 500, -1, -1, -1, -1)
ON CONFLICT (tier) DO UPDATE SET
  analyses_monthly = 1000,
  documents_monthly = 200,
  storage_bytes = 26843545600,
  max_file_bytes = 26214400,
  max_words = 50000,
  post_mortems_monthly = 500,
  frameworks_monthly = -1,
  habits_limit = -1,
  journal_daily = -1,
  decisions_daily = -1;

-- Add usage columns for daily limits
ALTER TABLE public.usage
ADD COLUMN IF NOT EXISTS habits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS habits_limit INTEGER DEFAULT 3;

-- Create enhanced feature check function
CREATE OR REPLACE FUNCTION public.check_feature_access(
  p_user_id UUID,
  p_feature TEXT
) RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_usage RECORD;
  v_tier_limits RECORD;
  v_result JSONB;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN '{"allowed": false, "reason": "no_profile"}'::JSONB;
  END IF;
  
  -- Get current period usage
  SELECT * INTO v_usage FROM public.usage 
  WHERE user_id = p_user_id 
  AND CURRENT_DATE BETWEEN period_start::date AND period_end::date
  LIMIT 1;
  
  -- Get tier limits
  SELECT * INTO v_tier_limits FROM public.tier_limits 
  WHERE tier = COALESCE(v_profile.subscription_tier, 'free');
  
  -- Check by feature and tier
  CASE p_feature
    WHEN 'deep_snag' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') = 'free' THEN
        IF COALESCE(v_profile.lifetime_deep_snags_used, 0) < 1 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', 1 - COALESCE(v_profile.lifetime_deep_snags_used, 0), 'is_trial', true);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'trial_used', 'upgrade_to', 'pro');
        END IF;
      ELSE
        IF v_tier_limits.analyses_monthly = -1 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
        ELSIF COALESCE(v_usage.analyses_used, 0) < v_tier_limits.analyses_monthly THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', v_tier_limits.analyses_monthly - COALESCE(v_usage.analyses_used, 0), 'limit', v_tier_limits.analyses_monthly);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'limit_reached', 'can_topup', true);
        END IF;
      END IF;
    
    WHEN 'post_mortem' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') = 'free' THEN
        IF COALESCE(v_profile.lifetime_post_mortems_used, 0) < 1 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', 1 - COALESCE(v_profile.lifetime_post_mortems_used, 0), 'is_trial', true);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'trial_used', 'upgrade_to', 'pro');
        END IF;
      ELSE
        IF v_tier_limits.post_mortems_monthly = -1 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
        ELSIF COALESCE(v_usage.post_mortems_used, 0) < v_tier_limits.post_mortems_monthly THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', v_tier_limits.post_mortems_monthly - COALESCE(v_usage.post_mortems_used, 0), 'limit', v_tier_limits.post_mortems_monthly);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'limit_reached', 'can_topup', true);
        END IF;
      END IF;
    
    WHEN 'framework' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') = 'free' THEN
        IF COALESCE(v_profile.lifetime_frameworks_used, 0) < 2 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', 2 - COALESCE(v_profile.lifetime_frameworks_used, 0), 'is_trial', true);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'trial_used', 'upgrade_to', 'pro');
        END IF;
      ELSE
        v_result := jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
      END IF;
    
    WHEN 'visual_export' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') = 'free' THEN
        v_result := jsonb_build_object('allowed', false, 'reason', 'pro_feature', 'upgrade_to', 'pro');
      ELSE
        v_result := jsonb_build_object('allowed', true, 'unlimited', true);
      END IF;
    
    WHEN 'document_upload' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') = 'free' THEN
        v_result := jsonb_build_object('allowed', false, 'reason', 'pro_feature', 'upgrade_to', 'pro');
      ELSIF COALESCE(v_usage.documents_used, 0) >= v_tier_limits.documents_monthly THEN
        v_result := jsonb_build_object('allowed', false, 'reason', 'limit_reached', 'can_topup', true);
      ELSE
        v_result := jsonb_build_object('allowed', true, 'remaining', v_tier_limits.documents_monthly - COALESCE(v_usage.documents_used, 0), 'limit', v_tier_limits.documents_monthly);
      END IF;
    
    WHEN 'patterns' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') = 'free' THEN
        v_result := jsonb_build_object('allowed', false, 'reason', 'pro_feature', 'upgrade_to', 'pro');
      ELSE
        v_result := jsonb_build_object('allowed', true);
      END IF;
    
    WHEN 'team_workspace' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') IN ('team', 'business') THEN
        v_result := jsonb_build_object('allowed', true);
      ELSE
        v_result := jsonb_build_object('allowed', false, 'reason', 'team_feature', 'upgrade_to', 'team');
      END IF;
    
    WHEN 'journal' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') = 'free' THEN
        IF COALESCE(v_usage.journal_entries_today, 0) < 3 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', 3 - COALESCE(v_usage.journal_entries_today, 0), 'limit', 3);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'daily_limit', 'upgrade_to', 'pro');
        END IF;
      ELSE
        v_result := jsonb_build_object('allowed', true, 'unlimited', true);
      END IF;
    
    WHEN 'decision' THEN
      IF COALESCE(v_profile.subscription_tier, 'free') = 'free' THEN
        IF COALESCE(v_usage.decisions_today, 0) < 3 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', 3 - COALESCE(v_usage.decisions_today, 0), 'limit', 3);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'daily_limit', 'upgrade_to', 'pro');
        END IF;
      ELSE
        v_result := jsonb_build_object('allowed', true, 'unlimited', true);
      END IF;
    
    WHEN 'habit' THEN
      IF v_tier_limits.habits_limit = -1 THEN
        v_result := jsonb_build_object('allowed', true, 'unlimited', true);
      ELSIF COALESCE(v_usage.habits_used, 0) < v_tier_limits.habits_limit THEN
        v_result := jsonb_build_object('allowed', true, 'remaining', v_tier_limits.habits_limit - COALESCE(v_usage.habits_used, 0), 'limit', v_tier_limits.habits_limit);
      ELSE
        v_result := jsonb_build_object('allowed', false, 'reason', 'limit_reached', 'upgrade_to', 'pro');
      END IF;
    
    ELSE
      v_result := jsonb_build_object('allowed', true);
  END CASE;
  
  -- Add tier info to result
  v_result := v_result || jsonb_build_object('tier', COALESCE(v_profile.subscription_tier, 'free'));
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_feature_access(UUID, TEXT) TO authenticated;

-- Function to increment lifetime usage for free tier
CREATE OR REPLACE FUNCTION public.increment_lifetime_usage(
  p_user_id UUID,
  p_feature TEXT
) RETURNS void AS $$
BEGIN
  CASE p_feature
    WHEN 'deep_snag' THEN
      UPDATE public.profiles 
      SET lifetime_deep_snags_used = COALESCE(lifetime_deep_snags_used, 0) + 1
      WHERE user_id = p_user_id;
    WHEN 'post_mortem' THEN
      UPDATE public.profiles 
      SET lifetime_post_mortems_used = COALESCE(lifetime_post_mortems_used, 0) + 1
      WHERE user_id = p_user_id;
    WHEN 'framework' THEN
      UPDATE public.profiles 
      SET lifetime_frameworks_used = COALESCE(lifetime_frameworks_used, 0) + 1
      WHERE user_id = p_user_id;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.increment_lifetime_usage(UUID, TEXT) TO authenticated;