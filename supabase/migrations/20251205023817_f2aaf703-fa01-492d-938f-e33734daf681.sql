-- Add super_admin role for gopi_komirisetti@sltfinanceindia.com
INSERT INTO public.user_roles (user_id, role, organization_id)
VALUES (
  '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87',
  'super_admin',
  '81ce98aa-c524-4872-ab4c-95e66fe49a08'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove the incorrect 'intern' role for this user
DELETE FROM public.user_roles 
WHERE user_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' 
AND role = 'intern';