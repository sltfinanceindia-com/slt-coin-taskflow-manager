
-- Initialize custom_roles for SLT Finance India organization
INSERT INTO public.custom_roles (organization_id, name, description, role_type, is_system_role, hierarchy_level, is_active, created_by)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Super Admin', 'Full platform access', 'super_admin', true, 100, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Org Admin', 'Organization administrator', 'org_admin', true, 90, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Admin', 'System administrator', 'admin', true, 90, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'HR Admin', 'HR department admin', 'hr_admin', true, 80, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Project Manager', 'Project management access', 'project_manager', true, 80, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Finance Manager', 'Finance module access', 'finance_manager', true, 80, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Manager', 'Team manager', 'manager', true, 70, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Team Lead', 'Team lead', 'team_lead', true, 60, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Employee', 'Regular employee', 'employee', true, 50, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Intern', 'Intern with limited access', 'intern', true, 40, true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87')
ON CONFLICT DO NOTHING;

-- Now seed role_permissions for employee and intern roles (admins bypass permissions)
-- Get role IDs and insert permissions for key modules
DO $$
DECLARE
  v_org_id UUID := '81ce98aa-c524-4872-ab4c-95e66fe49a08';
  v_employee_role_id UUID;
  v_intern_role_id UUID;
  v_manager_role_id UUID;
  v_team_lead_role_id UUID;
  v_hr_admin_role_id UUID;
  v_pm_role_id UUID;
  v_fm_role_id UUID;
BEGIN
  SELECT id INTO v_employee_role_id FROM custom_roles WHERE organization_id = v_org_id AND role_type = 'employee' LIMIT 1;
  SELECT id INTO v_intern_role_id FROM custom_roles WHERE organization_id = v_org_id AND role_type = 'intern' LIMIT 1;
  SELECT id INTO v_manager_role_id FROM custom_roles WHERE organization_id = v_org_id AND role_type = 'manager' LIMIT 1;
  SELECT id INTO v_team_lead_role_id FROM custom_roles WHERE organization_id = v_org_id AND role_type = 'team_lead' LIMIT 1;
  SELECT id INTO v_hr_admin_role_id FROM custom_roles WHERE organization_id = v_org_id AND role_type = 'hr_admin' LIMIT 1;
  SELECT id INTO v_pm_role_id FROM custom_roles WHERE organization_id = v_org_id AND role_type = 'project_manager' LIMIT 1;
  SELECT id INTO v_fm_role_id FROM custom_roles WHERE organization_id = v_org_id AND role_type = 'finance_manager' LIMIT 1;

  -- Employee permissions
  INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope) VALUES
    (v_employee_role_id, v_org_id, 'dashboard', true, false, false, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'tasks', true, true, true, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'attendance', true, true, false, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'leaves', true, true, false, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'time_logs', true, true, true, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'profile', true, false, true, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'calendar', true, true, true, true, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'kudos', true, true, false, false, false, false, 'all'),
    (v_employee_role_id, v_org_id, 'training', true, false, false, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'expenses', true, true, true, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'documents', true, true, false, false, false, false, 'own'),
    (v_employee_role_id, v_org_id, 'announcements', true, false, false, false, false, false, 'all'),
    (v_employee_role_id, v_org_id, 'wfh', true, true, true, false, false, false, 'own')
  ON CONFLICT DO NOTHING;

  -- Intern permissions (view-only for most)
  INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope) VALUES
    (v_intern_role_id, v_org_id, 'dashboard', true, false, false, false, false, false, 'own'),
    (v_intern_role_id, v_org_id, 'tasks', true, false, true, false, false, false, 'own'),
    (v_intern_role_id, v_org_id, 'attendance', true, true, false, false, false, false, 'own'),
    (v_intern_role_id, v_org_id, 'leaves', true, true, false, false, false, false, 'own'),
    (v_intern_role_id, v_org_id, 'time_logs', true, true, true, false, false, false, 'own'),
    (v_intern_role_id, v_org_id, 'profile', true, false, true, false, false, false, 'own'),
    (v_intern_role_id, v_org_id, 'training', true, false, false, false, false, false, 'own'),
    (v_intern_role_id, v_org_id, 'kudos', true, false, false, false, false, false, 'all')
  ON CONFLICT DO NOTHING;

  -- Manager permissions
  INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope) VALUES
    (v_manager_role_id, v_org_id, 'dashboard', true, false, false, false, false, true, 'team'),
    (v_manager_role_id, v_org_id, 'tasks', true, true, true, true, true, true, 'team'),
    (v_manager_role_id, v_org_id, 'attendance', true, true, true, false, true, true, 'team'),
    (v_manager_role_id, v_org_id, 'leaves', true, true, true, false, true, true, 'team'),
    (v_manager_role_id, v_org_id, 'time_logs', true, true, true, false, true, true, 'team'),
    (v_manager_role_id, v_org_id, 'employees', true, false, true, false, false, true, 'team'),
    (v_manager_role_id, v_org_id, 'projects', true, true, true, false, false, true, 'team'),
    (v_manager_role_id, v_org_id, 'kudos', true, true, false, false, false, false, 'all'),
    (v_manager_role_id, v_org_id, 'training', true, true, true, false, false, false, 'team'),
    (v_manager_role_id, v_org_id, 'expenses', true, true, true, false, true, true, 'team'),
    (v_manager_role_id, v_org_id, 'calendar', true, true, true, true, false, true, 'team'),
    (v_manager_role_id, v_org_id, 'announcements', true, true, false, false, false, false, 'team')
  ON CONFLICT DO NOTHING;

  -- Team Lead permissions (similar to manager, team scope)
  INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope) VALUES
    (v_team_lead_role_id, v_org_id, 'dashboard', true, false, false, false, false, false, 'team'),
    (v_team_lead_role_id, v_org_id, 'tasks', true, true, true, false, true, false, 'team'),
    (v_team_lead_role_id, v_org_id, 'attendance', true, true, true, false, false, false, 'team'),
    (v_team_lead_role_id, v_org_id, 'leaves', true, false, false, false, true, false, 'team'),
    (v_team_lead_role_id, v_org_id, 'time_logs', true, true, true, false, false, false, 'team'),
    (v_team_lead_role_id, v_org_id, 'projects', true, true, true, false, false, false, 'team'),
    (v_team_lead_role_id, v_org_id, 'kudos', true, true, false, false, false, false, 'all'),
    (v_team_lead_role_id, v_org_id, 'training', true, false, false, false, false, false, 'team')
  ON CONFLICT DO NOTHING;

  -- HR Admin permissions
  INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope) VALUES
    (v_hr_admin_role_id, v_org_id, 'dashboard', true, false, false, false, false, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'employees', true, true, true, true, true, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'attendance', true, true, true, true, true, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'leaves', true, true, true, true, true, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'onboarding', true, true, true, true, true, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'training', true, true, true, true, true, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'recruitment', true, true, true, true, true, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'grievances', true, true, true, true, true, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'documents', true, true, true, true, false, true, 'all'),
    (v_hr_admin_role_id, v_org_id, 'hr_analytics', true, false, false, false, false, true, 'all')
  ON CONFLICT DO NOTHING;

  -- Project Manager permissions
  INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope) VALUES
    (v_pm_role_id, v_org_id, 'dashboard', true, false, false, false, false, true, 'all'),
    (v_pm_role_id, v_org_id, 'tasks', true, true, true, true, true, true, 'all'),
    (v_pm_role_id, v_org_id, 'projects', true, true, true, true, true, true, 'all'),
    (v_pm_role_id, v_org_id, 'time_logs', true, true, true, false, true, true, 'all'),
    (v_pm_role_id, v_org_id, 'sprints', true, true, true, true, false, true, 'all'),
    (v_pm_role_id, v_org_id, 'issues', true, true, true, true, false, true, 'all')
  ON CONFLICT DO NOTHING;

  -- Finance Manager permissions
  INSERT INTO role_permissions (role_id, organization_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_export, visibility_scope) VALUES
    (v_fm_role_id, v_org_id, 'dashboard', true, false, false, false, false, true, 'all'),
    (v_fm_role_id, v_org_id, 'payroll', true, true, true, true, true, true, 'all'),
    (v_fm_role_id, v_org_id, 'expenses', true, true, true, true, true, true, 'all'),
    (v_fm_role_id, v_org_id, 'budgets', true, true, true, true, true, true, 'all'),
    (v_fm_role_id, v_org_id, 'loans', true, true, true, true, true, true, 'all'),
    (v_fm_role_id, v_org_id, 'reimbursements', true, true, true, true, true, true, 'all'),
    (v_fm_role_id, v_org_id, 'tax', true, true, true, false, false, true, 'all')
  ON CONFLICT DO NOTHING;
END $$;
