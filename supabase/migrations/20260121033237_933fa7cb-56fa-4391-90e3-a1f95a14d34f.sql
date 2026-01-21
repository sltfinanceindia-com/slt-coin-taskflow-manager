-- =====================================================
-- PHASE 1: HR CORE TABLES
-- =====================================================

-- Employee Benefits Table
CREATE TABLE IF NOT EXISTS public.employee_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('health', 'life', 'dental', 'vision', 'retirement', 'wellness', 'other')),
  provider TEXT,
  coverage_amount NUMERIC DEFAULT 0,
  premium NUMERIC DEFAULT 0,
  employer_contribution NUMERIC DEFAULT 0,
  employee_contribution NUMERIC DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  dependents_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grievances Table
CREATE TABLE IF NOT EXISTS public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'resolved', 'closed', 'escalated')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_anonymous BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_date TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Employee Contracts Table
CREATE TABLE IF NOT EXISTS public.employee_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('permanent', 'temporary', 'contract', 'intern', 'consultant')),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'signed', 'active', 'expired', 'terminated')),
  document_url TEXT,
  terms TEXT,
  salary NUMERIC,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Probations Table
CREATE TABLE IF NOT EXISTS public.probations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'extended', 'confirmed', 'terminated')),
  performance_score NUMERIC DEFAULT 0,
  manager_id UUID REFERENCES public.profiles(id),
  feedback TEXT,
  extension_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Confirmations Table
CREATE TABLE IF NOT EXISTS public.confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  probation_id UUID REFERENCES public.probations(id) ON DELETE SET NULL,
  confirmation_date DATE,
  letter_status TEXT DEFAULT 'pending' CHECK (letter_status IN ('pending', 'generated', 'sent', 'acknowledged')),
  salary_revision BOOLEAN DEFAULT false,
  previous_salary NUMERIC,
  revised_salary NUMERIC,
  letter_url TEXT,
  generated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disciplinary Actions Table
CREATE TABLE IF NOT EXISTS public.disciplinary_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('verbal_warning', 'written_warning', 'suspension', 'pip', 'termination')),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'appealed', 'expired')),
  issued_by UUID REFERENCES public.profiles(id),
  issued_date DATE NOT NULL,
  expiry_date DATE,
  witnesses TEXT[],
  documents TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Background Verifications Table
CREATE TABLE IF NOT EXISTS public.background_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'education', 'employment', 'criminal', 'reference', 'address')),
  vendor TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'verified', 'failed', 'inconclusive')),
  progress INTEGER DEFAULT 0,
  initiated_on DATE,
  completed_on DATE,
  findings TEXT,
  initiated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Handbook Policies Table
CREATE TABLE IF NOT EXISTS public.handbook_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  effective_date DATE,
  acknowledgment_required BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Policy Acknowledgments Table
CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.handbook_policies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(policy_id, employee_id)
);

-- =====================================================
-- PHASE 2: FINANCE TABLES
-- =====================================================

-- Budget Allocations Table
CREATE TABLE IF NOT EXISTS public.budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  fiscal_year TEXT NOT NULL,
  allocated_amount NUMERIC DEFAULT 0,
  spent_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'over_budget', 'under_utilized')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cost Centers Table
CREATE TABLE IF NOT EXISTS public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  budget NUMERIC DEFAULT 0,
  actual_spend NUMERIC DEFAULT 0,
  headcount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'frozen')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Salary Revisions Table
CREATE TABLE IF NOT EXISTS public.salary_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  previous_salary NUMERIC NOT NULL,
  new_salary NUMERIC NOT NULL,
  effective_date DATE NOT NULL,
  revision_type TEXT CHECK (revision_type IN ('annual', 'promotion', 'special', 'market_adjustment', 'performance')),
  approved_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PHASE 3: HR EXTENDED TABLES
-- =====================================================

-- Job Postings Table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT,
  type TEXT DEFAULT 'full_time' CHECK (type IN ('full_time', 'part_time', 'contract', 'intern')),
  experience TEXT,
  description TEXT,
  requirements TEXT,
  salary_range_min NUMERIC,
  salary_range_max NUMERIC,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'on_hold', 'closed')),
  applications_count INTEGER DEFAULT 0,
  hiring_manager_id UUID REFERENCES public.profiles(id),
  posted_on DATE,
  closes_on DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interviews Table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  position TEXT NOT NULL,
  round TEXT NOT NULL,
  interviewer_ids UUID[],
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  mode TEXT DEFAULT 'video' CHECK (mode IN ('video', 'in_person', 'phone')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  position TEXT NOT NULL,
  department TEXT,
  salary_offered NUMERIC NOT NULL,
  joining_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'negotiating', 'withdrawn')),
  offer_letter_url TEXT,
  expires_at DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Succession Plans Table
CREATE TABLE IF NOT EXISTS public.succession_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  current_holder_id UUID REFERENCES public.profiles(id),
  department TEXT,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Succession Candidates Table
CREATE TABLE IF NOT EXISTS public.succession_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  succession_plan_id UUID REFERENCES public.succession_plans(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  readiness TEXT DEFAULT 'ready_2yr' CHECK (readiness IN ('ready_now', 'ready_1yr', 'ready_2yr')),
  readiness_score INTEGER DEFAULT 0,
  development_areas TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Career Paths Table
CREATE TABLE IF NOT EXISTS public.career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  track_name TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Career Path Levels Table
CREATE TABLE IF NOT EXISTS public.career_path_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  career_path_id UUID REFERENCES public.career_paths(id) ON DELETE CASCADE,
  level_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  experience_min INTEGER,
  experience_max INTEGER,
  salary_min NUMERIC,
  salary_max NUMERIC,
  skills TEXT[],
  responsibilities TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Salary Benchmarks Table
CREATE TABLE IF NOT EXISTS public.salary_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  industry TEXT NOT NULL,
  region TEXT NOT NULL,
  internal_avg NUMERIC,
  market_25 NUMERIC,
  market_50 NUMERIC,
  market_75 NUMERIC,
  status TEXT CHECK (status IN ('above', 'at', 'below')),
  last_updated DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- F&F Settlements Table
CREATE TABLE IF NOT EXISTS public.fnf_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_working_day DATE NOT NULL,
  notice_period_days INTEGER DEFAULT 0,
  notice_served_days INTEGER DEFAULT 0,
  basic_salary NUMERIC DEFAULT 0,
  leave_encashment NUMERIC DEFAULT 0,
  gratuity NUMERIC DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  other_earnings NUMERIC DEFAULT 0,
  notice_recovery NUMERIC DEFAULT 0,
  loan_recovery NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  net_payable NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'disputed')),
  clearance_hr BOOLEAN DEFAULT false,
  clearance_it BOOLEAN DEFAULT false,
  clearance_finance BOOLEAN DEFAULT false,
  clearance_admin BOOLEAN DEFAULT false,
  clearance_manager BOOLEAN DEFAULT false,
  processed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gratuity Records Table
CREATE TABLE IF NOT EXISTS public.gratuity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joining_date DATE NOT NULL,
  years_of_service NUMERIC DEFAULT 0,
  last_drawn_basic NUMERIC DEFAULT 0,
  gratuity_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'not_eligible' CHECK (status IN ('not_eligible', 'eligible', 'nearing_eligibility', 'paid')),
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.probations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handbook_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_path_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fnf_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratuity_records ENABLE ROW LEVEL SECURITY;

-- Employee Benefits Policies
CREATE POLICY "Users can view own org benefits" ON public.employee_benefits
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org benefits" ON public.employee_benefits
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Grievances Policies
CREATE POLICY "Users can view own org grievances" ON public.grievances
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org grievances" ON public.grievances
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Employee Contracts Policies
CREATE POLICY "Users can view own org contracts" ON public.employee_contracts
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org contracts" ON public.employee_contracts
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Probations Policies
CREATE POLICY "Users can view own org probations" ON public.probations
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org probations" ON public.probations
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Confirmations Policies
CREATE POLICY "Users can view own org confirmations" ON public.confirmations
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org confirmations" ON public.confirmations
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Disciplinary Actions Policies
CREATE POLICY "Users can view own org disciplinary actions" ON public.disciplinary_actions
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org disciplinary actions" ON public.disciplinary_actions
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Background Verifications Policies
CREATE POLICY "Users can view own org verifications" ON public.background_verifications
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org verifications" ON public.background_verifications
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Handbook Policies Policies
CREATE POLICY "Users can view own org policies" ON public.handbook_policies
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org policies" ON public.handbook_policies
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Policy Acknowledgments Policies
CREATE POLICY "Users can view own org acknowledgments" ON public.policy_acknowledgments
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org acknowledgments" ON public.policy_acknowledgments
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Budget Allocations Policies
CREATE POLICY "Users can view own org budgets" ON public.budget_allocations
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org budgets" ON public.budget_allocations
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Cost Centers Policies
CREATE POLICY "Users can view own org cost centers" ON public.cost_centers
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org cost centers" ON public.cost_centers
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Salary Revisions Policies
CREATE POLICY "Users can view own org salary revisions" ON public.salary_revisions
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org salary revisions" ON public.salary_revisions
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Job Postings Policies
CREATE POLICY "Users can view own org job postings" ON public.job_postings
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org job postings" ON public.job_postings
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Interviews Policies
CREATE POLICY "Users can view own org interviews" ON public.interviews
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org interviews" ON public.interviews
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Offers Policies
CREATE POLICY "Users can view own org offers" ON public.offers
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org offers" ON public.offers
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Succession Plans Policies
CREATE POLICY "Users can view own org succession plans" ON public.succession_plans
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org succession plans" ON public.succession_plans
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Succession Candidates Policies
CREATE POLICY "Users can view own org succession candidates" ON public.succession_candidates
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org succession candidates" ON public.succession_candidates
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Career Paths Policies
CREATE POLICY "Users can view own org career paths" ON public.career_paths
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org career paths" ON public.career_paths
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Career Path Levels Policies
CREATE POLICY "Users can view own org career path levels" ON public.career_path_levels
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org career path levels" ON public.career_path_levels
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Salary Benchmarks Policies
CREATE POLICY "Users can view own org benchmarks" ON public.salary_benchmarks
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org benchmarks" ON public.salary_benchmarks
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- F&F Settlements Policies
CREATE POLICY "Users can view own org fnf settlements" ON public.fnf_settlements
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org fnf settlements" ON public.fnf_settlements
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Gratuity Records Policies
CREATE POLICY "Users can view own org gratuity records" ON public.gratuity_records
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage own org gratuity records" ON public.gratuity_records
  FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_employee_benefits_org ON public.employee_benefits(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_employee ON public.employee_benefits(employee_id);
CREATE INDEX IF NOT EXISTS idx_grievances_org ON public.grievances(organization_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
CREATE INDEX IF NOT EXISTS idx_employee_contracts_org ON public.employee_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_probations_org ON public.probations(organization_id);
CREATE INDEX IF NOT EXISTS idx_probations_status ON public.probations(status);
CREATE INDEX IF NOT EXISTS idx_disciplinary_actions_org ON public.disciplinary_actions(organization_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_org ON public.budget_allocations(organization_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_org ON public.cost_centers(organization_id);
CREATE INDEX IF NOT EXISTS idx_salary_revisions_org ON public.salary_revisions(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_org ON public.job_postings(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_interviews_org ON public.interviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_offers_org ON public.offers(organization_id);
CREATE INDEX IF NOT EXISTS idx_succession_plans_org ON public.succession_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_org ON public.career_paths(organization_id);
CREATE INDEX IF NOT EXISTS idx_fnf_settlements_org ON public.fnf_settlements(organization_id);
CREATE INDEX IF NOT EXISTS idx_gratuity_records_org ON public.gratuity_records(organization_id);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers to all tables with updated_at
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'employee_benefits', 'grievances', 'employee_contracts', 'probations', 
    'confirmations', 'disciplinary_actions', 'background_verifications',
    'handbook_policies', 'budget_allocations', 'cost_centers', 'salary_revisions',
    'job_postings', 'interviews', 'offers', 'succession_plans', 'career_paths',
    'salary_benchmarks', 'fnf_settlements', 'gratuity_records'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%s;
      CREATE TRIGGER update_%s_updated_at
        BEFORE UPDATE ON public.%s
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;