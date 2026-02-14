
-- Create a secure accept_invitation function
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_team RECORD;
  v_user_email TEXT;
  v_existing_member RECORD;
  v_inviter_name TEXT;
BEGIN
  -- Verify caller is the user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;

  -- Fetch invitation
  SELECT * INTO v_invite FROM public.team_invitations WHERE token = p_token;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found', 'message', 'Invitation not found');
  END IF;

  -- Check if expired
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'expired', 'message', 'This invitation has expired');
  END IF;

  -- Check if already accepted
  IF v_invite.accepted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_accepted', 'message', 'This invitation has already been accepted');
  END IF;

  -- Check email matches
  IF lower(v_user_email) != lower(v_invite.email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_mismatch', 'message', 'This invitation was sent to ' || v_invite.email);
  END IF;

  -- Check if already a member
  SELECT * INTO v_existing_member FROM public.team_members 
  WHERE team_id = v_invite.team_id AND user_id = p_user_id AND status = 'active';
  
  IF FOUND THEN
    -- Mark invitation as accepted anyway
    UPDATE public.team_invitations SET accepted_at = now() WHERE id = v_invite.id;
    SELECT slug, name INTO v_team FROM public.teams WHERE id = v_invite.team_id;
    RETURN jsonb_build_object('success', true, 'already_member', true, 'team_slug', v_team.slug, 'team_name', v_team.name);
  END IF;

  -- Accept: update invitation
  UPDATE public.team_invitations SET accepted_at = now() WHERE id = v_invite.id;

  -- Create team member
  INSERT INTO public.team_members (team_id, user_id, role, status, invited_by, invited_at, joined_at)
  VALUES (v_invite.team_id, p_user_id, v_invite.role, 'active', v_invite.invited_by, v_invite.created_at, now());

  -- Fetch team info
  SELECT slug, name INTO v_team FROM public.teams WHERE id = v_invite.team_id;

  -- Fetch inviter name
  SELECT display_name INTO v_inviter_name FROM public.profiles WHERE user_id = v_invite.invited_by;

  RETURN jsonb_build_object(
    'success', true, 
    'team_slug', v_team.slug, 
    'team_name', v_team.name,
    'role', v_invite.role,
    'inviter_name', COALESCE(v_inviter_name, 'A team member')
  );
END;
$$;

-- Create get_user_teams function
CREATE OR REPLACE FUNCTION public.get_user_teams(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_result
  FROM (
    SELECT teams.id, teams.name, teams.slug, tm.role
    FROM public.team_members tm
    JOIN public.teams teams ON teams.id = tm.team_id
    WHERE tm.user_id = p_user_id AND tm.status = 'active'
    ORDER BY teams.name
  ) t;

  RETURN v_result;
END;
$$;

-- Create get_invite_details function (for unauthenticated users to see basic info)
CREATE OR REPLACE FUNCTION public.get_invite_details(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_team_name TEXT;
  v_inviter_name TEXT;
BEGIN
  SELECT * INTO v_invite FROM public.team_invitations WHERE token = p_token;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false, 'error', 'not_found');
  END IF;

  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RETURN jsonb_build_object('found', true, 'expired', true);
  END IF;

  IF v_invite.accepted_at IS NOT NULL THEN
    RETURN jsonb_build_object('found', true, 'already_accepted', true);
  END IF;

  SELECT name INTO v_team_name FROM public.teams WHERE id = v_invite.team_id;
  SELECT display_name INTO v_inviter_name FROM public.profiles WHERE user_id = v_invite.invited_by;

  RETURN jsonb_build_object(
    'found', true,
    'team_name', COALESCE(v_team_name, 'Unknown Team'),
    'inviter_name', COALESCE(v_inviter_name, 'A team member'),
    'role', v_invite.role,
    'email', v_invite.email
  );
END;
$$;
