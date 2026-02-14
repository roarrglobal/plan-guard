
-- Fix teams SELECT policy: also allow owner to see their own team
DROP POLICY "Members can view their teams" ON public.teams;
CREATE POLICY "Members can view their teams"
  ON public.teams FOR SELECT TO authenticated
  USING (public.is_team_member(id, auth.uid()) OR owner_id = auth.uid());

-- Fix team_members INSERT policy: allow owner of the team to insert the first member (themselves)
DROP POLICY "Admins can insert team members" ON public.team_members;
CREATE POLICY "Team admins or owner can insert members"
  ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (
    public.is_team_admin(team_id, auth.uid())
    OR (
      user_id = auth.uid()
      AND role = 'owner'
      AND EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
    )
  );
