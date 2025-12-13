-- Create RPC function to get organizations with coin rates for public landing page
CREATE OR REPLACE FUNCTION get_public_coin_rates()
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  rate NUMERIC,
  change_percentage NUMERIC,
  rate_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (o.id)
    o.id as organization_id,
    o.name as organization_name,
    cr.rate,
    cr.change_percentage,
    cr.rate_date
  FROM organizations o
  INNER JOIN coin_rates cr ON cr.organization_id = o.id
  ORDER BY o.id, cr.rate_date DESC;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION get_public_coin_rates() TO anon;
GRANT EXECUTE ON FUNCTION get_public_coin_rates() TO authenticated;