/**
 * Dashboard Tab Registry
 * Lazy-loaded tab components for ModernDashboard
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

export interface TabConfig {
  component: LazyExoticComponent<ComponentType<any>>;
  adminOnly?: boolean;
  internOnly?: boolean;
  redirectTo?: string;
}

/**
 * Registry of all dashboard tab components
 * Components are lazy-loaded to reduce initial bundle size
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
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.TaxManagementTab }))),
    adminOnly: true,
  },
  'salary-structure': {
    component: lazy(() => import('@/components/finance/SalaryStructureManagement').then(m => ({ default: m.SalaryStructureManagement }))),
    adminOnly: true,
  },
  'salary-revisions': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.SalaryRevisionsTab }))),
    adminOnly: true,
  },
  'bonus': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.BonusManagementTab }))),
    adminOnly: true,
  },
  'reimbursements': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.ReimbursementsTab }))),
  },
  'compliance': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.ComplianceTab }))),
    adminOnly: true,
  },
  'form16': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.Form16Tab }))),
    adminOnly: true,
  },
  'investments': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.InvestmentsTab }))),
  },
  'benefits': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.BenefitsTab }))),
  },
  'fnf': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.FnFTab }))),
    adminOnly: true,
  },
  'gratuity': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.GratuityTab }))),
    adminOnly: true,
  },
  'onboarding': {
    component: lazy(() => import('@/components/hr/OnboardingManagement').then(m => ({ default: m.OnboardingManagement }))),
    adminOnly: true,
  },
  'exit': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.ExitManagementTab }))),
    adminOnly: true,
  },
  'contracts': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.ContractsTab }))),
    adminOnly: true,
  },
  'verification': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.VerificationTab }))),
    adminOnly: true,
  },
  'probation': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.ProbationTab }))),
    adminOnly: true,
  },
  'confirmations': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.ConfirmationsTab }))),
    adminOnly: true,
  },
  'handbook': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.HandbookTab }))),
  },
  'grievances': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.GrievancesTab }))),
    adminOnly: true,
  },
  'disciplinary': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.DisciplinaryTab }))),
    adminOnly: true,
  },
  'hr-analytics': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.HRAnalyticsTab }))),
    adminOnly: true,
  },
  'benchmarking': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.BenchmarkingTab }))),
    adminOnly: true,
  },
  'succession': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.SuccessionTab }))),
    adminOnly: true,
  },
  'career-paths': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.CareerPathsTab }))),
  },
  'job-postings': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.JobPostingsTab }))),
    adminOnly: true,
  },
  'recruitment': {
    component: lazy(() => import('@/components/hr/RecruitmentPipeline').then(m => ({ default: m.RecruitmentPipeline }))),
    adminOnly: true,
  },
  'interviews': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.InterviewsTab }))),
    adminOnly: true,
  },
  'offers': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.OffersTab }))),
    adminOnly: true,
  },
  'budget-planning': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.BudgetPlanningTab }))),
    adminOnly: true,
  },
  'cost-centers': {
    component: lazy(() => import('./tabs/FinanceHRFeatures').then(m => ({ default: m.CostCentersTab }))),
    adminOnly: true,
  },

  // Work Management - NEW FEATURES
  'sprints': {
    component: lazy(() => import('@/components/sprints/SprintManagement').then(m => ({ default: m.SprintManagement }))),
    adminOnly: true,
  },
  'backlog': {
    component: lazy(() => import('@/components/backlog/BacklogManagement').then(m => ({ default: m.BacklogManagement }))),
    adminOnly: true,
  },
  'milestones': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.MilestonesTab }))),
  },
  'dependencies': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.DependenciesTab }))),
  },
  'risks': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.RisksTab }))),
    adminOnly: true,
  },
  'issues': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.IssuesTab }))),
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
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.OvertimeTab }))),
    adminOnly: true,
  },
  'comp-off': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.CompOffTab }))),
  },
  'on-call': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.OnCallTab }))),
    adminOnly: true,
  },
  'shift-swap': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.ShiftSwapTab }))),
  },
  'remote-policies': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.RemotePoliciesTab }))),
    adminOnly: true,
  },
  'project-templates': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.ProjectTemplatesTab }))),
    adminOnly: true,
  },
  'task-templates': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.TaskTemplatesTab }))),
    adminOnly: true,
  },
  'recurring-tasks': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.RecurringTasksTab }))),
    adminOnly: true,
  },
  'meeting-notes': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.MeetingNotesTab }))),
  },
  'decisions': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.DecisionsTab }))),
  },
  'lessons': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.LessonsTab }))),
  },
  'work-calendars': {
    component: lazy(() => import('./tabs/WorkManagementFeatures').then(m => ({ default: m.WorkCalendarsTab }))),
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
};

/**
 * Get tab component if user has access
 */
export function getTabComponent(tabId: string, isAdmin: boolean): TabConfig | null {
  const config = tabRegistry[tabId];
  
  if (!config) return null;
  
  // Check access restrictions
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
