-- Create function to get public statistics without authentication
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM profiles WHERE is_active = true),
    'completedTasks', (SELECT COUNT(*) FROM tasks WHERE status = 'verified'),
    'totalCoins', (SELECT COALESCE(SUM(coins_earned), 0) FROM coin_transactions WHERE status = 'approved')
  ) INTO result;
  RETURN result;
END;
$$;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;