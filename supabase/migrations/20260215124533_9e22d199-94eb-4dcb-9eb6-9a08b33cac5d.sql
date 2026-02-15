
-- Create mystical readings table
CREATE TABLE public.mystical_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reading_type TEXT NOT NULL, -- 'vedic', 'western', 'chinese', 'numerology'
  reading_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mystical purchases table
CREATE TABLE public.mystical_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mystical_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystical_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for mystical_readings
CREATE POLICY "Users can view their own readings" ON public.mystical_readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own readings" ON public.mystical_readings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own readings" ON public.mystical_readings FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for mystical_purchases
CREATE POLICY "Users can view their own purchases" ON public.mystical_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own purchases" ON public.mystical_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchases" ON public.mystical_purchases FOR UPDATE USING (auth.uid() = user_id);
