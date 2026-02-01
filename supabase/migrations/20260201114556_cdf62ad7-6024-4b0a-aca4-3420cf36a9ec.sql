-- Migration: Add new specialized roles to app_role enum
-- Must be done in separate statements for PostgreSQL enum handling

-- Add hr_admin role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'hr_admin' AND enumtypid = 'public.app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'hr_admin';
    END IF;
END$$;

-- Add project_manager role  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'project_manager' AND enumtypid = 'public.app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'project_manager';
    END IF;
END$$;

-- Add finance_manager role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'finance_manager' AND enumtypid = 'public.app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'finance_manager';
    END IF;
END$$;