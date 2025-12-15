-- Fix scratch_card_stats view with actual columns
DROP VIEW IF EXISTS public.scratch_card_stats;
CREATE VIEW public.scratch_card_stats
WITH (security_invoker = on)
AS
SELECT
  card_type,
  COUNT(*) as total_issued,
  COUNT(*) FILTER (WHERE is_scratched = true) as scratched_count,
  COUNT(*) FILTER (WHERE is_scratched = false) as pending_count,
  0::bigint as verified_count,
  SUM(card_value) as total_value,
  SUM(card_value) FILTER (WHERE is_scratched = true) as redeemed_value,
  0::numeric as paid_value
FROM public.scratch_cards
GROUP BY card_type;