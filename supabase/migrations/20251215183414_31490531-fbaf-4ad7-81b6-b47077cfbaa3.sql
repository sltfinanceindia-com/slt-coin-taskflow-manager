-- Add/Update RLS policies for leave and WFH tables to enforce organization isolation

-- Leave Types RLS
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view leave types in their org" ON public.leave_types;
CREATE POLICY "Users can view leave types in their org" 
ON public.leave_types 
FOR SELECT 
USING (organization_id = get_my_org_id());

DROP POLICY IF EXISTS "Admins can manage leave types" ON public.leave_types;
CREATE POLICY "Admins can manage leave types" 
ON public.leave_types 
FOR ALL 
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- Leave Balances RLS
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own leave balances" ON public.leave_balances;
CREATE POLICY "Users can view own leave balances" 
ON public.leave_balances 
FOR SELECT 
USING (employee_id = get_my_profile_id());

DROP POLICY IF EXISTS "Admins can view all leave balances in org" ON public.leave_balances;
CREATE POLICY "Admins can view all leave balances in org" 
ON public.leave_balances 
FOR SELECT 
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

DROP POLICY IF EXISTS "Admins can manage leave balances" ON public.leave_balances;
CREATE POLICY "Admins can manage leave balances" 
ON public.leave_balances 
FOR ALL 
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- Leave Requests RLS
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own leave requests" ON public.leave_requests;
CREATE POLICY "Users can view own leave requests" 
ON public.leave_requests 
FOR SELECT 
USING (employee_id = get_my_profile_id());

DROP POLICY IF EXISTS "Admins can view all leave requests in org" ON public.leave_requests;
CREATE POLICY "Admins can view all leave requests in org" 
ON public.leave_requests 
FOR SELECT 
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can create own leave requests" ON public.leave_requests;
CREATE POLICY "Users can create own leave requests" 
ON public.leave_requests 
FOR INSERT 
WITH CHECK (employee_id = get_my_profile_id() AND organization_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can update own pending leave requests" ON public.leave_requests;
CREATE POLICY "Users can update own pending leave requests" 
ON public.leave_requests 
FOR UPDATE 
USING (employee_id = get_my_profile_id() AND status = 'pending');

DROP POLICY IF EXISTS "Admins can manage leave requests" ON public.leave_requests;
CREATE POLICY "Admins can manage leave requests" 
ON public.leave_requests 
FOR ALL 
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- WFH Policies RLS
ALTER TABLE public.wfh_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view wfh policies in their org" ON public.wfh_policies;
CREATE POLICY "Users can view wfh policies in their org" 
ON public.wfh_policies 
FOR SELECT 
USING (organization_id = get_my_org_id());

DROP POLICY IF EXISTS "Admins can manage wfh policies" ON public.wfh_policies;
CREATE POLICY "Admins can manage wfh policies" 
ON public.wfh_policies 
FOR ALL 
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- WFH Requests RLS
ALTER TABLE public.wfh_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wfh requests" ON public.wfh_requests;
CREATE POLICY "Users can view own wfh requests" 
ON public.wfh_requests 
FOR SELECT 
USING (employee_id = get_my_profile_id());

DROP POLICY IF EXISTS "Admins can view all wfh requests in org" ON public.wfh_requests;
CREATE POLICY "Admins can view all wfh requests in org" 
ON public.wfh_requests 
FOR SELECT 
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can create own wfh requests" ON public.wfh_requests;
CREATE POLICY "Users can create own wfh requests" 
ON public.wfh_requests 
FOR INSERT 
WITH CHECK (employee_id = get_my_profile_id() AND organization_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can update own pending wfh requests" ON public.wfh_requests;
CREATE POLICY "Users can update own pending wfh requests" 
ON public.wfh_requests 
FOR UPDATE 
USING (employee_id = get_my_profile_id() AND status = 'pending');

DROP POLICY IF EXISTS "Admins can manage wfh requests" ON public.wfh_requests;
CREATE POLICY "Admins can manage wfh requests" 
ON public.wfh_requests 
FOR ALL 
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());