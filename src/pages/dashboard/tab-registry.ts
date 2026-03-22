/**
 * Dashboard Tab Registry
 * Lazy-loaded tab components for ModernDashboard
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';
import type { AppRole } from '@/config/navigation/types';

export interface TabConfig {
  component: LazyExoticComponent<ComponentType<any>>;
  adminOnly?: boolean;
  internOnly?: boolean;
  redirectTo?: string;
  /** Explicit list of roles that can access this tab */
  allowedRoles?: AppRole[];
  /** Required module permission */
  requiredPermission?: { module: string; action: 'view' | 'create' | 'edit' | 'delete' };
}

/**
 * Registry of all dashboard tab components.
 * Components are lazy-loaded to reduce initial bundle size.
 */
export const tabRegistry: Record<string, TabConfig> = {
  // Main tabs - inline rendering (no lazy loading for frequently used)
  overview: {
    component: lazy(() => import('./tabs/OverviewTab').then(m => ({ default: m.OverviewTab }))),
  },
  tasks: {
    component: lazy(() => import('./tabs/TasksTab').then(m => ({ default: m.TasksTab }))),
  },
  
  // Projects
  projects: {
    component: lazy(() => import('@/components/project/ProjectPortfolioHub').then(m => ({ default: m.ProjectPortfolioHub }))),
  },
  
  // Time Management
  time: {
    component: lazy(() => import('./tabs/TimeLogsTab').then(m => ({ default: m.TimeLogsTab }))),
  },
  timesheets: {
    component: lazy(() => import('@/components/timesheets/TimesheetManagement').then(m => ({ default: m.TimesheetManagement }))),
  },
  
  // Workforce
  shifts: {
    component: lazy(() => import('@/components/workforce/ShiftManagement').then(m => ({ default: m.ShiftManagement }))),
    adminOnly: true,
  },
  leave: {
    component: lazy(() => import('@/components/workforce/LeaveManagement').then(m => ({ default: m.LeaveManagement }))),
  },
  attendance: {
    component: lazy(() => import('@/components/workforce/GeoAttendance').then(m => ({ default: m.GeoAttendance }))),
  },
  wfh: {
    component: lazy(() => import('@/components/workforce/WFHManagement').then(m => ({ default: m.WFHManagement }))),
  },
  holidays: {
    component: lazy(() => import('@/components/workforce/HolidayCalendar').then(m => ({ default: m.HolidayCalendar }))),
    adminOnly: true,
  },
  
  // Performance
  okrs: {
    component: lazy(() => import('@/components/performance/OKRManagement').then(m => ({ default: m.OKRManagement }))),
  },
  feedback: {
    component: lazy(() => import('@/components/performance/FeedbackManagement').then(m => ({ default: m.FeedbackManagement }))),
    adminOnly: true,
  },
  meetings: {
    component: lazy(() => import('@/components/performance/OneOnOneMeetings').then(m => ({ default: m.OneOnOneMeetings }))),
  },
  pips: {
    component: lazy(() => import('@/components/performance/PIPManagement').then(m => ({ default: m.PIPManagement }))),
    adminOnly: true,
  },
  
  // Project Controls
  baselines: {
    component: lazy(() => import('@/components/baselines/ProjectBaselineHub').then(m => ({ default: m.ProjectBaselineHub }))),
    adminOnly: true,
  },
  changes: {
    component: lazy(() => import('@/components/changes/ChangeRequestHub').then(m => ({ default: m.ChangeRequestHub }))),
    adminOnly: true,
  },
  scoring: {
    component: lazy(() => import('@/components/scoring/ScoringHub').then(m => ({ default: m.ScoringHub }))),
    adminOnly: true,
  },
  gantt: {
    component: lazy(() => import('@/components/project/GanttChart').then(m => ({ default: m.GanttChart }))),
  },
  
  // Finance & HR - Existing
  payroll: {
    component: lazy(() => import('@/components/finance/PayrollManagement').then(m => ({ default: m.PayrollManagement }))),
    adminOnly: true,
    allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin', 'finance_manager'],
    requiredPermission: { module: 'payroll', action: 'view' },
  },
  expenses: {
    component: lazy(() => import('@/components/expenses/ExpenseManagement').then(m => ({ default: m.ExpenseManagement }))),
  },
  'expense-categories': {
    component: lazy(() => import('@/components/expenses/ExpenseCategoryManager').then(m => ({ default: m.ExpenseCategoryManager }))),
    adminOnly: true,
  },
  loans: {
    component: lazy(() => import('@/components/loans/LoanManagement').then(m => ({ default: m.LoanManagement }))),
  },
  documents: {
    component: lazy(() => import('@/components/documents/DocumentManager').then(m => ({ default: m.DocumentManager }))),
  },
  assets: {
    component: lazy(() => import('@/components/assets/AssetManagement').then(m => ({ default: m.AssetManagement }))),
    adminOnly: true,
  },

  // Finance & HR - NEW FEATURES
  'tax-management': {
    component: lazy(() => import('@/components/finance/TaxManagement').then(m => ({ default: m.TaxManagement }))),
    adminOnly: true,
  },
  'salary-structure': {
    component: lazy(() => import('@/components/finance/SalaryStructureManagement').then(m => ({ default: m.SalaryStructureManagement }))),
    adminOnly: true,
  },
  'salary-revisions': {
    component: lazy(() => import('@/components/finance/SalaryRevisionsManagement').then(m => ({ default: m.SalaryRevisionsManagement }))),
    adminOnly: true,
  },
  'bonus': {
    component: lazy(() => import('@/components/finance/BonusManagement').then(m => ({ default: m.BonusManagement }))),
    adminOnly: true,
  },
  'reimbursements': {
    component: lazy(() => import('@/components/finance/ReimbursementsManagement').then(m => ({ default: m.ReimbursementsManagement }))),
  },
  'compliance': {
    component: lazy(() => import('@/components/finance/ComplianceManagement').then(m => ({ default: m.ComplianceManagement }))),
    adminOnly: true,
  },
  'form16': {
    component: lazy(() => import('@/components/finance/Form16Generator').then(m => ({ default: m.Form16Generator }))),
    adminOnly: true,
  },
  'investments': {
    component: lazy(() => import('@/components/finance/InvestmentDeclarations').then(m => ({ default: m.InvestmentDeclarations }))),
  },
  'benefits': {
    component: lazy(() => import('@/components/hr/BenefitsManagement').then(m => ({ default: m.BenefitsManagement }))),
  },
  'fnf': {
    component: lazy(() => import('@/components/hr/FnFSettlement').then(m => ({ default: m.FnFSettlement }))),
    adminOnly: true,
  },
  'gratuity': {
    component: lazy(() => import('@/components/hr/GratuityManagement').then(m => ({ default: m.GratuityManagement }))),
    adminOnly: true,
  },
  'onboarding': {
    component: lazy(() => import('@/components/hr/OnboardingManagement').then(m => ({ default: m.OnboardingManagement }))),
    adminOnly: true,
    allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin'],
    requiredPermission: { module: 'hr_management', action: 'view' },
  },
  'exit': {
    component: lazy(() => import('@/components/hr/ExitManagement').then(m => ({ default: m.ExitManagement }))),
    adminOnly: true,
  },
  'contracts': {
    component: lazy(() => import('@/components/hr/ContractsManagement').then(m => ({ default: m.ContractsManagement }))),
    adminOnly: true,
  },
  'verification': {
    component: lazy(() => import('@/components/hr/VerificationManagement').then(m => ({ default: m.VerificationManagement }))),
    adminOnly: true,
  },
  'probation': {
    component: lazy(() => import('@/components/hr/ProbationManagement').then(m => ({ default: m.ProbationManagement }))),
    adminOnly: true,
  },
  'confirmations': {
    component: lazy(() => import('@/components/hr/ConfirmationsManagement').then(m => ({ default: m.ConfirmationsManagement }))),
    adminOnly: true,
  },
  'handbook': {
    component: lazy(() => import('@/components/hr/HandbookManagement').then(m => ({ default: m.HandbookManagement }))),
  },
  'grievances': {
    component: lazy(() => import('@/components/hr/GrievanceManagement').then(m => ({ default: m.GrievanceManagement }))),
    adminOnly: true,
  },
  'disciplinary': {
    component: lazy(() => import('@/components/hr/DisciplinaryManagement').then(m => ({ default: m.DisciplinaryManagement }))),
    adminOnly: true,
  },
  'hr-analytics': {
    component: lazy(() => import('@/components/hr/HRAnalytics').then(m => ({ default: m.HRAnalytics }))),
    adminOnly: true,
  },
  'benchmarking': {
    component: lazy(() => import('@/components/hr/BenchmarkingManagement').then(m => ({ default: m.BenchmarkingManagement }))),
    adminOnly: true,
  },
  'succession': {
    component: lazy(() => import('@/components/hr/SuccessionManagement').then(m => ({ default: m.SuccessionManagement }))),
    adminOnly: true,
  },
  'career-paths': {
    component: lazy(() => import('@/components/hr/CareerPathsManagement').then(m => ({ default: m.CareerPathsManagement }))),
  },
  'job-postings': {
    component: lazy(() => import('@/components/hr/JobPostingsManagement').then(m => ({ default: m.JobPostingsManagement }))),
    adminOnly: true,
  },
  'recruitment': {
    component: lazy(() => import('@/components/hr/RecruitmentPipeline').then(m => ({ default: m.RecruitmentPipeline }))),
    adminOnly: true,
    allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin'],
  },
  'interviews': {
    component: lazy(() => import('@/components/hr/InterviewsManagement').then(m => ({ default: m.InterviewsManagement }))),
    adminOnly: true,
  },
  'offers': {
    component: lazy(() => import('@/components/hr/OffersManagement').then(m => ({ default: m.OffersManagement }))),
    adminOnly: true,
  },
  'budget-planning': {
    component: lazy(() => import('@/components/finance/BudgetPlanningManagement').then(m => ({ default: m.BudgetPlanningManagement }))),
    adminOnly: true,
  },
  'cost-centers': {
    component: lazy(() => import('@/components/finance/CostCentersManagement').then(m => ({ default: m.CostCentersManagement }))),
    adminOnly: true,
  },

  // Work Management - NEW FEATURES
  'sprints': {
    component: lazy(() => import('@/components/sprints/SprintManagement').then(m => ({ default: m.SprintManagement }))),
    adminOnly: true,
    allowedRoles: ['super_admin', 'org_admin', 'admin', 'project_manager'],
  },
  'backlog': {
    component: lazy(() => import('@/components/backlog/BacklogManagement').then(m => ({ default: m.BacklogManagement }))),
    adminOnly: true,
  },
  'milestones': {
    component: lazy(() => import('@/components/work/MilestoneManagement').then(m => ({ default: m.MilestoneManagement }))),
  },
  'dependencies': {
    component: lazy(() => import('@/components/work/DependencyManagement').then(m => ({ default: m.DependencyManagement }))),
  },
  'risks': {
    component: lazy(() => import('@/components/work/RiskManagement').then(m => ({ default: m.RiskManagement }))),
    adminOnly: true,
  },
  'issues': {
    component: lazy(() => import('@/components/work/IssueTracker').then(m => ({ default: m.IssueTracker }))),
  },
  'resources': {
    component: lazy(() => import('@/components/resources/ResourceAllocation').then(m => ({ default: m.ResourceAllocationManagement }))),
    adminOnly: true,
  },
  'workload': {
    component: lazy(() => import('@/components/workload/WorkloadBalancing').then(m => ({ default: m.WorkloadBalancing }))),
    adminOnly: true,
  },
  'overtime': {
    component: lazy(() => import('@/components/work/OvertimeManagement').then(m => ({ default: m.OvertimeManagement }))),
    adminOnly: true,
  },
  'comp-off': {
    component: lazy(() => import('@/components/work/CompOffManagement').then(m => ({ default: m.CompOffManagement }))),
  },
  'on-call': {
    component: lazy(() => import('@/components/work/OnCallManagement').then(m => ({ default: m.OnCallManagement }))),
    adminOnly: true,
  },
  'shift-swap': {
    component: lazy(() => import('@/components/work/ShiftSwapManagement').then(m => ({ default: m.ShiftSwapManagement }))),
  },
  'remote-policies': {
    component: lazy(() => import('@/components/work/RemotePoliciesManagement').then(m => ({ default: m.RemotePoliciesManagement }))),
    adminOnly: true,
  },
  'project-templates': {
    component: lazy(() => import('@/components/work/ProjectTemplatesManagement').then(m => ({ default: m.ProjectTemplatesManagement }))),
    adminOnly: true,
  },
  'task-templates': {
    component: lazy(() => import('@/components/work/TaskTemplatesManagement').then(m => ({ default: m.TaskTemplatesManagement }))),
    adminOnly: true,
  },
  'recurring-tasks': {
    component: lazy(() => import('@/components/work/RecurringTasksManagement').then(m => ({ default: m.RecurringTasksManagement }))),
    adminOnly: true,
  },
  'meeting-notes': {
    component: lazy(() => import('@/components/work/MeetingNotesManagement').then(m => ({ default: m.MeetingNotesManagement }))),
  },
  'decisions': {
    component: lazy(() => import('@/components/work/DecisionsManagement').then(m => ({ default: m.DecisionsManagement }))),
  },
  'lessons': {
    component: lazy(() => import('@/components/work/LessonsLearnedManagement').then(m => ({ default: m.LessonsLearnedManagement }))),
  },
  'work-calendars': {
    component: lazy(() => import('@/components/work/WorkCalendarsManagement').then(m => ({ default: m.WorkCalendarsManagement }))),
  },
  
  // Admin Tools
  templates: {
    component: lazy(() => import('./tabs/TemplatesTab').then(m => ({ default: m.TemplatesTab }))),
    adminOnly: true,
  },
  approvals: {
    component: lazy(() => import('./tabs/ApprovalsTab').then(m => ({ default: m.ApprovalsTab }))),
  },
  'work-health': {
    component: lazy(() => import('@/components/health/WorkHealthDashboard').then(m => ({ default: m.WorkHealthDashboard }))),
    adminOnly: true,
  },
  automation: {
    component: lazy(() => import('./tabs/AutomationTab').then(m => ({ default: m.AutomationTab }))),
    adminOnly: true,
  },
  audit: {
    component: lazy(() => import('@/components/audit/AuditHub').then(m => ({ default: m.AuditHub }))),
    adminOnly: true,
  },
  lifecycle: {
    component: lazy(() => import('@/components/lifecycle/LifecycleHub').then(m => ({ default: m.LifecycleHub }))),
    adminOnly: true,
  },
  reports: {
    component: lazy(() => import('@/components/reports/CustomReportBuilder').then(m => ({ default: m.CustomReportBuilder }))),
    adminOnly: true,
  },
  coins: {
    component: lazy(() => import('@/components/CoinManagement').then(m => ({ default: m.CoinManagement }))),
    adminOnly: true,
  },
  interns: {
    component: lazy(() => import('@/components/InternManagement').then(m => ({ default: m.InternManagement }))),
    adminOnly: true,
  },
  analytics: {
    component: lazy(() => import('@/components/AnalyticsPage').then(m => ({ default: m.AnalyticsPage }))),
  },
  
  // Communication
  communication: {
    component: lazy(() => import('@/components/ModernCommunication').then(m => ({ default: m.default }))),
  },
  updates: {
    component: lazy(() => import('@/components/updates/ProjectUpdatesFeed').then(m => ({ default: m.ProjectUpdatesFeed }))),
  },
  
  // User specific
  'my-coins': {
    component: lazy(() => import('@/components/MyCoins').then(m => ({ default: m.MyCoins }))),
    internOnly: true,
  },
  'self-service': {
    component: lazy(() => import('@/components/employee/EmployeeSelfServicePortal').then(m => ({ default: m.EmployeeSelfServicePortal }))),
  },
  'app-feedback': {
    component: lazy(() => import('@/components/feedback/FeedbackForm').then(m => ({ default: m.default }))),
  },
  capacity: {
    component: lazy(() => import('@/components/capacity/CapacityHub').then(m => ({ default: m.CapacityHub }))),
    adminOnly: true,
  },
  requests: {
    component: lazy(() => import('@/components/requests/RequestHub').then(m => ({ default: m.RequestHub }))),
  },
  'my-work': {
    component: lazy(() => import('@/components/mywork/MyWorkCenter').then(m => ({ default: m.MyWorkCenter }))),
  },
  'service-desk': {
    component: lazy(() => import('@/components/servicedesk/ServiceDeskHub').then(m => ({ default: m.ServiceDeskHub }))),
    adminOnly: true,
  },

  // Calendar & Events
  'calendar': {
    component: lazy(() => import('@/components/OrganizationCalendar').then(m => ({ default: m.OrganizationCalendar }))),
  },

  // Organization Management (HR Admin)
  'departments': {
    component: lazy(() => import('@/components/admin/DepartmentManagement').then(m => ({ default: m.DepartmentManagement }))),
    adminOnly: true,
    allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin'],
  },
  'teams': {
    component: lazy(() => import('@/components/admin/TeamManagement').then(m => ({ default: m.TeamManagement }))),
    adminOnly: true,
    allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin'],
  },
  'locations': {
    component: lazy(() => import('@/components/admin/LocationManagement').then(m => ({ default: m.LocationManagement }))),
    adminOnly: true,
    allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin'],
  },

  // Super Admin Tools
  'organizations': {
    component: lazy(() => import('@/components/super-admin/OrganizationsTab').then(m => ({ default: m.OrganizationsTab }))),
    allowedRoles: ['super_admin'],
  },
  'monitoring': {
    component: lazy(() => import('@/components/super-admin/SystemMonitoring').then(m => ({ default: m.SystemMonitoring }))),
    allowedRoles: ['super_admin'],
  },
  'platform-settings': {
    component: lazy(() => import('@/components/super-admin/PlatformSettings').then(m => ({ default: m.PlatformSettings }))),
    allowedRoles: ['super_admin'],
  },

  // Attendance Regularization
  'regularization': {
    component: lazy(() => import('@/components/workforce/AttendanceRegularization').then(m => ({ default: m.AttendanceRegularization }))),
  },
  'attendance-reports': {
    component: lazy(() => import('@/components/workforce/AttendanceReports').then(m => ({ default: m.AttendanceReports }))),
    adminOnly: true,
  },

  // Bulk Operations
  'bulk-import': {
    component: lazy(() => import('@/components/hr/BulkImportExport').then(m => ({ default: m.BulkImportExport }))),
    adminOnly: true,
    allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin'],
  },

  // Employee Self-Service
  'my-payslips': {
    component: lazy(() => import('@/components/employee/MyPayslipsView').then(m => ({ default: m.MyPayslipsView }))),
  },

  // Recognition Module
  'awards-badges': {
    component: lazy(() => import('@/components/recognition/AwardsBadgesManagement').then(m => ({ default: m.AwardsBadgesManagement }))),
    adminOnly: true,
  },
  'employee-of-month': {
    component: lazy(() => import('@/components/recognition/EmployeeOfMonth').then(m => ({ default: m.EmployeeOfMonth }))),
  },
  'recognition-feed': {
    component: lazy(() => import('@/components/recognition/RecognitionFeed').then(m => ({ default: m.RecognitionFeed }))),
  },
};
/**
 * Get tab component if user has access
 * @param tabId - The tab identifier
 * @param isAdmin - Whether the user is an admin (legacy check)
 * @param userRole - The user's specific role for granular access control
 */
export function getTabComponent(
  tabId: string, 
  isAdmin: boolean,
  userRole?: AppRole
): TabConfig | null {
  const config = tabRegistry[tabId];
  
  if (!config) return null;
  
  // Check role-based access (new system)
  if (config.allowedRoles && userRole) {
    if (!config.allowedRoles.includes(userRole)) {
      return null;
    }
  }
  
  // Legacy access restrictions (still supported)
  if (config.adminOnly && !isAdmin) return null;
  if (config.internOnly && isAdmin) return null;
  
  return config;
}

/**
 * Check if tab requires redirect
 */
export function getTabRedirect(tabId: string): string | null {
  const config = tabRegistry[tabId];
  return config?.redirectTo || null;
}

/**
 * Get all tabs a user has access to
 */
export function getAccessibleTabs(isAdmin: boolean, userRole?: AppRole): string[] {
  return Object.keys(tabRegistry).filter(tabId => 
    getTabComponent(tabId, isAdmin, userRole) !== null
  );
}
