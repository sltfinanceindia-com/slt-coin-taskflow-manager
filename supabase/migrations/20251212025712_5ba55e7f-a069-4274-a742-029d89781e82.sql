
-- Project baselines table
CREATE TABLE public.project_baselines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  baseline_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  is_current BOOLEAN DEFAULT false,
  task_snapshots JSONB DEFAULT '[]'::jsonb,
  budget_snapshot NUMERIC DEFAULT 0,
  schedule_snapshot JSONB DEFAULT '{}'::jsonb,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Task baseline snapshots for detailed tracking
CREATE TABLE public.task_baseline_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baseline_id UUID NOT NULL REFERENCES public.project_baselines(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  planned_start_date DATE,
  planned_end_date DATE,
  estimated_hours NUMERIC DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_baseline_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_baselines
CREATE POLICY "Users can view baselines in their org"
  ON public.project_baselines FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create baselines"
  ON public.project_baselines FOR INSERT
  WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Users can update baselines in their org"
  ON public.project_baselines FOR UPDATE
  USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can delete baselines"
  ON public.project_baselines FOR DELETE
  USING (is_any_admin(auth.uid()));

-- RLS Policies for task_baseline_snapshots
CREATE POLICY "Users can view snapshots in their org"
  ON public.task_baseline_snapshots FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "System can create snapshots"
  ON public.task_baseline_snapshots FOR INSERT
  WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Admins can delete snapshots"
  ON public.task_baseline_snapshots FOR DELETE
  USING (is_any_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_project_baselines_project ON public.project_baselines(project_id);
CREATE INDEX idx_project_baselines_org ON public.project_baselines(organization_id);
CREATE INDEX idx_task_baseline_snapshots_baseline ON public.task_baseline_snapshots(baseline_id);
CREATE INDEX idx_task_baseline_snapshots_task ON public.task_baseline_snapshots(task_id);

-- Function to create baseline snapshot
CREATE OR REPLACE FUNCTION public.create_project_baseline(
  p_project_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_baseline_id UUID;
  v_org_id UUID;
  v_profile_id UUID;
  v_task RECORD;
  v_total_budget NUMERIC := 0;
BEGIN
  -- Get org and profile
  SELECT organization_id INTO v_org_id FROM profiles WHERE user_id = auth.uid();
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = auth.uid();
  
  -- Set all existing baselines for this project to not current
  UPDATE project_baselines SET is_current = false WHERE project_id = p_project_id;
  
  -- Create new baseline
  INSERT INTO project_baselines (
    project_id, name, description, created_by, 
    is_current, organization_id
  ) VALUES (
    p_project_id, p_name, p_description, v_profile_id,
    true, v_org_id
  ) RETURNING id INTO v_baseline_id;
  
  -- Snapshot all tasks
  FOR v_task IN 
    SELECT id, planned_start_date, planned_end_date, estimated_hours
    FROM tasks WHERE project_id = p_project_id
  LOOP
    INSERT INTO task_baseline_snapshots (
      baseline_id, task_id, planned_start_date, 
      planned_end_date, estimated_hours, organization_id
    ) VALUES (
      v_baseline_id, v_task.id, v_task.planned_start_date,
      v_task.planned_end_date, COALESCE(v_task.estimated_hours, 0), v_org_id
    );
    
    v_total_budget := v_total_budget + COALESCE(v_task.estimated_hours, 0);
  END LOOP;
  
  -- Update baseline with budget
  UPDATE project_baselines 
  SET budget_snapshot = v_total_budget,
      schedule_snapshot = (
        SELECT jsonb_build_object(
          'start_date', MIN(planned_start_date),
          'end_date', MAX(planned_end_date),
          'task_count', COUNT(*)
        )
        FROM task_baseline_snapshots WHERE baseline_id = v_baseline_id
      )
  WHERE id = v_baseline_id;
  
  RETURN v_baseline_id;
END;
$$;

-- Function to calculate variance metrics
CREATE OR REPLACE FUNCTION public.calculate_project_variance(p_project_id UUID, p_baseline_id UUID DEFAULT NULL)
RETURNS TABLE(
  baseline_hours NUMERIC,
  actual_hours NUMERIC,
  effort_variance NUMERIC,
  effort_variance_pct NUMERIC,
  baseline_end_date DATE,
  current_end_date DATE,
  schedule_variance_days INTEGER,
  tasks_on_track INTEGER,
  tasks_behind INTEGER,
  tasks_ahead INTEGER,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_baseline_id UUID;
BEGIN
  -- Get baseline ID (use current if not specified)
  IF p_baseline_id IS NULL THEN
    SELECT id INTO v_baseline_id 
    FROM project_baselines 
    WHERE project_id = p_project_id AND is_current = true
    LIMIT 1;
  ELSE
    v_baseline_id := p_baseline_id;
  END IF;
  
  IF v_baseline_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  WITH baseline_data AS (
    SELECT 
      SUM(tbs.estimated_hours) as total_baseline_hours,
      MAX(tbs.planned_end_date) as baseline_end
    FROM task_baseline_snapshots tbs
    WHERE tbs.baseline_id = v_baseline_id
  ),
  actual_data AS (
    SELECT 
      COALESCE(SUM(tl.hours_logged), 0) as total_actual_hours
    FROM time_logs tl
    JOIN tasks t ON tl.task_id = t.id
    WHERE t.project_id = p_project_id
  ),
  current_schedule AS (
    SELECT 
      MAX(COALESCE(t.planned_end_date, t.end_date::date)) as current_end
    FROM tasks t
    WHERE t.project_id = p_project_id
  ),
  task_status AS (
    SELECT 
      COUNT(*) FILTER (WHERE 
        t.status IN ('completed', 'verified') OR 
        (t.planned_end_date >= CURRENT_DATE AND t.status NOT IN ('completed', 'verified'))
      ) as on_track,
      COUNT(*) FILTER (WHERE 
        t.planned_end_date < CURRENT_DATE AND t.status NOT IN ('completed', 'verified')
      ) as behind,
      COUNT(*) FILTER (WHERE 
        t.status IN ('completed', 'verified') AND 
        t.updated_at::date < COALESCE(tbs.planned_end_date, CURRENT_DATE)
      ) as ahead,
      COUNT(*) FILTER (WHERE t.status IN ('completed', 'verified'))::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100 as completion
    FROM tasks t
    LEFT JOIN task_baseline_snapshots tbs ON t.id = tbs.task_id AND tbs.baseline_id = v_baseline_id
    WHERE t.project_id = p_project_id
  )
  SELECT 
    COALESCE(bd.total_baseline_hours, 0),
    ad.total_actual_hours,
    ad.total_actual_hours - COALESCE(bd.total_baseline_hours, 0),
    CASE WHEN COALESCE(bd.total_baseline_hours, 0) > 0 
      THEN ((ad.total_actual_hours - bd.total_baseline_hours) / bd.total_baseline_hours * 100)
      ELSE 0 
    END,
    bd.baseline_end,
    cs.current_end,
    COALESCE(cs.current_end - bd.baseline_end, 0)::INTEGER,
    ts.on_track::INTEGER,
    ts.behind::INTEGER,
    ts.ahead::INTEGER,
    COALESCE(ts.completion, 0)
  FROM baseline_data bd
  CROSS JOIN actual_data ad
  CROSS JOIN current_schedule cs
  CROSS JOIN task_status ts;
END;
$$;
