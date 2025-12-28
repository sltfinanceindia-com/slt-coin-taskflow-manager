-- Security Hardening: Add indexes to new tables for better performance
CREATE INDEX IF NOT EXISTS idx_timesheets_employee_id ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_period_start ON timesheets(period_start);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_timesheet_id ON timesheet_entries(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_work_date ON timesheet_entries(work_date);

CREATE INDEX IF NOT EXISTS idx_holidays_organization_id ON holidays(organization_id);
CREATE INDEX IF NOT EXISTS idx_holidays_holiday_date ON holidays(holiday_date);

CREATE INDEX IF NOT EXISTS idx_loan_requests_employee_id ON loan_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_loan_requests_status ON loan_requests(status);
CREATE INDEX IF NOT EXISTS idx_loan_requests_organization_id ON loan_requests(organization_id);

CREATE INDEX IF NOT EXISTS idx_expense_categories_organization_id ON expense_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_is_active ON expense_categories(is_active);

-- Security Hardening: Update database functions to set explicit search_path
-- Update generate_expense_claim_number function
CREATE OR REPLACE FUNCTION public.generate_expense_claim_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.claim_number := 'EXP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

-- Update mark_card_scratched function
CREATE OR REPLACE FUNCTION public.mark_card_scratched(p_card_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE scratch_cards
  SET 
    is_scratched = TRUE,
    scratch_date = NOW()
  WHERE id = p_card_id AND is_scratched = FALSE;
  
  RETURN FOUND;
END;
$function$;

-- Update check_organization_user_limit function with proper search_path
CREATE OR REPLACE FUNCTION public.check_organization_user_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;