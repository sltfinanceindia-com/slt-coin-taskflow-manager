
-- Add org_admin role for admin@sltfinanceindia.com so they can manage SLT Finance India
INSERT INTO user_roles (user_id, role, organization_id)
SELECT 
  'cbc4df08-b653-4006-ab26-20ad66e5e65e',
  'org_admin'::app_role,
  '81ce98aa-c524-4872-ab4c-95e66fe49a08'
ON CONFLICT (user_id, role) DO NOTHING;

-- Clean up duplicate entries - keep only unique user_id + role combinations
-- This is just documentation since we already have unique constraint
