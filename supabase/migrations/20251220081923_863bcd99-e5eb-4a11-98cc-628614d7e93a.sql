-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own feedback and super admins can view all" ON feedback_responses;

-- Create a new policy that only allows super admins to view feedback responses
CREATE POLICY "Super admins can view all feedback"
ON feedback_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'super_admin'
  )
);