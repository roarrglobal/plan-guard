
-- Create email_type enum
CREATE TYPE public.email_type AS ENUM (
  'outcome_reminder', 'outcome_overdue', 'weekly_digest', 
  'analysis_complete', 'team_invite', 'welcome', 
  'trial_ending', 'trial_ended'
);

-- Create email_status enum
CREATE TYPE public.email_status AS ENUM ('pending', 'sent', 'failed', 'bounced');

-- Create email_queue table
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  email_type public.email_type NOT NULL,
  subject VARCHAR NOT NULL,
  to_email VARCHAR NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.email_status NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_preferences table
CREATE TABLE public.email_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  outcome_reminders BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  team_activity BOOLEAN NOT NULL DEFAULT true,
  product_updates BOOLEAN NOT NULL DEFAULT false,
  unsubscribed_all BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add template_usage_count to decision_templates
ALTER TABLE public.decision_templates ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- email_queue policies: users can view their own, service role handles insert/update
CREATE POLICY "Users can view their own emails"
  ON public.email_queue FOR SELECT
  USING (auth.uid() = user_id);

-- email_preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get or create email preferences
CREATE OR REPLACE FUNCTION public.get_or_create_email_preferences(p_user_id UUID)
RETURNS public.email_preferences
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_prefs public.email_preferences;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_prefs FROM public.email_preferences WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.email_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_prefs;
  END IF;
  
  RETURN v_prefs;
END;
$$;

-- Function to increment template usage
CREATE OR REPLACE FUNCTION public.increment_template_usage(p_template_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.decision_templates
  SET usage_count = usage_count + 1
  WHERE id = p_template_id;
END;
$$;
