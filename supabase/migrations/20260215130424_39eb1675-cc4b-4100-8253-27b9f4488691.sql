
-- Create shared_snags table for public sharing
CREATE TABLE public.shared_snags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  short_code TEXT UNIQUE NOT NULL DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  share_config JSONB DEFAULT '{"title": true, "verdict": true, "blind_spots_count": true, "top_blind_spot": false}'::jsonb,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Index for fast lookup
CREATE INDEX idx_shared_snags_code ON public.shared_snags(short_code);
CREATE INDEX idx_shared_snags_user ON public.shared_snags(user_id);

-- Enable RLS
ALTER TABLE public.shared_snags ENABLE ROW LEVEL SECURITY;

-- Users can manage their own shared snags
CREATE POLICY "Users can view their own shared snags"
  ON public.shared_snags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create shared snags for their analyses"
  ON public.shared_snags FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.analyses WHERE id = analysis_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their own shared snags"
  ON public.shared_snags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared snags"
  ON public.shared_snags FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access by short_code (for the public share page)
CREATE POLICY "Anyone can view shared snags by short_code"
  ON public.shared_snags FOR SELECT
  USING (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_share_view(p_short_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.shared_snags SET view_count = view_count + 1 WHERE short_code = p_short_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
