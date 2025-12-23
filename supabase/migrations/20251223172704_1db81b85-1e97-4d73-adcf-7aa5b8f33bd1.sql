-- PHASE 1: Comprehensive Enterprise Upgrade Migration
-- This migration adds: project_owner_id to tasks, payroll, expenses, documents, assets, custom reports

-- ==========================================
-- PART 1: Add project_owner_id to tasks
-- ==========================================
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS project_owner_id uuid REFERENCES public.profiles(id);

-- Create index for project owner queries
CREATE INDEX IF NOT EXISTS idx_tasks_project_owner ON public.tasks(project_owner_id);

-- ==========================================
-- PART 2: Payroll Management Tables
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  employee_id uuid NOT NULL REFERENCES public.profiles(id),
  pay_period_start date NOT NULL,
  pay_period_end date NOT NULL,
  basic_salary numeric(12,2) NOT NULL DEFAULT 0,
  allowances jsonb DEFAULT '{}',
  deductions jsonb DEFAULT '{}',
  bonus numeric(12,2) DEFAULT 0,
  overtime_hours numeric(6,2) DEFAULT 0,
  overtime_rate numeric(8,2) DEFAULT 0,
  gross_salary numeric(12,2) GENERATED ALWAYS AS (basic_salary + bonus + (overtime_hours * overtime_rate)) STORED,
  tax_deduction numeric(12,2) DEFAULT 0,
  pf_deduction numeric(12,2) DEFAULT 0,
  other_deductions numeric(12,2) DEFAULT 0,
  net_salary numeric(12,2),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
  payment_date timestamp with time zone,
  payment_method text DEFAULT 'bank_transfer',
  transaction_reference text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payroll"
ON public.payroll_records FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id())
WITH CHECK (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

CREATE POLICY "Employees can view own payroll"
ON public.payroll_records FOR SELECT
USING (employee_id = get_my_profile_id());

-- ==========================================
-- PART 3: Expense Claims Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.expense_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  employee_id uuid NOT NULL REFERENCES public.profiles(id),
  claim_number text UNIQUE,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('travel', 'meals', 'accommodation', 'supplies', 'equipment', 'software', 'training', 'other')),
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'INR',
  expense_date date NOT NULL,
  receipt_urls text[],
  status text DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'paid', 'cancelled')),
  submitted_at timestamp with time zone,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamp with time zone,
  review_notes text,
  payment_date timestamp with time zone,
  payment_reference text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.expense_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own expenses"
ON public.expense_claims FOR ALL
USING (employee_id = get_my_profile_id())
WITH CHECK (employee_id = get_my_profile_id());

CREATE POLICY "Admins can manage all expenses"
ON public.expense_claims FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id())
WITH CHECK (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- Generate claim numbers automatically
CREATE OR REPLACE FUNCTION generate_expense_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.claim_number := 'EXP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_expense_claim_number ON public.expense_claims;
CREATE TRIGGER set_expense_claim_number
  BEFORE INSERT ON public.expense_claims
  FOR EACH ROW
  WHEN (NEW.claim_number IS NULL)
  EXECUTE FUNCTION generate_expense_claim_number();

-- ==========================================
-- PART 4: Employee Documents Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  employee_id uuid NOT NULL REFERENCES public.profiles(id),
  document_type text NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'passport', 'driving_license', 'voter_id', 'resume', 'offer_letter', 'contract', 'certificate', 'other')),
  document_name text NOT NULL,
  document_number text,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  expiry_date date,
  is_verified boolean DEFAULT false,
  verified_by uuid REFERENCES public.profiles(id),
  verified_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own documents"
ON public.employee_documents FOR ALL
USING (employee_id = get_my_profile_id())
WITH CHECK (employee_id = get_my_profile_id());

CREATE POLICY "Admins can manage all documents"
ON public.employee_documents FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id())
WITH CHECK (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- ==========================================
-- PART 5: Asset Management Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.asset_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  asset_tag text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('laptop', 'desktop', 'mobile', 'tablet', 'monitor', 'keyboard', 'mouse', 'headset', 'id_card', 'access_key', 'vehicle', 'other')),
  asset_name text NOT NULL,
  brand text,
  model text,
  serial_number text,
  purchase_date date,
  purchase_value numeric(12,2),
  current_value numeric(12,2),
  assigned_to uuid REFERENCES public.profiles(id),
  assigned_by uuid REFERENCES public.profiles(id),
  assigned_date timestamp with time zone,
  return_date timestamp with time zone,
  status text DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'under_repair', 'retired', 'lost')),
  condition text DEFAULT 'good' CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assigned assets"
ON public.asset_assignments FOR SELECT
USING (assigned_to = get_my_profile_id() OR is_any_admin(auth.uid()));

CREATE POLICY "Admins can manage assets"
ON public.asset_assignments FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id())
WITH CHECK (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- ==========================================
-- PART 6: Exit/Resignation Management
-- ==========================================
CREATE TABLE IF NOT EXISTS public.exit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  employee_id uuid NOT NULL REFERENCES public.profiles(id),
  resignation_date date NOT NULL,
  last_working_date date NOT NULL,
  notice_period_days integer DEFAULT 30,
  reason text NOT NULL,
  detailed_reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'withdrawn')),
  hr_notes text,
  clearance_checklist jsonb DEFAULT '{}',
  fnf_amount numeric(12,2),
  fnf_status text DEFAULT 'pending' CHECK (fnf_status IN ('pending', 'calculated', 'approved', 'paid')),
  exit_interview_date timestamp with time zone,
  exit_interview_notes text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.exit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own exit requests"
ON public.exit_requests FOR ALL
USING (employee_id = get_my_profile_id())
WITH CHECK (employee_id = get_my_profile_id());

CREATE POLICY "Admins can manage all exit requests"
ON public.exit_requests FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id())
WITH CHECK (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- ==========================================
-- PART 7: Custom Reports Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.custom_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  report_type text NOT NULL CHECK (report_type IN ('tasks', 'attendance', 'payroll', 'expenses', 'performance', 'custom')),
  query_config jsonb NOT NULL DEFAULT '{}',
  columns jsonb NOT NULL DEFAULT '[]',
  filters jsonb DEFAULT '[]',
  grouping jsonb DEFAULT '[]',
  sorting jsonb DEFAULT '[]',
  chart_config jsonb,
  is_scheduled boolean DEFAULT false,
  schedule_cron text,
  recipients text[],
  last_run_at timestamp with time zone,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public reports or own"
ON public.custom_reports FOR SELECT
USING (
  (is_public = true AND organization_id = get_my_org_id()) 
  OR created_by = get_my_profile_id()
  OR is_any_admin(auth.uid())
);

CREATE POLICY "Users can manage own reports"
ON public.custom_reports FOR ALL
USING (created_by = get_my_profile_id() OR is_any_admin(auth.uid()))
WITH CHECK (organization_id = get_my_org_id());

-- ==========================================
-- PART 8: Salary Templates Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.salary_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  basic_salary numeric(12,2) NOT NULL,
  allowances jsonb DEFAULT '{}',
  deductions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.salary_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage salary templates"
ON public.salary_templates FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id())
WITH CHECK (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

CREATE POLICY "Users can view salary templates"
ON public.salary_templates FOR SELECT
USING (organization_id = get_my_org_id());

-- ==========================================
-- PART 9: Create indexes for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON public.payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON public.payroll_records(pay_period_start, pay_period_end);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON public.payroll_records(payment_status);
CREATE INDEX IF NOT EXISTS idx_expense_employee ON public.expense_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_status ON public.expense_claims(status);
CREATE INDEX IF NOT EXISTS idx_documents_employee ON public.employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_assets_assigned ON public.asset_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_exit_employee ON public.exit_requests(employee_id);