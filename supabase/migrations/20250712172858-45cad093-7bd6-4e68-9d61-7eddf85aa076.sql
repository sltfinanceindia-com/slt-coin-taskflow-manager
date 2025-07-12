-- Create tables for Kanban analytics and logging

-- Kanban events log table
CREATE TABLE public.kanban_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  analytics_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kanban metrics table for daily aggregations
CREATE TABLE public.kanban_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_events INTEGER DEFAULT 0,
  status_changes INTEGER DEFAULT 0,
  avg_cycle_time DECIMAL,
  throughput INTEGER DEFAULT 0,
  wip_limit_violations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_kanban_events_task_id ON public.kanban_events(task_id);
CREATE INDEX idx_kanban_events_user_id ON public.kanban_events(user_id);
CREATE INDEX idx_kanban_events_timestamp ON public.kanban_events(timestamp);
CREATE INDEX idx_kanban_events_event_type ON public.kanban_events(event_type);
CREATE INDEX idx_kanban_metrics_date ON public.kanban_metrics(date);

-- Enable Row Level Security
ALTER TABLE public.kanban_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kanban_events
CREATE POLICY "Users can view their own kanban events" 
ON public.kanban_events 
FOR SELECT 
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can insert kanban events" 
ON public.kanban_events 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for kanban_metrics
CREATE POLICY "Admins can manage kanban metrics" 
ON public.kanban_metrics 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view kanban metrics" 
ON public.kanban_metrics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Trigger for updating updated_at on kanban_metrics
CREATE TRIGGER update_kanban_metrics_updated_at
  BEFORE UPDATE ON public.kanban_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate advanced kanban metrics
CREATE OR REPLACE FUNCTION public.calculate_kanban_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  metric_name TEXT,
  metric_value DECIMAL,
  metric_date DATE,
  category TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return cycle time metrics
  RETURN QUERY
  SELECT 
    'avg_cycle_time'::TEXT as metric_name,
    AVG(
      EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 86400
    )::DECIMAL as metric_value,
    t.updated_at::DATE as metric_date,
    'efficiency'::TEXT as category
  FROM public.tasks t
  WHERE t.status = 'verified'
    AND t.updated_at::DATE BETWEEN start_date AND end_date
  GROUP BY t.updated_at::DATE;

  -- Return throughput metrics
  RETURN QUERY
  SELECT 
    'daily_throughput'::TEXT as metric_name,
    COUNT(*)::DECIMAL as metric_value,
    t.updated_at::DATE as metric_date,
    'throughput'::TEXT as category
  FROM public.tasks t
  WHERE t.status = 'verified'
    AND t.updated_at::DATE BETWEEN start_date AND end_date
  GROUP BY t.updated_at::DATE;

  -- Return WIP metrics
  RETURN QUERY
  SELECT 
    'wip_count'::TEXT as metric_name,
    COUNT(*)::DECIMAL as metric_value,
    CURRENT_DATE as metric_date,
    'flow'::TEXT as category
  FROM public.tasks t
  WHERE t.status IN ('assigned', 'in_progress', 'completed');

END;
$$;