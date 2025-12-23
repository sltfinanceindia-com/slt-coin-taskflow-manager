-- Fix tasks RLS policies to check user_roles table instead of profiles.role
-- This allows org_admin, admin, and super_admin to manage tasks

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.tasks;

-- Create new policy that checks user_roles table for admin-like roles
CREATE POLICY "Admins can manage all tasks"
ON public.tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN profiles p ON p.user_id = ur.user_id
    WHERE p.user_id = auth.uid()
    AND ur.role IN ('admin', 'org_admin', 'super_admin', 'manager')
    AND p.organization_id = tasks.organization_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN profiles p ON p.user_id = ur.user_id
    WHERE p.user_id = auth.uid()
    AND ur.role IN ('admin', 'org_admin', 'super_admin', 'manager')
    AND p.organization_id = tasks.organization_id
  )
);

-- Also update the view policy to use user_roles
DROP POLICY IF EXISTS "Users can view tasks they're involved in" ON public.tasks;

CREATE POLICY "Users can view tasks in their organization"
ON public.tasks
FOR SELECT
USING (
  -- Users can see tasks assigned to them
  assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  -- Users can see tasks they created
  created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  -- Admins, org_admins, super_admins, managers can see all org tasks
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN profiles p ON p.user_id = ur.user_id
    WHERE p.user_id = auth.uid()
    AND ur.role IN ('admin', 'org_admin', 'super_admin', 'manager')
    AND p.organization_id = tasks.organization_id
  )
);