
-- Allow users to insert themselves as team members when they have a valid pending invitation
CREATE POLICY "Invitee can join via invitation"
  ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.team_invitations
      WHERE team_invitations.team_id = team_members.team_id
      AND team_invitations.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND team_invitations.accepted_at IS NOT NULL
      AND team_invitations.expires_at > now()
    )
  );

-- Allow invitees to view invitations sent to their email (for the accept page)
-- The existing policy already handles this via email match, but let's ensure
-- the teams table allows viewing for invited users (so they see the team name)
DROP POLICY "Members can view their teams" ON public.teams;
CREATE POLICY "Members or invitees can view teams"
  ON public.teams FOR SELECT TO authenticated
  USING (
    public.is_team_member(id, auth.uid())
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_invitations
      WHERE team_invitations.team_id = teams.id
      AND team_invitations.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND team_invitations.accepted_at IS NULL
    )
  );
