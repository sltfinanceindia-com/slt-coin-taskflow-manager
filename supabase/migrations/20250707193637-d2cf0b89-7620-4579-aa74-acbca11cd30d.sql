-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', false);

-- Create RLS policies for task attachments
CREATE POLICY "Users can view task attachments they have access to" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'task-attachments' AND 
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM tasks 
    WHERE assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
    OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  )
);

CREATE POLICY "Users can upload attachments to tasks they have access to" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'task-attachments' AND 
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM tasks 
    WHERE assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
    OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  )
);

CREATE POLICY "Users can delete attachments from tasks they have access to" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'task-attachments' AND 
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM tasks 
    WHERE assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
    OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  )
);