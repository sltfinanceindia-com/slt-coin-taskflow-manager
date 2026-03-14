
-- Fix 1: Sync profiles.role with highest user_roles role for mismatched users
UPDATE public.profiles SET role = 'super_admin' WHERE id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87';
UPDATE public.profiles SET role = 'super_admin' WHERE id = 'cbc4df08-b653-4006-ab26-20ad66e5e65e';
UPDATE public.profiles SET role = 'admin' WHERE id = '3952d290-7f3b-4c22-a90f-b94e595bab89';

-- Fix 2: Set organization to active with extended trial
UPDATE public.organizations 
SET subscription_status = 'active', 
    trial_ends_at = now() + INTERVAL '90 days'
WHERE id = '81ce98aa-c524-4872-ab4c-95e66fe49a08';

-- Fix 3: Complete employee profile
UPDATE public.profiles 
SET department = 'Finance',
    employee_id = 'SLT-EMP-001',
    reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87',
    total_coins = COALESCE(total_coins, 0)
WHERE id = '2ebb7605-9210-42e6-bddb-7a896563fcef';

-- Fix 4: Set total_coins default for all NULL profiles in this org
UPDATE public.profiles 
SET total_coins = 0
WHERE organization_id = '81ce98aa-c524-4872-ab4c-95e66fe49a08'
AND total_coins IS NULL;

-- Fix 5: Add RLS policies to login_attempts table
CREATE POLICY "Service role full access on login_attempts"
ON public.login_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can read own login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
