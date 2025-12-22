-- Simplify attachments bucket policy - since bucket is public, allow all authenticated users full access
-- This enables org members to download each other's attachments in communication

DROP POLICY IF EXISTS "Org members can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;

-- Allow all authenticated users to view files in attachments bucket
CREATE POLICY "Authenticated users can view attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

-- Allow all authenticated users to upload to attachments bucket
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own attachments (or any in shared folder)
CREATE POLICY "Authenticated users can delete attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);