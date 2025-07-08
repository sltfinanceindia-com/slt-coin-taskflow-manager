-- Add assessment tables for training
CREATE TABLE public.training_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.training_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for user assessment attempts
CREATE TABLE public.training_assessment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.training_assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_passed BOOLEAN DEFAULT false,
  attempt_number INTEGER DEFAULT 1
);

-- Enhanced video progress tracking with completion percentage
CREATE TABLE public.training_video_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.training_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  watch_time_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL,
  completion_percentage NUMERIC(5,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Enable RLS
ALTER TABLE public.training_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_video_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments
CREATE POLICY "Everyone can view published assessments" 
ON public.training_assessments 
FOR SELECT 
USING (is_published = true OR EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'::user_role
));

CREATE POLICY "Admins can manage assessments" 
ON public.training_assessments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'::user_role
));

-- RLS Policies for assessment attempts
CREATE POLICY "Users can view their own attempts" 
ON public.training_assessment_attempts 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'::user_role
));

CREATE POLICY "Users can insert their own attempts" 
ON public.training_assessment_attempts 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all attempts" 
ON public.training_assessment_attempts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'::user_role
));

-- RLS Policies for video progress
CREATE POLICY "Users can view their own video progress" 
ON public.training_video_progress 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'::user_role
));

CREATE POLICY "Users can manage their own video progress" 
ON public.training_video_progress 
FOR ALL 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all video progress" 
ON public.training_video_progress 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'::user_role
));

-- Triggers for updated_at
CREATE TRIGGER update_training_assessments_updated_at
  BEFORE UPDATE ON public.training_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to extract video duration from URL (basic implementation)
CREATE OR REPLACE FUNCTION public.extract_video_duration(video_url TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a basic implementation - in real scenario you'd integrate with YouTube API
  -- For now, return NULL so admin can manually enter duration
  RETURN NULL;
END;
$$;