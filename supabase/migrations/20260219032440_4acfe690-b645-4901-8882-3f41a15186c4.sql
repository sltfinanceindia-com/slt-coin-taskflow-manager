
-- Phase A: Fix auto_create_fnf_settlement function to match actual fnf_settlements schema
CREATE OR REPLACE FUNCTION public.auto_create_fnf_settlement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.fnf_settlements (
      employee_id,
      organization_id,
      last_working_day,
      status,
      basic_salary,
      leave_encashment,
      gratuity,
      bonus,
      other_earnings,
      notice_recovery,
      loan_recovery,
      other_deductions,
      net_payable
    ) VALUES (
      NEW.employee_id,
      NEW.organization_id,
      NEW.last_working_date,
      'pending',
      0, 0, 0, 0, 0, 0, 0, 0, 0
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Phase B: Budget alert trigger on expense_claims
CREATE OR REPLACE FUNCTION public.check_budget_threshold_on_expense()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_budget RECORD;
  v_total_spent NUMERIC;
  v_threshold_amount NUMERIC;
BEGIN
  -- Find matching budget allocation for this expense category and org
  FOR v_budget IN
    SELECT ba.id, ba.department, ba.category, ba.allocated_amount, 
           ba.alert_threshold_percentage, ba.spent_amount
    FROM budget_allocations ba
    WHERE ba.organization_id = NEW.organization_id
      AND ba.status = 'active'
      AND ba.alert_threshold_percentage IS NOT NULL
      AND ba.allocated_amount > 0
  LOOP
    -- Calculate total spent including this new expense
    SELECT COALESCE(SUM(amount), 0) INTO v_total_spent
    FROM expense_claims
    WHERE organization_id = NEW.organization_id
      AND status IN ('approved', 'pending')
      AND category = v_budget.category;

    v_threshold_amount := v_budget.allocated_amount * (v_budget.alert_threshold_percentage / 100.0);

    -- If spending exceeds threshold, create a notification for org admins
    IF v_total_spent >= v_threshold_amount THEN
      INSERT INTO notifications (user_id, organization_id, type, title, message, data)
      SELECT p.id, NEW.organization_id, 'budget_alert',
        'Budget Alert: ' || v_budget.category,
        'Spending in ' || v_budget.category || ' (' || v_budget.department || ') has reached ' 
          || ROUND((v_total_spent / v_budget.allocated_amount) * 100) || '% of the allocated budget.',
        jsonb_build_object('budget_id', v_budget.id, 'spent', v_total_spent, 'allocated', v_budget.allocated_amount)
      FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.user_id
      WHERE p.organization_id = NEW.organization_id
        AND ur.role IN ('org_admin', 'admin');
    END IF;

    -- Update spent_amount on the budget allocation
    UPDATE budget_allocations 
    SET spent_amount = v_total_spent
    WHERE id = v_budget.id;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Create trigger for budget threshold check
DROP TRIGGER IF EXISTS trigger_check_budget_threshold ON expense_claims;
CREATE TRIGGER trigger_check_budget_threshold
  AFTER INSERT ON expense_claims
  FOR EACH ROW
  EXECUTE FUNCTION check_budget_threshold_on_expense();

-- Phase C (partial): Create attendance-to-timelog sync trigger
CREATE OR REPLACE FUNCTION public.sync_attendance_to_time_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- When clock_out_time is set, create/update a time_log entry
  IF NEW.clock_out_time IS NOT NULL AND (OLD.clock_out_time IS NULL OR OLD.clock_out_time IS DISTINCT FROM NEW.clock_out_time) THEN
    INSERT INTO time_logs (
      user_id,
      task_id,
      start_time,
      end_time,
      duration_minutes,
      description,
      organization_id
    ) VALUES (
      NEW.employee_id,
      NULL,
      NEW.clock_in_time,
      NEW.clock_out_time,
      COALESCE(NEW.total_hours, 0) * 60,
      'Auto-logged from attendance on ' || NEW.attendance_date,
      NEW.organization_id
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_sync_attendance_time_log ON attendance_records;
CREATE TRIGGER trigger_sync_attendance_time_log
  AFTER UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION sync_attendance_to_time_log();
