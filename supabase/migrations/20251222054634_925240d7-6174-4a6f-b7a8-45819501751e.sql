-- Fix Critical Security Issues: Public Data Exposure

-- 1. Add RLS policies to restrict feedback_responses access to super admins only
DROP POLICY IF EXISTS "Anyone can read feedback responses" ON public.feedback_responses;
DROP POLICY IF EXISTS "Super admins can view all feedback" ON public.feedback_responses;

CREATE POLICY "Super admins can view all feedback"
ON public.feedback_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND ur.role = 'super_admin'
  )
);

-- 2. Fix scratch_cards table - only super admins should see all, users see their own
DROP POLICY IF EXISTS "Anyone can view scratch cards" ON public.scratch_cards;
DROP POLICY IF EXISTS "Users can view own scratch cards" ON public.scratch_cards;
DROP POLICY IF EXISTS "Super admins can view all scratch cards" ON public.scratch_cards;

CREATE POLICY "Users can view own scratch cards"
ON public.scratch_cards
FOR SELECT
USING (
  user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND ur.role = 'super_admin'
  )
);

-- 3. Fix referral_tracking - only super admins can view
DROP POLICY IF EXISTS "Anyone can read referral tracking" ON public.referral_tracking;
DROP POLICY IF EXISTS "Super admins can view referrals" ON public.referral_tracking;

CREATE POLICY "Super admins can view referrals"
ON public.referral_tracking
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND ur.role = 'super_admin'
  )
);

-- 4. Fix contact_submissions - only super admins can read
DROP POLICY IF EXISTS "Anyone can read contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Super admins can view contact submissions" ON public.contact_submissions;

CREATE POLICY "Super admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND ur.role = 'super_admin'
  )
);

-- 5. Fix scratch_card_inventory - only super admins can view
DROP POLICY IF EXISTS "Anyone can read inventory" ON public.scratch_card_inventory;
DROP POLICY IF EXISTS "Super admins can view inventory" ON public.scratch_card_inventory;

CREATE POLICY "Super admins can view inventory"
ON public.scratch_card_inventory
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND ur.role = 'super_admin'
  )
);

-- 6. Fix training_sections - require authentication to view
DROP POLICY IF EXISTS "Anyone can view published training" ON public.training_sections;
DROP POLICY IF EXISTS "Authenticated users can view published training" ON public.training_sections;

CREATE POLICY "Authenticated users can view published training"
ON public.training_sections
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('super_admin', 'org_admin', 'admin')
    )
  )
);