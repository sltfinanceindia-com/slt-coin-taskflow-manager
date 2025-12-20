-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Update the select policy to allow admins to view all roles in their org
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a proper SELECT policy that uses the security definer function
CREATE POLICY "Users can view roles in their org"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_admin_user(auth.uid(), organization_id)
);