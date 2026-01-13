-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.is_trial_expired(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_trial_start timestamp with time zone;
  v_trial_expired boolean;
BEGIN
  SELECT trial_start_date, trial_expired INTO v_trial_start, v_trial_expired
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF v_trial_expired THEN
    RETURN true;
  END IF;
  
  IF v_trial_start IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN (now() - v_trial_start) > interval '3 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_deep_snags_used(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_new_count integer;
BEGIN
  UPDATE public.profiles
  SET deep_snags_used = COALESCE(deep_snags_used, 0) + 1
  WHERE user_id = p_user_id
  RETURNING deep_snags_used INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_retros_used(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_new_count integer;
BEGIN
  UPDATE public.profiles
  SET retros_used = COALESCE(retros_used, 0) + 1
  WHERE user_id = p_user_id
  RETURNING retros_used INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;