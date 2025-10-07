-- Create assessment assignments table
CREATE TABLE IF NOT EXISTS public.assessment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.assessment_assignments ENABLE ROW LEVEL SECURITY;

-- Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
ON public.assessment_assignments
FOR SELECT
USING (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin')
);

-- Admins can manage assignments
CREATE POLICY "Admins can manage assignments"
ON public.assessment_assignments
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_user_id ON public.assessment_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_assessment_id ON public.assessment_assignments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_status ON public.assessment_assignments(status);

-- Update function for updated_at
CREATE TRIGGER update_assessment_assignments_updated_at
  BEFORE UPDATE ON public.assessment_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();