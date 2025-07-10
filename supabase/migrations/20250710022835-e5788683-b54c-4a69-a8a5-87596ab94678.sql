-- Create table to track daily email limits
CREATE TABLE public.daily_email_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  email_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sent_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email_type, email_date)
);

-- Enable RLS
ALTER TABLE public.daily_email_log ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_email_log
CREATE POLICY "Users can view their own email logs" 
ON public.daily_email_log 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all email logs" 
ON public.daily_email_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "System can insert email logs" 
ON public.daily_email_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update email logs" 
ON public.daily_email_log 
FOR UPDATE 
USING (true);

-- Add function to check and log daily email
CREATE OR REPLACE FUNCTION public.check_and_log_daily_email(
  p_user_id UUID,
  p_email_type TEXT
) RETURNS BOOLEAN AS $$
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
    DO UPDATE SET sent_count = daily_email_log.sent_count + 1;
    
    RETURN TRUE;
  END IF;
  
  -- Email already sent today, return false (don't send)
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating updated_at
CREATE TRIGGER update_daily_email_log_updated_at
  BEFORE UPDATE ON public.daily_email_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();