
-- Add missing values to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hr_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'project_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finance_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'team_lead';
