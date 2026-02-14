
-- Create team_outcomes table for TRACE outcome tracking
CREATE TABLE public.team_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid NOT NULL REFERENCES public.team_decisions(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES public.team_analyses(id) ON DELETE SET NULL,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  result text NOT NULL CHECK (result IN ('right_call', 'mostly_right', 'mixed', 'mostly_wrong', 'wrong_call', 'too_early')),
  satisfaction integer CHECK (satisfaction >= 1 AND satisfaction <= 10),
  what_happened text,
  predictions_hit jsonb DEFAULT '[]'::jsonb,
  predictions_missed jsonb DEFAULT '[]'::jsonb,
  lesson text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view outcomes"
ON public.team_outcomes FOR SELECT
USING (is_team_member(team_id, auth.uid()));

CREATE POLICY "Team members can create outcomes"
ON public.team_outcomes FOR INSERT
WITH CHECK (is_team_member(team_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Creator or admin can update outcomes"
ON public.team_outcomes FOR UPDATE
USING (user_id = auth.uid() OR is_team_admin(team_id, auth.uid()));

CREATE POLICY "Creator or admin can delete outcomes"
ON public.team_outcomes FOR DELETE
USING (user_id = auth.uid() OR is_team_admin(team_id, auth.uid()));

-- Index for fast lookups
CREATE INDEX idx_team_outcomes_decision ON public.team_outcomes(decision_id);
CREATE INDEX idx_team_outcomes_team ON public.team_outcomes(team_id);
