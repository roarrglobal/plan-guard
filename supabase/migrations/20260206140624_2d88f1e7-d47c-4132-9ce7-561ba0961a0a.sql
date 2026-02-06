-- Drop the overly permissive INSERT policy on shares
DROP POLICY IF EXISTS "Anyone can create shares" ON public.shares;

-- Create a new restrictive INSERT policy - users can only share their own analyses
CREATE POLICY "Users can share their own analyses"
ON public.shares
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.analyses
    WHERE analyses.id = shares.analysis_id
    AND analyses.user_id = auth.uid()
  )
);

-- Enable leaked password protection in auth config
-- This is done via Supabase auth settings, but we can add a comment here
-- The actual setting needs to be enabled via the auth configuration tool