/**
 * Employee and Profile related types
 * Centralized type definitions for user/employee data
 */

export type UserRole = 
  | 'super_admin' 
  | 'org_admin' 
  | 'admin' 
  | 'hr_admin'
  | 'project_manager'
  | 'finance_manager'
  | 'manager' 
  | 'team_lead' 
  | 'employee' 
  | 'intern';

export interface Profile {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  employee_id?: string;
  avatar_url?: string;
  total_coins: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee extends Profile {
  // Extended employee fields
  job_title?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  skills?: string[];
  certifications?: string[];
  manager_id?: string;
  team_id?: string;
}

export interface EmployeeProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface EmployeeSummary {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar_url?: string;
}

export interface EmployeeDirectory {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  employee_id?: string;
  avatar_url?: string;
  is_active: boolean;
  start_date?: string;
}

// User session and presence
export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen?: string;
  status?: 'available' | 'busy' | 'away' | 'offline';
  status_message?: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  profile_id?: string;
  login_at?: string;
  last_activity_at?: string;
  expires_at?: string;
  is_active?: boolean;
  device_info?: Record<string, unknown>;
  ip_address?: string;
  geo_location?: Record<string, unknown>;
  work_mode?: string;
}

// Role-based access control
export interface UserPermissions {
  canManageTasks: boolean;
  canManageProjects: boolean;
  canManageEmployees: boolean;
  canManageCoins: boolean;
  canManageOrganization: boolean;
  canApproveTimesheets: boolean;
  canViewReports: boolean;
  canManageTraining: boolean;
}

export function getRolePermissions(role: UserRole): UserPermissions {
  const adminRoles: UserRole[] = ['super_admin', 'org_admin', 'admin'];
  const hrRoles: UserRole[] = [...adminRoles, 'hr_admin'];
  const projectRoles: UserRole[] = [...adminRoles, 'project_manager'];
  const financeRoles: UserRole[] = [...adminRoles, 'finance_manager', 'hr_admin'];
  const managerRoles: UserRole[] = [...adminRoles, 'manager', 'team_lead'];
  
  return {
    canManageTasks: projectRoles.includes(role) || managerRoles.includes(role),
    canManageProjects: projectRoles.includes(role),
    canManageEmployees: hrRoles.includes(role),
    canManageCoins: adminRoles.includes(role),
    canManageOrganization: adminRoles.includes(role),
    canApproveTimesheets: managerRoles.includes(role) || projectRoles.includes(role),
    canViewReports: managerRoles.includes(role) || hrRoles.includes(role) || financeRoles.includes(role),
    canManageTraining: hrRoles.includes(role),
  };
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    org_admin: 'Organization Admin',
    admin: 'Admin',
    hr_admin: 'HR Admin',
    project_manager: 'Project Manager',
    finance_manager: 'Finance Manager',
    manager: 'Manager',
    team_lead: 'Team Lead',
    employee: 'Employee',
    intern: 'Intern',
  };
  return roleNames[role] || 'User';
}

export function isAdminRole(role: UserRole): boolean {
  return ['super_admin', 'org_admin', 'admin'].includes(role);
}

export function isManagerRole(role: UserRole): boolean {
  return ['super_admin', 'org_admin', 'admin', 'manager', 'team_lead'].includes(role);
}
