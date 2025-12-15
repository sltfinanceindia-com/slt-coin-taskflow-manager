-- Create a helper function to check if user belongs to same organization
CREATE OR REPLACE FUNCTION public.is_same_org_user(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND organization_id = target_org_id
  )
$$;

-- Create a helper function to check if user is admin in same organization
CREATE OR REPLACE FUNCTION public.is_same_org_admin(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON ur.user_id = p.user_id
    WHERE p.user_id = auth.uid()
    AND p.organization_id = target_org_id
    AND ur.role IN ('super_admin', 'org_admin', 'admin')
  )
$$;

-- Drop existing policies for one_on_one_meetings and recreate with org filter
DROP POLICY IF EXISTS "Users can view meetings they participate in" ON public.one_on_one_meetings;
DROP POLICY IF EXISTS "Admins can manage meetings in their org" ON public.one_on_one_meetings;
DROP POLICY IF EXISTS "Users can create meetings in their org" ON public.one_on_one_meetings;
DROP POLICY IF EXISTS "Users can update their meetings" ON public.one_on_one_meetings;

CREATE POLICY "Users can view meetings they participate in"
ON public.one_on_one_meetings FOR SELECT
USING (
  public.is_same_org_user(organization_id) AND (
    manager_id = public.get_user_profile_id() OR
    employee_id = public.get_user_profile_id() OR
    public.is_same_org_admin(organization_id)
  )
);

CREATE POLICY "Users can create meetings in their org"
ON public.one_on_one_meetings FOR INSERT
WITH CHECK (
  public.is_same_org_user(organization_id)
);

CREATE POLICY "Users can update their meetings"
ON public.one_on_one_meetings FOR UPDATE
USING (
  public.is_same_org_user(organization_id) AND (
    manager_id = public.get_user_profile_id() OR
    public.is_same_org_admin(organization_id)
  )
);

CREATE POLICY "Admins can delete meetings in their org"
ON public.one_on_one_meetings FOR DELETE
USING (
  public.is_same_org_admin(organization_id)
);

-- Drop and recreate policies for feedback_cycles
DROP POLICY IF EXISTS "Users can view feedback cycles in their org" ON public.feedback_cycles;
DROP POLICY IF EXISTS "Admins can manage feedback cycles" ON public.feedback_cycles;

CREATE POLICY "Users can view feedback cycles in their org"
ON public.feedback_cycles FOR SELECT
USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert feedback cycles"
ON public.feedback_cycles FOR INSERT
WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update feedback cycles"
ON public.feedback_cycles FOR UPDATE
USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete feedback cycles"
ON public.feedback_cycles FOR DELETE
USING (public.is_same_org_admin(organization_id));

-- Drop and recreate policies for objectives
DROP POLICY IF EXISTS "Users can view objectives in their org" ON public.objectives;
DROP POLICY IF EXISTS "Users can manage their objectives" ON public.objectives;

CREATE POLICY "Users can view objectives in their org"
ON public.objectives FOR SELECT
USING (public.is_same_org_user(organization_id));

CREATE POLICY "Users can insert objectives in their org"
ON public.objectives FOR INSERT
WITH CHECK (public.is_same_org_user(organization_id));

CREATE POLICY "Users can update their own objectives"
ON public.objectives FOR UPDATE
USING (
  public.is_same_org_user(organization_id) AND (
    owner_id = public.get_user_profile_id() OR
    created_by = public.get_user_profile_id() OR
    public.is_same_org_admin(organization_id)
  )
);

CREATE POLICY "Admins can delete objectives"
ON public.objectives FOR DELETE
USING (public.is_same_org_admin(organization_id));

-- Drop and recreate policies for key_results
DROP POLICY IF EXISTS "Users can view key results in their org" ON public.key_results;
DROP POLICY IF EXISTS "Users can manage key results" ON public.key_results;

CREATE POLICY "Users can view key results in their org"
ON public.key_results FOR SELECT
USING (public.is_same_org_user(organization_id));

CREATE POLICY "Users can insert key results in their org"
ON public.key_results FOR INSERT
WITH CHECK (public.is_same_org_user(organization_id));

CREATE POLICY "Users can update key results in their org"
ON public.key_results FOR UPDATE
USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can delete key results"
ON public.key_results FOR DELETE
USING (public.is_same_org_admin(organization_id));

-- Drop and recreate policies for performance_improvement_plans
DROP POLICY IF EXISTS "Users can view PIPs they are involved in" ON public.performance_improvement_plans;
DROP POLICY IF EXISTS "Admins can manage PIPs" ON public.performance_improvement_plans;

CREATE POLICY "Users can view PIPs they are involved in"
ON public.performance_improvement_plans FOR SELECT
USING (
  public.is_same_org_user(organization_id) AND (
    employee_id = public.get_user_profile_id() OR
    manager_id = public.get_user_profile_id() OR
    hr_representative_id = public.get_user_profile_id() OR
    public.is_same_org_admin(organization_id)
  )
);

CREATE POLICY "Admins can insert PIPs"
ON public.performance_improvement_plans FOR INSERT
WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update PIPs"
ON public.performance_improvement_plans FOR UPDATE
USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete PIPs"
ON public.performance_improvement_plans FOR DELETE
USING (public.is_same_org_admin(organization_id));

-- Drop and recreate policies for feedback_requests
DROP POLICY IF EXISTS "Users can view feedback requests they are involved in" ON public.feedback_requests;
DROP POLICY IF EXISTS "Admins can manage feedback requests" ON public.feedback_requests;

CREATE POLICY "Users can view feedback requests they are involved in"
ON public.feedback_requests FOR SELECT
USING (
  public.is_same_org_user(organization_id) AND (
    subject_id = public.get_user_profile_id() OR
    reviewer_id = public.get_user_profile_id() OR
    public.is_same_org_admin(organization_id)
  )
);

CREATE POLICY "Admins can insert feedback requests"
ON public.feedback_requests FOR INSERT
WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Users can update their feedback requests"
ON public.feedback_requests FOR UPDATE
USING (
  public.is_same_org_user(organization_id) AND (
    reviewer_id = public.get_user_profile_id() OR
    public.is_same_org_admin(organization_id)
  )
);

CREATE POLICY "Admins can delete feedback requests"
ON public.feedback_requests FOR DELETE
USING (public.is_same_org_admin(organization_id));