-- Create notifications table for persistent app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index for fast lookups
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = get_my_profile_id());

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = get_my_profile_id());

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (user_id = get_my_profile_id());

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Function to send notification
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_org_id UUID;
  v_notification_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO v_org_id FROM profiles WHERE id = p_user_id;
  
  INSERT INTO notifications (user_id, organization_id, type, title, message, data)
  VALUES (p_user_id, v_org_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to set trial period for new organizations
CREATE OR REPLACE FUNCTION public.set_organization_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Set 14-day trial for new organizations
  IF NEW.trial_ends_at IS NULL THEN
    NEW.trial_ends_at := now() + INTERVAL '14 days';
    NEW.subscription_status := 'trialing';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for setting trial on new organizations
DROP TRIGGER IF EXISTS set_org_trial_trigger ON public.organizations;
CREATE TRIGGER set_org_trial_trigger
BEFORE INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.set_organization_trial();

-- Update existing organizations without trial_ends_at
UPDATE public.organizations 
SET trial_ends_at = now() + INTERVAL '14 days',
    subscription_status = 'trialing'
WHERE trial_ends_at IS NULL;