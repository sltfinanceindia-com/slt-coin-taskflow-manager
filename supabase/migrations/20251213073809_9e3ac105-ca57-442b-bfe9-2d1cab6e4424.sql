-- Fix the trigger function that references wrong column name
CREATE OR REPLACE FUNCTION check_organization_user_limit()
RETURNS TRIGGER AS $$
DECLARE
  org_record RECORD;
  current_user_count INTEGER;
BEGIN
  -- Get organization with plan info
  SELECT o.*, sp.max_users as plan_max_users
  FROM public.organizations o
  LEFT JOIN public.subscription_plans sp ON o.subscription_plan_id = sp.id
  WHERE o.id = NEW.organization_id
  INTO org_record;
  
  IF org_record IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Count current active users
  SELECT COUNT(*) INTO current_user_count
  FROM public.profiles
  WHERE organization_id = NEW.organization_id AND is_active = true;
  
  -- Check limit (use plan max_users or org max_users)
  IF COALESCE(org_record.plan_max_users, org_record.max_users, 999999) <= current_user_count THEN
    RAISE EXCEPTION 'Organization user limit reached';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;