-- Add missing created_at column to training_assessment_attempts table
ALTER TABLE public.training_assessment_attempts 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add missing updated_at column for consistency
ALTER TABLE public.training_assessment_attempts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add trigger for updated_at
CREATE TRIGGER update_training_assessment_attempts_updated_at
BEFORE UPDATE ON public.training_assessment_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();