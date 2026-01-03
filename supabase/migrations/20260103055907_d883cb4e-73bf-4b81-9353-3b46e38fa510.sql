-- Phase 2: Enhanced Timesheet System
-- Add billable/non-billable tracking, hours type, and billing rate

-- Add new columns to timesheet_entries table
ALTER TABLE public.timesheet_entries 
ADD COLUMN IF NOT EXISTS is_billable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS billing_rate numeric(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hours_type text DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS client_name text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cost_center text DEFAULT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_project ON public.timesheet_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_task ON public.timesheet_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_billable ON public.timesheet_entries(is_billable);

-- Add new columns to time_logs table for LMS integration
ALTER TABLE public.time_logs 
ADD COLUMN IF NOT EXISTS log_type text DEFAULT 'work',
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_id uuid,
ADD COLUMN IF NOT EXISTS start_time timestamptz,
ADD COLUMN IF NOT EXISTS end_time timestamptz,
ADD COLUMN IF NOT EXISTS duration_minutes integer,
ADD COLUMN IF NOT EXISTS is_synced_to_timesheet boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS timesheet_entry_id uuid REFERENCES public.timesheet_entries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Create indexes for time_logs
CREATE INDEX IF NOT EXISTS idx_time_logs_user ON public.time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_type ON public.time_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_time_logs_source ON public.time_logs(source);

-- Create function to get timesheet summary with billable breakdown
CREATE OR REPLACE FUNCTION public.get_timesheet_summary(
  p_timesheet_id uuid
)
RETURNS TABLE(
  total_hours numeric,
  billable_hours numeric,
  non_billable_hours numeric,
  regular_hours numeric,
  overtime_hours numeric,
  training_hours numeric,
  pto_hours numeric,
  estimated_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(te.regular_hours + COALESCE(te.overtime_hours, 0)), 0) as total_hours,
    COALESCE(SUM(CASE WHEN te.is_billable THEN te.regular_hours + COALESCE(te.overtime_hours, 0) ELSE 0 END), 0) as billable_hours,
    COALESCE(SUM(CASE WHEN NOT COALESCE(te.is_billable, true) THEN te.regular_hours + COALESCE(te.overtime_hours, 0) ELSE 0 END), 0) as non_billable_hours,
    COALESCE(SUM(CASE WHEN te.hours_type = 'regular' OR te.hours_type IS NULL THEN te.regular_hours ELSE 0 END), 0) as regular_hours,
    COALESCE(SUM(COALESCE(te.overtime_hours, 0)), 0) as overtime_hours,
    COALESCE(SUM(CASE WHEN te.hours_type = 'training' THEN te.regular_hours ELSE 0 END), 0) as training_hours,
    COALESCE(SUM(CASE WHEN te.hours_type = 'pto' THEN te.regular_hours ELSE 0 END), 0) as pto_hours,
    COALESCE(SUM(CASE WHEN te.is_billable AND te.billing_rate IS NOT NULL 
      THEN (te.regular_hours + COALESCE(te.overtime_hours, 0)) * te.billing_rate 
      ELSE 0 END), 0) as estimated_revenue
  FROM timesheet_entries te
  WHERE te.timesheet_id = p_timesheet_id;
END;
$$;

-- Create function to sync LMS hours to timesheet
CREATE OR REPLACE FUNCTION public.sync_lms_hours_to_timesheet(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_synced_count INTEGER := 0;
  v_log RECORD;
  v_org_id uuid;
  v_timesheet_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO v_org_id FROM profiles WHERE id = p_user_id;
  
  -- Get or create timesheet for the period
  SELECT id INTO v_timesheet_id
  FROM timesheets
  WHERE user_id = p_user_id
    AND period_start = p_start_date
    AND period_end = p_end_date;
  
  IF v_timesheet_id IS NULL THEN
    INSERT INTO timesheets (user_id, organization_id, period_start, period_end, status)
    VALUES (p_user_id, v_org_id, p_start_date, p_end_date, 'draft')
    RETURNING id INTO v_timesheet_id;
  END IF;
  
  -- Sync unsynced LMS time logs
  FOR v_log IN 
    SELECT * FROM time_logs
    WHERE user_id = p_user_id
      AND log_type = 'training'
      AND is_synced_to_timesheet = false
      AND date_logged BETWEEN p_start_date AND p_end_date
  LOOP
    -- Create timesheet entry for training hours
    INSERT INTO timesheet_entries (
      timesheet_id, work_date, regular_hours, description, 
      hours_type, is_billable, organization_id
    ) VALUES (
      v_timesheet_id,
      v_log.date_logged,
      COALESCE(v_log.duration_minutes, v_log.hours_worked * 60) / 60.0,
      COALESCE(v_log.description, 'LMS Training'),
      'training',
      false,
      v_org_id
    );
    
    -- Mark as synced
    UPDATE time_logs SET is_synced_to_timesheet = true WHERE id = v_log.id;
    v_synced_count := v_synced_count + 1;
  END LOOP;
  
  RETURN v_synced_count;
END;
$$;