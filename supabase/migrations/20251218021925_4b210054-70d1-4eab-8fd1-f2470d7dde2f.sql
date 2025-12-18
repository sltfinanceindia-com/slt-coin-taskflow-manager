-- Fix null organization_ids in leave_balances by getting org from employee's profile
UPDATE leave_balances lb
SET organization_id = p.organization_id
FROM profiles p
WHERE lb.employee_id = p.id
AND lb.organization_id IS NULL;

-- Fix null organization_ids in leave_types by assigning to the first organization
-- (since leave_types without org are likely orphaned)
UPDATE leave_types lt
SET organization_id = (
  SELECT organization_id 
  FROM profiles 
  WHERE organization_id IS NOT NULL 
  LIMIT 1
)
WHERE lt.organization_id IS NULL;

-- Fix null organization_ids in leave_requests by getting org from employee's profile
UPDATE leave_requests lr
SET organization_id = p.organization_id
FROM profiles p
WHERE lr.employee_id = p.id
AND lr.organization_id IS NULL;

-- Add NOT NULL constraints with defaults for future records (optional - skip if issues)
-- ALTER TABLE leave_balances ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE leave_types ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE leave_requests ALTER COLUMN organization_id SET NOT NULL;