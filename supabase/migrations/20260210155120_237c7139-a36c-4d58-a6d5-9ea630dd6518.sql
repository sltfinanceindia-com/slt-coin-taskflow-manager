-- Make the attachments bucket private to prevent unauthenticated access
UPDATE storage.buckets 
SET public = false 
WHERE id = 'attachments';

-- Drop any existing policies for attachments bucket
DROP POLICY IF EXISTS "Authenticated users can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Org members can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;

-- Create proper RLS policies for attachments

CREATE POLICY "Authed users view attachments" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authed users upload attachments" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Owners update attachments" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'attachments' AND
    auth.uid() = owner
  );

CREATE POLICY "Owners delete attachments" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    auth.uid() = owner
  );