-- Phase 5: Workload Forecasting + What-If Scenarios

-- Workload scenarios table for what-if analysis
CREATE TABLE public.workload_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scenario_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- scenario_data: { resource_changes: [{profile_id, hours_change, effective_from, effective_until}], deadline_shifts: [{project_id, days_shift}], new_projects: [{name, hours, start_date}] }
  results JSONB DEFAULT '{}'::jsonb,
  -- results: { weekly_utilization: [{week_start, utilization_pct, overloaded_count}], gaps: [{week_start, hours_gap}], bottlenecks: [{profile_id, peak_week, utilization}] }
  is_baseline BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'archived')),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workload_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view scenarios in their org"
  ON public.workload_scenarios
  FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create scenarios"
  ON public.workload_scenarios
  FOR INSERT
  WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Users can update their own scenarios"
  ON public.workload_scenarios
  FOR UPDATE
  USING (created_by = get_my_profile_id() OR is_any_admin(auth.uid()));

CREATE POLICY "Users can delete their own scenarios"
  ON public.workload_scenarios
  FOR DELETE
  USING (created_by = get_my_profile_id() OR is_any_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_workload_scenarios_org ON public.workload_scenarios(organization_id);
CREATE INDEX idx_workload_scenarios_created_by ON public.workload_scenarios(created_by);
CREATE INDEX idx_workload_scenarios_status ON public.workload_scenarios(status);

-- Function to calculate workload forecast
CREATE OR REPLACE FUNCTION calculate_workload_forecast(
  p_organization_id UUID,
  p_weeks_ahead INTEGER DEFAULT 12,
  p_scenario_adjustments JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB := '{"weekly_forecast": [], "resource_utilization": [], "capacity_gaps": []}'::jsonb;
  v_week_start DATE;
  v_week_end DATE;
  v_current_week INTEGER;
BEGIN
  -- Calculate weekly forecast for the specified period
  FOR v_current_week IN 0..p_weeks_ahead LOOP
    v_week_start := date_trunc('week', CURRENT_DATE + (v_current_week * 7));
    v_week_end := v_week_start + INTERVAL '6 days';
    
    -- Get task hours due this week
    WITH week_hours AS (
      SELECT 
        COALESCE(SUM(t.estimated_hours), 0) as planned_hours,
        COUNT(DISTINCT t.assignee_id) as assigned_resources
      FROM tasks t
      WHERE t.organization_id = p_organization_id
        AND t.status NOT IN ('completed', 'cancelled')
        AND t.due_date >= v_week_start
        AND t.due_date <= v_week_end
    ),
    capacity AS (
      SELECT COALESCE(SUM(ec.weekly_hours), 0) as total_capacity
      FROM employee_capacity ec
      JOIN profiles p ON p.id = ec.profile_id
      WHERE ec.organization_id = p_organization_id
    )
    SELECT jsonb_build_object(
      'week_start', v_week_start,
      'week_number', v_current_week + 1,
      'planned_hours', wh.planned_hours,
      'capacity_hours', c.total_capacity,
      'utilization_pct', CASE WHEN c.total_capacity > 0 
        THEN ROUND((wh.planned_hours / c.total_capacity * 100)::numeric, 1)
        ELSE 0 END,
      'gap_hours', c.total_capacity - wh.planned_hours,
      'assigned_resources', wh.assigned_resources
    )
    INTO v_result
    FROM week_hours wh, capacity c;
    
    v_result := jsonb_set(
      v_result,
      '{weekly_forecast}',
      COALESCE(v_result->'weekly_forecast', '[]'::jsonb) || 
        jsonb_build_object(
          'week_start', v_week_start,
          'week_number', v_current_week + 1
        )
    );
  END LOOP;
  
  RETURN v_result;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_workload_scenarios_updated_at
  BEFORE UPDATE ON public.workload_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();