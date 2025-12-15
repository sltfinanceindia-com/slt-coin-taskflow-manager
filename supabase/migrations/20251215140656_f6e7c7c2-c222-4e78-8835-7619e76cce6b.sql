-- Fix profiles table RLS: Remove overly permissive policy and add organization-based access
DROP POLICY IF EXISTS "Authenticated users can view all profiles for communication" ON public.profiles;

-- Users can view profiles in their own organization
CREATE POLICY "Users can view profiles in same organization" 
ON public.profiles 
FOR SELECT 
USING (
  organization_id = get_user_organization_id()
  OR user_id = auth.uid()
  OR is_super_admin()
);

-- Fix activity_logs RLS: Restrict to same organization
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;

-- Users can only view their own activity logs
CREATE POLICY "Users view own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Admins can view activity logs within their organization
CREATE POLICY "Org admins view org activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (
  organization_id = get_user_organization_id()
  AND is_any_admin(auth.uid())
);

-- Super admins can view all activity logs
CREATE POLICY "Super admins view all activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (is_super_admin());

-- Fix audit_logs: Make them immutable (no UPDATE/DELETE)
-- Drop any existing update/delete policies first
DROP POLICY IF EXISTS "No one can update audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No one can delete audit logs" ON public.audit_logs;

-- Create restrictive policies that prevent all updates and deletes
CREATE POLICY "No one can update audit logs" 
ON public.audit_logs 
FOR UPDATE 
USING (false);

CREATE POLICY "No one can delete audit logs" 
ON public.audit_logs 
FOR DELETE 
USING (false);

-- Restrict audit log viewing to same organization
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Org admins view org audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  organization_id = get_user_organization_id()
  AND is_any_admin(auth.uid())
);

CREATE POLICY "Super admins view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_super_admin());