-- C2: Hardcode 'intern' role in handle_new_user trigger, ignore client metadata role
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  org_id UUID;
BEGIN
  org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  
  IF org_id IS NULL THEN
    SELECT id INTO org_id FROM public.organizations WHERE subdomain = 'slt-finance' LIMIT 1;
  END IF;
  
  INSERT INTO public.profiles (
    id, user_id, full_name, email, organization_id, is_active
  )
  VALUES (
    NEW.id, NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email, org_id, true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    organization_id = COALESCE(EXCLUDED.organization_id, public.profiles.organization_id),
    updated_at = NOW();
  
  -- SECURITY: Always assign 'intern' role, never trust client metadata
  INSERT INTO public.user_roles (user_id, role, organization_id)
  VALUES (NEW.id, 'intern'::public.app_role, org_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.chat_users (user_id, status, organization_id)
  VALUES (NEW.id, 'offline', org_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;