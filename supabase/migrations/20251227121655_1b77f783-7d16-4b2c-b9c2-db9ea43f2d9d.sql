-- Create timesheets table for weekly/monthly submission
CREATE TABLE IF NOT EXISTS public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours DECIMAL(10,2) DEFAULT 0,
  overtime_hours DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create timesheet entries for daily breakdown
CREATE TABLE IF NOT EXISTS public.timesheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timesheet_id UUID NOT NULL REFERENCES public.timesheets(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  regular_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  project_id UUID REFERENCES public.projects(id),
  task_id UUID REFERENCES public.tasks(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payroll_runs table for batch processing
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  run_name TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_employees INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payroll_items for individual employee payments
CREATE TABLE IF NOT EXISTS public.payroll_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  base_salary DECIMAL(15,2) DEFAULT 0,
  overtime_pay DECIMAL(15,2) DEFAULT 0,
  bonuses DECIMAL(15,2) DEFAULT 0,
  deductions DECIMAL(15,2) DEFAULT 0,
  loan_deductions DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  net_pay DECIMAL(15,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  payment_date DATE,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Gantt/task dependencies table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  predecessor_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  successor_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(predecessor_id, successor_id)
);

-- Enable RLS
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timesheets
CREATE POLICY "Users can view own timesheets" ON public.timesheets
  FOR SELECT USING (employee_id = public.get_my_profile_id() OR public.is_same_org_admin(organization_id));

CREATE POLICY "Users can create own timesheets" ON public.timesheets
  FOR INSERT WITH CHECK (employee_id = public.get_my_profile_id());

CREATE POLICY "Users can update own draft timesheets" ON public.timesheets
  FOR UPDATE USING (employee_id = public.get_my_profile_id() AND status = 'draft');

CREATE POLICY "Admins can update timesheets" ON public.timesheets
  FOR UPDATE USING (public.is_same_org_admin(organization_id));

-- RLS Policies for timesheet_entries
CREATE POLICY "Users can view own timesheet entries" ON public.timesheet_entries
  FOR SELECT USING (
    timesheet_id IN (SELECT id FROM public.timesheets WHERE employee_id = public.get_my_profile_id())
    OR public.is_same_org_admin(organization_id)
  );

CREATE POLICY "Users can manage own timesheet entries" ON public.timesheet_entries
  FOR ALL USING (
    timesheet_id IN (SELECT id FROM public.timesheets WHERE employee_id = public.get_my_profile_id() AND status = 'draft')
  );

-- RLS Policies for payroll_runs
CREATE POLICY "Admins can view payroll runs" ON public.payroll_runs
  FOR SELECT USING (public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can manage payroll runs" ON public.payroll_runs
  FOR ALL USING (public.is_same_org_admin(organization_id));

-- RLS Policies for payroll_items
CREATE POLICY "Users can view own payroll items" ON public.payroll_items
  FOR SELECT USING (employee_id = public.get_my_profile_id() OR public.is_same_org_admin(organization_id));

CREATE POLICY "Admins can manage payroll items" ON public.payroll_items
  FOR ALL USING (public.is_same_org_admin(organization_id));

-- RLS Policies for task_dependencies
CREATE POLICY "Org users can view task dependencies" ON public.task_dependencies
  FOR SELECT USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can manage task dependencies" ON public.task_dependencies
  FOR ALL USING (public.is_same_org_admin(organization_id));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON public.timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON public.timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_timesheet ON public.timesheet_entries(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON public.payroll_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON public.payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON public.payroll_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_predecessor ON public.task_dependencies(predecessor_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_successor ON public.task_dependencies(successor_id);