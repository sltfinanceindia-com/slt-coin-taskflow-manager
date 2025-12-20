-- Drop the existing restrictive admin policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a new policy that allows org_admin, admin, and super_admin to manage roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'org_admin', 'super_admin')
    AND ur.organization_id = user_roles.organization_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'org_admin', 'super_admin')
    AND ur.organization_id = user_roles.organization_id
  )
);