-- Create platform_settings table for super admin settings persistence
CREATE TABLE public.platform_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can read/write platform settings
CREATE POLICY "Super admins can manage platform settings"
ON public.platform_settings
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Create platform_announcements table
CREATE TABLE public.platform_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, critical
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  target_audience TEXT NOT NULL DEFAULT 'all', -- all, org_admins, users
  created_by uuid REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;

-- Super admins can manage announcements
CREATE POLICY "Super admins can manage announcements"
ON public.platform_announcements
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- All authenticated users can view active announcements
CREATE POLICY "Users can view active announcements"
ON public.platform_announcements
FOR SELECT
TO authenticated
USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));

-- Create super_admin_audit_log table
CREATE TABLE public.super_admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id uuid,
  entity_name TEXT,
  details JSONB DEFAULT '{}',
  performed_by uuid REFERENCES public.profiles(id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET
);

-- Enable RLS
ALTER TABLE public.super_admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can access audit logs
CREATE POLICY "Super admins can view audit logs"
ON public.super_admin_audit_log
FOR SELECT
USING (public.is_super_admin());

CREATE POLICY "Super admins can insert audit logs"
ON public.super_admin_audit_log
FOR INSERT
WITH CHECK (public.is_super_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_platform_announcements_updated_at
  BEFORE UPDATE ON public.platform_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, category, description) VALUES
  ('platform_name', '"SLT Work Hub"', 'general', 'Name of the platform'),
  ('support_email', '"support@sltworkhub.com"', 'general', 'Support email address'),
  ('max_organizations', '100', 'general', 'Maximum organizations allowed'),
  ('enforce_strong_passwords', 'true', 'security', 'Require strong passwords'),
  ('session_timeout', '60', 'security', 'Session timeout in minutes'),
  ('max_login_attempts', '5', 'security', 'Maximum login attempts before lockout'),
  ('two_factor_required', 'false', 'security', 'Require 2FA for admins'),
  ('email_notifications', 'true', 'email', 'Enable email notifications'),
  ('welcome_emails', 'true', 'email', 'Send welcome emails to new users'),
  ('weekly_reports', 'false', 'email', 'Send weekly activity reports'),
  ('maintenance_mode', 'false', 'system', 'Enable maintenance mode'),
  ('debug_mode', 'false', 'system', 'Enable debug mode');