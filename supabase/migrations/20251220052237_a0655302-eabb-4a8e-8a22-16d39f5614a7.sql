-- First create the security definer function
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _organization_id
      AND role IN ('admin', 'org_admin', 'super_admin')
  )
$$;

-- Now add the policies
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_user(auth.uid(), organization_id)
);

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid(), organization_id))
WITH CHECK (public.is_admin_user(auth.uid(), organization_id));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin_user(auth.uid(), organization_id));