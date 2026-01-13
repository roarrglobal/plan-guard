-- Add soft launch fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_expired boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deep_snags_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS retros_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS waitlist_joined boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS waitlist_joined_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS discount_code text;

-- Create waitlist table for tracking
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  discount_code text DEFAULT 'EARLY30',
  source text DEFAULT 'trial_limit',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Waitlist policies
CREATE POLICY "Users can view their own waitlist entry"
ON public.waitlist FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can join waitlist"
ON public.waitlist FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to check if trial is expired (3 days)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment deep snags used
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment retros used
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
$$ LANGUAGE plpgsql SECURITY DEFINER;