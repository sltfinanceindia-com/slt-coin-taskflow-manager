-- Fix projects RLS policy to include org_admin and super_admin roles
DROP POLICY IF EXISTS "Users can view projects in their organization" ON projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
DROP POLICY IF EXISTS "Admins and org_admins can manage projects" ON projects;

-- Allow all org members to view projects in their organization
CREATE POLICY "Users can view projects in their organization" ON projects
FOR SELECT USING (
  organization_id = get_user_organization_id()
);

-- Allow admins, org_admins, and super_admins to create/update/delete projects
CREATE POLICY "Admins can manage projects" ON projects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'org_admin', 'super_admin')
    AND (ur.organization_id = projects.organization_id OR ur.role = 'super_admin')
  )
);

-- Fix task_comments RLS to allow organization members to view comments
DROP POLICY IF EXISTS "Users can view comments on tasks they have access to" ON task_comments;
DROP POLICY IF EXISTS "Users can view comments in their organization" ON task_comments;

-- Allow all org members to view comments on tasks in their organization
CREATE POLICY "Users can view comments in their organization" ON task_comments
FOR SELECT USING (
  organization_id = get_user_organization_id()
);

-- Allow users to create comments on tasks in their organization
DROP POLICY IF EXISTS "Users can create comments" ON task_comments;
CREATE POLICY "Users can create comments" ON task_comments
FOR INSERT WITH CHECK (
  organization_id = get_user_organization_id() AND
  user_id = get_user_profile_id()
);

-- Allow users to update their own comments
DROP POLICY IF EXISTS "Users can update their own comments" ON task_comments;
CREATE POLICY "Users can update their own comments" ON task_comments
FOR UPDATE USING (
  user_id = get_user_profile_id()
);

-- Allow users to delete their own comments
DROP POLICY IF EXISTS "Users can delete their own comments" ON task_comments;
CREATE POLICY "Users can delete their own comments" ON task_comments
FOR DELETE USING (
  user_id = get_user_profile_id()
);

-- Fix shift_schedules RLS to allow admins to view all org shifts
DROP POLICY IF EXISTS "Users can view their own shifts" ON shift_schedules;
DROP POLICY IF EXISTS "Admins can view all organization shifts" ON shift_schedules;
DROP POLICY IF EXISTS "Users can view organization shifts" ON shift_schedules;

-- Allow users to view all shifts in their organization (for scheduler visibility)
CREATE POLICY "Users can view organization shifts" ON shift_schedules
FOR SELECT USING (
  organization_id = get_user_organization_id()
);

-- Allow admins to manage all shifts in their organization
DROP POLICY IF EXISTS "Admins can manage organization shifts" ON shift_schedules;
CREATE POLICY "Admins can manage organization shifts" ON shift_schedules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'org_admin', 'super_admin')
    AND ur.organization_id = shift_schedules.organization_id
  )
);