-- Tier limits reference table
CREATE TABLE public.tier_limits (
  tier TEXT PRIMARY KEY,
  analyses_monthly INTEGER NOT NULL,
  documents_monthly INTEGER NOT NULL,
  storage_bytes BIGINT NOT NULL,
  max_file_bytes BIGINT NOT NULL,
  max_words INTEGER NOT NULL
);

-- Insert tier limits
INSERT INTO public.tier_limits VALUES
  ('free', 3, 0, 0, 0, 0),
  ('pro', 100, 15, 524288000, 5242880, 10000),
  ('team', 500, 75, 5368709120, 10485760, 25000),
  ('business', 2000, 300, 26843545600, 26214400, 50000),
  ('enterprise', -1, -1, -1, -1, -1);

-- Enable RLS on tier_limits (public read)
ALTER TABLE public.tier_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tier limits"
ON public.tier_limits FOR SELECT
USING (true);

-- Add subscription_tier to profiles
ALTER TABLE public.profiles 
ADD COLUMN subscription_tier TEXT DEFAULT 'free';

-- Usage tracking table
CREATE TABLE public.usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  analyses_used INTEGER DEFAULT 0,
  analyses_limit INTEGER NOT NULL,
  documents_used INTEGER DEFAULT 0,
  documents_limit INTEGER NOT NULL,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Enable RLS on usage
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
ON public.usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.usage FOR UPDATE
USING (auth.uid() = user_id);

-- Function to get or create current usage period
CREATE OR REPLACE FUNCTION public.get_or_create_usage(p_user_id UUID)
RETURNS public.usage
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage public.usage;
  v_tier TEXT;
  v_limits public.tier_limits;
  v_period_start DATE;
  v_period_end DATE;
BEGIN
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
$$;

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION public.can_use_feature(
  p_user_id UUID,
  p_feature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage public.usage;
BEGIN
  -- Get or create usage record
  v_usage := public.get_or_create_usage(p_user_id);
  
  -- Check for unlimited (-1)
  IF v_usage.analyses_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  IF p_feature = 'analysis' THEN
    RETURN v_usage.analyses_used < v_usage.analyses_limit;
  ELSIF p_feature = 'document_upload' THEN
    RETURN v_usage.documents_used < v_usage.documents_limit;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to increment usage (called by trigger)
CREATE OR REPLACE FUNCTION public.increment_analysis_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage public.usage;
BEGIN
  -- Get or create usage record
  v_usage := public.get_or_create_usage(NEW.user_id);
  
  -- Increment analyses count
  UPDATE public.usage 
  SET analyses_used = analyses_used + 1,
      updated_at = NOW()
  WHERE id = v_usage.id;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-increment usage on analysis insert
CREATE TRIGGER after_analysis_insert
AFTER INSERT ON public.analyses
FOR EACH ROW
EXECUTE FUNCTION public.increment_analysis_usage();

-- Function to increment document usage
CREATE OR REPLACE FUNCTION public.increment_document_usage(p_user_id UUID, p_file_size BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage public.usage;
BEGIN
  v_usage := public.get_or_create_usage(p_user_id);
  
  -- Check limits
  IF v_usage.documents_limit != -1 AND v_usage.documents_used >= v_usage.documents_limit THEN
    RETURN FALSE;
  END IF;
  
  IF v_usage.storage_limit_bytes != -1 AND (v_usage.storage_used_bytes + p_file_size) > v_usage.storage_limit_bytes THEN
    RETURN FALSE;
  END IF;
  
  -- Increment
  UPDATE public.usage 
  SET documents_used = documents_used + 1,
      storage_used_bytes = storage_used_bytes + p_file_size,
      updated_at = NOW()
  WHERE id = v_usage.id;
  
  RETURN TRUE;
END;
$$;