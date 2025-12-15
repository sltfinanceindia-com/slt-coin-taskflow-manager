-- Recreate feedback_analytics view with correct schema and security invoker
DROP VIEW IF EXISTS public.feedback_analytics;
CREATE VIEW public.feedback_analytics 
WITH (security_invoker = on)
AS
SELECT 
  DATE(submission_date) as response_date,
  COUNT(*) as total_responses,
  AVG((response_data->>'rating')::numeric) FILTER (WHERE response_data->>'rating' IS NOT NULL) as avg_rating
FROM public.feedback_responses
GROUP BY DATE(submission_date);

-- Recreate scratch_card_stats view with security invoker  
DROP VIEW IF EXISTS public.scratch_card_stats;
CREATE VIEW public.scratch_card_stats
WITH (security_invoker = on)
AS
SELECT
  card_type,
  COUNT(*) as total_issued,
  COUNT(*) FILTER (WHERE is_scratched = true) as total_scratched,
  SUM(card_value) as total_value,
  SUM(card_value) FILTER (WHERE is_scratched = true) as redeemed_value
FROM public.scratch_cards
GROUP BY card_type;