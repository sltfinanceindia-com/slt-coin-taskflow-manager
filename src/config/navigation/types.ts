/**
 * Navigation Type Definitions
 * Shared types for role-based navigation configuration
 */

import { LucideIcon } from 'lucide-react';

export type AppRole = 
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

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
  standalone?: boolean;
  /** Roles that can access this item */
  allowedRoles?: AppRole[];
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  /** Roles that can see this entire group */
  allowedRoles?: AppRole[];
}

/**
 * Role priority - higher number = more privilege
 */
export const ROLE_PRIORITY: Record<AppRole, number> = {
  'super_admin': 10,
  'org_admin': 9,
  'admin': 9,
  'hr_admin': 8,
  'project_manager': 8,
  'finance_manager': 8,
  'manager': 7,
  'team_lead': 6,
  'employee': 5,
  'intern': 4,
};

/**
 * Role categories for permission grouping
 */
export const ADMIN_ROLES: AppRole[] = ['super_admin', 'org_admin', 'admin'];
export const HR_ROLES: AppRole[] = ['super_admin', 'org_admin', 'admin', 'hr_admin'];
export const PROJECT_ROLES: AppRole[] = ['super_admin', 'org_admin', 'admin', 'project_manager', 'manager'];
export const FINANCE_ROLES: AppRole[] = ['super_admin', 'org_admin', 'admin', 'finance_manager', 'hr_admin'];
export const MANAGER_ROLES: AppRole[] = ['super_admin', 'org_admin', 'admin', 'manager', 'team_lead'];
export const ALL_MANAGER_PLUS: AppRole[] = ['super_admin', 'org_admin', 'admin', 'hr_admin', 'project_manager', 'finance_manager', 'manager', 'team_lead'];

/**
 * Check if role has admin privileges
 */
export function isAdminRole(role: AppRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Check if role has HR access
 */
export function hasHRAccess(role: AppRole): boolean {
  return HR_ROLES.includes(role);
}

/**
 * Check if role has project management access
 */
export function hasProjectAccess(role: AppRole): boolean {
  return PROJECT_ROLES.includes(role);
}

/**
 * Check if role has finance access
 */
export function hasFinanceAccess(role: AppRole): boolean {
  return FINANCE_ROLES.includes(role);
}

/**
 * Check if role has manager-level access (can manage teams)
 */
export function hasManagerAccess(role: AppRole): boolean {
  return MANAGER_ROLES.includes(role);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: AppRole): string {
  const roleNames: Record<AppRole, string> = {
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

/**
 * Get highest priority role from array
 */
export function getHighestPriorityRole(roles: AppRole[]): AppRole {
  if (roles.length === 0) return 'employee';
  return roles.reduce((highest, current) => 
    ROLE_PRIORITY[current] > ROLE_PRIORITY[highest] ? current : highest
  , roles[0]);
}
