
-- Phase 5: Performance Management (new tables only)

-- OKR Objectives table
CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  visibility TEXT DEFAULT 'organization' CHECK (visibility IN ('private', 'team', 'organization')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1:1 Meetings table
CREATE TABLE IF NOT EXISTS public.one_on_one_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  meeting_type TEXT DEFAULT 'regular' CHECK (meeting_type IN ('regular', 'performance_review', 'career_development', 'feedback')),
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  action_items JSONB DEFAULT '[]',
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1:1 Talking Points
CREATE TABLE IF NOT EXISTS public.meeting_talking_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.one_on_one_meetings(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_discussed BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PIP (Performance Improvement Plans) table
CREATE TABLE IF NOT EXISTS public.performance_improvement_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'extended', 'completed_success', 'completed_failure', 'cancelled')),
  goals JSONB DEFAULT '[]',
  success_criteria TEXT,
  support_provided TEXT,
  consequences TEXT,
  final_outcome TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PIP Check-ins table
CREATE TABLE IF NOT EXISTS public.pip_check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pip_id UUID REFERENCES public.performance_improvement_plans(id) ON DELETE CASCADE NOT NULL,
  check_in_date DATE NOT NULL,
  progress_notes TEXT,
  areas_of_improvement TEXT,
  areas_needing_work TEXT,
  next_steps TEXT,
  manager_notes TEXT,
  employee_notes TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_talking_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_improvement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pip_check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for objectives
DROP POLICY IF EXISTS "Users can view org objectives" ON public.objectives;
CREATE POLICY "Users can view org objectives" ON public.objectives
  FOR SELECT USING (organization_id = public.get_user_organization_id());

DROP POLICY IF EXISTS "Users can manage own objectives" ON public.objectives;
CREATE POLICY "Users can manage own objectives" ON public.objectives
  FOR ALL USING (owner_id = public.get_user_profile_id() OR public.is_any_admin(auth.uid()));

-- RLS Policies for 1:1 meetings
DROP POLICY IF EXISTS "Users can view own meetings" ON public.one_on_one_meetings;
CREATE POLICY "Users can view own meetings" ON public.one_on_one_meetings
  FOR SELECT USING (
    manager_id = public.get_user_profile_id() 
    OR employee_id = public.get_user_profile_id()
    OR public.is_any_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage own meetings" ON public.one_on_one_meetings;
CREATE POLICY "Users can manage own meetings" ON public.one_on_one_meetings
  FOR ALL USING (
    manager_id = public.get_user_profile_id() 
    OR employee_id = public.get_user_profile_id()
    OR public.is_any_admin(auth.uid())
  );

-- RLS Policies for talking points
DROP POLICY IF EXISTS "Users can view meeting talking points" ON public.meeting_talking_points;
CREATE POLICY "Users can view meeting talking points" ON public.meeting_talking_points
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.one_on_one_meetings m 
      WHERE m.id = meeting_id 
      AND (m.manager_id = public.get_user_profile_id() OR m.employee_id = public.get_user_profile_id())
    )
    AND (NOT is_private OR added_by = public.get_user_profile_id())
  );

DROP POLICY IF EXISTS "Users can manage own talking points" ON public.meeting_talking_points;
CREATE POLICY "Users can manage own talking points" ON public.meeting_talking_points
  FOR ALL USING (added_by = public.get_user_profile_id() OR public.is_any_admin(auth.uid()));

-- RLS Policies for PIPs
DROP POLICY IF EXISTS "Users can view relevant PIPs" ON public.performance_improvement_plans;
CREATE POLICY "Users can view relevant PIPs" ON public.performance_improvement_plans
  FOR SELECT USING (
    employee_id = public.get_user_profile_id() 
    OR manager_id = public.get_user_profile_id()
    OR public.is_any_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Managers can manage PIPs" ON public.performance_improvement_plans;
CREATE POLICY "Managers can manage PIPs" ON public.performance_improvement_plans
  FOR ALL USING (manager_id = public.get_user_profile_id() OR public.is_any_admin(auth.uid()));

-- RLS Policies for PIP check-ins
DROP POLICY IF EXISTS "Users can view relevant PIP check-ins" ON public.pip_check_ins;
CREATE POLICY "Users can view relevant PIP check-ins" ON public.pip_check_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.performance_improvement_plans pip 
      WHERE pip.id = pip_id 
      AND (pip.employee_id = public.get_user_profile_id() OR pip.manager_id = public.get_user_profile_id() OR public.is_any_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Managers can manage PIP check-ins" ON public.pip_check_ins;
CREATE POLICY "Managers can manage PIP check-ins" ON public.pip_check_ins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.performance_improvement_plans pip 
      WHERE pip.id = pip_id 
      AND (pip.manager_id = public.get_user_profile_id() OR public.is_any_admin(auth.uid()))
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_objectives_owner ON public.objectives(owner_id);
CREATE INDEX IF NOT EXISTS idx_objectives_org ON public.objectives(organization_id);
CREATE INDEX IF NOT EXISTS idx_meetings_manager ON public.one_on_one_meetings(manager_id);
CREATE INDEX IF NOT EXISTS idx_meetings_employee ON public.one_on_one_meetings(employee_id);
CREATE INDEX IF NOT EXISTS idx_pips_employee ON public.performance_improvement_plans(employee_id);
