-- Create quick_retros table for Quick Post-Mortems
CREATE TABLE public.quick_retros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  outcome_rating TEXT NOT NULL CHECK (outcome_rating IN ('great', 'good', 'okay', 'poor', 'bad')),
  what_worked TEXT,
  what_didnt TEXT,
  lesson TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('meeting', 'project', 'decision', 'day', 'conversation', 'other')),
  ai_nudge TEXT,
  full_post_mortem_id UUID REFERENCES public.post_mortems(id) ON DELETE SET NULL,
  source_journal_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.quick_retros ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own quick retros"
ON public.quick_retros FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quick retros"
ON public.quick_retros FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick retros"
ON public.quick_retros FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick retros"
ON public.quick_retros FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_quick_retros_user_date ON public.quick_retros(user_id, created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_quick_retros_updated_at
BEFORE UPDATE ON public.quick_retros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();