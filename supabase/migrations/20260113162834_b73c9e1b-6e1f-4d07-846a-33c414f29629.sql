-- Add source_journal_id to post_mortems table to link journal entries
ALTER TABLE public.post_mortems 
ADD COLUMN IF NOT EXISTS source_journal_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_mortems_source_journal ON public.post_mortems(source_journal_id);

-- Add linked_analysis columns to journal_entries for quick lookup
ALTER TABLE public.journal_entries
ADD COLUMN IF NOT EXISTS linked_analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS linked_post_mortem_id UUID REFERENCES public.post_mortems(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_linked_analysis ON public.journal_entries(linked_analysis_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_linked_post_mortem ON public.journal_entries(linked_post_mortem_id);