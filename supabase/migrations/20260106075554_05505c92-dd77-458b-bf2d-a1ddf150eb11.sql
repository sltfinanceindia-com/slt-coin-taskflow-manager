-- Add hierarchy enhancement columns to portfolios
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS strategic_goals jsonb DEFAULT '[]';
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS template_config jsonb DEFAULT '{}';

-- Add hierarchy enhancement columns to programs
ALTER TABLE programs ADD COLUMN IF NOT EXISTS health_score integer DEFAULT 50;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS program_type text DEFAULT 'standard';

-- Add hierarchy enhancement columns to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_subtask boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS visibility_scope text DEFAULT 'assigned';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT 0;

-- Create function to auto-set is_subtask based on parent_task_id
CREATE OR REPLACE FUNCTION set_is_subtask()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_subtask := (NEW.parent_task_id IS NOT NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS task_is_subtask_trigger ON tasks;
CREATE TRIGGER task_is_subtask_trigger
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION set_is_subtask();

-- Update existing tasks that have parent_task_id to be marked as subtasks
UPDATE tasks SET is_subtask = true WHERE parent_task_id IS NOT NULL;