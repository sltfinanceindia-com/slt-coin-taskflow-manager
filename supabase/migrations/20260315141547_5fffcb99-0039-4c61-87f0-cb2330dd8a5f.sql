
-- Fix 1: get_current_user_role() - read from user_roles instead of profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'org_admin' THEN 2
      WHEN 'admin' THEN 3
      WHEN 'hr_admin' THEN 4
      WHEN 'project_manager' THEN 5
      WHEN 'finance_manager' THEN 6
      WHEN 'manager' THEN 7
      WHEN 'team_lead' THEN 8
      WHEN 'employee' THEN 9
      WHEN 'intern' THEN 10
      ELSE 11
    END
  LIMIT 1;
  
  RETURN COALESCE(v_role, 'employee');
END;
$function$;

-- Fix 2: can_update_profile() - check user_roles for admin access
CREATE OR REPLACE FUNCTION public.can_update_profile(profile_id uuid, new_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_profile RECORD;
  is_admin BOOLEAN;
BEGIN
  SELECT * FROM public.profiles WHERE id = profile_id INTO current_profile;
  
  -- Check if requesting user is any admin via user_roles
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'org_admin', 'admin')
  ) INTO is_admin;
  
  -- If role is not changing, allow update
  IF current_profile.role::TEXT = new_role THEN
    RETURN TRUE;
  END IF;
  
  IF is_admin THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- Fix 3: get_user_highest_role() - include all 10 role types
CREATE OR REPLACE FUNCTION public.get_user_highest_role(p_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT role FROM public.user_roles
  WHERE user_id = p_user_id
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'org_admin' THEN 2
      WHEN 'admin' THEN 3
      WHEN 'hr_admin' THEN 4
      WHEN 'project_manager' THEN 5
      WHEN 'finance_manager' THEN 6
      WHEN 'manager' THEN 7
      WHEN 'team_lead' THEN 8
      WHEN 'employee' THEN 9
      WHEN 'intern' THEN 10
      ELSE 11
    END
  LIMIT 1
$function$;
