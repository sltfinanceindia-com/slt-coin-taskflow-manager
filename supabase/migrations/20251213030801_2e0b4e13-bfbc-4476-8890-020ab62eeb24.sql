-- Fix overly permissive RLS policies

-- 1. Fix coin_rates - restrict to authenticated users only (was public)
DROP POLICY IF EXISTS "Anyone can view coin rates" ON public.coin_rates;
CREATE POLICY "Authenticated users can view coin rates" ON public.coin_rates
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 2. Fix chat_users - ensure org-scoped access
DROP POLICY IF EXISTS "Authenticated users can view active chat users" ON public.chat_users;
DROP POLICY IF EXISTS "Users can view all active chat users" ON public.chat_users;
CREATE POLICY "Users can view chat users in their org" ON public.chat_users
FOR SELECT USING (
  organization_id = get_my_org_id() OR user_id = get_my_profile_id()
);

-- 3. Fix assessments - restrict published assessments to org members
DROP POLICY IF EXISTS "Everyone can view published assessments" ON public.assessments;
CREATE POLICY "Users can view published assessments in their org" ON public.assessments
FOR SELECT USING (
  (is_published = true AND organization_id = get_my_org_id()) OR
  is_any_admin(auth.uid())
);

-- 4. Fix achievements - restrict to org members only
DROP POLICY IF EXISTS "Users can view achievements" ON public.achievements;
CREATE POLICY "Users can view achievements in their org" ON public.achievements
FOR SELECT USING (
  organization_id = get_my_org_id() OR
  (organization_id IS NULL AND auth.uid() IS NOT NULL)
);