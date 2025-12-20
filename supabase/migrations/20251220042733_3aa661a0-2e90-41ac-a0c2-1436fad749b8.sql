-- =====================================================
-- RBAC ENHANCEMENT: Custom Roles, Permissions, Reporting Structure
-- =====================================================

-- 1. Extend app_role enum with manager and team_lead
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager' AFTER 'org_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'team_lead' AFTER 'manager';

-- 2. Create custom_roles table for organization-specific roles
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  role_type public.app_role NOT NULL,
  is_system_role BOOLEAN DEFAULT FALSE,
  hierarchy_level INT NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- 3. Create role_permissions table for granular permission control
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_approve BOOLEAN DEFAULT FALSE,
  can_export BOOLEAN DEFAULT FALSE,
  visibility_scope TEXT DEFAULT 'own' CHECK (visibility_scope IN ('own', 'team', 'department', 'all')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, module_name)
);

-- 4. Create reporting_structure table for hierarchy
CREATE TABLE IF NOT EXISTS public.reporting_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  relationship_type TEXT DEFAULT 'direct' CHECK (relationship_type IN ('direct', 'dotted_line')),
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, manager_id, relationship_type)
);

-- 5. Add reporting_manager_id and visibility columns to profiles (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'reporting_manager_id') THEN
    ALTER TABLE public.profiles ADD COLUMN reporting_manager_id UUID REFERENCES public.profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'data_visibility_scope') THEN
    ALTER TABLE public.profiles ADD COLUMN data_visibility_scope TEXT DEFAULT 'own';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'can_approve_leaves') THEN
    ALTER TABLE public.profiles ADD COLUMN can_approve_leaves BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'can_approve_timesheets') THEN
    ALTER TABLE public.profiles ADD COLUMN can_approve_timesheets BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'can_assign_tasks') THEN
    ALTER TABLE public.profiles ADD COLUMN can_assign_tasks BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'custom_role_id') THEN
    ALTER TABLE public.profiles ADD COLUMN custom_role_id UUID REFERENCES public.custom_roles(id);
  END IF;
END $$;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_roles_org ON public.custom_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_reporting_structure_user ON public.reporting_structure(user_id);
CREATE INDEX IF NOT EXISTS idx_reporting_structure_manager ON public.reporting_structure(manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_reporting_manager ON public.profiles(reporting_manager_id);

-- 7. Enable RLS on new tables
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporting_structure ENABLE ROW LEVEL SECURITY;

-- 8. Create SECURITY DEFINER functions to avoid RLS recursion

-- Function to get user's direct reports
CREATE OR REPLACE FUNCTION public.get_direct_reports(p_manager_id UUID) 
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM reporting_structure
  WHERE manager_id = p_manager_id
  AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
$$;

-- Function to get all team members (recursive)
CREATE OR REPLACE FUNCTION public.get_team_members(p_user_id UUID) 
RETURNS TABLE(member_id UUID)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE team AS (
    SELECT user_id FROM reporting_structure WHERE manager_id = p_user_id
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    UNION
    SELECT rs.user_id FROM reporting_structure rs
    JOIN team t ON rs.manager_id = t.user_id
    WHERE (rs.effective_to IS NULL OR rs.effective_to >= CURRENT_DATE)
  )
  SELECT user_id AS member_id FROM team
$$;

-- Function to check module permission
CREATE OR REPLACE FUNCTION public.check_module_permission(
  p_user_id UUID, 
  p_module TEXT, 
  p_action TEXT
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM role_permissions rp
    JOIN custom_roles cr ON rp.role_id = cr.id
    JOIN profiles p ON p.custom_role_id = cr.id
    WHERE p.id = p_user_id
    AND rp.module_name = p_module
    AND (
      (p_action = 'view' AND rp.can_view = TRUE) OR
      (p_action = 'create' AND rp.can_create = TRUE) OR
      (p_action = 'edit' AND rp.can_edit = TRUE) OR
      (p_action = 'delete' AND rp.can_delete = TRUE) OR
      (p_action = 'approve' AND rp.can_approve = TRUE) OR
      (p_action = 'export' AND rp.can_export = TRUE)
    )
  )
$$;

-- Function to get visibility scope for a module
CREATE OR REPLACE FUNCTION public.get_visibility_scope(p_user_id UUID, p_module TEXT) 
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(rp.visibility_scope, 'own')
  FROM role_permissions rp
  JOIN custom_roles cr ON rp.role_id = cr.id
  JOIN profiles p ON p.custom_role_id = cr.id
  WHERE p.id = p_user_id AND rp.module_name = p_module
  LIMIT 1
$$;

-- Function to initialize default roles for an organization
CREATE OR REPLACE FUNCTION public.initialize_default_roles(p_org_id UUID, p_created_by UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_admin_id UUID;
  v_manager_id UUID;
  v_team_lead_id UUID;
  v_employee_id UUID;
  v_intern_id UUID;
  v_modules TEXT[] := ARRAY['tasks', 'attendance', 'leave', 'time_logs', 'projects', 'employees', 'reports', 'coins', 'settings', 'communication', 'training'];
  v_module TEXT;
BEGIN
  -- Insert default roles
  INSERT INTO custom_roles (organization_id, name, description, role_type, is_system_role, hierarchy_level, created_by)
  VALUES 
    (p_org_id, 'Organization Admin', 'Full control over the organization', 'org_admin', TRUE, 5, p_created_by)
  RETURNING id INTO v_org_admin_id;
  
  INSERT INTO custom_roles (organization_id, name, description, role_type, is_system_role, hierarchy_level, created_by)
  VALUES 
    (p_org_id, 'Manager', 'Department manager with team oversight', 'manager', TRUE, 4, p_created_by)
  RETURNING id INTO v_manager_id;
  
  INSERT INTO custom_roles (organization_id, name, description, role_type, is_system_role, hierarchy_level, created_by)
  VALUES 
    (p_org_id, 'Team Lead', 'Team leader with limited management capabilities', 'team_lead', TRUE, 3, p_created_by)
  RETURNING id INTO v_team_lead_id;
  
  INSERT INTO custom_roles (organization_id, name, description, role_type, is_system_role, hierarchy_level, created_by)
  VALUES 
    (p_org_id, 'Employee', 'Standard employee access', 'employee', TRUE, 2, p_created_by)
  RETURNING id INTO v_employee_id;
  
  INSERT INTO custom_roles (organization_id, name, description, role_type, is_system_role, hierarchy_level, created_by)
  VALUES 
    (p_org_id, 'Intern', 'Limited access for interns', 'intern', TRUE, 1, p_created_by)
  RETURNING id INTO v_intern_id;

  -- Insert permissions for each role and module
  FOREACH v_module IN ARRAY v_modules
  LOOP
    -- Org Admin: Full access to everything
    INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope)
    VALUES (v_org_admin_id, p_org_id, v_module, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'all');
    
    -- Manager: Full department access
    INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope)
    VALUES (v_manager_id, p_org_id, v_module, TRUE, 
      v_module NOT IN ('settings'), 
      v_module NOT IN ('settings'), 
      v_module IN ('tasks', 'projects'), 
      v_module IN ('tasks', 'leave', 'time_logs', 'attendance'), 
      TRUE, 
      'department');
    
    -- Team Lead: Team access only
    INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope)
    VALUES (v_team_lead_id, p_org_id, v_module, TRUE, 
      v_module IN ('tasks', 'communication'), 
      v_module IN ('tasks'), 
      FALSE, 
      v_module IN ('tasks', 'leave', 'time_logs'), 
      v_module NOT IN ('settings', 'employees'), 
      'team');
    
    -- Employee: Own data only
    INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope)
    VALUES (v_employee_id, p_org_id, v_module, 
      v_module NOT IN ('settings', 'employees'), 
      v_module IN ('tasks', 'leave', 'time_logs', 'communication'), 
      v_module IN ('tasks'), 
      FALSE, 
      FALSE, 
      FALSE, 
      'own');
    
    -- Intern: Very limited access
    INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope)
    VALUES (v_intern_id, p_org_id, v_module, 
      v_module IN ('tasks', 'attendance', 'training', 'communication'), 
      v_module IN ('attendance', 'time_logs'), 
      FALSE, 
      FALSE, 
      FALSE, 
      FALSE, 
      'own');
  END LOOP;
END;
$$;

-- 9. RLS Policies for custom_roles
CREATE POLICY "Users can view roles in their org" ON public.custom_roles
FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage roles" ON public.custom_roles
FOR ALL USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- 10. RLS Policies for role_permissions
CREATE POLICY "Users can view permissions in their org" ON public.role_permissions
FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage permissions" ON public.role_permissions
FOR ALL USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- 11. RLS Policies for reporting_structure
CREATE POLICY "Users can view reporting structure in their org" ON public.reporting_structure
FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage reporting structure" ON public.reporting_structure
FOR ALL USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

CREATE POLICY "Users can view their own reporting relationships" ON public.reporting_structure
FOR SELECT USING (user_id = get_my_profile_id() OR manager_id = get_my_profile_id());