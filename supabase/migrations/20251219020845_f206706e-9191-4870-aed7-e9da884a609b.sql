-- Fix Task Creation RLS - Allow org users to create tasks
CREATE POLICY "Users can create tasks in their org"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid() LIMIT 1
  )
);

-- Fix Coin Rates - Update existing records to have organization_id
UPDATE public.coin_rates 
SET organization_id = (
  SELECT organization_id FROM profiles WHERE user_id = created_by LIMIT 1
)
WHERE organization_id IS NULL AND created_by IS NOT NULL;

-- Add RLS policy for coin_rates organization filtering
DROP POLICY IF EXISTS "Authenticated users can view coin rates" ON public.coin_rates;
CREATE POLICY "Users can view coin rates in their org"
ON public.coin_rates
FOR SELECT
TO authenticated
USING (
  organization_id = (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid() LIMIT 1
  )
  OR organization_id IS NULL
);

DROP POLICY IF EXISTS "Only admins can insert coin rates" ON public.coin_rates;
CREATE POLICY "Org admins can insert coin rates"
ON public.coin_rates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'org_admin', 'super_admin')
  )
  AND (
    organization_id = (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid() LIMIT 1
    )
    OR organization_id IS NULL
  )
);

DROP POLICY IF EXISTS "Only admins can update coin rates" ON public.coin_rates;
CREATE POLICY "Org admins can update coin rates"
ON public.coin_rates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'org_admin', 'super_admin')
  )
  AND (
    organization_id = (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid() LIMIT 1
    )
    OR organization_id IS NULL
  )
);

DROP POLICY IF EXISTS "Only admins can delete coin rates" ON public.coin_rates;
CREATE POLICY "Org admins can delete coin rates"
ON public.coin_rates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'org_admin', 'super_admin')
  )
  AND (
    organization_id = (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid() LIMIT 1
    )
    OR organization_id IS NULL
  )
);

-- Fix leave types with null organization_id - assign to the org of their creator if possible
UPDATE public.leave_types lt
SET organization_id = (
  SELECT p.organization_id 
  FROM profiles p 
  WHERE p.organization_id IS NOT NULL 
  LIMIT 1
)
WHERE lt.organization_id IS NULL;