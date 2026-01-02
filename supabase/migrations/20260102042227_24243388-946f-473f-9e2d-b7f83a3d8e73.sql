-- Fix SECURITY DEFINER functions that are missing search_path protection
-- This prevents SQL injection through search path manipulation

-- Fix increment_user_coins function - add proper search_path protection
CREATE OR REPLACE FUNCTION public.increment_user_coins(p_user_id uuid, p_coins integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verify caller is admin before allowing coin increment
  IF NOT public.is_any_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can increment user coins';
  END IF;
  
  UPDATE public.profiles 
  SET total_coins = COALESCE(total_coins, 0) + p_coins
  WHERE id = p_user_id;
END;
$$;

-- Fix handle_new_user function - ensure proper search_path protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  org_id UUID;
  user_role_value public.app_role;
BEGIN
  -- Get organization_id from metadata or use default
  org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  
  -- If no org_id provided, get the default organization
  IF org_id IS NULL THEN
    SELECT id INTO org_id FROM public.organizations WHERE subdomain = 'slt-finance' LIMIT 1;
  END IF;
  
  -- Get role from metadata (default to 'intern')
  user_role_value := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.app_role, 
    'intern'::public.app_role
  );
  
  -- Insert into profiles with organization_id
  INSERT INTO public.profiles (
    id, 
    user_id, 
    full_name, 
    email,
    organization_id,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    org_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    organization_id = COALESCE(EXCLUDED.organization_id, public.profiles.organization_id),
    updated_at = NOW();
  
  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role, organization_id)
  VALUES (NEW.id, user_role_value, org_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create chat_users entry
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

-- Fix get_current_user_role function - ensure explicit schema qualification
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN (
    SELECT role::TEXT 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$function$;

-- Fix check_and_log_daily_email function if it exists (referenced as check_daily_email_sent)
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

-- Fix cleanup_expired_otps - ensure it has proper search_path (currently has 'public' which should be '')
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
END;
$function$;