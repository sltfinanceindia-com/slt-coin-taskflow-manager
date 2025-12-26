-- Create holidays table for organization-wide holiday management
CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  holiday_date DATE NOT NULL,
  holiday_type TEXT DEFAULT 'public' CHECK (holiday_type IN ('public', 'optional', 'restricted', 'regional')),
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, holiday_date, name)
);

-- Create loan_requests table for employee advances
CREATE TABLE IF NOT EXISTS public.loan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  loan_type TEXT DEFAULT 'salary_advance' CHECK (loan_type IN ('salary_advance', 'personal_loan', 'emergency_loan', 'education_loan')),
  amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  tenure_months INTEGER DEFAULT 1,
  emi_amount DECIMAL(12,2),
  total_paid DECIMAL(12,2) DEFAULT 0,
  remaining_balance DECIMAL(12,2),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'cancelled')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  next_emi_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  budget_amount DECIMAL(12,2) DEFAULT 0,
  budget_period TEXT DEFAULT 'monthly' CHECK (budget_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  is_active BOOLEAN DEFAULT true,
  parent_category_id UUID REFERENCES public.expense_categories(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Create loan_repayments table for tracking EMIs
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loan_requests(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  principal_amount DECIMAL(12,2),
  interest_amount DECIMAL(12,2),
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'salary_deduction',
  reference_number TEXT,
  payroll_record_id UUID REFERENCES public.payroll_records(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create employee_self_service_settings for portal configuration
CREATE TABLE IF NOT EXISTS public.employee_portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  allow_payslip_download BOOLEAN DEFAULT true,
  allow_leave_requests BOOLEAN DEFAULT true,
  allow_attendance_view BOOLEAN DEFAULT true,
  allow_profile_update BOOLEAN DEFAULT true,
  allow_document_upload BOOLEAN DEFAULT true,
  show_coin_balance BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  show_leaderboard BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_portal_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for holidays
CREATE POLICY "Users can view holidays in their organization" ON public.holidays
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage holidays" ON public.holidays
  FOR ALL USING (
    organization_id = public.get_user_organization_id() 
    AND public.is_any_admin(auth.uid())
  );

-- RLS Policies for loan_requests
CREATE POLICY "Employees can view their own loan requests" ON public.loan_requests
  FOR SELECT USING (
    employee_id = public.get_user_profile_id() 
    OR (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()))
  );

CREATE POLICY "Employees can create their own loan requests" ON public.loan_requests
  FOR INSERT WITH CHECK (
    employee_id = public.get_user_profile_id() 
    AND organization_id = public.get_user_organization_id()
  );

CREATE POLICY "Admins can update loan requests" ON public.loan_requests
  FOR UPDATE USING (
    organization_id = public.get_user_organization_id() 
    AND public.is_any_admin(auth.uid())
  );

-- RLS Policies for expense_categories
CREATE POLICY "Users can view expense categories in their org" ON public.expense_categories
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage expense categories" ON public.expense_categories
  FOR ALL USING (
    organization_id = public.get_user_organization_id() 
    AND public.is_any_admin(auth.uid())
  );

-- RLS Policies for loan_repayments
CREATE POLICY "Users can view their loan repayments" ON public.loan_repayments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.loan_requests lr 
      WHERE lr.id = loan_id 
      AND (lr.employee_id = public.get_user_profile_id() OR public.is_any_admin(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage loan repayments" ON public.loan_repayments
  FOR ALL USING (
    organization_id = public.get_user_organization_id() 
    AND public.is_any_admin(auth.uid())
  );

-- RLS Policies for employee_portal_settings
CREATE POLICY "Users can view their org portal settings" ON public.employee_portal_settings
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage portal settings" ON public.employee_portal_settings
  FOR ALL USING (
    organization_id = public.get_user_organization_id() 
    AND public.is_any_admin(auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_holidays_org_date ON public.holidays(organization_id, holiday_date);
CREATE INDEX IF NOT EXISTS idx_loan_requests_employee ON public.loan_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_expense_categories_org ON public.expense_categories(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan ON public.loan_repayments(loan_id, payment_date);