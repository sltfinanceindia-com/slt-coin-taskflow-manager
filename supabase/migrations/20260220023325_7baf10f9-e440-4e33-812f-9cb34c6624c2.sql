
-- Fix the auto-provision function to use correct column names
CREATE OR REPLACE FUNCTION public.auto_provision_leave_balances()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.organization_id IS NOT NULL AND (OLD IS NULL OR OLD.organization_id IS DISTINCT FROM NEW.organization_id) THEN
    INSERT INTO leave_balances (employee_id, leave_type_id, organization_id, total_days, used_days, pending_days, year)
    SELECT 
      NEW.id,
      lt.id,
      NEW.organization_id,
      lt.days_per_year,
      0,
      0,
      EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
    FROM leave_types lt
    WHERE lt.organization_id = NEW.organization_id
      AND lt.is_active = true
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Backfill leave balances for existing employees
INSERT INTO leave_balances (employee_id, leave_type_id, organization_id, total_days, used_days, pending_days, year)
SELECT 
  p.id, lt.id, p.organization_id, lt.days_per_year, 0, 0,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
FROM profiles p
CROSS JOIN leave_types lt
WHERE lt.organization_id = p.organization_id
  AND lt.is_active = true
  AND p.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM leave_balances lb 
    WHERE lb.employee_id = p.id AND lb.leave_type_id = lt.id 
    AND lb.year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  );
