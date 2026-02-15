
-- Fix 1: tier_limits - restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can read tier limits" ON public.tier_limits;
CREATE POLICY "Authenticated users can read tier limits"
ON public.tier_limits
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 2: decision_templates - restrict system template viewing to authenticated users
DROP POLICY IF EXISTS "Anyone can view system templates" ON public.decision_templates;
CREATE POLICY "Authenticated users can view system templates"
ON public.decision_templates
FOR SELECT
USING (is_system = true AND auth.uid() IS NOT NULL);
