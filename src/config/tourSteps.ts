import type { Step } from 'react-joyride';
import type { AppRole } from '@/hooks/useUserRole';

export interface TourStep extends Step {
  roles?: AppRole[];
}

const commonSteps: TourStep[] = [
  {
    target: '[data-testid="app-sidebar"]',
    content: 'This is your main navigation sidebar. Use it to access all modules like Dashboard, Tasks, Projects, Attendance, and more.',
    title: 'Navigation Sidebar',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-overview"]',
    content: 'Your dashboard gives you an at-a-glance view of your key metrics, tasks, and activity. It updates in real-time as you work.',
    title: 'Dashboard Overview',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-builder"]',
    content: 'Customize your dashboard layout by adding, removing, or rearranging widgets to suit your workflow.',
    title: 'Customize Dashboard',
    placement: 'bottom',
    disableBeacon: true,
  },
];

const employeeSteps: TourStep[] = [
  {
    target: '[data-tab-url="tasks"]',
    content: 'View and manage your assigned tasks here. You can track progress, update statuses, and meet deadlines.',
    title: 'My Tasks',
    placement: 'right',
    disableBeacon: true,
    roles: ['employee', 'intern'],
  },
  {
    target: '[data-tab-url="attendance"]',
    content: 'Clock in and out, view your attendance history, and track your working hours from this section.',
    title: 'Attendance Tracking',
    placement: 'right',
    disableBeacon: true,
    roles: ['employee', 'intern'],
  },
  {
    target: '[data-tab-url="leave"]',
    content: 'Apply for leave, check your leave balance, and view the status of your requests.',
    title: 'Leave Management',
    placement: 'right',
    disableBeacon: true,
    roles: ['employee', 'intern'],
  },
  {
    target: '[data-tab-url="communication"]',
    content: 'Stay connected with your team through messages, announcements, and collaboration tools.',
    title: 'Communication Hub',
    placement: 'right',
    disableBeacon: true,
    roles: ['employee', 'intern'],
  },
];

const managerSteps: TourStep[] = [
  {
    target: '[data-tab-url="interns"]',
    content: 'Manage your team members, view their profiles, and oversee their assignments and performance.',
    title: 'Team Management',
    placement: 'right',
    disableBeacon: true,
    roles: ['manager', 'team_lead', 'hr_admin'],
  },
  {
    target: '[data-tab-url="projects"]',
    content: 'Create and manage projects, assign team members, and track milestones using Gantt charts and Kanban boards.',
    title: 'Project Management',
    placement: 'right',
    disableBeacon: true,
    roles: ['manager', 'team_lead', 'project_manager'],
  },
  {
    target: '[data-tab-url="approvals"]',
    content: 'Review and approve leave requests, expense claims, and other pending approvals from your team.',
    title: 'Approvals Queue',
    placement: 'right',
    disableBeacon: true,
    roles: ['manager', 'team_lead', 'hr_admin', 'project_manager', 'finance_manager'],
  },
  {
    target: '[data-tab-url="reports"]',
    content: 'Access reports and analytics to track team performance and project progress.',
    title: 'Reports & Analytics',
    placement: 'right',
    disableBeacon: true,
    roles: ['manager', 'team_lead', 'project_manager'],
  },
];

const adminSteps: TourStep[] = [
  {
    target: '[data-tab-url="interns"]',
    content: 'Manage all employees across the organization. Add, edit, deactivate users and manage their roles.',
    title: 'Employee Directory',
    placement: 'right',
    disableBeacon: true,
    roles: ['admin', 'org_admin', 'super_admin'],
  },
  {
    target: '[data-tab-url="payroll"]',
    content: 'Process payroll, generate payslips, and manage salary structures for all employees.',
    title: 'Payroll Management',
    placement: 'right',
    disableBeacon: true,
    roles: ['admin', 'org_admin', 'super_admin', 'finance_manager'],
  },
  {
    target: '[data-tab-url="reports"]',
    content: 'Generate comprehensive reports on attendance, performance, payroll, and more to make data-driven decisions.',
    title: 'Reports & Analytics',
    placement: 'right',
    disableBeacon: true,
    roles: ['admin', 'org_admin', 'super_admin'],
  },
  {
    target: '[data-tab-url="communication"]',
    content: 'Send announcements, manage team communication channels, and keep everyone informed.',
    title: 'Communication Hub',
    placement: 'right',
    disableBeacon: true,
    roles: ['admin', 'org_admin', 'super_admin'],
  },
];

const financeSteps: TourStep[] = [
  {
    target: '[data-tab-url="payroll"]',
    content: 'Process payroll, manage salary structures, and handle bonus disbursements.',
    title: 'Payroll Processing',
    placement: 'right',
    disableBeacon: true,
    roles: ['finance_manager'],
  },
  {
    target: '[data-tab-url="reports"]',
    content: 'Access financial reports, cost center analysis, and budget tracking.',
    title: 'Financial Reports',
    placement: 'right',
    disableBeacon: true,
    roles: ['finance_manager'],
  },
];

const profileStep: TourStep = {
  target: 'a[href="/profile"]',
  content: 'Access your profile settings, update your information, and find the option to restart this tour anytime.',
  title: 'Profile & Settings',
  placement: 'right',
  disableBeacon: true,
};

export function getTourStepsForRole(role: AppRole): Step[] {
  const isAdmin = ['admin', 'org_admin', 'super_admin'].includes(role);
  const isManager = ['manager', 'team_lead', 'project_manager', 'hr_admin'].includes(role);
  const isFinance = role === 'finance_manager';

  const steps: TourStep[] = [...commonSteps];

  if (isAdmin) {
    steps.push(...adminSteps.filter(s => !s.roles || s.roles.includes(role)));
  } else if (isFinance) {
    steps.push(...financeSteps.filter(s => !s.roles || s.roles.includes(role)));
  } else if (isManager) {
    steps.push(...managerSteps.filter(s => !s.roles || s.roles.includes(role)));
  } else {
    steps.push(...employeeSteps.filter(s => !s.roles || s.roles.includes(role)));
  }

  steps.push(profileStep);

  return steps.map(({ roles, ...step }) => step);
}
