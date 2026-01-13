-- Fix the view to use SECURITY INVOKER (default, but explicit)
DROP VIEW IF EXISTS public.scorecard_stats;

CREATE VIEW public.scorecard_stats 
WITH (security_invoker = true)
AS
SELECT 
  COUNT(*) as total_analyses,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as last_hour,
  COUNT(*) FILTER (WHERE category = 'career') as career_count,
  COUNT(*) FILTER (WHERE category = 'business') as business_count,
  COUNT(*) FILTER (WHERE category = 'personal') as personal_count,
  COUNT(*) FILTER (WHERE category = 'travel') as travel_count,
  COUNT(*) FILTER (WHERE category = 'other' OR category IS NULL) as other_count
FROM public.analyses;