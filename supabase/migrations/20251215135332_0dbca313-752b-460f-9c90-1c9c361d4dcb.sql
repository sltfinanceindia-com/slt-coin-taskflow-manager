-- Fix remaining function search_path warnings
-- These functions need SET search_path = 'public' to prevent mutable search path issues

-- Fix calculate_workload_forecast function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_workload_forecast') THEN
    EXECUTE 'ALTER FUNCTION public.calculate_workload_forecast SET search_path = ''public''';
  END IF;
END $$;

-- Fix calculate_project_score function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_project_score') THEN
    EXECUTE 'ALTER FUNCTION public.calculate_project_score SET search_path = ''public''';
  END IF;
END $$;

-- Fix get_portfolio_ranking function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_portfolio_ranking') THEN
    EXECUTE 'ALTER FUNCTION public.get_portfolio_ranking SET search_path = ''public''';
  END IF;
END $$;

-- Fix calculate_project_variance function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_project_variance') THEN
    EXECUTE 'ALTER FUNCTION public.calculate_project_variance SET search_path = ''public''';
  END IF;
END $$;

-- Additional RLS policies for cross-organization data isolation

-- Ensure risk_assessments table has proper RLS
ALTER TABLE IF EXISTS public.risk_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view risk assessments in their org" ON public.risk_assessments;
CREATE POLICY "Users can view risk assessments in their org"
  ON public.risk_assessments FOR SELECT
  USING (public.is_same_org_user(organization_id));

DROP POLICY IF EXISTS "Users can create risk assessments in their org" ON public.risk_assessments;
CREATE POLICY "Users can create risk assessments in their org"
  ON public.risk_assessments FOR INSERT
  WITH CHECK (public.is_same_org_user(organization_id));

-- Ensure early_warnings table has proper RLS
ALTER TABLE IF EXISTS public.early_warnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view early warnings in their org" ON public.early_warnings;
CREATE POLICY "Users can view early warnings in their org"
  ON public.early_warnings FOR SELECT
  USING (public.is_same_org_user(organization_id));

DROP POLICY IF EXISTS "Users can update early warnings in their org" ON public.early_warnings;
CREATE POLICY "Users can update early warnings in their org"
  ON public.early_warnings FOR UPDATE
  USING (public.is_same_org_user(organization_id));

-- Ensure project_templates table has proper RLS
ALTER TABLE IF EXISTS public.project_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view templates in their org" ON public.project_templates;
CREATE POLICY "Users can view templates in their org"
  ON public.project_templates FOR SELECT
  USING (public.is_same_org_user(organization_id));

DROP POLICY IF EXISTS "Admins can manage templates in their org" ON public.project_templates;
CREATE POLICY "Admins can manage templates in their org"
  ON public.project_templates FOR ALL
  USING (public.is_same_org_admin(organization_id));

-- Ensure task_templates table has proper RLS
ALTER TABLE IF EXISTS public.task_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view task templates in their org" ON public.task_templates;
CREATE POLICY "Users can view task templates in their org"
  ON public.task_templates FOR SELECT
  USING (public.is_same_org_user(organization_id));

DROP POLICY IF EXISTS "Admins can manage task templates in their org" ON public.task_templates;
CREATE POLICY "Admins can manage task templates in their org"
  ON public.task_templates FOR ALL
  USING (public.is_same_org_admin(organization_id));

-- Ensure automation_rules table has proper RLS
ALTER TABLE IF EXISTS public.automation_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view automation rules in their org" ON public.automation_rules;
CREATE POLICY "Users can view automation rules in their org"
  ON public.automation_rules FOR SELECT
  USING (public.is_same_org_user(organization_id));

DROP POLICY IF EXISTS "Admins can manage automation rules in their org" ON public.automation_rules;
CREATE POLICY "Admins can manage automation rules in their org"
  ON public.automation_rules FOR ALL
  USING (public.is_same_org_admin(organization_id));

-- Ensure automation_logs table has proper RLS
ALTER TABLE IF EXISTS public.automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view automation logs in their org" ON public.automation_logs;
CREATE POLICY "Users can view automation logs in their org"
  ON public.automation_logs FOR SELECT
  USING (public.is_same_org_user(organization_id));

-- Ensure project_updates table has proper RLS
ALTER TABLE IF EXISTS public.project_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view project updates in their org" ON public.project_updates;
CREATE POLICY "Users can view project updates in their org"
  ON public.project_updates FOR SELECT
  USING (public.is_same_org_user(organization_id));

DROP POLICY IF EXISTS "Users can create project updates in their org" ON public.project_updates;
CREATE POLICY "Users can create project updates in their org"
  ON public.project_updates FOR INSERT
  WITH CHECK (public.is_same_org_user(organization_id));

DROP POLICY IF EXISTS "Users can delete their own updates" ON public.project_updates;
CREATE POLICY "Users can delete their own updates"
  ON public.project_updates FOR DELETE
  USING (user_id = public.get_my_profile_id());