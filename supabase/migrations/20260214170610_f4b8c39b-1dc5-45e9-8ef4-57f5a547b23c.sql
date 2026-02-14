
-- Add last_active_at to team_members for admin dashboard
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- Update handle_new_user to set 15-day trial on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (
      user_id, 
      display_name, 
      user_type,
      subscription_tier, 
      subscription_status,
      trial_start_date,
      trial_ends_at,
      trial_expired
    )
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data->>'display_name',
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual'),
      'business',
      'trialing',
      now(),
      now() + interval '15 days',
      false
    );
    RETURN NEW;
END;
$$;

-- Function to update member last_active_at
CREATE OR REPLACE FUNCTION public.update_member_activity(p_user_id uuid, p_team_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.team_members 
  SET last_active_at = now()
  WHERE user_id = p_user_id AND team_id = p_team_id AND status = 'active';
END;
$$;

-- Add admin_dashboard permission to useTeamPermissions
-- (handled in frontend code)
