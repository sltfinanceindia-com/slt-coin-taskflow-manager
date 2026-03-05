-- Step 1: RLS Hardening - Tighten 10 permissive INSERT/UPDATE policies
-- Keep contact_submissions and trial_signups as public-facing

-- audit_logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- automation_logs
DROP POLICY IF EXISTS "System can insert automation logs" ON public.automation_logs;
CREATE POLICY "Authenticated users can insert automation logs" ON public.automation_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- daily_email_log (INSERT + UPDATE)
DROP POLICY IF EXISTS "System can insert email logs" ON public.daily_email_log;
CREATE POLICY "Authenticated users can insert email logs" ON public.daily_email_log FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "System can update email logs" ON public.daily_email_log;
CREATE POLICY "Authenticated users can update email logs" ON public.daily_email_log FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- email_notifications
DROP POLICY IF EXISTS "System can insert email notifications" ON public.email_notifications;
CREATE POLICY "Authenticated users can insert email notifications" ON public.email_notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- payments
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
CREATE POLICY "Authenticated users can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- referral_tracking
DROP POLICY IF EXISTS "System can insert referrals" ON public.referral_tracking;
CREATE POLICY "Authenticated users can insert referrals" ON public.referral_tracking FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- scratch_cards
DROP POLICY IF EXISTS "System can create scratch cards" ON public.scratch_cards;
CREATE POLICY "Authenticated users can create scratch cards" ON public.scratch_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- subscription_history
DROP POLICY IF EXISTS "System can insert subscription history" ON public.subscription_history;
CREATE POLICY "Authenticated users can insert subscription history" ON public.subscription_history FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);