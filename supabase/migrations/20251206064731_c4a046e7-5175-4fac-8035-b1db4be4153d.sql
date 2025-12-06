-- Create a function to get user's highest privilege role (using valid enum values)
CREATE OR REPLACE FUNCTION public.get_user_highest_role(p_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = p_user_id
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'org_admin' THEN 2
      WHEN 'admin' THEN 3
      WHEN 'employee' THEN 4
      WHEN 'intern' THEN 5
      ELSE 6
    END
  LIMIT 1
$$;

-- Create a function to check if user is any type of admin (for sidebar/UI purposes)
CREATE OR REPLACE FUNCTION public.is_any_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id
    AND role IN ('super_admin', 'org_admin', 'admin')
  )
$$;