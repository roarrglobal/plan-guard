-- Fix the view to use security_invoker mode instead of security_definer
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = on) AS
SELECT 
  id, 
  user_id, 
  display_name, 
  avatar_url, 
  bio, 
  role, 
  location, 
  linkedin_url, 
  focus_areas, 
  show_snags, 
  allow_connections, 
  discoverable, 
  visibility, 
  created_at, 
  updated_at
FROM public.profiles
WHERE visibility = 'public';

-- Grant read access
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;