-- Create training sections table
CREATE TABLE public.training_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training videos table
CREATE TABLE public.training_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training assignments table
CREATE TABLE public.training_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  due_days INTEGER DEFAULT 7,
  max_points INTEGER DEFAULT 100,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress tracking table
CREATE TABLE public.training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_id UUID,
  video_id UUID,
  assignment_id UUID,
  progress_type TEXT NOT NULL CHECK (progress_type IN ('video_watched', 'assignment_submitted', 'section_completed')),
  progress_value DECIMAL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_sections
CREATE POLICY "Everyone can view published training sections" 
ON public.training_sections 
FOR SELECT 
USING (is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage training sections" 
ON public.training_sections 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS policies for training_videos
CREATE POLICY "Everyone can view published training videos" 
ON public.training_videos 
FOR SELECT 
USING (is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage training videos" 
ON public.training_videos 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS policies for training_assignments
CREATE POLICY "Everyone can view published training assignments" 
ON public.training_assignments 
FOR SELECT 
USING (is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage training assignments" 
ON public.training_assignments 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS policies for training_progress
CREATE POLICY "Users can view their own progress" 
ON public.training_progress 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert their own progress" 
ON public.training_progress 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all progress" 
ON public.training_progress 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Add foreign key constraints
ALTER TABLE public.training_videos 
ADD CONSTRAINT training_videos_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES public.training_sections(id) ON DELETE CASCADE;

ALTER TABLE public.training_assignments 
ADD CONSTRAINT training_assignments_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES public.training_sections(id) ON DELETE CASCADE;

ALTER TABLE public.training_videos 
ADD CONSTRAINT training_videos_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.training_assignments 
ADD CONSTRAINT training_assignments_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.training_sections 
ADD CONSTRAINT training_sections_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.training_progress 
ADD CONSTRAINT training_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.training_progress 
ADD CONSTRAINT training_progress_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES public.training_sections(id) ON DELETE CASCADE;

ALTER TABLE public.training_progress 
ADD CONSTRAINT training_progress_video_id_fkey 
FOREIGN KEY (video_id) REFERENCES public.training_videos(id) ON DELETE CASCADE;

ALTER TABLE public.training_progress 
ADD CONSTRAINT training_progress_assignment_id_fkey 
FOREIGN KEY (assignment_id) REFERENCES public.training_assignments(id) ON DELETE CASCADE;

-- Create triggers for updated_at
CREATE TRIGGER update_training_sections_updated_at
BEFORE UPDATE ON public.training_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_videos_updated_at
BEFORE UPDATE ON public.training_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_assignments_updated_at
BEFORE UPDATE ON public.training_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();