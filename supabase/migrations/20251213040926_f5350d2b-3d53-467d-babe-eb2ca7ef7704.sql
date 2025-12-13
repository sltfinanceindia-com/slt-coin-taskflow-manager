-- Update the get_public_stats function to return organizations count instead of users
CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalOrganizations', (SELECT COUNT(*) FROM organizations),
    'completedTasks', (SELECT COUNT(*) FROM tasks WHERE status = 'verified'),
    'totalCoins', (SELECT COALESCE(SUM(coins_earned), 0) FROM coin_transactions WHERE status = 'approved')
  ) INTO result;
  
  RETURN result;
END;
$$;