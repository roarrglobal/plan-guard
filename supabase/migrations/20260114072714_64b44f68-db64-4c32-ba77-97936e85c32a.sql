-- Add outcome tracking fields to decisions table
ALTER TABLE public.decisions
ADD COLUMN IF NOT EXISTS followup_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS outcome_proceeded text,
ADD COLUMN IF NOT EXISTS outcome_result text,
ADD COLUMN IF NOT EXISTS risks_materialized text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS outcome_lesson text;

-- Add bottom_line field to analyses table for storing the verdict
ALTER TABLE public.analyses
ADD COLUMN IF NOT EXISTS bottom_line jsonb;

-- Create kill_criteria_reminders table for accountability tracking
CREATE TABLE IF NOT EXISTS public.kill_criteria_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  analysis_id uuid REFERENCES public.analyses(id) ON DELETE CASCADE,
  decision_id uuid REFERENCES public.decisions(id) ON DELETE CASCADE,
  criterion_text text NOT NULL,
  reminder_date date NOT NULL,
  reminder_enabled boolean DEFAULT true,
  status text DEFAULT 'pending',
  response text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on kill_criteria_reminders
ALTER TABLE public.kill_criteria_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for kill_criteria_reminders
CREATE POLICY "Users can view their own kill criteria reminders"
ON public.kill_criteria_reminders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own kill criteria reminders"
ON public.kill_criteria_reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kill criteria reminders"
ON public.kill_criteria_reminders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kill criteria reminders"
ON public.kill_criteria_reminders FOR DELETE
USING (auth.uid() = user_id);