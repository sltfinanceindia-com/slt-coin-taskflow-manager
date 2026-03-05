-- Step 2a: Create login_attempts table for account lockout
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL
);

-- Index for fast lockout checks
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts (email, attempted_at DESC);
CREATE INDEX idx_login_attempts_cleanup ON public.login_attempts (attempted_at);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can access (edge function uses service role)
-- No policies for anon/authenticated - they go through the edge function

-- Helper function: check if account is locked (5+ failed in 15 min)
CREATE OR REPLACE FUNCTION public.is_account_locked(p_email TEXT)
RETURNS TABLE(locked BOOLEAN, remaining_minutes INTEGER, failed_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_failed_count INTEGER;
  v_oldest_attempt TIMESTAMPTZ;
  v_lockout_end TIMESTAMPTZ;
BEGIN
  SELECT COUNT(*), MIN(attempted_at)
  INTO v_failed_count, v_oldest_attempt
  FROM login_attempts
  WHERE login_attempts.email = p_email
    AND success = false
    AND attempted_at > now() - INTERVAL '15 minutes';

  IF v_failed_count >= 5 THEN
    v_lockout_end := v_oldest_attempt + INTERVAL '15 minutes';
    RETURN QUERY SELECT 
      true, 
      GREATEST(0, EXTRACT(EPOCH FROM (v_lockout_end - now()))::INTEGER / 60 + 1)::INTEGER,
      v_failed_count;
  ELSE
    RETURN QUERY SELECT false, 0::INTEGER, v_failed_count;
  END IF;
END;
$$;

-- Cleanup function: purge attempts older than 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM login_attempts WHERE attempted_at < now() - INTERVAL '24 hours';
END;
$$;