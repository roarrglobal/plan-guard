-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS focus_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private',
ADD COLUMN IF NOT EXISTS show_snags BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_connections BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discoverable BOOLEAN DEFAULT FALSE;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
-- Allow public read access
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update RLS policy for public profile reading
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Users can view public profiles or their own
CREATE POLICY "Public profiles or own profile readable"
ON public.profiles FOR SELECT
USING (
  visibility = 'public' 
  OR user_id = auth.uid()
);