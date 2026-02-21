
-- Fix 1: Leave-to-Attendance Sync Trigger
-- Auto-marks attendance records as 'on_leave' when a leave request is approved
CREATE OR REPLACE FUNCTION public.auto_mark_attendance_on_leave_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  leave_date DATE;
BEGIN
  -- Only fire when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Insert attendance records for each day of the leave
    FOR leave_date IN
      SELECT generate_series(NEW.start_date::date, NEW.end_date::date, '1 day')::date
    LOOP
      -- Skip weekends (Saturday=6, Sunday=0)
      IF EXTRACT(DOW FROM leave_date) NOT IN (0, 6) THEN
        INSERT INTO attendance_records (
          employee_id,
          organization_id,
          attendance_date,
          status,
          notes
        ) VALUES (
          NEW.employee_id,
          NEW.organization_id,
          leave_date,
          'on_leave',
          'Auto-marked: Leave approved'
        )
        ON CONFLICT (employee_id, attendance_date) 
        DO UPDATE SET status = 'on_leave', notes = 'Auto-marked: Leave approved';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on leave_requests
DROP TRIGGER IF EXISTS trigger_mark_attendance_on_leave ON leave_requests;
CREATE TRIGGER trigger_mark_attendance_on_leave
  AFTER UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_attendance_on_leave_approval();

-- Fix 4: Create salary_structures table for Payroll-Salary integration
CREATE TABLE IF NOT EXISTS public.salary_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  hra NUMERIC DEFAULT 0,
  da NUMERIC DEFAULT 0,
  special_allowance NUMERIC DEFAULT 0,
  medical_allowance NUMERIC DEFAULT 0,
  transport_allowance NUMERIC DEFAULT 0,
  pf_contribution NUMERIC DEFAULT 0,
  esi_contribution NUMERIC DEFAULT 0,
  professional_tax NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  gross_salary NUMERIC GENERATED ALWAYS AS (
    basic_salary + COALESCE(hra, 0) + COALESCE(da, 0) + COALESCE(special_allowance, 0) + 
    COALESCE(medical_allowance, 0) + COALESCE(transport_allowance, 0)
  ) STORED,
  total_deductions NUMERIC GENERATED ALWAYS AS (
    COALESCE(pf_contribution, 0) + COALESCE(esi_contribution, 0) + 
    COALESCE(professional_tax, 0) + COALESCE(other_deductions, 0)
  ) STORED,
  net_salary NUMERIC GENERATED ALWAYS AS (
    basic_salary + COALESCE(hra, 0) + COALESCE(da, 0) + COALESCE(special_allowance, 0) + 
    COALESCE(medical_allowance, 0) + COALESCE(transport_allowance, 0) -
    COALESCE(pf_contribution, 0) - COALESCE(esi_contribution, 0) - 
    COALESCE(professional_tax, 0) - COALESCE(other_deductions, 0)
  ) STORED,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for salary_structures
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage salary structures"
ON public.salary_structures FOR ALL
USING (is_same_org_admin(organization_id));

CREATE POLICY "Employees can view own salary structure"
ON public.salary_structures FOR SELECT
USING (employee_id = get_my_profile_id() AND is_same_org_user(organization_id));

-- Index
CREATE INDEX idx_salary_structures_employee ON salary_structures(employee_id);
CREATE INDEX idx_salary_structures_org ON salary_structures(organization_id);

-- Also check attendance_records has unique constraint for ON CONFLICT to work
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'attendance_records_employee_date_unique'
  ) THEN
    ALTER TABLE attendance_records 
    ADD CONSTRAINT attendance_records_employee_date_unique 
    UNIQUE (employee_id, attendance_date);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
