-- Fix subscription_plans to be publicly viewable (for pricing page)
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;

CREATE POLICY "Anyone can view active subscription plans"
ON subscription_plans FOR SELECT
USING (is_active = true);