
-- Complete profile metadata for all 12 incomplete profiles in SLT Finance India org

-- Admin profiles
UPDATE public.profiles SET department = 'Operations', employee_id = 'SLT-ADM-001' WHERE id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' AND department IS NULL;
UPDATE public.profiles SET department = 'Operations', employee_id = 'SLT-ADM-002', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = 'cbc4df08-b653-4006-ab26-20ad66e5e65e' AND department IS NULL;
UPDATE public.profiles SET department = 'Engineering', employee_id = 'SLT-ADM-003', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = '3952d290-7f3b-4c22-a90f-b94e595bab89' AND department IS NULL;

-- Interns distributed across departments
UPDATE public.profiles SET department = 'Engineering', employee_id = 'SLT-INT-101', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = 'f43dbff8-1e1f-4876-90c5-0dba79547458' AND department IS NULL;
UPDATE public.profiles SET department = 'Engineering', employee_id = 'SLT-INT-102', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = 'ed626b88-9685-4849-98e6-993fe1a01cc6' AND department IS NULL;
UPDATE public.profiles SET department = 'Human Resources', employee_id = 'SLT-INT-103', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = '591c5bc3-d75f-4474-baf9-e6d08db7da80' AND department IS NULL;
UPDATE public.profiles SET department = 'Human Resources', employee_id = 'SLT-INT-104', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = '337c9e37-8ab2-4082-9505-928944696259' AND department IS NULL;
UPDATE public.profiles SET department = 'Finance', employee_id = 'SLT-INT-105', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = '35723941-6ffb-4d9c-b084-e183d654a266';
UPDATE public.profiles SET department = 'Marketing', employee_id = 'SLT-INT-106', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = 'c10cf831-e541-4e0c-99b2-ad54f2e52b7e' AND department IS NULL;
UPDATE public.profiles SET department = 'Operations', employee_id = 'SLT-INT-107', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = '81f48f9b-256f-446c-824b-a9b85cc8c6df' AND department IS NULL;
UPDATE public.profiles SET department = 'Marketing', employee_id = 'SLT-INT-108', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = '812a4a3d-da8f-4cc8-83ad-aade6e9bb530' AND department IS NULL;

-- Test accounts
UPDATE public.profiles SET department = 'Engineering', employee_id = 'SLT-TST-001', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = '469498d6-d94f-4daa-8860-23c2e4cd473c' AND department IS NULL;
UPDATE public.profiles SET department = 'Engineering', employee_id = 'SLT-TST-002', reporting_manager_id = '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87' WHERE id = 'caf68d8d-a4a4-4f54-aa98-b58bcc35375f' AND department IS NULL;
