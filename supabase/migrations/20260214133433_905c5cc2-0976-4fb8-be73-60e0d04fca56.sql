
-- Team decisions table
CREATE TABLE public.team_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  decision_text text NOT NULL,
  description text,
  category text DEFAULT 'general',
  stakes text DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  options jsonb DEFAULT '[]'::jsonb,
  chosen_option text,
  deadline date,
  outcome_notes text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_decisions ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_team_decisions_updated_at
  BEFORE UPDATE ON public.team_decisions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: team members can view team decisions
CREATE POLICY "Team members can view decisions"
  ON public.team_decisions FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

-- RLS: team members can create decisions
CREATE POLICY "Team members can create decisions"
  ON public.team_decisions FOR INSERT TO authenticated
  WITH CHECK (
    public.is_team_member(team_id, auth.uid())
    AND created_by = auth.uid()
  );

-- RLS: creator or admin can update
CREATE POLICY "Creator or admin can update decisions"
  ON public.team_decisions FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_team_admin(team_id, auth.uid())
  );

-- RLS: creator or admin can delete
CREATE POLICY "Creator or admin can delete decisions"
  ON public.team_decisions FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_team_admin(team_id, auth.uid())
  );

-- Allow team_members SELECT policy to also work for pending members checking their own invitation
-- (needed for accept flow - user needs to see their own pending record)
CREATE POLICY "Users can see their own membership"
  ON public.team_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());
