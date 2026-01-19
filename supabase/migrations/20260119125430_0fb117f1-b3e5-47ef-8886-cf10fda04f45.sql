-- FIX 1: Create a public_profiles view with only safe columns
-- This prevents exposing sensitive subscription/usage data for public profiles

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id, 
  user_id, 
  display_name, 
  avatar_url, 
  bio, 
  role, 
  location, 
  linkedin_url, 
  focus_areas, 
  show_snags, 
  allow_connections, 
  discoverable, 
  visibility, 
  created_at, 
  updated_at
FROM public.profiles
WHERE visibility = 'public';

-- Grant read access to the view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- FIX 2: Update the profiles SELECT policy to only allow full access to own profile
-- Drop existing policy and create more restrictive one
DROP POLICY IF EXISTS "Public profiles or own profile readable" ON public.profiles;

-- Create new policy: users can ONLY see their own profile with all fields
-- For public profiles, they should use the public_profiles view instead
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- FIX 3: Add authorization checks to SECURITY DEFINER functions

-- Fix increment_deep_snags_used to verify caller owns the user_id
CREATE OR REPLACE FUNCTION public.increment_deep_snags_used(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
BEGIN
  -- Verify caller is authorized to modify this user's data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify another user''s data';
  END IF;
  
  UPDATE public.profiles
  SET deep_snags_used = COALESCE(deep_snags_used, 0) + 1
  WHERE user_id = p_user_id
  RETURNING deep_snags_used INTO v_new_count;
  
  RETURN COALESCE(v_new_count, 0);
END;
$$;

-- Fix increment_retros_used to verify caller owns the user_id
CREATE OR REPLACE FUNCTION public.increment_retros_used(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
BEGIN
  -- Verify caller is authorized to modify this user's data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify another user''s data';
  END IF;
  
  UPDATE public.profiles
  SET retros_used = COALESCE(retros_used, 0) + 1
  WHERE user_id = p_user_id
  RETURNING retros_used INTO v_new_count;
  
  RETURN COALESCE(v_new_count, 0);
END;
$$;

-- Fix is_trial_expired to verify caller can only check their own trial status
CREATE OR REPLACE FUNCTION public.is_trial_expired(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trial_expired boolean;
  v_trial_ends_at timestamptz;
BEGIN
  -- Verify caller is authorized to check this user's data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access another user''s data';
  END IF;
  
  SELECT trial_expired, trial_ends_at
  INTO v_trial_expired, v_trial_ends_at
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Return true if explicitly expired or trial_ends_at has passed
  RETURN COALESCE(v_trial_expired, false) OR 
         (v_trial_ends_at IS NOT NULL AND v_trial_ends_at < now());
END;
$$;

-- Also fix increment_lifetime_usage if it exists
CREATE OR REPLACE FUNCTION public.increment_lifetime_usage(p_feature text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is authorized to modify this user's data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify another user''s data';
  END IF;
  
  IF p_feature = 'deep_snag' THEN
    UPDATE public.profiles
    SET lifetime_deep_snags_used = COALESCE(lifetime_deep_snags_used, 0) + 1
    WHERE user_id = p_user_id;
  ELSIF p_feature = 'post_mortem' THEN
    UPDATE public.profiles
    SET lifetime_post_mortems_used = COALESCE(lifetime_post_mortems_used, 0) + 1
    WHERE user_id = p_user_id;
  ELSIF p_feature = 'framework' THEN
    UPDATE public.profiles
    SET lifetime_frameworks_used = COALESCE(lifetime_frameworks_used, 0) + 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Fix increment_framework_usage
CREATE OR REPLACE FUNCTION public.increment_framework_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is authorized to modify this user's data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify another user''s data';
  END IF;
  
  UPDATE public.usage
  SET frameworks_used = COALESCE(frameworks_used, 0) + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Fix increment_post_mortem_usage
CREATE OR REPLACE FUNCTION public.increment_post_mortem_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is authorized to modify this user's data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify another user''s data';
  END IF;
  
  UPDATE public.usage
  SET post_mortems_used = COALESCE(post_mortems_used, 0) + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Fix increment_document_usage
CREATE OR REPLACE FUNCTION public.increment_document_usage(p_user_id uuid, p_file_size bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_used integer;
  v_limit integer;
  v_storage_used bigint;
  v_storage_limit bigint;
BEGIN
  -- Verify caller is authorized to modify this user's data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify another user''s data';
  END IF;
  
  SELECT documents_used, documents_limit, storage_used_bytes, storage_limit_bytes
  INTO v_current_used, v_limit, v_storage_used, v_storage_limit
  FROM public.usage
  WHERE user_id = p_user_id;
  
  -- Check document count limit (-1 = unlimited)
  IF v_limit != -1 AND COALESCE(v_current_used, 0) >= v_limit THEN
    RETURN false;
  END IF;
  
  -- Check storage limit
  IF (COALESCE(v_storage_used, 0) + p_file_size) > v_storage_limit THEN
    RETURN false;
  END IF;
  
  -- Increment usage
  UPDATE public.usage
  SET documents_used = COALESCE(documents_used, 0) + 1,
      storage_used_bytes = COALESCE(storage_used_bytes, 0) + p_file_size,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;