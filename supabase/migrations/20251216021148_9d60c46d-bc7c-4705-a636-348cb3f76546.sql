-- Add serial number columns to tasks and projects
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_number TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_number TEXT;

-- Create sequences for auto-incrementing
CREATE SEQUENCE IF NOT EXISTS task_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS project_number_seq START 1;

-- Create function to generate task number
CREATE OR REPLACE FUNCTION public.generate_task_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.task_number IS NULL THEN
    NEW.task_number := 'TSK-' || LPAD(nextval('task_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to generate project number
CREATE OR REPLACE FUNCTION public.generate_project_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_number IS NULL THEN
    NEW.project_number := 'PRJ-' || LPAD(nextval('project_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS set_task_number ON public.tasks;
CREATE TRIGGER set_task_number
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_task_number();

DROP TRIGGER IF EXISTS set_project_number ON public.projects;
CREATE TRIGGER set_project_number
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_project_number();

-- Update existing tasks with serial numbers using subquery
WITH numbered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.tasks
  WHERE task_number IS NULL
)
UPDATE public.tasks t
SET task_number = 'TSK-' || LPAD(nt.rn::TEXT, 5, '0')
FROM numbered_tasks nt
WHERE t.id = nt.id;

-- Update existing projects with serial numbers using subquery
WITH numbered_projects AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.projects
  WHERE project_number IS NULL
)
UPDATE public.projects p
SET project_number = 'PRJ-' || LPAD(np.rn::TEXT, 5, '0')
FROM numbered_projects np
WHERE p.id = np.id;

-- Update sequences to start after existing records
SELECT setval('task_number_seq', COALESCE((SELECT COUNT(*) FROM public.tasks), 0) + 1);
SELECT setval('project_number_seq', COALESCE((SELECT COUNT(*) FROM public.projects), 0) + 1);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_task_number ON public.tasks(task_number);
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON public.projects(project_number);