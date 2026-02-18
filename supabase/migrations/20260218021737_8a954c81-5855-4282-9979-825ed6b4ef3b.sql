
-- ============================================================
-- Phase 1: Fix 1 - Create sprint_tasks junction table
-- ============================================================
CREATE TABLE public.sprint_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sort_order INTEGER DEFAULT 0,
  story_points INTEGER DEFAULT 0,
  UNIQUE(sprint_id, task_id)
);

ALTER TABLE public.sprint_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sprint tasks in their org"
ON public.sprint_tasks FOR SELECT
USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can manage sprint tasks"
ON public.sprint_tasks FOR ALL
USING (public.is_same_org_admin(organization_id))
WITH CHECK (public.is_same_org_admin(organization_id));

CREATE POLICY "Users in org can insert sprint tasks"
ON public.sprint_tasks FOR INSERT
WITH CHECK (public.is_same_org_user(organization_id));

CREATE POLICY "Users in org can update sprint tasks"
ON public.sprint_tasks FOR UPDATE
USING (public.is_same_org_user(organization_id));

CREATE POLICY "Users in org can delete sprint tasks"
ON public.sprint_tasks FOR DELETE
USING (public.is_same_org_user(organization_id));

CREATE INDEX idx_sprint_tasks_sprint_id ON public.sprint_tasks(sprint_id);
CREATE INDEX idx_sprint_tasks_task_id ON public.sprint_tasks(task_id);
CREATE INDEX idx_sprint_tasks_org_id ON public.sprint_tasks(organization_id);

-- ============================================================
-- Phase 1: Fix 3 - Fix invoices RLS policy (overly permissive)
-- ============================================================
DROP POLICY IF EXISTS "System can manage invoices" ON public.invoices;

CREATE POLICY "Users can view invoices in their org"
ON public.invoices FOR SELECT
USING (public.is_same_org_user(organization_id));

CREATE POLICY "Admins can manage invoices"
ON public.invoices FOR ALL
USING (public.is_same_org_admin(organization_id))
WITH CHECK (public.is_same_org_admin(organization_id));

-- ============================================================
-- Phase 1: Fix 4 - Fix mutable search_path on update_updated_at_column
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- Phase 2: Fix 5 - Auto-trigger F&F from exit requests
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_create_fnf_settlement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.fnf_settlements (
      employee_id,
      exit_request_id,
      organization_id,
      settlement_date,
      status,
      basic_salary_due,
      total_earnings,
      total_deductions,
      net_settlement
    ) VALUES (
      NEW.employee_id,
      NEW.id,
      NEW.organization_id,
      NEW.last_working_day,
      'pending',
      0, 0, 0, 0
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if exit_requests table exists before creating trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exit_requests') THEN
    DROP TRIGGER IF EXISTS trigger_auto_create_fnf ON public.exit_requests;
    CREATE TRIGGER trigger_auto_create_fnf
      AFTER UPDATE ON public.exit_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.auto_create_fnf_settlement();
  END IF;
END $$;

-- ============================================================
-- Phase 2: Fix 6 - Add budget alert threshold column
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'budget_allocations' AND column_name = 'alert_threshold_percentage'
  ) THEN
    ALTER TABLE public.budget_allocations ADD COLUMN alert_threshold_percentage INTEGER DEFAULT 80;
  END IF;
END $$;
