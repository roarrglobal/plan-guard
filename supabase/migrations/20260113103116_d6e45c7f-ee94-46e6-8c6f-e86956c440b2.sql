-- Add UPDATE policy for analyses table so users can update their own analyses
CREATE POLICY "Users can update their own analyses"
ON public.analyses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);