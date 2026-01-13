-- Create shares table for tracking share analytics
CREATE TABLE public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'linkedin', 'instagram', 'copy_link'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on shares
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert shares (for anonymous tracking)
CREATE POLICY "Anyone can create shares"
ON public.shares
FOR INSERT
WITH CHECK (true);

-- Only allow users to view their own shares (via analysis ownership)
CREATE POLICY "Users can view shares of their analyses"
ON public.shares
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.analyses 
    WHERE analyses.id = shares.analysis_id 
    AND analyses.user_id = auth.uid()
  )
);

-- Create aggregation view for scorecard (public stats)
CREATE OR REPLACE VIEW public.scorecard_stats AS
SELECT 
  COUNT(*) as total_analyses,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as last_hour,
  COUNT(*) FILTER (WHERE category = 'career') as career_count,
  COUNT(*) FILTER (WHERE category = 'business') as business_count,
  COUNT(*) FILTER (WHERE category = 'personal') as personal_count,
  COUNT(*) FILTER (WHERE category = 'travel') as travel_count,
  COUNT(*) FILTER (WHERE category = 'other' OR category IS NULL) as other_count
FROM public.analyses;