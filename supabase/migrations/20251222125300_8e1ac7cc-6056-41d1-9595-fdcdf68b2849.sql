-- Fix task_comments RLS policies - remove duplicate INSERT policy and keep the simpler one
DROP POLICY IF EXISTS "Users can create comments on tasks they have access to" ON public.task_comments;

-- Fix attendance_records RLS policies to use user_roles table instead of profiles.role
DROP POLICY IF EXISTS "Users can manage their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance_records;

-- Create proper attendance policies using user_roles table
CREATE POLICY "Employees can manage their own attendance"
ON public.attendance_records
FOR ALL
USING (employee_id = get_user_profile_id());

CREATE POLICY "Admins can view all attendance in org"
ON public.attendance_records
FOR SELECT
USING (
  organization_id = get_user_organization_id()
  AND is_any_admin(auth.uid())
);

CREATE POLICY "Admins can manage all attendance in org"
ON public.attendance_records
FOR ALL
USING (
  organization_id = get_user_organization_id()
  AND is_any_admin(auth.uid())
);

-- Fix time_logs RLS - ensure admins can see all logs in their org
DROP POLICY IF EXISTS "Admins can view all time logs" ON public.time_logs;

CREATE POLICY "Admins can view all time logs in org"
ON public.time_logs
FOR SELECT
USING (
  organization_id = get_user_organization_id()
  AND is_any_admin(auth.uid())
);