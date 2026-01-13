-- Add source tracking columns to analyses table
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'text';
-- Values: 'text', 'pdf', 'docx', 'image'

ALTER TABLE analyses ADD COLUMN IF NOT EXISTS source_file_url TEXT;
-- URL to uploaded file in Supabase Storage

-- Create storage bucket for analysis uploads (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analysis-uploads', 'analysis-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for analysis uploads
CREATE POLICY "Users can upload own analysis files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'analysis-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own analysis files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'analysis-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own analysis files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'analysis-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);