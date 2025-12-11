
-- Phase 3: Workload & Capacity Planning

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(name, organization_id)
);

-- Employee capacity settings
CREATE TABLE IF NOT EXISTS public.employee_capacity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weekly_hours DECIMAL(5,2) NOT NULL DEFAULT 40,
  hourly_rate DECIMAL(10,2),
  available_from DATE,
  available_until DATE,
  utilization_target DECIMAL(5,2) DEFAULT 80,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);

-- Employee skills mapping
CREATE TABLE IF NOT EXISTS public.employee_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER NOT NULL DEFAULT 1 CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  years_experience DECIMAL(4,1),
  is_certified BOOLEAN DEFAULT false,
  certified_date DATE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, skill_id)
);

-- Project role requirements
CREATE TABLE IF NOT EXISTS public.project_role_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  skill_id UUID REFERENCES public.skills(id),
  min_proficiency INTEGER DEFAULT 1 CHECK (min_proficiency >= 1 AND min_proficiency <= 5),
  required_hours DECIMAL(10,2),
  assigned_profile_id UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, role_name)
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_role_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skills
CREATE POLICY "Users can view skills in their organization"
  ON public.skills FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage skills"
  ON public.skills FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- RLS Policies for employee_capacity
CREATE POLICY "Users can view capacity in their organization"
  ON public.employee_capacity FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update own capacity"
  ON public.employee_capacity FOR UPDATE
  USING (profile_id = public.get_user_profile_id());

CREATE POLICY "Admins can manage all capacity"
  ON public.employee_capacity FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- RLS Policies for employee_skills
CREATE POLICY "Users can view skills in their organization"
  ON public.employee_skills FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage own skills"
  ON public.employee_skills FOR ALL
  USING (profile_id = public.get_user_profile_id());

CREATE POLICY "Admins can manage all employee skills"
  ON public.employee_skills FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- RLS Policies for project_role_requirements
CREATE POLICY "Users can view project requirements in their organization"
  ON public.project_role_requirements FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage project requirements"
  ON public.project_role_requirements FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skills_org ON public.skills(organization_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_employee_capacity_profile ON public.employee_capacity(profile_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_profile ON public.employee_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_skill ON public.employee_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_project_role_requirements_project ON public.project_role_requirements(project_id);

-- Function to calculate employee workload
CREATE OR REPLACE FUNCTION public.get_employee_workload(
  p_profile_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '7 days'
)
RETURNS TABLE(
  total_assigned_hours DECIMAL,
  capacity_hours DECIMAL,
  utilization_percentage DECIMAL,
  task_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH task_hours AS (
    SELECT 
      COALESCE(SUM(t.estimated_hours), 0) as assigned_hours,
      COUNT(*) as tasks
    FROM tasks t
    WHERE t.assigned_to = p_profile_id
      AND t.status NOT IN ('completed', 'verified', 'rejected')
      AND (
        (t.planned_start_date IS NULL AND t.start_date::date BETWEEN p_start_date AND p_end_date)
        OR (t.planned_start_date BETWEEN p_start_date AND p_end_date)
      )
  ),
  capacity AS (
    SELECT COALESCE(ec.weekly_hours, 40) as weekly_hours
    FROM employee_capacity ec
    WHERE ec.profile_id = p_profile_id
  )
  SELECT 
    th.assigned_hours,
    COALESCE(c.weekly_hours, 40) * ((p_end_date - p_start_date + 1) / 7.0) as cap_hours,
    CASE 
      WHEN COALESCE(c.weekly_hours, 40) > 0 THEN
        (th.assigned_hours / (COALESCE(c.weekly_hours, 40) * ((p_end_date - p_start_date + 1) / 7.0))) * 100
      ELSE 0
    END as util_pct,
    th.tasks
  FROM task_hours th
  CROSS JOIN (SELECT COALESCE(MAX(weekly_hours), 40) as weekly_hours FROM capacity) c;
END;
$$;

-- Function to suggest best resource for a task based on skills and availability
CREATE OR REPLACE FUNCTION public.suggest_task_assignment(
  p_required_skill_id UUID DEFAULT NULL,
  p_min_proficiency INTEGER DEFAULT 1,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE + INTERVAL '7 days'
)
RETURNS TABLE(
  profile_id UUID,
  full_name TEXT,
  proficiency_level INTEGER,
  current_utilization DECIMAL,
  available_hours DECIMAL,
  match_score DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH employee_workloads AS (
    SELECT 
      p.id as emp_id,
      p.full_name as emp_name,
      COALESCE(ec.weekly_hours, 40) as capacity,
      COALESCE(SUM(t.estimated_hours), 0) as assigned_hours
    FROM profiles p
    LEFT JOIN employee_capacity ec ON ec.profile_id = p.id
    LEFT JOIN tasks t ON t.assigned_to = p.id 
      AND t.status NOT IN ('completed', 'verified', 'rejected')
      AND (
        (t.planned_start_date IS NULL AND t.start_date::date BETWEEN p_start_date AND p_end_date)
        OR (t.planned_start_date BETWEEN p_start_date AND p_end_date)
      )
    WHERE p.is_active = true
      AND p.organization_id = get_user_organization_id()
    GROUP BY p.id, p.full_name, ec.weekly_hours
  ),
  skill_matches AS (
    SELECT 
      es.profile_id,
      es.proficiency_level
    FROM employee_skills es
    WHERE (p_required_skill_id IS NULL OR es.skill_id = p_required_skill_id)
      AND es.proficiency_level >= p_min_proficiency
  )
  SELECT 
    ew.emp_id,
    ew.emp_name,
    COALESCE(sm.proficiency_level, 0)::INTEGER,
    CASE WHEN ew.capacity > 0 THEN (ew.assigned_hours / ew.capacity) * 100 ELSE 0 END as curr_util,
    (ew.capacity * ((p_end_date - p_start_date + 1) / 7.0)) - ew.assigned_hours as avail_hours,
    -- Match score: higher proficiency + lower utilization = better match
    (COALESCE(sm.proficiency_level, 0) * 20) + 
    (100 - LEAST(100, CASE WHEN ew.capacity > 0 THEN (ew.assigned_hours / ew.capacity) * 100 ELSE 0 END)) as score
  FROM employee_workloads ew
  LEFT JOIN skill_matches sm ON sm.profile_id = ew.emp_id
  WHERE (p_required_skill_id IS NULL OR sm.profile_id IS NOT NULL)
  ORDER BY score DESC;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_employee_capacity_updated_at
  BEFORE UPDATE ON public.employee_capacity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_skills_updated_at
  BEFORE UPDATE ON public.employee_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
