-- Journal entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('free_write', 'gratitude', 'manifestation', 'reflection', 'morning', 'evening')),
  content JSONB NOT NULL DEFAULT '{}',
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'low', 'difficult')),
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'custom')),
  frequency_days INTEGER[] DEFAULT '{}',
  reminder_time TIME,
  why_it_matters TEXT,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habit completions table
CREATE TABLE public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completed_at)
);

-- Decisions (micro-snags) table
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_text TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  stakes TEXT CHECK (stakes IN ('low', 'medium', 'high')),
  category TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'made', 'completed')),
  chosen_option TEXT,
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
  outcome_check_date DATE,
  outcome_status TEXT CHECK (outcome_status IN ('success', 'partial', 'failure', 'changed', 'pending')),
  outcome_notes TEXT,
  outcome_logged_at TIMESTAMPTZ,
  deep_snag_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  ai_nudge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post-mortems table
CREATE TABLE public.post_mortems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT NOT NULL,
  post_mortem_type TEXT NOT NULL CHECK (post_mortem_type IN ('decision', 'project', 'event', 'failure', 'success', 'other')),
  outcome_rating INTEGER CHECK (outcome_rating >= 1 AND outcome_rating <= 10),
  outcome_status TEXT CHECK (outcome_status IN ('success', 'partial', 'failure', 'mixed')),
  user_inputs JSONB NOT NULL DEFAULT '{}',
  ai_analysis JSONB,
  linked_decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
  timeframe_start DATE,
  timeframe_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business framework analyses table
CREATE TABLE public.framework_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  framework_type TEXT NOT NULL,
  title TEXT,
  inputs JSONB NOT NULL DEFAULT '{}',
  ai_enhancement JSONB,
  visual_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Visual exports table
CREATE TABLE public.visual_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('deep_snag', 'post_mortem', 'framework')),
  source_id UUID NOT NULL,
  framework_type TEXT NOT NULL,
  visual_data JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_mortems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_exports ENABLE ROW LEVEL SECURITY;

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Habit completions policies
CREATE POLICY "Users can view their own habit completions" ON public.habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habit completions" ON public.habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habit completions" ON public.habit_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habit completions" ON public.habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Decisions policies
CREATE POLICY "Users can view their own decisions" ON public.decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own decisions" ON public.decisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own decisions" ON public.decisions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own decisions" ON public.decisions FOR DELETE USING (auth.uid() = user_id);

-- Post-mortems policies
CREATE POLICY "Users can view their own post-mortems" ON public.post_mortems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own post-mortems" ON public.post_mortems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own post-mortems" ON public.post_mortems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own post-mortems" ON public.post_mortems FOR DELETE USING (auth.uid() = user_id);

-- Framework analyses policies
CREATE POLICY "Users can view their own framework analyses" ON public.framework_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own framework analyses" ON public.framework_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own framework analyses" ON public.framework_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own framework analyses" ON public.framework_analyses FOR DELETE USING (auth.uid() = user_id);

-- Visual exports policies
CREATE POLICY "Users can view their own visual exports" ON public.visual_exports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own visual exports" ON public.visual_exports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own visual exports" ON public.visual_exports FOR DELETE USING (auth.uid() = user_id);

-- Update usage table to include new tracking columns
ALTER TABLE public.usage 
ADD COLUMN IF NOT EXISTS post_mortems_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS post_mortems_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS frameworks_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS frameworks_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visual_exports_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS journal_entries_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS decisions_today INTEGER DEFAULT 0;

-- Update tier_limits table with new limits
ALTER TABLE public.tier_limits
ADD COLUMN IF NOT EXISTS post_mortems_monthly INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS frameworks_monthly INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS habits_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS journal_daily INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS decisions_daily INTEGER DEFAULT 0;

-- Update tier_limits with new values
UPDATE public.tier_limits SET 
  post_mortems_monthly = 1,
  frameworks_monthly = 2,
  habits_limit = 0,
  journal_daily = 3,
  decisions_daily = 3
WHERE tier = 'free';

UPDATE public.tier_limits SET 
  post_mortems_monthly = 25,
  frameworks_monthly = -1,
  habits_limit = 10,
  journal_daily = -1,
  decisions_daily = -1
WHERE tier = 'pro';

UPDATE public.tier_limits SET 
  post_mortems_monthly = 100,
  frameworks_monthly = -1,
  habits_limit = -1,
  journal_daily = -1,
  decisions_daily = -1
WHERE tier = 'team';

UPDATE public.tier_limits SET 
  post_mortems_monthly = 500,
  frameworks_monthly = -1,
  habits_limit = -1,
  journal_daily = -1,
  decisions_daily = -1
WHERE tier = 'business';

UPDATE public.tier_limits SET 
  post_mortems_monthly = -1,
  frameworks_monthly = -1,
  habits_limit = -1,
  journal_daily = -1,
  decisions_daily = -1
WHERE tier = 'enterprise';

-- Function to update journal entry timestamp
CREATE OR REPLACE FUNCTION public.update_journal_entry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for journal entries
CREATE TRIGGER update_journal_entries_timestamp
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_journal_entry_timestamp();

-- Function to update habit streaks on completion
CREATE OR REPLACE FUNCTION public.update_habit_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_current_streak INTEGER;
  v_best_streak INTEGER;
  v_last_completion DATE;
BEGIN
  -- Get the last completion before this one
  SELECT completed_at INTO v_last_completion
  FROM public.habit_completions
  WHERE habit_id = NEW.habit_id AND completed_at < NEW.completed_at
  ORDER BY completed_at DESC
  LIMIT 1;
  
  -- Get current streak
  SELECT current_streak, best_streak INTO v_current_streak, v_best_streak
  FROM public.habits
  WHERE id = NEW.habit_id;
  
  -- If last completion was yesterday, increment streak
  IF v_last_completion = NEW.completed_at - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  -- If last completion was today (duplicate), keep streak
  ELSIF v_last_completion = NEW.completed_at THEN
    -- Do nothing
    NULL;
  -- Otherwise, reset streak to 1
  ELSE
    v_current_streak := 1;
  END IF;
  
  -- Update best streak if current is higher
  IF v_current_streak > v_best_streak THEN
    v_best_streak := v_current_streak;
  END IF;
  
  -- Update the habit
  UPDATE public.habits
  SET current_streak = v_current_streak, best_streak = v_best_streak
  WHERE id = NEW.habit_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for habit completions
CREATE TRIGGER update_habit_streak_on_completion
AFTER INSERT ON public.habit_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_habit_streak();

-- Function to increment post-mortem usage
CREATE OR REPLACE FUNCTION public.increment_post_mortem_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.usage 
  SET post_mortems_used = post_mortems_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id 
  AND CURRENT_DATE BETWEEN period_start AND period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to increment framework usage
CREATE OR REPLACE FUNCTION public.increment_framework_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.usage 
  SET frameworks_used = frameworks_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id 
  AND CURRENT_DATE BETWEEN period_start AND period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_type ON public.journal_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON public.habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON public.habit_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON public.decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_outcome_check_date ON public.decisions(outcome_check_date);
CREATE INDEX IF NOT EXISTS idx_post_mortems_user_id ON public.post_mortems(user_id);
CREATE INDEX IF NOT EXISTS idx_framework_analyses_user_id ON public.framework_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_visual_exports_source ON public.visual_exports(source_type, source_id);