
-- Add missing columns to team_decisions for enhanced decision tracking
ALTER TABLE public.team_decisions 
  ADD COLUMN IF NOT EXISTS reversibility text DEFAULT 'difficult',
  ADD COLUMN IF NOT EXISTS timeline text DEFAULT 'this_week',
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'team',
  ADD COLUMN IF NOT EXISTS decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS outcome_check_date date,
  ADD COLUMN IF NOT EXISTS input_context text;

-- Create team_analyses table
CREATE TABLE public.team_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid NOT NULL REFERENCES public.team_decisions(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  analysis_type text NOT NULL DEFAULT 'standard',
  input_text text NOT NULL,
  output_json jsonb,
  token_count integer,
  processing_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_analyses ENABLE ROW LEVEL SECURITY;

-- Team members can view analyses for decisions they can see
CREATE POLICY "Team members can view analyses"
  ON public.team_analyses FOR SELECT TO authenticated
  USING (is_team_member(team_id, auth.uid()));

CREATE POLICY "Team members can create analyses"
  ON public.team_analyses FOR INSERT TO authenticated
  WITH CHECK (is_team_member(team_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Creator or admin can delete analyses"
  ON public.team_analyses FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_team_admin(team_id, auth.uid()));

-- Create team_usage table for tracking monthly usage
CREATE TABLE public.team_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  month date NOT NULL,
  deep_snags_used integer DEFAULT 0,
  quick_snags_used integer DEFAULT 0,
  post_mortems_used integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id, month)
);

ALTER TABLE public.team_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view usage"
  ON public.team_usage FOR SELECT TO authenticated
  USING (is_team_member(team_id, auth.uid()));

-- Update team_decisions SELECT policy to handle visibility
DROP POLICY IF EXISTS "Team members can view decisions" ON public.team_decisions;

CREATE POLICY "Team members can view decisions"
  ON public.team_decisions FOR SELECT TO authenticated
  USING (
    is_team_member(team_id, auth.uid()) AND (
      visibility IS NULL OR
      visibility = 'team' OR
      created_by = auth.uid() OR
      (visibility = 'leadership' AND is_team_admin(team_id, auth.uid())) OR
      (visibility = 'private' AND created_by = auth.uid())
    )
  );

-- Function to get or create team usage
CREATE OR REPLACE FUNCTION public.get_or_create_team_usage(p_team_id uuid)
RETURNS public.team_usage
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_usage public.team_usage;
  v_month date;
BEGIN
  IF NOT is_team_member(p_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  v_month := date_trunc('month', CURRENT_DATE)::date;
  
  SELECT * INTO v_usage FROM public.team_usage
  WHERE team_id = p_team_id AND month = v_month;
  
  IF NOT FOUND THEN
    INSERT INTO public.team_usage (team_id, month)
    VALUES (p_team_id, v_month)
    RETURNING * INTO v_usage;
  END IF;
  
  RETURN v_usage;
END;
$$;

-- Function to increment team snag usage
CREATE OR REPLACE FUNCTION public.increment_team_snag_usage(p_team_id uuid, p_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_month date;
BEGIN
  IF NOT is_team_member(p_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  v_month := date_trunc('month', CURRENT_DATE)::date;
  
  INSERT INTO public.team_usage (team_id, month)
  VALUES (p_team_id, v_month)
  ON CONFLICT (team_id, month) DO NOTHING;
  
  IF p_type = 'deep' THEN
    UPDATE public.team_usage SET deep_snags_used = deep_snags_used + 1, updated_at = now()
    WHERE team_id = p_team_id AND month = v_month;
  ELSIF p_type = 'quick' THEN
    UPDATE public.team_usage SET quick_snags_used = quick_snags_used + 1, updated_at = now()
    WHERE team_id = p_team_id AND month = v_month;
  ELSIF p_type = 'post_mortem' THEN
    UPDATE public.team_usage SET post_mortems_used = post_mortems_used + 1, updated_at = now()
    WHERE team_id = p_team_id AND month = v_month;
  END IF;
END;
$$;
