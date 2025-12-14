-- Drop and recreate the SELECT policy on feedback_responses to use direct lookup
DROP POLICY IF EXISTS "Users can view own feedback and super admins can view all" ON feedback_responses;

CREATE POLICY "Users can view own feedback and super admins can view all" 
ON feedback_responses FOR SELECT USING (
  user_email = auth.email() 
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'super_admin'
  )
);