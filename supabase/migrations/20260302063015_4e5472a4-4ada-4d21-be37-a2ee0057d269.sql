
-- =============================================
-- 1. SHIFTS TABLE
-- =============================================
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  is_night_shift BOOLEAN DEFAULT false,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shifts in their org" ON public.shifts
  FOR SELECT USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert shifts" ON public.shifts
  FOR INSERT WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update shifts" ON public.shifts
  FOR UPDATE USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete shifts" ON public.shifts
  FOR DELETE USING (public.is_same_org_admin(organization_id));

CREATE INDEX idx_shifts_org ON public.shifts(organization_id);

-- =============================================
-- 2. SHIFT_ASSIGNMENTS TABLE
-- =============================================
CREATE TABLE public.shift_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assignment_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  assigned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shift assignments in their org" ON public.shift_assignments
  FOR SELECT USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert shift assignments" ON public.shift_assignments
  FOR INSERT WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update shift assignments" ON public.shift_assignments
  FOR UPDATE USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete shift assignments" ON public.shift_assignments
  FOR DELETE USING (public.is_same_org_admin(organization_id));

CREATE INDEX idx_shift_assignments_org ON public.shift_assignments(organization_id);
CREATE INDEX idx_shift_assignments_employee ON public.shift_assignments(employee_id);
CREATE INDEX idx_shift_assignments_date ON public.shift_assignments(assignment_date);

-- =============================================
-- 3. TAX_DECLARATIONS TABLE
-- =============================================
CREATE TABLE public.tax_declarations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  fiscal_year TEXT NOT NULL,
  regime TEXT DEFAULT 'new',
  section TEXT NOT NULL,
  declaration_type TEXT NOT NULL,
  declared_amount NUMERIC(12,2) DEFAULT 0,
  approved_amount NUMERIC(12,2) DEFAULT 0,
  proof_submitted BOOLEAN DEFAULT false,
  proof_url TEXT,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tax_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax declarations" ON public.tax_declarations
  FOR SELECT USING (
    employee_id = public.get_my_profile_id() OR public.is_same_org_admin(organization_id)
  );

CREATE POLICY "Users can insert own tax declarations" ON public.tax_declarations
  FOR INSERT WITH CHECK (
    employee_id = public.get_my_profile_id() AND public.is_same_org_user(organization_id)
  );

CREATE POLICY "Users can update own pending declarations" ON public.tax_declarations
  FOR UPDATE USING (
    (employee_id = public.get_my_profile_id() AND status = 'pending') OR public.is_same_org_admin(organization_id)
  );

CREATE POLICY "Admins can delete tax declarations" ON public.tax_declarations
  FOR DELETE USING (public.is_same_org_admin(organization_id));

CREATE INDEX idx_tax_declarations_org ON public.tax_declarations(organization_id);
CREATE INDEX idx_tax_declarations_employee ON public.tax_declarations(employee_id);

-- =============================================
-- 4. TRAINING_PROGRAMS TABLE
-- =============================================
CREATE TABLE public.training_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  trainer TEXT,
  trainer_id UUID REFERENCES public.profiles(id),
  start_date DATE,
  end_date DATE,
  duration_hours NUMERIC(6,2),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  meeting_url TEXT,
  status TEXT DEFAULT 'planned',
  materials_url TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  department TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view training in their org" ON public.training_programs
  FOR SELECT USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert training" ON public.training_programs
  FOR INSERT WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update training" ON public.training_programs
  FOR UPDATE USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete training" ON public.training_programs
  FOR DELETE USING (public.is_same_org_admin(organization_id));

CREATE INDEX idx_training_programs_org ON public.training_programs(organization_id);

-- =============================================
-- 5. WORK_CALENDARS TABLE
-- =============================================
CREATE TABLE public.work_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  work_start_time TIME DEFAULT '09:00',
  work_end_time TIME DEFAULT '18:00',
  holidays JSONB DEFAULT '[]',
  special_working_days JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.work_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view work calendars in their org" ON public.work_calendars
  FOR SELECT USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert work calendars" ON public.work_calendars
  FOR INSERT WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update work calendars" ON public.work_calendars
  FOR UPDATE USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete work calendars" ON public.work_calendars
  FOR DELETE USING (public.is_same_org_admin(organization_id));

CREATE INDEX idx_work_calendars_org ON public.work_calendars(organization_id);

-- =============================================
-- 6. BENCHMARKING_DATA TABLE
-- =============================================
CREATE TABLE public.benchmarking_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_category TEXT DEFAULT 'general',
  internal_value NUMERIC(12,2),
  industry_average NUMERIC(12,2),
  top_quartile NUMERIC(12,2),
  bottom_quartile NUMERIC(12,2),
  unit TEXT DEFAULT 'percentage',
  period TEXT,
  source TEXT,
  notes TEXT,
  department TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.benchmarking_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view benchmarking in their org" ON public.benchmarking_data
  FOR SELECT USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert benchmarking" ON public.benchmarking_data
  FOR INSERT WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update benchmarking" ON public.benchmarking_data
  FOR UPDATE USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete benchmarking" ON public.benchmarking_data
  FOR DELETE USING (public.is_same_org_admin(organization_id));

CREATE INDEX idx_benchmarking_data_org ON public.benchmarking_data(organization_id);

-- =============================================
-- 7. AUDIT_PACKS TABLE
-- =============================================
CREATE TABLE public.audit_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audit_type TEXT DEFAULT 'internal',
  scope TEXT,
  auditor TEXT,
  auditor_id UUID REFERENCES public.profiles(id),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planned',
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  risk_rating TEXT DEFAULT 'low',
  department TEXT,
  attachments JSONB DEFAULT '[]',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit packs in their org" ON public.audit_packs
  FOR SELECT USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert audit packs" ON public.audit_packs
  FOR INSERT WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update audit packs" ON public.audit_packs
  FOR UPDATE USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete audit packs" ON public.audit_packs
  FOR DELETE USING (public.is_same_org_admin(organization_id));

CREATE INDEX idx_audit_packs_org ON public.audit_packs(organization_id);

-- =============================================
-- 8. PROJECT_SCORING TABLE
-- =============================================
CREATE TABLE public.project_scoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  criteria_name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  weight NUMERIC(5,2) DEFAULT 1.0,
  score NUMERIC(5,2) DEFAULT 0,
  max_score NUMERIC(5,2) DEFAULT 10,
  notes TEXT,
  scored_by UUID REFERENCES public.profiles(id),
  scored_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_scoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project scoring in their org" ON public.project_scoring
  FOR SELECT USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can insert project scoring" ON public.project_scoring
  FOR INSERT WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can update project scoring" ON public.project_scoring
  FOR UPDATE USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can delete project scoring" ON public.project_scoring
  FOR DELETE USING (public.is_same_org_admin(organization_id));

CREATE INDEX idx_project_scoring_org ON public.project_scoring(organization_id);
CREATE INDEX idx_project_scoring_project ON public.project_scoring(project_id);
