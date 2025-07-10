
-- Create UI/UX exams table
CREATE TABLE public.ui_ux_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_limit_minutes INTEGER NOT NULL DEFAULT 90,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create UI/UX exam attempts table
CREATE TABLE public.ui_ux_exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.ui_ux_exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_minutes INTEGER
);

-- Enable Row Level Security
ALTER TABLE public.ui_ux_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_ux_exam_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ui_ux_exams
CREATE POLICY "Everyone can view active exams"
  ON public.ui_ux_exams
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'::user_role
  ));

CREATE POLICY "Admins can manage exams"
  ON public.ui_ux_exams
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'::user_role
  ));

-- RLS Policies for ui_ux_exam_attempts
CREATE POLICY "Users can view their own attempts"
  ON public.ui_ux_exam_attempts
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'::user_role
  ));

CREATE POLICY "Users can insert their own attempts"
  ON public.ui_ux_exam_attempts
  FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own attempts"
  ON public.ui_ux_exam_attempts
  FOR UPDATE
  USING (user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Add some sample exam data
INSERT INTO public.ui_ux_exams (title, description, questions, time_limit_minutes, is_active) VALUES 
(
  'UI/UX Fundamentals Test',
  'Test your knowledge of basic UI/UX principles and design concepts.',
  '[
    {
      "id": "q1",
      "question": "What does UX stand for?",
      "options": ["User Experience", "User Extension", "Universal Experience", "User Expert"],
      "correct_answer": 0
    },
    {
      "id": "q2", 
      "question": "Which principle emphasizes making the most important elements stand out?",
      "options": ["Proximity", "Alignment", "Contrast", "Repetition"],
      "correct_answer": 2
    },
    {
      "id": "q3",
      "question": "What is the primary goal of user research?",
      "options": ["To validate design decisions", "To understand user needs and behaviors", "To create wireframes", "To test prototypes"],
      "correct_answer": 1
    }
  ]'::jsonb,
  30,
  true
);
