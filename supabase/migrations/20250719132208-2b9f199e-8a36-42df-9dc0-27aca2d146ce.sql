-- Create audit logging for role changes and security events
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create security definer function to prevent role self-updates
CREATE OR REPLACE FUNCTION public.can_update_profile(profile_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_profile RECORD;
  requesting_user_role TEXT;
BEGIN
  -- Get current profile data
  SELECT * FROM public.profiles WHERE id = profile_id INTO current_profile;
  
  -- Get requesting user's role
  SELECT role FROM public.profiles WHERE user_id = auth.uid() INTO requesting_user_role;
  
  -- If role is not changing, allow update
  IF current_profile.role::TEXT = new_role THEN
    RETURN TRUE;
  END IF;
  
  -- Only admins can change roles
  IF requesting_user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update profile RLS policy to use the security function
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  (user_id = auth.uid() OR id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  AND public.can_update_profile(id, role::TEXT)
);

-- Create function to log profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      performed_by
    ) VALUES (
      NEW.user_id,
      'role_change',
      'profiles',
      NEW.id,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for profile changes
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();