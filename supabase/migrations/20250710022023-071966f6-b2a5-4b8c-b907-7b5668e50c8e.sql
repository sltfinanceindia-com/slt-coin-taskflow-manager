-- Create session_logs table for tracking intern screen time
CREATE TABLE public.session_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  session_duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN logout_time IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (logout_time - login_time))/60 
      ELSE NULL 
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for session_logs
CREATE POLICY "Users can view their own session logs" 
ON public.session_logs 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all session logs" 
ON public.session_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can insert their own session logs" 
ON public.session_logs 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own session logs" 
ON public.session_logs 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create quiz_templates table for UI/UX tests
CREATE TABLE public.quiz_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]',
  time_per_question_seconds INTEGER NOT NULL DEFAULT 30,
  total_questions INTEGER NOT NULL DEFAULT 50,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for quiz_templates
ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_templates
CREATE POLICY "Admins can manage quiz templates" 
ON public.quiz_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Everyone can view published quiz templates" 
ON public.quiz_templates 
FOR SELECT 
USING (is_published = true OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create quiz_attempts table for tracking quiz submissions
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_template_id UUID NOT NULL REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can insert their own quiz attempts" 
ON public.quiz_attempts 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own quiz attempts" 
ON public.quiz_attempts 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add task_type column to tasks table for different task types including quizzes
ALTER TABLE public.tasks ADD COLUMN task_type TEXT DEFAULT 'regular' CHECK (task_type IN ('regular', 'quiz', 'training'));
ALTER TABLE public.tasks ADD COLUMN quiz_template_id UUID REFERENCES public.quiz_templates(id) ON DELETE SET NULL;

-- Create trigger for updating updated_at timestamps
CREATE TRIGGER update_session_logs_updated_at
  BEFORE UPDATE ON public.session_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_templates_updated_at
  BEFORE UPDATE ON public.quiz_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();