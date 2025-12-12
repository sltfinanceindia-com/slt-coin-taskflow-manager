-- Phase 6: Advanced Features Database Migration

-- 6.1 Updates Feed & Proofing

-- Project Updates - Unified activity stream
CREATE TABLE public.project_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL DEFAULT 'comment',
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  mentions UUID[] DEFAULT '{}'::uuid[],
  is_important BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view updates in their org"
  ON public.project_updates FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create updates"
  ON public.project_updates FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND user_id = get_my_profile_id());

CREATE POLICY "Users can update their own updates"
  ON public.project_updates FOR UPDATE
  USING (user_id = get_my_profile_id());

CREATE POLICY "Users can delete their own updates"
  ON public.project_updates FOR DELETE
  USING (user_id = get_my_profile_id() OR is_any_admin(auth.uid()));

CREATE INDEX idx_project_updates_project ON public.project_updates(project_id);
CREATE INDEX idx_project_updates_task ON public.project_updates(task_id);
CREATE INDEX idx_project_updates_org ON public.project_updates(organization_id);
CREATE INDEX idx_project_updates_created ON public.project_updates(created_at DESC);

-- File Versions - Version tracking
CREATE TABLE public.file_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_file_id UUID,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change_description TEXT,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view file versions in their org"
  ON public.file_versions FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Users can upload file versions"
  ON public.file_versions FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND uploaded_by = get_my_profile_id());

CREATE POLICY "Admins can delete file versions"
  ON public.file_versions FOR DELETE
  USING (is_any_admin(auth.uid()) OR uploaded_by = get_my_profile_id());

CREATE INDEX idx_file_versions_original ON public.file_versions(original_file_id);
CREATE INDEX idx_file_versions_task ON public.file_versions(task_id);
CREATE INDEX idx_file_versions_project ON public.file_versions(project_id);

-- File Annotations - Inline proofing
CREATE TABLE public.file_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_version_id UUID NOT NULL REFERENCES public.file_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  annotation_type TEXT NOT NULL DEFAULT 'comment',
  position_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.file_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view annotations in their org"
  ON public.file_annotations FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create annotations"
  ON public.file_annotations FOR INSERT
  WITH CHECK (organization_id = get_my_org_id() AND user_id = get_my_profile_id());

CREATE POLICY "Users can update annotations"
  ON public.file_annotations FOR UPDATE
  USING (user_id = get_my_profile_id() OR is_any_admin(auth.uid()));

CREATE POLICY "Users can delete their own annotations"
  ON public.file_annotations FOR DELETE
  USING (user_id = get_my_profile_id() OR is_any_admin(auth.uid()));

CREATE INDEX idx_file_annotations_version ON public.file_annotations(file_version_id);
CREATE INDEX idx_file_annotations_status ON public.file_annotations(status);

-- Digest Settings - User notification preferences
CREATE TABLE public.digest_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  digest_frequency TEXT NOT NULL DEFAULT 'daily',
  digest_time TIME WITHOUT TIME ZONE DEFAULT '09:00:00',
  include_mentions BOOLEAN DEFAULT true,
  include_updates BOOLEAN DEFAULT true,
  include_files BOOLEAN DEFAULT true,
  include_tasks BOOLEAN DEFAULT true,
  last_digest_sent TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.digest_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own digest settings"
  ON public.digest_settings FOR ALL
  USING (user_id = get_my_profile_id());

-- 6.2 Automation Rules

CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view automation rules in their org"
  ON public.automation_rules FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage automation rules"
  ON public.automation_rules FOR ALL
  USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

CREATE INDEX idx_automation_rules_org ON public.automation_rules(organization_id);
CREATE INDEX idx_automation_rules_trigger ON public.automation_rules(trigger_event);
CREATE INDEX idx_automation_rules_active ON public.automation_rules(is_active);

-- Automation Logs
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  actions_executed JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  execution_time_ms INTEGER,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view automation logs"
  ON public.automation_logs FOR SELECT
  USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

CREATE POLICY "System can insert automation logs"
  ON public.automation_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_automation_logs_rule ON public.automation_logs(rule_id);
CREATE INDEX idx_automation_logs_status ON public.automation_logs(status);
CREATE INDEX idx_automation_logs_created ON public.automation_logs(created_at DESC);

-- 6.3 Work Health Dashboard

-- Risk Assessments
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_risk INTEGER NOT NULL DEFAULT 1 CHECK (schedule_risk >= 1 AND schedule_risk <= 5),
  budget_risk INTEGER NOT NULL DEFAULT 1 CHECK (budget_risk >= 1 AND budget_risk <= 5),
  scope_risk INTEGER NOT NULL DEFAULT 1 CHECK (scope_risk >= 1 AND scope_risk <= 5),
  resource_risk INTEGER NOT NULL DEFAULT 1 CHECK (resource_risk >= 1 AND resource_risk <= 5),
  quality_risk INTEGER NOT NULL DEFAULT 1 CHECK (quality_risk >= 1 AND quality_risk <= 5),
  overall_risk_score NUMERIC(3,2) GENERATED ALWAYS AS (
    (schedule_risk + budget_risk + scope_risk + resource_risk + quality_risk)::NUMERIC / 5
  ) STORED,
  risk_trend TEXT DEFAULT 'stable',
  mitigation_notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk assessments in their org"
  ON public.risk_assessments FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage risk assessments"
  ON public.risk_assessments FOR ALL
  USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

CREATE INDEX idx_risk_assessments_project ON public.risk_assessments(project_id);
CREATE INDEX idx_risk_assessments_date ON public.risk_assessments(assessment_date DESC);

-- Early Warnings
CREATE TABLE public.early_warnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  warning_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  suggested_action TEXT,
  prediction_confidence INTEGER DEFAULT 75 CHECK (prediction_confidence >= 0 AND prediction_confidence <= 100),
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  is_resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.early_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view early warnings in their org"
  ON public.early_warnings FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Users can acknowledge warnings"
  ON public.early_warnings FOR UPDATE
  USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage early warnings"
  ON public.early_warnings FOR ALL
  USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

CREATE INDEX idx_early_warnings_project ON public.early_warnings(project_id);
CREATE INDEX idx_early_warnings_severity ON public.early_warnings(severity);
CREATE INDEX idx_early_warnings_resolved ON public.early_warnings(is_resolved);

-- Function to calculate project risk score
CREATE OR REPLACE FUNCTION public.calculate_project_risk_score(p_project_id UUID)
RETURNS TABLE(
  overall_score NUMERIC,
  schedule_score NUMERIC,
  resource_score NUMERIC,
  task_health_score NUMERIC,
  risk_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_tasks INTEGER;
  v_overdue_tasks INTEGER;
  v_completed_tasks INTEGER;
  v_in_progress_tasks INTEGER;
  v_schedule_score NUMERIC;
  v_resource_score NUMERIC;
  v_task_health NUMERIC;
  v_overall NUMERIC;
BEGIN
  -- Get task counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status NOT IN ('completed', 'verified') AND end_date < CURRENT_DATE),
    COUNT(*) FILTER (WHERE status IN ('completed', 'verified')),
    COUNT(*) FILTER (WHERE status = 'in_progress')
  INTO v_total_tasks, v_overdue_tasks, v_completed_tasks, v_in_progress_tasks
  FROM tasks
  WHERE project_id = p_project_id;

  -- Calculate scores (lower is better, 1-5 scale)
  IF v_total_tasks > 0 THEN
    v_schedule_score := LEAST(5, 1 + (v_overdue_tasks::NUMERIC / v_total_tasks) * 4);
    v_task_health := LEAST(5, 5 - (v_completed_tasks::NUMERIC / v_total_tasks) * 4);
    v_resource_score := CASE 
      WHEN v_in_progress_tasks > v_total_tasks * 0.5 THEN 4
      WHEN v_in_progress_tasks > v_total_tasks * 0.3 THEN 3
      ELSE 2
    END;
  ELSE
    v_schedule_score := 1;
    v_task_health := 1;
    v_resource_score := 1;
  END IF;

  v_overall := (v_schedule_score + v_resource_score + v_task_health) / 3;

  RETURN QUERY SELECT 
    ROUND(v_overall, 2),
    ROUND(v_schedule_score, 2),
    ROUND(v_resource_score, 2),
    ROUND(v_task_health, 2),
    CASE 
      WHEN v_overall >= 4 THEN 'critical'
      WHEN v_overall >= 3 THEN 'high'
      WHEN v_overall >= 2 THEN 'medium'
      ELSE 'low'
    END;
END;
$$;

-- Function to detect early warnings
CREATE OR REPLACE FUNCTION public.detect_early_warnings(p_org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_warnings_created INTEGER := 0;
  v_task RECORD;
  v_project RECORD;
BEGIN
  -- Check for tasks approaching deadline (within 2 days)
  FOR v_task IN 
    SELECT t.id, t.title, t.project_id, t.end_date, p.name as project_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.organization_id = p_org_id
      AND t.status NOT IN ('completed', 'verified')
      AND t.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 days'
      AND NOT EXISTS (
        SELECT 1 FROM early_warnings ew 
        WHERE ew.task_id = t.id 
          AND ew.warning_type = 'deadline_approaching'
          AND ew.is_resolved = false
      )
  LOOP
    INSERT INTO early_warnings (
      project_id, task_id, warning_type, severity, description, 
      suggested_action, prediction_confidence, organization_id
    ) VALUES (
      v_task.project_id, v_task.id, 'deadline_approaching', 'high',
      'Task "' || v_task.title || '" is due within 2 days',
      'Review task progress and consider reassigning or extending deadline',
      90, p_org_id
    );
    v_warnings_created := v_warnings_created + 1;
  END LOOP;

  -- Check for overdue tasks
  FOR v_task IN 
    SELECT t.id, t.title, t.project_id, t.end_date
    FROM tasks t
    WHERE t.organization_id = p_org_id
      AND t.status NOT IN ('completed', 'verified')
      AND t.end_date < CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM early_warnings ew 
        WHERE ew.task_id = t.id 
          AND ew.warning_type = 'overdue'
          AND ew.is_resolved = false
      )
  LOOP
    INSERT INTO early_warnings (
      project_id, task_id, warning_type, severity, description,
      suggested_action, prediction_confidence, organization_id
    ) VALUES (
      v_task.project_id, v_task.id, 'overdue', 'critical',
      'Task "' || v_task.title || '" is overdue by ' || (CURRENT_DATE - v_task.end_date) || ' days',
      'Immediately review and either complete, reassign, or update timeline',
      100, p_org_id
    );
    v_warnings_created := v_warnings_created + 1;
  END LOOP;

  RETURN v_warnings_created;
END;
$$;