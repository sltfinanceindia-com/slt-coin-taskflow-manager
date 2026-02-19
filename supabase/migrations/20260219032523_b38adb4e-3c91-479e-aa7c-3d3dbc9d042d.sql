
-- Add is_archived flag to tasks for archive workflow
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Index for filtering archived tasks
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON public.tasks (is_archived) WHERE is_archived = true;
