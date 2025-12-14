-- Drop existing policies that check profiles.role for super_admin
DROP POLICY IF EXISTS "Users can view own feedback and super admins can view all" ON feedback_responses;
DROP POLICY IF EXISTS "Super admins can update all scratch cards" ON scratch_cards;
DROP POLICY IF EXISTS "Users can view own scratch cards" ON scratch_cards;

-- Create or replace a helper function to check if user is super admin (using user_roles table)
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = check_user_id
      AND user_roles.role = 'super_admin'
  )
$$;

-- Recreate feedback_responses SELECT policy
CREATE POLICY "Users can view own feedback and super admins can view all"
ON feedback_responses
FOR SELECT
USING (
  (user_email = auth.email()) 
  OR public.is_super_admin(auth.uid())
);

-- Recreate scratch_cards SELECT policy  
CREATE POLICY "Users can view own scratch cards"
ON scratch_cards
FOR SELECT
USING (
  (user_email = auth.email()) 
  OR public.is_super_admin(auth.uid())
);

-- Recreate scratch_cards UPDATE policy for super admins
CREATE POLICY "Super admins can update all scratch cards"
ON scratch_cards
FOR UPDATE
USING (public.is_super_admin(auth.uid()));