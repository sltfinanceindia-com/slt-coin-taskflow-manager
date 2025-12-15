-- Fix views with security_invoker option
ALTER VIEW public.feedback_analytics SET (security_invoker = on);
ALTER VIEW public.scratch_card_stats SET (security_invoker = on);