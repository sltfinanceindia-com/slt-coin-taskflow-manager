-- Fix session duration calculation with trigger
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate session duration in minutes when logout_time is updated
  IF NEW.logout_time IS NOT NULL AND OLD.logout_time IS NULL THEN
    NEW.session_duration_minutes := EXTRACT(EPOCH FROM (NEW.logout_time - NEW.login_time)) / 60;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session duration calculation
CREATE TRIGGER update_session_duration
  BEFORE UPDATE ON public.session_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- Create activity_logs table for detailed employee monitoring
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'task_start', 'task_complete', 'task_update', 'idle_start', 'idle_end', 'focus_start', 'focus_end')),
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  duration_minutes INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_user_timestamp ON public.activity_logs(user_id, timestamp DESC);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_task_id ON public.activity_logs(task_id);

-- Create function to get user productivity metrics
CREATE OR REPLACE FUNCTION get_user_productivity_metrics(p_user_id UUID, p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days', p_end_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  total_hours NUMERIC,
  active_hours NUMERIC,
  idle_hours NUMERIC,
  productivity_score NUMERIC,
  task_completion_rate NUMERIC,
  avg_task_duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH session_stats AS (
    SELECT 
      COALESCE(SUM(session_duration_minutes), 0) / 60.0 as total_session_hours,
      COUNT(*) as session_count
    FROM public.session_logs sl
    WHERE sl.user_id = p_user_id
    AND sl.login_time::DATE BETWEEN p_start_date AND p_end_date
    AND sl.logout_time IS NOT NULL
  ),
  task_stats AS (
    SELECT 
      COUNT(*) as total_tasks,
      COUNT(CASE WHEN status = 'verified' THEN 1 END) as completed_tasks,
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_task_hours
    FROM public.tasks t
    WHERE t.assigned_to = p_user_id
    AND t.created_at::DATE BETWEEN p_start_date AND p_end_date
  ),
  activity_stats AS (
    SELECT 
      COALESCE(SUM(CASE WHEN activity_type = 'focus_start' THEN duration_minutes END), 0) / 60.0 as focus_hours,
      COALESCE(SUM(CASE WHEN activity_type = 'idle_start' THEN duration_minutes END), 0) / 60.0 as idle_hours
    FROM public.activity_logs al
    WHERE al.user_id = p_user_id
    AND al.timestamp::DATE BETWEEN p_start_date AND p_end_date
  )
  SELECT 
    ss.total_session_hours,
    GREATEST(ss.total_session_hours - ast.idle_hours, 0) as active_hours,
    ast.idle_hours,
    CASE 
      WHEN ss.total_session_hours > 0 THEN 
        ROUND(((ss.total_session_hours - ast.idle_hours) / ss.total_session_hours) * 100, 2)
      ELSE 0 
    END as productivity_score,
    CASE 
      WHEN ts.total_tasks > 0 THEN 
        ROUND((ts.completed_tasks::NUMERIC / ts.total_tasks) * 100, 2)
      ELSE 0 
    END as task_completion_rate,
    ROUND(COALESCE(ts.avg_task_hours, 0), 2) as avg_task_duration
  FROM session_stats ss
  CROSS JOIN task_stats ts
  CROSS JOIN activity_stats ast;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-track session activity
CREATE OR REPLACE FUNCTION track_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_task_id UUID DEFAULT NULL,
  p_duration_minutes INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    activity_type,
    task_id,
    duration_minutes,
    metadata
  )
  VALUES (
    p_user_id,
    p_activity_type,
    p_task_id,
    p_duration_minutes,
    p_metadata
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;