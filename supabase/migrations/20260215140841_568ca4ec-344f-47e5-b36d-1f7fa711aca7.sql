
-- Drop and recreate public_profiles view with proper filtering
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT
  id, user_id, display_name, avatar_url, bio, role, location,
  linkedin_url, focus_areas, visibility, show_snags, allow_connections,
  discoverable, created_at, updated_at
FROM public.profiles
WHERE visibility = 'public' AND discoverable = true;

-- Add RLS policy on the base profiles table for view access
-- The view already uses security_invoker so RLS on profiles applies.
-- Authenticated users can see public/discoverable profiles through the view.
