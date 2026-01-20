-- Fix check_feature_access function to require authorization
-- This prevents users from querying other users' subscription/usage data

CREATE OR REPLACE FUNCTION public.check_feature_access(p_user_id uuid, p_feature text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_profile RECORD;
  v_usage RECORD;
  v_tier_limits RECORD;
  v_result JSONB;
  v_tier TEXT;
BEGIN
  -- SECURITY: Verify caller is authorized to check this user's data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot check another user''s access';
  END IF;
  
  -- Get user profile
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN '{"allowed": false, "reason": "no_profile"}'::JSONB;
  END IF;
  
  v_tier := COALESCE(v_profile.subscription_tier, 'free');
  
  -- OWNER and ENTERPRISE tiers get unlimited access to EVERYTHING
  IF v_tier IN ('owner', 'enterprise') THEN
    RETURN jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true, 'tier', v_tier);
  END IF;
  
  -- Get current period usage
  SELECT * INTO v_usage FROM public.usage 
  WHERE user_id = p_user_id 
  AND CURRENT_DATE BETWEEN period_start::date AND period_end::date
  LIMIT 1;
  
  -- Get tier limits
  SELECT * INTO v_tier_limits FROM public.tier_limits 
  WHERE tier = v_tier;
  
  -- Check by feature and tier
  CASE p_feature
    WHEN 'deep_snag' THEN
      IF v_tier = 'free' THEN
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
      IF v_tier = 'free' THEN
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
      IF v_tier = 'free' THEN
        IF COALESCE(v_profile.lifetime_frameworks_used, 0) < 2 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', 2 - COALESCE(v_profile.lifetime_frameworks_used, 0), 'is_trial', true);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'trial_used', 'upgrade_to', 'pro');
        END IF;
      ELSE
        v_result := jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
      END IF;
    
    WHEN 'visual_export' THEN
      IF v_tier = 'free' THEN
        v_result := jsonb_build_object('allowed', false, 'reason', 'pro_feature', 'upgrade_to', 'pro');
      ELSE
        v_result := jsonb_build_object('allowed', true, 'unlimited', true);
      END IF;
    
    WHEN 'document_upload' THEN
      IF v_tier = 'free' THEN
        v_result := jsonb_build_object('allowed', false, 'reason', 'pro_feature', 'upgrade_to', 'pro');
      ELSE
        -- Check for unlimited documents (-1)
        IF v_tier_limits.documents_monthly = -1 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
        ELSIF COALESCE(v_usage.documents_used, 0) >= v_tier_limits.documents_monthly THEN
          v_result := jsonb_build_object('allowed', false, 'reason', 'limit_reached', 'can_topup', true);
        ELSE
          v_result := jsonb_build_object('allowed', true, 'remaining', v_tier_limits.documents_monthly - COALESCE(v_usage.documents_used, 0), 'limit', v_tier_limits.documents_monthly);
        END IF;
      END IF;
    
    WHEN 'patterns' THEN
      IF v_tier = 'free' THEN
        v_result := jsonb_build_object('allowed', false, 'reason', 'pro_feature', 'upgrade_to', 'pro');
      ELSE
        v_result := jsonb_build_object('allowed', true);
      END IF;
    
    WHEN 'team_workspace' THEN
      IF v_tier IN ('team', 'business') THEN
        v_result := jsonb_build_object('allowed', true);
      ELSE
        v_result := jsonb_build_object('allowed', false, 'reason', 'team_feature', 'upgrade_to', 'team');
      END IF;
    
    WHEN 'journal' THEN
      IF v_tier = 'free' THEN
        IF COALESCE(v_usage.journal_entries_today, 0) < 3 THEN
          v_result := jsonb_build_object('allowed', true, 'remaining', 3 - COALESCE(v_usage.journal_entries_today, 0), 'limit', 3);
        ELSE
          v_result := jsonb_build_object('allowed', false, 'reason', 'daily_limit', 'upgrade_to', 'pro');
        END IF;
      ELSE
        v_result := jsonb_build_object('allowed', true, 'unlimited', true);
      END IF;
    
    WHEN 'decision' THEN
      IF v_tier = 'free' THEN
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
  v_result := v_result || jsonb_build_object('tier', v_tier);
  
  RETURN v_result;
END;
$function$;

-- Also fix get_or_create_usage to add authorization check
CREATE OR REPLACE FUNCTION public.get_or_create_usage(p_user_id uuid)
 RETURNS usage
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_usage public.usage;
  v_tier TEXT;
  v_limits public.tier_limits;
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- SECURITY: Verify caller is authorized to access this user's usage
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access another user''s usage data';
  END IF;
  
  -- Get user's tier
  SELECT COALESCE(subscription_tier, 'free') INTO v_tier
  FROM public.profiles WHERE user_id = p_user_id;
  
  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;
  
  -- Get tier limits
  SELECT * INTO v_limits FROM public.tier_limits WHERE tier = v_tier;
  
  -- Calculate current billing period (1st of month to end of month)
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  v_period_end := (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::DATE;
  
  -- Try to get existing usage record
  SELECT * INTO v_usage FROM public.usage
  WHERE user_id = p_user_id
  AND CURRENT_DATE BETWEEN period_start AND period_end;
  
  -- Create if not exists
  IF v_usage IS NULL THEN
    INSERT INTO public.usage (
      user_id, period_start, period_end,
      analyses_limit, documents_limit, storage_limit_bytes
    ) VALUES (
      p_user_id, v_period_start, v_period_end,
      v_limits.analyses_monthly, v_limits.documents_monthly, v_limits.storage_bytes
    )
    RETURNING * INTO v_usage;
  END IF;
  
  RETURN v_usage;
END;
$function$;