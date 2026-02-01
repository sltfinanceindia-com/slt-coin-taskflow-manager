/**
 * Navigation Configuration Index
 * Central export point for all navigation configurations
 */

// Export types
export * from './types';

// Export role-specific navigation groups
export { adminNavGroups, superAdminGroups } from './admin-groups';
export { hrAdminNavGroups } from './hr-groups';
export { projectManagerNavGroups } from './pm-groups';
export { financeManagerNavGroups } from './finance-groups';
export { managerNavGroups, teamLeadNavGroups } from './manager-groups';
export { employeeNavGroups, internNavGroups } from './employee-groups';

import { NavGroup, AppRole, ADMIN_ROLES } from './types';
import { adminNavGroups, superAdminGroups } from './admin-groups';
import { hrAdminNavGroups } from './hr-groups';
import { projectManagerNavGroups } from './pm-groups';
import { financeManagerNavGroups } from './finance-groups';
import { managerNavGroups, teamLeadNavGroups } from './manager-groups';
import { employeeNavGroups, internNavGroups } from './employee-groups';

/**
 * Get navigation groups for a specific role
 */
export function getNavGroupsForRole(role: AppRole): NavGroup[] {
  switch (role) {
    case 'super_admin':
      return [...superAdminGroups, ...adminNavGroups];
    case 'org_admin':
    case 'admin':
      return adminNavGroups;
    case 'hr_admin':
      return hrAdminNavGroups;
    case 'project_manager':
      return projectManagerNavGroups;
    case 'finance_manager':
      return financeManagerNavGroups;
    case 'manager':
      return managerNavGroups;
    case 'team_lead':
      return teamLeadNavGroups;
    case 'employee':
      return employeeNavGroups;
    case 'intern':
    default:
      return internNavGroups;
  }
}

/**
 * Check if role should see admin navigation
 */
export function isAdminNavigation(role: AppRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Filter navigation groups based on enabled organization features
 */
export function filterNavGroupsByFeatures(
  groups: NavGroup[],
  enabledFeatures: Partial<Record<string, boolean>> | null | undefined
): NavGroup[] {
  const features = enabledFeatures || {};
  // Feature to navigation item mapping
  const featureNavMapping: Record<string, string[]> = {
    training: ['training', 'tutorial'],
    leave_management: ['leave', 'wfh', 'holidays', 'comp-off'],
    attendance: ['attendance', 'shifts', 'shift-swap', 'on-call'],
    projects: ['projects', 'tasks', 'sprints', 'backlog', 'milestones', 'dependencies', 'risks', 'issues', 'gantt', 'project-templates', 'task-templates', 'recurring-tasks'],
    communication: ['communication', 'kudos', 'pulse-surveys', 'app-feedback'],
    assessments: ['assessments'],
    coin_rewards: ['coins', 'my-coins'],
    hr_management: ['onboarding', 'exit', 'contracts', 'verification', 'probation', 'confirmations', 'handbook', 'grievances', 'disciplinary', 'hr-analytics', 'succession', 'career-paths', 'job-postings', 'recruitment', 'interviews', 'offers'],
    finance: ['payroll', 'expenses', 'expense-categories', 'loans', 'tax-management', 'salary-structure', 'salary-revisions', 'bonus', 'reimbursements', 'compliance', 'form16', 'investments', 'benefits', 'fnf', 'gratuity', 'budget-planning', 'cost-centers'],
    work_management: ['time', 'timesheets', 'capacity', 'resources', 'workload', 'overtime', 'remote-policies', 'meeting-notes', 'decisions', 'lessons', 'work-calendars'],
    performance: ['okrs', 'feedback', 'meetings', 'pips', 'my-goals'],
  };

  // Always show these items regardless of feature flags
  const alwaysShow = [
    'overview', 'updates', 'requests', 'interns', 'analytics', 'roles', 'org-chart',
    'templates', 'approvals', 'work-health', 'automation', 'audit', 'lifecycle',
    'reports', 'baselines', 'changes', 'scoring', 'documents', 'assets',
    'benchmarking', 'self-service', 'my-work', 'service-desk'
  ];

  return groups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // Always show core items
      if (alwaysShow.includes(item.url)) return true;

      // Check if this item's feature is enabled
      for (const [feature, urls] of Object.entries(featureNavMapping)) {
        if (urls.includes(item.url)) {
          // Default to true if feature not explicitly set
          return (features as Record<string, boolean>)[feature] !== false;
        }
      }

      // Show by default if not mapped
      return true;
    })
  })).filter(group => group.items.length > 0);
}

/**
 * Standalone routes that navigate to their own pages
 */
export const standaloneRoutes: Record<string, string> = {
  'training': '/training',
  'tutorial': '/tutorial',
  'kudos': '/kudos',
  'pulse-surveys': '/pulse-surveys',
  'my-goals': '/my-goals',
  'profile': '/profile',
  'roles': '/admin/roles-permissions',
  'org-chart': '/organization/chart',
  'settings': '/admin/organization-settings',
  'super-admin': '/super-admin',
};

/**
 * Check if a tab should navigate to a standalone route
 */
export function isStandaloneRoute(tab: string): boolean {
  return tab in standaloneRoutes;
}

/**
 * Get the route for a tab (standalone or dashboard)
 */
export function getRouteForTab(tab: string): string {
  return standaloneRoutes[tab] || `/dashboard?tab=${tab}`;
}
