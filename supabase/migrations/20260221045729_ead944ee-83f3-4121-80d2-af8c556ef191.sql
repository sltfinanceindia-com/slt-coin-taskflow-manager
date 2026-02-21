
-- Add linked_task_ids to key_results for OKR-Task progress integration
ALTER TABLE public.key_results 
ADD COLUMN IF NOT EXISTS linked_task_ids UUID[] DEFAULT '{}';

-- Create index for array queries
CREATE INDEX IF NOT EXISTS idx_key_results_linked_tasks ON key_results USING GIN (linked_task_ids);
