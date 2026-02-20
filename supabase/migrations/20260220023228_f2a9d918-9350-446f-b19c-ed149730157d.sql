
-- Fix 1: Create employee_bonuses table
CREATE TABLE public.employee_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bonus_type TEXT NOT NULL DEFAULT 'performance',
  amount NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payout_date TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_employee_bonuses_employee_id ON public.employee_bonuses(employee_id);
CREATE INDEX idx_employee_bonuses_organization_id ON public.employee_bonuses(organization_id);
CREATE INDEX idx_employee_bonuses_status ON public.employee_bonuses(status);

-- Enable RLS
ALTER TABLE public.employee_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view bonuses in their org"
  ON public.employee_bonuses FOR SELECT
  USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert bonuses"
  ON public.employee_bonuses FOR INSERT
  WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update bonuses"
  ON public.employee_bonuses FOR UPDATE
  USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete bonuses"
  ON public.employee_bonuses FOR DELETE
  USING (public.is_same_org_admin(organization_id));

-- Timestamp trigger
CREATE TRIGGER update_employee_bonuses_updated_at
  BEFORE UPDATE ON public.employee_bonuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Fix 2: Auto-provision leave balances for new employees
CREATE OR REPLACE FUNCTION public.auto_provision_leave_balances()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  -- When a profile gets an organization_id, create leave balances for all active leave types
  IF NEW.organization_id IS NOT NULL AND (OLD IS NULL OR OLD.organization_id IS DISTINCT FROM NEW.organization_id) THEN
    INSERT INTO leave_balances (employee_id, leave_type_id, organization_id, total_days, used_days, pending_days, remaining_days, year)
    SELECT 
      NEW.id,
      lt.id,
      NEW.organization_id,
      lt.default_days,
      0,
      0,
      lt.default_days,
      EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
    FROM leave_types lt
    WHERE lt.organization_id = NEW.organization_id
      AND lt.is_active = true
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_provision_leave_balances
  AFTER INSERT OR UPDATE OF organization_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_provision_leave_balances();
