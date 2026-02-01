-- Fix function search_path for security definer functions
-- These functions had search_path="" which is a security risk

-- Fix set_is_subtask
CREATE OR REPLACE FUNCTION public.set_is_subtask()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.is_subtask := (NEW.parent_task_id IS NOT NULL);
  RETURN NEW;
END;
$function$;

-- Fix update_sprints_updated_at
CREATE OR REPLACE FUNCTION public.update_sprints_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_task_templates_updated_at  
CREATE OR REPLACE FUNCTION public.update_task_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix audit_profile_changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
      COALESCE(auth.uid(), NEW.user_id)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;