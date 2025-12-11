
-- Phase 2: Task Dependencies & Critical Path

-- Add new columns to tasks table for scheduling
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS planned_start_date DATE,
ADD COLUMN IF NOT EXISTS planned_end_date DATE,
ADD COLUMN IF NOT EXISTS actual_start_date DATE,
ADD COLUMN IF NOT EXISTS actual_end_date DATE,
ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Task Dependencies table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  predecessor_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  successor_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  lag_days INTEGER DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(predecessor_id, successor_id)
);

-- Enable RLS
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_dependencies
CREATE POLICY "Users can view task dependencies in their organization"
  ON public.task_dependencies FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can create task dependencies"
  ON public.task_dependencies FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.is_any_admin(auth.uid())
  );

CREATE POLICY "Admins can update task dependencies"
  ON public.task_dependencies FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.is_any_admin(auth.uid())
  );

CREATE POLICY "Admins can delete task dependencies"
  ON public.task_dependencies FOR DELETE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.is_any_admin(auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_dependencies_predecessor ON public.task_dependencies(predecessor_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_successor ON public.task_dependencies(successor_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_org ON public.task_dependencies(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_critical ON public.tasks(is_critical) WHERE is_critical = true;
CREATE INDEX IF NOT EXISTS idx_tasks_is_milestone ON public.tasks(is_milestone) WHERE is_milestone = true;
CREATE INDEX IF NOT EXISTS idx_tasks_planned_dates ON public.tasks(planned_start_date, planned_end_date);

-- Function to calculate critical path (simplified version)
CREATE OR REPLACE FUNCTION public.calculate_task_critical_path(p_project_id UUID)
RETURNS TABLE(task_id UUID, is_on_critical_path BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Reset all tasks to non-critical first
  UPDATE tasks SET is_critical = false WHERE project_id = p_project_id;
  
  -- Mark tasks as critical if they:
  -- 1. Have no slack (planned_end_date = end_date)
  -- 2. Are on the longest path to project completion
  -- 3. Have dependencies that are also critical
  
  -- Simple implementation: tasks with 0 or negative slack are critical
  WITH task_slack AS (
    SELECT 
      t.id,
      t.planned_end_date,
      t.end_date,
      COALESCE(t.planned_end_date, t.end_date::date) - CURRENT_DATE as slack_days
    FROM tasks t
    WHERE t.project_id = p_project_id
      AND t.status NOT IN ('completed', 'verified')
  )
  UPDATE tasks t
  SET is_critical = true
  FROM task_slack ts
  WHERE t.id = ts.id
    AND ts.slack_days <= 0;
  
  -- Return the results
  RETURN QUERY
  SELECT t.id, t.is_critical
  FROM tasks t
  WHERE t.project_id = p_project_id;
END;
$$;

-- Function to auto-adjust successor dates when predecessor changes
CREATE OR REPLACE FUNCTION public.cascade_dependency_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  dep RECORD;
  new_start_date DATE;
BEGIN
  -- When a task's end date changes, update dependent tasks
  IF OLD.planned_end_date IS DISTINCT FROM NEW.planned_end_date 
     OR OLD.end_date IS DISTINCT FROM NEW.end_date THEN
    
    FOR dep IN 
      SELECT td.*, t.planned_start_date as successor_start
      FROM task_dependencies td
      JOIN tasks t ON t.id = td.successor_id
      WHERE td.predecessor_id = NEW.id
    LOOP
      -- Calculate new start date based on dependency type
      CASE dep.dependency_type
        WHEN 'finish_to_start' THEN
          new_start_date := COALESCE(NEW.planned_end_date, NEW.end_date::date) + dep.lag_days;
        WHEN 'start_to_start' THEN
          new_start_date := COALESCE(NEW.planned_start_date, NEW.start_date::date) + dep.lag_days;
        WHEN 'finish_to_finish' THEN
          -- For FF, we adjust end date, not start
          CONTINUE;
        WHEN 'start_to_finish' THEN
          -- SF is rare, skip for now
          CONTINUE;
        ELSE
          new_start_date := COALESCE(NEW.planned_end_date, NEW.end_date::date) + dep.lag_days;
      END CASE;
      
      -- Update successor if new date is later than current
      IF new_start_date > dep.successor_start OR dep.successor_start IS NULL THEN
        UPDATE tasks 
        SET planned_start_date = new_start_date
        WHERE id = dep.successor_id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for cascading date changes
DROP TRIGGER IF EXISTS trigger_cascade_dependency_dates ON public.tasks;
CREATE TRIGGER trigger_cascade_dependency_dates
  AFTER UPDATE OF planned_end_date, end_date ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_dependency_dates();
