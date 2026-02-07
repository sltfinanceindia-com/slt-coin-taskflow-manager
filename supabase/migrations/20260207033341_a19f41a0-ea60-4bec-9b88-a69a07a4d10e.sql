-- Fix RLS policies for custom_roles table to allow organization admins to create/manage roles

-- First drop existing policies if any
DROP POLICY IF EXISTS "Users can view roles in their organization" ON custom_roles;
DROP POLICY IF EXISTS "Admins can create roles" ON custom_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON custom_roles;
DROP POLICY IF EXISTS "Admins can delete non-system roles" ON custom_roles;

-- Enable RLS
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view roles in their organization
CREATE POLICY "Users can view roles in their organization"
ON custom_roles FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- INSERT: Admins can create roles in their organization
CREATE POLICY "Admins can create roles"
ON custom_roles FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'org_admin', 'admin', 'hr_admin')
  )
);

-- UPDATE: Admins can update roles in their organization
CREATE POLICY "Admins can update roles"
ON custom_roles FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'org_admin', 'admin', 'hr_admin')
  )
);

-- DELETE: Admins can delete non-system roles in their organization
CREATE POLICY "Admins can delete non-system roles"
ON custom_roles FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
  AND is_system_role = false
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'org_admin', 'admin', 'hr_admin')
  )
);

-- Fix RLS for role_permissions table
DROP POLICY IF EXISTS "Users can view permissions in their organization" ON role_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON role_permissions;

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view permissions for roles in their organization
CREATE POLICY "Users can view permissions in their organization"
ON role_permissions FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- INSERT/UPDATE/DELETE: Admins can manage permissions
CREATE POLICY "Admins can manage permissions"
ON role_permissions FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'org_admin', 'admin', 'hr_admin')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'org_admin', 'admin', 'hr_admin')
  )
);