-- Fix the audit_profile_changes function to handle service role operations
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log role changes when there's an actual role change
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Use COALESCE to handle service role operations where auth.uid() is null
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
      COALESCE(auth.uid(), NEW.user_id)  -- Fallback to the user being modified
    );
  END IF;
  
  RETURN NEW;
END;
$$;