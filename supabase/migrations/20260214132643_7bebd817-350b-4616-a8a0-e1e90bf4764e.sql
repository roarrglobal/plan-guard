
-- Create enums
CREATE TYPE public.team_subscription_tier AS ENUM ('team', 'business', 'enterprise');
CREATE TYPE public.team_subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled');
CREATE TYPE public.team_member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE public.team_member_status AS ENUM ('pending', 'active', 'removed');
CREATE TYPE public.team_invite_role AS ENUM ('admin', 'member', 'viewer');

-- Create teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  slug varchar NOT NULL UNIQUE,
  owner_id uuid NOT NULL,
  subscription_tier public.team_subscription_tier NOT NULL DEFAULT 'team',
  subscription_status public.team_subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.team_member_role NOT NULL DEFAULT 'member',
  invited_by uuid,
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  status public.team_member_status NOT NULL DEFAULT 'pending',
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email varchar NOT NULL,
  role public.team_invite_role NOT NULL DEFAULT 'member',
  token varchar NOT NULL UNIQUE DEFAULT gen_random_uuid()::varchar,
  invited_by uuid NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Updated_at trigger for teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is a member of a team
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
    AND user_id = p_user_id
    AND status = 'active'
  );
$$;

-- Helper function: check if user is admin/owner of a team
CREATE OR REPLACE FUNCTION public.is_team_admin(p_team_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
    AND user_id = p_user_id
    AND role IN ('owner', 'admin')
    AND status = 'active'
  );
$$;

-- RLS: teams
CREATE POLICY "Members can view their teams"
  ON public.teams FOR SELECT TO authenticated
  USING (public.is_team_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can update their teams"
  ON public.teams FOR UPDATE TO authenticated
  USING (public.is_team_admin(id, auth.uid()));

CREATE POLICY "Owner can delete team"
  ON public.teams FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- RLS: team_members
CREATE POLICY "Members can view team members"
  ON public.team_members FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "Admins can insert team members"
  ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (
    public.is_team_admin(team_id, auth.uid())
    OR (user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Admins can update team members"
  ON public.team_members FOR UPDATE TO authenticated
  USING (public.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Admins can remove team members"
  ON public.team_members FOR DELETE TO authenticated
  USING (public.is_team_admin(team_id, auth.uid()));

-- RLS: team_invitations
CREATE POLICY "Admins can create invitations"
  ON public.team_invitations FOR INSERT TO authenticated
  WITH CHECK (public.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Admins can view team invitations"
  ON public.team_invitations FOR SELECT TO authenticated
  USING (
    public.is_team_admin(team_id, auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete invitations"
  ON public.team_invitations FOR DELETE TO authenticated
  USING (public.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Invitee can update invitation"
  ON public.team_invitations FOR UPDATE TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
