
-- Team Activity Feed table
CREATE TABLE public.team_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action_type text NOT NULL, -- decision_created, analysis_run, status_changed, member_joined, comment_added, member_removed, decision_deleted
  entity_type text, -- decision, analysis, comment, member
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_team_activity_team_created ON public.team_activity(team_id, created_at DESC);
CREATE INDEX idx_team_activity_entity ON public.team_activity(entity_type, entity_id);

ALTER TABLE public.team_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view activity" ON public.team_activity
  FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "Team members can create activity" ON public.team_activity
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()) AND user_id = auth.uid());

-- Team Decision Comments table
CREATE TABLE public.team_decision_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid NOT NULL REFERENCES public.team_decisions(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_decision ON public.team_decision_comments(decision_id, created_at ASC);
CREATE INDEX idx_comments_team ON public.team_decision_comments(team_id);

ALTER TABLE public.team_decision_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view comments" ON public.team_decision_comments
  FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "Team members can create comments" ON public.team_decision_comments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON public.team_decision_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON public.team_decision_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at on comments
CREATE TRIGGER update_team_decision_comments_updated_at
  BEFORE UPDATE ON public.team_decision_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_decision_comments;
