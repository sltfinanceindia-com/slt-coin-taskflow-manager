-- Create missing profile for existing user
INSERT INTO profiles (id, user_id, full_name, email, organization_id, role, is_active, total_coins)
VALUES (
  '16c23692-4d7f-46ed-9e7c-4ea84f34bb90',
  '16c23692-4d7f-46ed-9e7c-4ea84f34bb90',
  'Gop(Test)',
  'tester@gmail.com',
  '9d0910a0-eff0-4247-bc77-5487cd60bb60',
  'org_admin',
  true,
  0
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  organization_id = EXCLUDED.organization_id,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;