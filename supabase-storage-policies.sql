-- ==========================================
-- Supabase Storage RLS Policies for chat-audio bucket
-- ==========================================
-- Fix for: function storage.foldername() does not exist
-- Use storage.path() instead, or simpler approach

-- ==========================================
-- OPTION A: Simple RLS (no folder tracking)
-- ==========================================

-- Allow ALL authenticated users to upload to chat-audio bucket
-- (Simpler, less secure but works without foldername())
CREATE POLICY "Allow authenticated uploads to chat-audio" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'chat-audio');

-- Allow ALL authenticated users to view files in chat-audio bucket
CREATE POLICY "Allow authenticated reads from chat-audio" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'chat-audio');

-- ==========================================
-- OPTION B: Better RLS with path-based folders (if needed)
-- ==========================================
-- Note: storage.path() returns full path like "userid/filename.ogg"
-- We can check if path starts with user ID

-- Allow uploads with path containing user ID
CREATE POLICY "Users can upload to own folder" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'chat-audio' AND storage.path() LIKE (auth.uid()::text || '/%'));

-- Allow users to view their own folder
CREATE POLICY "Users can view own folder" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'chat-audio' AND storage.path() LIKE (auth.uid()::text || '/%'));

-- ==========================================
-- STEP 3: Grant necessary permissions
-- ==========================================

-- Grant storage access to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- ==========================================
-- STEP 4: Verify bucket configuration
-- ==========================================

-- In Supabase Dashboard → Storage → chat-audio bucket:
-- - Set "Public" to: false (if using RLS) or true (if open access)
-- - File size limit: 5242880 (5MB)
-- - Allowed MIME types: ogg, mp3, wav, m4a

-- ==========================================
-- STEP 4: Test upload via API or Dashboard
-- ==========================================

-- Test upload using Supabase CLI or Dashboard:
-- supabase storage upload chat-audio test.mp3 /path/to/local/file.mp3

-- Or via JavaScript:
/*
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');

const { data, error } = await supabase.storage
  .from('chat-audio')
  .upload('user_123/audio_1.ogg', audioBlob, { contentType: 'audio/ogg' });

if (data) {
  const publicUrl = supabase.storage.from('chat-audio').getPublicUrl('user_123/audio_1.ogg');
  console.log('Upload successful:', publicUrl);
}
*/