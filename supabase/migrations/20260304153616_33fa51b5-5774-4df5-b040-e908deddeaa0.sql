
-- Step 1: Add issue_number column to issues table
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS issue_number TEXT;

-- Step 2: Add severity column to issues table (used by useIssues hook)
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium';

-- Step 3: Add root_cause column to issues table (used by useIssues hook)
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS root_cause TEXT;

-- Step 4: Harden feedback_responses INSERT policy
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback_responses;
CREATE POLICY "Authenticated users can submit feedback" ON public.feedback_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
