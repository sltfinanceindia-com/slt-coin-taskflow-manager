-- =====================================================
-- PHASE 1: CRITICAL DATA PERSISTENCE FIXES
-- Create onboarding_records table + job_applications table
-- =====================================================

-- 1. ONBOARDING RECORDS TABLE
CREATE TABLE public.onboarding_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  buddy_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ONBOARDING TASKS TABLE (for checklist items)
CREATE TABLE public.onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.onboarding_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  task_order INTEGER NOT NULL DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. JOB APPLICATIONS TABLE (replacing tasks workaround)
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
  candidate_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT,
  stage TEXT NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'technical', 'hr', 'offer', 'hired', 'rejected')),
  source TEXT DEFAULT 'direct',
  experience_years NUMERIC(4,1) DEFAULT 0,
  current_salary NUMERIC(12,2) DEFAULT 0,
  expected_salary NUMERIC(12,2) DEFAULT 0,
  resume_url TEXT,
  notes TEXT,
  interview_date TIMESTAMPTZ,
  rejection_reason TEXT,
  hired_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_records
CREATE POLICY "Users can view onboarding in their org"
  ON public.onboarding_records FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can insert onboarding records"
  ON public.onboarding_records FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can update onboarding records"
  ON public.onboarding_records FOR UPDATE
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can delete onboarding records"
  ON public.onboarding_records FOR DELETE
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for onboarding_tasks
CREATE POLICY "Users can view onboarding tasks in their org"
  ON public.onboarding_tasks FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can insert onboarding tasks"
  ON public.onboarding_tasks FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can update onboarding tasks"
  ON public.onboarding_tasks FOR UPDATE
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can delete onboarding tasks"
  ON public.onboarding_tasks FOR DELETE
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for job_applications
CREATE POLICY "Users can view applications in their org"
  ON public.job_applications FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can insert job applications"
  ON public.job_applications FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can update job applications"
  ON public.job_applications FOR UPDATE
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can delete job applications"
  ON public.job_applications FOR DELETE
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Indexes for performance
CREATE INDEX idx_onboarding_records_org ON public.onboarding_records(organization_id);
CREATE INDEX idx_onboarding_records_employee ON public.onboarding_records(employee_id);
CREATE INDEX idx_onboarding_records_status ON public.onboarding_records(status);
CREATE INDEX idx_onboarding_tasks_onboarding ON public.onboarding_tasks(onboarding_id);
CREATE INDEX idx_job_applications_org ON public.job_applications(organization_id);
CREATE INDEX idx_job_applications_stage ON public.job_applications(stage);
CREATE INDEX idx_job_applications_posting ON public.job_applications(job_posting_id);

-- Trigger for updated_at
CREATE TRIGGER update_onboarding_records_updated_at
  BEFORE UPDATE ON public.onboarding_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();