/**
 * Centralized Navigation Configuration
 * Single source of truth for all navigation items across the app
 * Enhanced with 50+ enterprise features for Finance/HR and Work Management
 */

import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  Coins, 
  Users, 
  BarChart3, 
  FolderOpen,
  BookOpen,
  User,
  Settings,
  MessageSquare,
  Building2,
  Shield,
  Crown,
  CalendarDays,
  MapPin,
  Home,
  Palmtree,
  Target,
  MessageCircle,
  UserCheck,
  AlertTriangle,
  Activity,
  HeartPulse,
  Zap,
  Briefcase,
  TrendingUp,
  Users2,
  FileBox,
  GitBranch,
  Gauge,
  Inbox,
  Wallet,
  Receipt,
  FileText,
  Package,
  PieChart,
  ClipboardCheck,
  Calendar,
  Banknote,
  Tags,
  GanttChart,
  UserCircle,
  LucideIcon,
  Calculator,
  DollarSign,
  FileCheck,
  Award,
  GraduationCap,
  Handshake,
  Scale,
  FileSignature,
  UserPlus,
  UserMinus,
  BadgeCheck,
  ScrollText,
  MessageSquareWarning,
  Gavel,
  TrendingDown,
  Layers,
  GitMerge,
  UserSearch,
  Repeat,
  CalendarClock,
  Flame,
  IterationCw,
  Route,
  Milestone,
  Bug,
  ClipboardList,
  Lightbulb,
  RefreshCcw,
  Link2,
  Timer,
  Coffee,
  ArrowLeftRight,
  Phone,
  Shuffle,
  Building,
  Copy,
  LayoutTemplate,
  ListTodo,
} from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
  adminOnly?: boolean;
  internOnly?: boolean;
  standalone?: boolean;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

/**
 * Pages that have their own routes (not dashboard tabs)
 * Used by AppSidebar, BottomNavigation, GlobalSearch, and other navigation components
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

/**
 * Admin navigation groups - Enhanced with 50+ features
 */
export const adminNavGroups: NavGroup[] = [
  {
    label: "Main",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "Kanban Board", url: "tasks", icon: CheckSquare },
      { title: "Projects", url: "projects", icon: FolderOpen },
      { title: "Updates", url: "updates", icon: Activity },
    ]
  },
  {
    label: "Work Management",
    icon: Briefcase,
    items: [
      { title: "Requests", url: "requests", icon: Inbox },
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Capacity", url: "capacity", icon: Gauge },
      { title: "Shifts", url: "shifts", icon: CalendarDays },
      { title: "Attendance", url: "attendance", icon: MapPin },
      { title: "Leave", url: "leave", icon: Palmtree },
      { title: "WFH", url: "wfh", icon: Home },
      // NEW Work Management Features (25+)
      { title: "Sprint Planning", url: "sprints", icon: IterationCw },
      { title: "Backlog", url: "backlog", icon: ListTodo },
      { title: "Story Points", url: "story-points", icon: Target },
      { title: "Burndown Charts", url: "burndown", icon: TrendingDown },
      { title: "Velocity", url: "velocity", icon: Flame },
      { title: "Release Planning", url: "releases", icon: GitMerge },
      { title: "Roadmap", url: "roadmap", icon: Route },
      { title: "Resource Allocation", url: "resource-allocation", icon: Users2 },
      { title: "Skills Inventory", url: "skills-inventory", icon: GraduationCap },
      { title: "Workload Balancing", url: "workload", icon: Scale },
      { title: "Overtime Tracking", url: "overtime", icon: Timer },
      { title: "Comp-Off", url: "comp-off", icon: RefreshCcw },
      { title: "On-Call Rotation", url: "on-call", icon: Phone },
      { title: "Shift Swapping", url: "shift-swap", icon: ArrowLeftRight },
      { title: "Break Management", url: "breaks", icon: Coffee },
      { title: "Project Templates", url: "project-templates", icon: Copy },
      { title: "Task Templates", url: "task-templates", icon: LayoutTemplate },
      { title: "Recurring Tasks", url: "recurring-tasks", icon: Repeat },
      { title: "Dependencies", url: "dependencies", icon: Link2 },
      { title: "Milestones", url: "milestones", icon: Milestone },
      { title: "Risk Register", url: "risks", icon: AlertTriangle },
      { title: "Issue Tracker", url: "issues", icon: Bug },
      { title: "Meeting Notes", url: "meeting-notes", icon: ClipboardList },
      { title: "Decision Log", url: "decisions", icon: Gavel },
      { title: "Lessons Learned", url: "lessons", icon: Lightbulb },
    ]
  },
  {
    label: "Performance",
    icon: TrendingUp,
    items: [
      { title: "OKRs", url: "okrs", icon: Target },
      { title: "360° Feedback", url: "feedback", icon: MessageCircle },
      { title: "1:1 Meetings", url: "meetings", icon: UserCheck },
      { title: "PIPs", url: "pips", icon: AlertTriangle },
    ]
  },
  {
    label: "Project Controls",
    icon: GitBranch,
    items: [
      { title: "Baselines", url: "baselines", icon: GitBranch },
      { title: "Changes", url: "changes", icon: FileBox },
      { title: "Scoring", url: "scoring", icon: Target },
      { title: "Gantt Chart", url: "gantt", icon: GanttChart },
    ]
  },
  {
    label: "Finance & HR",
    icon: Wallet,
    items: [
      { title: "Payroll", url: "payroll", icon: Wallet },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
      { title: "Expenses", url: "expenses", icon: Receipt },
      { title: "Expense Categories", url: "expense-categories", icon: Tags },
      { title: "Loans & Advances", url: "loans", icon: Banknote },
      { title: "Documents", url: "documents", icon: FileText },
      { title: "Assets", url: "assets", icon: Package },
      { title: "Holidays", url: "holidays", icon: Calendar },
      // NEW Finance & HR Features (25+)
      { title: "Tax Management", url: "tax-management", icon: Calculator },
      { title: "Salary Structure", url: "salary-structure", icon: DollarSign },
      { title: "Salary Revisions", url: "salary-revisions", icon: TrendingUp },
      { title: "Bonus Management", url: "bonus", icon: Award },
      { title: "Reimbursements", url: "reimbursements", icon: Receipt },
      { title: "Statutory Compliance", url: "compliance", icon: Scale },
      { title: "Form 16", url: "form-16", icon: FileCheck },
      { title: "Investment Declarations", url: "investments", icon: PieChart },
      { title: "Employee Benefits", url: "benefits", icon: HeartPulse },
      { title: "Full & Final", url: "full-final", icon: FileSignature },
      { title: "Gratuity", url: "gratuity", icon: Coins },
      { title: "Onboarding", url: "onboarding", icon: UserPlus },
      { title: "Exit Management", url: "exit-management", icon: UserMinus },
      { title: "Contracts", url: "contracts", icon: ScrollText },
      { title: "Background Verification", url: "bgv", icon: UserSearch },
      { title: "Probation Tracking", url: "probation", icon: CalendarClock },
      { title: "Confirmation Letters", url: "confirmations", icon: BadgeCheck },
      { title: "Employee Handbook", url: "handbook", icon: BookOpen },
      { title: "Grievances", url: "grievances", icon: MessageSquareWarning },
      { title: "Disciplinary Actions", url: "disciplinary", icon: Gavel },
      { title: "HR Analytics", url: "hr-analytics", icon: BarChart3 },
      { title: "Compensation Benchmarking", url: "benchmarking", icon: TrendingUp },
      { title: "Succession Planning", url: "succession", icon: Layers },
      { title: "Career Pathing", url: "career-path", icon: Route },
      { title: "Job Postings", url: "job-postings", icon: Briefcase },
      { title: "Recruitment Pipeline", url: "recruitment", icon: Users },
      { title: "Interview Scheduling", url: "interviews", icon: CalendarDays },
      { title: "Offer Management", url: "offers", icon: Handshake },
    ]
  },
  {
    label: "Admin Tools",
    icon: Shield,
    items: [
      { title: "Roles & Permissions", url: "roles", icon: Shield, standalone: true },
      { title: "Org Chart", url: "org-chart", icon: Users2, standalone: true },
      { title: "Templates", url: "templates", icon: FileBox },
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Work Health", url: "work-health", icon: HeartPulse },
      { title: "Automation", url: "automation", icon: Zap },
      { title: "Audit Packs", url: "audit", icon: FileBox },
      { title: "Lifecycle", url: "lifecycle", icon: Users2 },
      { title: "Reports", url: "reports", icon: PieChart },
      { title: "Coins", url: "coins", icon: Coins },
      { title: "Employees", url: "interns", icon: Users },
      { title: "Analytics", url: "analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Resources",
    icon: BookOpen,
    items: [
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
      { title: "Training", url: "training", icon: BookOpen, standalone: true },
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
      { title: "App Feedback", url: "app-feedback", icon: MessageCircle },
    ]
  },
];

/**
 * Intern/Employee navigation groups - Enhanced with relevant features
 */
export const internNavGroups: NavGroup[] = [
  {
    label: "Main",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "My Tasks", url: "tasks", icon: CheckSquare },
      { title: "Projects", url: "projects", icon: FolderOpen },
      { title: "Updates", url: "updates", icon: Activity },
      { title: "Self-Service", url: "self-service", icon: UserCircle },
    ]
  },
  {
    label: "Work Management",
    icon: Briefcase,
    items: [
      { title: "Requests", url: "requests", icon: Inbox },
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
      { title: "My Shifts", url: "shifts", icon: CalendarDays },
      { title: "Attendance", url: "attendance", icon: MapPin },
      { title: "Leave", url: "leave", icon: Palmtree },
      { title: "WFH", url: "wfh", icon: Home },
      { title: "Holidays", url: "holidays", icon: Calendar },
      // Employee-accessible new features
      { title: "My Backlog", url: "backlog", icon: ListTodo },
      { title: "Shift Swap Request", url: "shift-swap", icon: ArrowLeftRight },
      { title: "Overtime Request", url: "overtime", icon: Timer },
      { title: "Comp-Off Request", url: "comp-off", icon: RefreshCcw },
    ]
  },
  {
    label: "Finance",
    icon: Wallet,
    items: [
      { title: "Expenses", url: "expenses", icon: Receipt },
      { title: "Loans & Advances", url: "loans", icon: Banknote },
      // Employee-accessible new features
      { title: "My Payslips", url: "payslips", icon: FileText },
      { title: "Tax Declarations", url: "investments", icon: Calculator },
      { title: "Reimbursements", url: "reimbursements", icon: Receipt },
      { title: "My Benefits", url: "benefits", icon: HeartPulse },
    ]
  },
  {
    label: "Resources",
    icon: BookOpen,
    items: [
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Training", url: "training", icon: BookOpen, standalone: true },
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
      { title: "My Goals", url: "my-goals", icon: Target, standalone: true },
      { title: "My Coins", url: "my-coins", icon: Coins },
      { title: "Analytics", url: "analytics", icon: BarChart3 },
      { title: "Feedback", url: "feedback", icon: MessageCircle },
      { title: "Employee Handbook", url: "handbook", icon: BookOpen },
      { title: "Career Path", url: "career-path", icon: Route },
      { title: "Job Postings", url: "job-postings", icon: Briefcase },
    ]
  },
];

/**
 * Get navigation groups based on user role
 */
export function getNavGroups(isAdmin: boolean): NavGroup[] {
  return isAdmin ? adminNavGroups : internNavGroups;
}

/**
 * Flatten all navigation items for search
 */
export function getAllNavItems(isAdmin: boolean): NavItem[] {
  const groups = getNavGroups(isAdmin);
  return groups.flatMap(group => group.items);
}

/**
 * Find navigation item by URL
 */
export function findNavItem(url: string, isAdmin: boolean): NavItem | undefined {
  return getAllNavItems(isAdmin).find(item => item.url === url);
}

/**
 * Bottom navigation items (mobile)
 */
export const bottomNavItems: NavItem[] = [
  { title: "Home", url: "overview", icon: LayoutDashboard },
  { title: "Tasks", url: "tasks", icon: CheckSquare },
  { title: "Time", url: "time", icon: Clock },
  { title: "Chat", url: "communication", icon: MessageSquare },
  { title: "Profile", url: "profile", icon: User, standalone: true },
];

/**
 * Quick action items for FAB menu
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  adminOnly?: boolean;
}

export const quickActions: QuickAction[] = [
  { id: 'new-task', label: 'New Task', icon: CheckSquare, shortcut: '⌘T' },
  { id: 'log-time', label: 'Log Time', icon: Clock, shortcut: '⌘L' },
  { id: 'new-request', label: 'New Request', icon: Inbox },
  { id: 'new-expense', label: 'New Expense', icon: Receipt },
  { id: 'search', label: 'Search', icon: LayoutDashboard, shortcut: '⌘K' },
];
