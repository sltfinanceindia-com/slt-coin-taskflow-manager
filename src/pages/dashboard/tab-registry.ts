/**
 * Dashboard Tab Registry
 * Lazy-loaded tab components for ModernDashboard
 * Enhanced with 50+ enterprise features
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

export interface TabConfig {
  component: LazyExoticComponent<ComponentType<any>>;
  adminOnly?: boolean;
  internOnly?: boolean;
  redirectTo?: string;
}

// Lazy load the ComingSoon placeholder component
const ComingSoonTab = lazy(() => import('./tabs/ComingSoonTab').then(m => ({ default: m.ComingSoonTab })));

/**
 * Registry of all dashboard tab components
 * Components are lazy-loaded to reduce initial bundle size
 */
export const tabRegistry: Record<string, TabConfig> = {
  // ============================================
  // MAIN TABS
  // ============================================
  overview: {
    component: lazy(() => import('./tabs/OverviewTab').then(m => ({ default: m.OverviewTab }))),
  },
  tasks: {
    component: lazy(() => import('./tabs/TasksTab').then(m => ({ default: m.TasksTab }))),
  },
  projects: {
    component: lazy(() => import('@/components/project/ProjectPortfolioHub').then(m => ({ default: m.ProjectPortfolioHub }))),
  },
  updates: {
    component: lazy(() => import('@/components/updates/ProjectUpdatesFeed').then(m => ({ default: m.ProjectUpdatesFeed }))),
  },
  
  // ============================================
  // WORK MANAGEMENT (Existing)
  // ============================================
  time: {
    component: lazy(() => import('./tabs/TimeLogsTab').then(m => ({ default: m.TimeLogsTab }))),
  },
  timesheets: {
    component: lazy(() => import('@/components/timesheets/TimesheetManagement').then(m => ({ default: m.TimesheetManagement }))),
  },
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
  capacity: {
    component: lazy(() => import('@/components/capacity/CapacityHub').then(m => ({ default: m.CapacityHub }))),
    adminOnly: true,
  },
  requests: {
    component: lazy(() => import('@/components/requests/RequestHub').then(m => ({ default: m.RequestHub }))),
  },
  
  // ============================================
  // WORK MANAGEMENT (NEW - 25+ Features)
  // ============================================
  sprints: { component: ComingSoonTab, adminOnly: true },
  backlog: { component: ComingSoonTab },
  'story-points': { component: ComingSoonTab, adminOnly: true },
  burndown: { component: ComingSoonTab, adminOnly: true },
  velocity: { component: ComingSoonTab, adminOnly: true },
  releases: { component: ComingSoonTab, adminOnly: true },
  roadmap: { component: ComingSoonTab, adminOnly: true },
  'resource-allocation': { component: ComingSoonTab, adminOnly: true },
  'skills-inventory': { component: ComingSoonTab, adminOnly: true },
  workload: { component: ComingSoonTab, adminOnly: true },
  overtime: { component: ComingSoonTab },
  'comp-off': { component: ComingSoonTab },
  'on-call': { component: ComingSoonTab, adminOnly: true },
  'shift-swap': { component: ComingSoonTab },
  breaks: { component: ComingSoonTab, adminOnly: true },
  'project-templates': { component: ComingSoonTab, adminOnly: true },
  'task-templates': { component: ComingSoonTab, adminOnly: true },
  'recurring-tasks': { component: ComingSoonTab, adminOnly: true },
  dependencies: { component: ComingSoonTab, adminOnly: true },
  milestones: { component: ComingSoonTab, adminOnly: true },
  risks: { component: ComingSoonTab, adminOnly: true },
  issues: { component: ComingSoonTab, adminOnly: true },
  'meeting-notes': { component: ComingSoonTab, adminOnly: true },
  decisions: { component: ComingSoonTab, adminOnly: true },
  lessons: { component: ComingSoonTab, adminOnly: true },
  
  // ============================================
  // PERFORMANCE
  // ============================================
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
  
  // ============================================
  // PROJECT CONTROLS
  // ============================================
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
  
  // ============================================
  // FINANCE & HR (Existing)
  // ============================================
  payroll: {
    component: lazy(() => import('@/components/payroll/PayrollDashboard').then(m => ({ default: m.PayrollDashboard }))),
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
  
  // ============================================
  // FINANCE & HR (NEW - 28+ Features)
  // ============================================
  'tax-management': { component: ComingSoonTab, adminOnly: true },
  'salary-structure': { component: ComingSoonTab, adminOnly: true },
  'salary-revisions': { component: ComingSoonTab, adminOnly: true },
  bonus: { component: ComingSoonTab, adminOnly: true },
  reimbursements: { component: ComingSoonTab },
  compliance: { component: ComingSoonTab, adminOnly: true },
  'form-16': { component: ComingSoonTab, adminOnly: true },
  investments: { component: ComingSoonTab },
  benefits: { component: ComingSoonTab },
  'full-final': { component: ComingSoonTab, adminOnly: true },
  gratuity: { component: ComingSoonTab, adminOnly: true },
  onboarding: { component: ComingSoonTab, adminOnly: true },
  'exit-management': { component: ComingSoonTab, adminOnly: true },
  contracts: { component: ComingSoonTab, adminOnly: true },
  bgv: { component: ComingSoonTab, adminOnly: true },
  probation: { component: ComingSoonTab, adminOnly: true },
  confirmations: { component: ComingSoonTab, adminOnly: true },
  handbook: { component: ComingSoonTab },
  grievances: { component: ComingSoonTab, adminOnly: true },
  disciplinary: { component: ComingSoonTab, adminOnly: true },
  'hr-analytics': { component: ComingSoonTab, adminOnly: true },
  benchmarking: { component: ComingSoonTab, adminOnly: true },
  succession: { component: ComingSoonTab, adminOnly: true },
  'career-path': { component: ComingSoonTab },
  'job-postings': { component: ComingSoonTab },
  recruitment: { component: ComingSoonTab, adminOnly: true },
  interviews: { component: ComingSoonTab, adminOnly: true },
  offers: { component: ComingSoonTab, adminOnly: true },
  payslips: { component: ComingSoonTab, internOnly: true },
  
  // ============================================
  // ADMIN TOOLS
  // ============================================
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
  
  // ============================================
  // COMMUNICATION & RESOURCES
  // ============================================
  communication: {
    component: lazy(() => import('@/components/ModernCommunication').then(m => ({ default: m.default }))),
  },
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
