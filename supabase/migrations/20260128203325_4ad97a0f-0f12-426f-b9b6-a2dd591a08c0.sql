-- =============================================
-- WORK MANAGEMENT TABLES - Only Missing Tables
-- =============================================

-- 1. DECISIONS TABLE
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  context TEXT,
  alternatives TEXT[],
  rationale TEXT,
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'implemented', 'rejected')),
  decision_maker_id UUID REFERENCES public.profiles(id),
  stakeholders TEXT[],
  decision_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view decisions in their organization" ON public.decisions
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create decisions in their organization" ON public.decisions
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update decisions in their organization" ON public.decisions
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete decisions in their organization" ON public.decisions
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE INDEX idx_decisions_org ON public.decisions(organization_id);
CREATE INDEX idx_decisions_status ON public.decisions(status);

-- 2. LESSONS LEARNED TABLE
CREATE TABLE public.lessons_learned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  project_name TEXT,
  category TEXT,
  what_went_well TEXT[],
  what_went_wrong TEXT[],
  recommendations TEXT[],
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lessons_learned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lessons in their organization" ON public.lessons_learned
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create lessons in their organization" ON public.lessons_learned
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update lessons in their organization" ON public.lessons_learned
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete lessons in their organization" ON public.lessons_learned
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE INDEX idx_lessons_org ON public.lessons_learned(organization_id);

-- 3. RECURRING TASKS TABLE
CREATE TABLE public.recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly')),
  assigned_to UUID REFERENCES public.profiles(id),
  next_occurrence DATE,
  last_created DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recurring tasks in their organization" ON public.recurring_tasks
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create recurring tasks in their organization" ON public.recurring_tasks
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update recurring tasks in their organization" ON public.recurring_tasks
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete recurring tasks in their organization" ON public.recurring_tasks
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE INDEX idx_recurring_tasks_org ON public.recurring_tasks(organization_id);
CREATE INDEX idx_recurring_tasks_active ON public.recurring_tasks(is_active);

-- 4. SHIFT SWAPS TABLE
CREATE TABLE public.shift_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id),
  target_id UUID NOT NULL REFERENCES public.profiles(id),
  original_shift TEXT NOT NULL,
  requested_shift TEXT NOT NULL,
  swap_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shift_swaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shift swaps in their organization" ON public.shift_swaps
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create shift swaps in their organization" ON public.shift_swaps
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update shift swaps in their organization" ON public.shift_swaps
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete shift swaps in their organization" ON public.shift_swaps
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE INDEX idx_shift_swaps_org ON public.shift_swaps(organization_id);
CREATE INDEX idx_shift_swaps_status ON public.shift_swaps(status);

-- 5. ON-CALL SCHEDULES TABLE
CREATE TABLE public.on_call_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rotation_type TEXT CHECK (rotation_type IN ('daily', 'weekly', 'bi-weekly', 'monthly')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.on_call_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view on-call schedules in their organization" ON public.on_call_schedules
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create on-call schedules in their organization" ON public.on_call_schedules
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update on-call schedules in their organization" ON public.on_call_schedules
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete on-call schedules in their organization" ON public.on_call_schedules
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE INDEX idx_on_call_org ON public.on_call_schedules(organization_id);
CREATE INDEX idx_on_call_dates ON public.on_call_schedules(start_date, end_date);

-- 6. REMOTE POLICIES TABLE
CREATE TABLE public.remote_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_wfh_days INTEGER DEFAULT 2,
  requires_approval BOOLEAN DEFAULT true,
  eligibility_criteria TEXT,
  equipment_allowance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.remote_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view remote policies in their organization" ON public.remote_policies
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create remote policies in their organization" ON public.remote_policies
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update remote policies in their organization" ON public.remote_policies
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete remote policies in their organization" ON public.remote_policies
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE INDEX idx_remote_policies_org ON public.remote_policies(organization_id);

-- 7. TRIGGERS FOR updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_learned_updated_at BEFORE UPDATE ON public.lessons_learned
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_tasks_updated_at BEFORE UPDATE ON public.recurring_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_swaps_updated_at BEFORE UPDATE ON public.shift_swaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_on_call_schedules_updated_at BEFORE UPDATE ON public.on_call_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_remote_policies_updated_at BEFORE UPDATE ON public.remote_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();