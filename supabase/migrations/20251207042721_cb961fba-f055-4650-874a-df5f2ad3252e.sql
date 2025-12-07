
-- Remove duplicate admin role for admin@sltfinanceindia.com, keeping only super_admin
DELETE FROM user_roles 
WHERE user_id = 'cbc4df08-b653-4006-ab26-20ad66e5e65e' 
AND role = 'admin';

-- Ensure all users in SLT Finance India have proper organization_id in user_roles
UPDATE user_roles 
SET organization_id = '81ce98aa-c524-4872-ab4c-95e66fe49a08'
WHERE user_id IN (
  SELECT user_id FROM profiles WHERE organization_id = '81ce98aa-c524-4872-ab4c-95e66fe49a08'
)
AND organization_id IS NULL;

-- Add 'employee' to user_role enum if not exists
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employee';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
