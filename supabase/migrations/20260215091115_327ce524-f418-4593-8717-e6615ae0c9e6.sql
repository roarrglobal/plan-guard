
-- Create chat_leads table for marketing chatbot lead capture
CREATE TABLE public.chat_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  source_page TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  first_message TEXT,
  messages_count INTEGER DEFAULT 0,
  asked_about_pricing BOOLEAN DEFAULT FALSE,
  asked_for_demo BOOLEAN DEFAULT FALSE,
  asked_about_enterprise BOOLEAN DEFAULT FALSE,
  interested_in_team BOOLEAN DEFAULT FALSE,
  converted_to_signup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

-- Indexes
CREATE INDEX idx_chat_leads_email ON public.chat_leads(email);
CREATE INDEX idx_chat_leads_created ON public.chat_leads(created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (marketing visitors aren't logged in)
CREATE POLICY "Anyone can insert chat leads"
  ON public.chat_leads FOR INSERT
  WITH CHECK (true);

-- Allow anonymous updates by email (for tracking interactions)
CREATE POLICY "Anyone can update chat leads"
  ON public.chat_leads FOR UPDATE
  USING (true);

-- Only service role can read (admin access only)
CREATE POLICY "Service role can read chat leads"
  ON public.chat_leads FOR SELECT
  USING (false);
