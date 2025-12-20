-- Initialize defaults for all existing organizations that are missing leave_types
DO $$
DECLARE
  org_rec RECORD;
BEGIN
  FOR org_rec IN 
    SELECT o.id 
    FROM organizations o 
    WHERE NOT EXISTS (
      SELECT 1 FROM leave_types lt WHERE lt.organization_id = o.id
    )
  LOOP
    -- Insert leave types for this org
    INSERT INTO leave_types (organization_id, name, description, days_per_year, is_paid, allow_carry_forward, max_carry_forward_days, color, is_active)
    VALUES 
      (org_rec.id, 'Casual Leave', 'Casual leave for personal matters', 12, true, true, 5, '#3B82F6', true),
      (org_rec.id, 'Sick Leave', 'Medical or health-related leave', 10, true, false, 0, '#EF4444', true),
      (org_rec.id, 'Earned Leave', 'Accumulated leave based on service', 15, true, true, 10, '#10B981', true),
      (org_rec.id, 'Compensatory Off', 'Leave for extra working days', 0, true, false, 0, '#8B5CF6', true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Initialize defaults for all existing organizations that are missing attendance_settings
DO $$
DECLARE
  org_rec RECORD;
BEGIN
  FOR org_rec IN 
    SELECT o.id 
    FROM organizations o 
    WHERE NOT EXISTS (
      SELECT 1 FROM attendance_settings ats WHERE ats.organization_id = o.id
    )
  LOOP
    INSERT INTO attendance_settings (organization_id, work_start_time, work_end_time, late_threshold_minutes, early_leave_threshold_minutes, enable_geo_fencing, geo_fence_radius_meters)
    VALUES (org_rec.id, '09:00:00', '18:00:00', 15, 15, false, 100)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;