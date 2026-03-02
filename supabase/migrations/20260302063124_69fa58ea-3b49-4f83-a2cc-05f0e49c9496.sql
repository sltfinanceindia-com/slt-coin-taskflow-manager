
-- Create default departments
INSERT INTO public.departments (organization_id, name, description, code, color, status)
VALUES 
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Engineering', 'Software development and technology', 'ENG', '#3B82F6', 'active'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Human Resources', 'HR and people management', 'HR', '#10B981', 'active'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Finance', 'Finance and accounting', 'FIN', '#F59E0B', 'active'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Operations', 'Operations and administration', 'OPS', '#8B5CF6', 'active'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Marketing', 'Marketing and communications', 'MKT', '#EF4444', 'active');

-- Assign admin (Gopi Komirisetti) to Engineering as head
UPDATE public.profiles 
SET department_id = (SELECT id FROM public.departments WHERE code = 'ENG' AND organization_id = '81ce98aa-c524-4872-ab4c-95e66fe49a08' LIMIT 1)
WHERE id IN ('6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 'cbc4df08-b653-4006-ab26-20ad66e5e65e');

-- Set department head
UPDATE public.departments 
SET head_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'
WHERE code = 'ENG' AND organization_id = '81ce98aa-c524-4872-ab4c-95e66fe49a08';

-- Assign interns to Engineering
UPDATE public.profiles 
SET department_id = (SELECT id FROM public.departments WHERE code = 'ENG' AND organization_id = '81ce98aa-c524-4872-ab4c-95e66fe49a08' LIMIT 1)
WHERE id IN (
  '2ebb7605-9210-42e6-bddb-7a896563fcef',  -- gopikomirisetti999
  'ed626b88-9685-4849-98e6-993fe1a01cc6',  -- Ganesh
  '337c9e37-8ab2-4082-9505-928944696259',  -- Harsha
  '35723941-6ffb-4d9c-b084-e183d654a266',  -- Khajavali
  'c10cf831-e541-4e0c-99b2-ad54f2e52b7e',  -- Naveen N
  '591c5bc3-d75f-4474-baf9-e6d08db7da80',  -- Tharani
  'f43dbff8-1e1f-4876-90c5-0dba79547458',  -- Vyshnavi
  '81f48f9b-256f-446c-824b-a9b85cc8c6df'   -- Sri latha
);

-- Assign Naveen to HR
UPDATE public.profiles 
SET department_id = (SELECT id FROM public.departments WHERE code = 'HR' AND organization_id = '81ce98aa-c524-4872-ab4c-95e66fe49a08' LIMIT 1)
WHERE id = '812a4a3d-da8f-4cc8-83ad-aade6e9bb530';

-- Assign test users to Operations
UPDATE public.profiles 
SET department_id = (SELECT id FROM public.departments WHERE code = 'OPS' AND organization_id = '81ce98aa-c524-4872-ab4c-95e66fe49a08' LIMIT 1)
WHERE id IN (
  '3952d290-7f3b-4c22-a90f-b94e595bab89',
  '469498d6-d94f-4daa-8860-23c2e4cd473c',
  'caf68d8d-a4a4-4f54-aa98-b58bcc35375f'
);

-- Fix 3: Sync employee role mismatch
UPDATE public.profiles 
SET role = 'employee'
WHERE email = 'gopikomirisetti999@gmail.com';
