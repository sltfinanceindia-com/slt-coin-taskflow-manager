-- Add daily email tracking to prevent spam
ALTER TABLE public.email_notifications 
ADD COLUMN daily_key TEXT GENERATED ALWAYS AS (
  user_id || '_' || email_type || '_' || DATE(sent_at)
) STORED;

-- Create unique index to prevent duplicate daily emails
CREATE UNIQUE INDEX idx_email_notifications_daily_unique 
ON public.email_notifications(daily_key);

-- Add function to check if daily email was already sent
CREATE OR REPLACE FUNCTION public.check_daily_email_sent(
  p_user_id UUID,
  p_email_type TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.email_notifications 
    WHERE user_id = p_user_id 
    AND email_type = p_email_type 
    AND DATE(sent_at) = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;