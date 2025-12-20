-- Add new columns for organization settings
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS first_day_of_week INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS enabled_features JSONB DEFAULT '{"training": true, "leave_management": true, "attendance": true, "projects": true, "communication": true, "assessments": true, "coin_rewards": true}'::jsonb,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email_notifications": true, "daily_digest": true, "task_reminders": true, "announcement_alerts": true}'::jsonb,
ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{"password_min_length": 8, "require_special_char": true, "session_timeout_minutes": 480, "max_login_attempts": 5}'::jsonb,
ADD COLUMN IF NOT EXISTS logo_url TEXT;