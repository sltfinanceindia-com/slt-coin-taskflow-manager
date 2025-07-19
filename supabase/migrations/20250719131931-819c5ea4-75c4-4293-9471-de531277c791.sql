-- Phase 1: Critical Database Security Fixes

-- 1. Fix Database Function Security by adding SET search_path = ''
CREATE OR REPLACE FUNCTION public.calculate_kanban_metrics(start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(metric_name text, metric_value numeric, metric_date date, category text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 2. Fix get_user_productivity_metrics function
CREATE OR REPLACE FUNCTION public.get_user_productivity_metrics(p_user_id uuid, p_start_date date DEFAULT (CURRENT_DATE - '7 days'::interval), p_end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(total_hours numeric, active_hours numeric, idle_hours numeric, productivity_score numeric, task_completion_rate numeric, avg_task_duration numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 3. Fix track_user_activity function
CREATE OR REPLACE FUNCTION public.track_user_activity(p_user_id uuid, p_activity_type text, p_task_id uuid DEFAULT NULL::uuid, p_duration_minutes integer DEFAULT NULL::integer, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 4. Fix check_and_log_daily_email function  
CREATE OR REPLACE FUNCTION public.check_and_log_daily_email(p_user_id uuid, p_email_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  email_sent_today BOOLEAN := FALSE;
BEGIN
  -- Check if email was already sent today
  SELECT EXISTS (
    SELECT 1 FROM public.daily_email_log 
    WHERE user_id = p_user_id 
    AND email_type = p_email_type 
    AND email_date = CURRENT_DATE
  ) INTO email_sent_today;
  
  -- If not sent today, log it and return true (allow sending)
  IF NOT email_sent_today THEN
    INSERT INTO public.daily_email_log (user_id, email_type, email_date)
    VALUES (p_user_id, p_email_type, CURRENT_DATE)
    ON CONFLICT (user_id, email_type, email_date) 
    DO UPDATE SET sent_count = public.daily_email_log.sent_count + 1;
    
    RETURN TRUE;
  END IF;
  
  -- Email already sent today, return false (don't send)
  RETURN FALSE;
END;
$function$;

-- 5. Fix session_logs RLS policies to allow proper user access
DROP POLICY IF EXISTS "Users can insert their own session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Users can update their own session logs" ON public.session_logs;

CREATE POLICY "Users can insert their own session logs" 
ON public.session_logs 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own session logs" 
ON public.session_logs 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));