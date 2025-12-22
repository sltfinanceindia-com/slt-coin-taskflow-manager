-- Fix storage policies for attachments bucket
-- Allow all authenticated users in the same org to download attachments

-- Drop the existing restrictive select policy
DROP POLICY IF EXISTS "Authenticated users can view attachments" ON storage.objects;

-- Create a new policy that allows org members to view attachments
CREATE POLICY "Org members can view attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'attachments' 
  AND auth.uid() IS NOT NULL
);

-- Fix the upload policy to use profile.id not auth.uid() for folder structure
DROP POLICY IF EXISTS "Users can upload attachments" ON storage.objects;
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'attachments' 
  AND auth.uid() IS NOT NULL
);

-- Fix delete policy
DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'attachments' 
  AND auth.uid() IS NOT NULL
);

-- Fix task-attachments policies to be org-based
DROP POLICY IF EXISTS "Users can view task attachments they have access to" ON storage.objects;
CREATE POLICY "Org users can view task attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.tasks t ON t.organization_id = p.organization_id
    WHERE p.user_id = auth.uid()
    AND (storage.foldername(name))[1] = t.id::text
  )
);

DROP POLICY IF EXISTS "Users can upload attachments to tasks they have access to" ON storage.objects;
CREATE POLICY "Org users can upload task attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.tasks t ON t.organization_id = p.organization_id
    WHERE p.user_id = auth.uid()
    AND (storage.foldername(name))[1] = t.id::text
  )
);

DROP POLICY IF EXISTS "Users can delete attachments from tasks they have access to" ON storage.objects;
CREATE POLICY "Org users can delete task attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.tasks t ON t.organization_id = p.organization_id
    WHERE p.user_id = auth.uid()
    AND (storage.foldername(name))[1] = t.id::text
  )
);