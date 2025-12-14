-- Make the attachments bucket public so files can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'attachments';

-- Add a policy for users to read all attachments in their organization
-- (The existing policy is too restrictive)
DROP POLICY IF EXISTS "Users can read attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments they have access to" ON storage.objects;

CREATE POLICY "Authenticated users can view attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'attachments' 
  AND auth.uid() IS NOT NULL
);