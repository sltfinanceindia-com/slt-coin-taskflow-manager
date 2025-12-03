-- =====================================================
-- MIGRATION PART 1: ADD ENUM VALUES (Must be committed first)
-- =====================================================

-- Add super_admin and org_admin to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_admin';

-- Add super_admin and org_admin to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'org_admin';

-- Create subscription plan type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan_type') THEN
    CREATE TYPE public.subscription_plan_type AS ENUM ('free', 'starter', 'professional', 'enterprise');
  END IF;
END $$;

-- Create organization status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_status') THEN
    CREATE TYPE public.organization_status AS ENUM ('active', 'suspended', 'pending', 'cancelled', 'trial');
  END IF;
END $$;