
-- Create a security definer function to get the current user's email
-- This avoids direct access to auth.users from RLS policies
CREATE OR REPLACE FUNCTION public.auth_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

-- Fix team_invitations SELECT policy
DROP POLICY IF EXISTS "Admins can view team invitations" ON public.team_invitations;
CREATE POLICY "Admins can view team invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  is_team_admin(team_id, auth.uid())
  OR email = public.auth_user_email()
);

-- Fix team_invitations UPDATE policy
DROP POLICY IF EXISTS "Invitee can update invitation" ON public.team_invitations;
CREATE POLICY "Invitee can update invitation"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (email = public.auth_user_email());

-- Fix team_members INSERT policy for invitees
DROP POLICY IF EXISTS "Invitee can join via invitation" ON public.team_members;
CREATE POLICY "Invitee can join via invitation"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'active'
  AND EXISTS (
    SELECT 1 FROM team_invitations
    WHERE team_invitations.team_id = team_members.team_id
      AND team_invitations.email = public.auth_user_email()
      AND team_invitations.accepted_at IS NOT NULL
      AND team_invitations.expires_at > now()
  )
);

-- Fix teams SELECT policy
DROP POLICY IF EXISTS "Members or invitees can view teams" ON public.teams;
CREATE POLICY "Members or invitees can view teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  is_team_member(id, auth.uid())
  OR owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM team_invitations
    WHERE team_invitations.team_id = teams.id
      AND team_invitations.email = public.auth_user_email()
      AND team_invitations.accepted_at IS NULL
  )
);
