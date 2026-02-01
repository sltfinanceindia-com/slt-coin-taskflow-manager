/**
 * Admin Navigation Groups
 * Navigation for Super Admin, Org Admin, and Admin roles
 * Aligned with TeneXA Complete Application Structure
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
  MessageSquare,
  Building2,
  Settings,
  Ticket,
  UserCircle,
  GraduationCap,
  Award,
  FileSearch,
  UserPlus,
  LogOut,
  Mail,
  Network,
  Layers,
} from 'lucide-react';
import { NavGroup } from './types';

/**
 * Super Admin specific navigation (platform management)
 */
export const superAdminGroups: NavGroup[] = [
  {
    label: "Platform",
    icon: Crown,
    items: [
      { title: "Organizations", url: "organizations", icon: Building2 },
      { title: "Platform Settings", url: "platform-settings", icon: Settings },
      { title: "System Monitoring", url: "monitoring", icon: Activity },
      { title: "Super Admin Panel", url: "super-admin", icon: Crown, standalone: true },
    ]
  },
];

/**
 * Full admin navigation groups
 * Restructured to match TeneXA spec hierarchy
 */
export const adminNavGroups: NavGroup[] = [
  // ═══ DASHBOARD ═══
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "My Work", url: "my-work", icon: Inbox },
      { title: "Updates", url: "updates", icon: Activity },
    ]
  },

  // ═══ HR MANAGEMENT ═══
  {
    label: "Employees",
    icon: Users,
    items: [
      { title: "All Employees", url: "interns", icon: Users },
      { title: "Employee Lifecycle", url: "lifecycle", icon: Users2 },
      { title: "Bulk Import/Export", url: "bulk-import", icon: FileBox },
      { title: "HR Analytics", url: "hr-analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Employee Lifecycle",
    icon: UserCircle,
    items: [
      { title: "Onboarding", url: "onboarding", icon: UserPlus },
      { title: "Probation", url: "probation", icon: Clock },
      { title: "Confirmations", url: "confirmations", icon: FileText },
      { title: "Exit Management", url: "exit", icon: LogOut },
    ]
  },
  {
    label: "Organization",
    icon: Building2,
    items: [
      { title: "Org Chart", url: "org-chart", icon: Network, standalone: true },
      { title: "Departments", url: "departments", icon: Building2 },
      { title: "Teams", url: "teams", icon: Users2 },
      { title: "Locations", url: "locations", icon: MapPin },
    ]
  },
  {
    label: "HR Documents",
    icon: FileText,
    items: [
      { title: "Documents", url: "documents", icon: FileText },
      { title: "Contracts", url: "contracts", icon: FileText },
      { title: "Verification", url: "verification", icon: Shield },
      { title: "Handbook", url: "handbook", icon: BookOpen },
    ]
  },
  {
    label: "HR Issues",
    icon: AlertTriangle,
    items: [
      { title: "Grievances", url: "grievances", icon: MessageCircle },
      { title: "Disciplinary", url: "disciplinary", icon: AlertTriangle },
    ]
  },

  // ═══ ATTENDANCE & TIME ═══
  {
    label: "Attendance",
    icon: MapPin,
    items: [
      { title: "Attendance", url: "attendance", icon: MapPin },
      { title: "Regularization", url: "regularization", icon: Clock },
      { title: "Attendance Reports", url: "attendance-reports", icon: BarChart3 },
    ]
  },
  {
    label: "Shifts",
    icon: CalendarDays,
    items: [
      { title: "Shift Management", url: "shifts", icon: CalendarDays },
      { title: "Shift Swap", url: "shift-swap", icon: CalendarDays },
      { title: "On-Call", url: "on-call", icon: CalendarDays },
    ]
  },
  {
    label: "Time Logs",
    icon: Clock,
    items: [
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
      { title: "Overtime", url: "overtime", icon: Clock },
    ]
  },

  // ═══ LEAVE MANAGEMENT ═══
  {
    label: "Leave Management",
    icon: Palmtree,
    items: [
      { title: "Leave Requests", url: "leave", icon: Palmtree },
      { title: "WFH Requests", url: "wfh", icon: Home },
      { title: "Comp-Off", url: "comp-off", icon: CalendarDays },
      { title: "Holidays", url: "holidays", icon: Calendar },
    ]
  },

  // ═══ PAYROLL & FINANCE ═══
  {
    label: "Payroll",
    icon: Wallet,
    items: [
      { title: "Payroll Dashboard", url: "payroll", icon: Wallet },
      { title: "Salary Structure", url: "salary-structure", icon: Wallet },
      { title: "Salary Revisions", url: "salary-revisions", icon: TrendingUp },
      { title: "Bonus", url: "bonus", icon: Coins },
    ]
  },
  {
    label: "Expenses & Loans",
    icon: Receipt,
    items: [
      { title: "Expenses", url: "expenses", icon: Receipt },
      { title: "Expense Categories", url: "expense-categories", icon: Tags },
      { title: "Reimbursements", url: "reimbursements", icon: Receipt },
      { title: "Loans & Advances", url: "loans", icon: Banknote },
    ]
  },
  {
    label: "Benefits & Tax",
    icon: HeartPulse,
    items: [
      { title: "Benefits", url: "benefits", icon: HeartPulse },
      { title: "Tax Management", url: "tax-management", icon: Receipt },
      { title: "Investments", url: "investments", icon: Coins },
      { title: "Form 16", url: "form16", icon: FileText },
      { title: "Gratuity", url: "gratuity", icon: Coins },
      { title: "F&F Settlement", url: "fnf", icon: FileBox },
    ]
  },
  {
    label: "Budget & Compliance",
    icon: PieChart,
    items: [
      { title: "Budget Planning", url: "budget-planning", icon: Wallet },
      { title: "Cost Centers", url: "cost-centers", icon: Building2 },
      { title: "Compliance", url: "compliance", icon: Shield },
    ]
  },

  // ═══ PERFORMANCE MANAGEMENT ═══
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
    label: "Career Development",
    icon: GitBranch,
    items: [
      { title: "Career Paths", url: "career-paths", icon: GitBranch },
      { title: "Succession", url: "succession", icon: Users2 },
      { title: "Benchmarking", url: "benchmarking", icon: TrendingUp },
    ]
  },

  // ═══ PROJECT MANAGEMENT ═══
  {
    label: "Projects",
    icon: FolderOpen,
    items: [
      { title: "All Projects", url: "projects", icon: FolderOpen },
      { title: "Kanban Board", url: "tasks?view=kanban", icon: CheckSquare },
      { title: "Task List", url: "tasks?view=list", icon: CheckSquare },
      { title: "Gantt Chart", url: "gantt", icon: GanttChart },
      { title: "Project Templates", url: "project-templates", icon: FileBox },
    ]
  },
  {
    label: "Sprints & Backlog",
    icon: Target,
    items: [
      { title: "Sprint Planning", url: "sprints", icon: Target },
      { title: "Backlog", url: "backlog", icon: FileBox },
      { title: "Milestones", url: "milestones", icon: Target },
      { title: "Task Templates", url: "task-templates", icon: FileBox },
      { title: "Recurring Tasks", url: "recurring-tasks", icon: Clock },
    ]
  },
  {
    label: "Project Controls",
    icon: GitBranch,
    items: [
      { title: "Dependencies", url: "dependencies", icon: GitBranch },
      { title: "Risks", url: "risks", icon: AlertTriangle },
      { title: "Issues", url: "issues", icon: AlertTriangle },
      { title: "Baselines", url: "baselines", icon: GitBranch },
      { title: "Changes", url: "changes", icon: FileBox },
    ]
  },
  {
    label: "Project Knowledge",
    icon: BookOpen,
    items: [
      { title: "Meeting Notes", url: "meeting-notes", icon: FileText },
      { title: "Decisions", url: "decisions", icon: FileText },
      { title: "Lessons Learned", url: "lessons", icon: BookOpen },
    ]
  },

  // ═══ CAPACITY & RESOURCES ═══
  {
    label: "Capacity",
    icon: Gauge,
    items: [
      { title: "Capacity Dashboard", url: "capacity", icon: Gauge },
      { title: "Resource Allocation", url: "resources", icon: Users2 },
      { title: "Workload", url: "workload", icon: Gauge },
      { title: "Work Calendars", url: "work-calendars", icon: Calendar },
      { title: "Remote Policies", url: "remote-policies", icon: Home },
    ]
  },

  // ═══ RECRUITMENT ═══
  {
    label: "Recruitment",
    icon: UserPlus,
    items: [
      { title: "Job Postings", url: "job-postings", icon: Inbox },
      { title: "Recruitment Pipeline", url: "recruitment", icon: Users },
      { title: "Interviews", url: "interviews", icon: UserCheck },
      { title: "Offers", url: "offers", icon: FileText },
    ]
  },

  // ═══ TRAINING ═══
  {
    label: "Training",
    icon: GraduationCap,
    items: [
      { title: "Training Programs", url: "training", icon: BookOpen, standalone: true },
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
    ]
  },

  // ═══ CALENDAR & EVENTS ═══
  {
    label: "Calendar",
    icon: Calendar,
    items: [
      { title: "Calendar", url: "calendar", icon: Calendar },
      { title: "Service Desk", url: "service-desk", icon: Ticket },
    ]
  },

  // ═══ APPROVALS ═══
  {
    label: "Approvals",
    icon: GitBranch,
    items: [
      { title: "Pending Approvals", url: "approvals", icon: GitBranch },
      { title: "Requests", url: "requests", icon: Inbox },
    ]
  },

  // ═══ ADMIN TOOLS ═══
  {
    label: "Admin Tools",
    icon: Shield,
    items: [
      { title: "Roles & Permissions", url: "roles", icon: Shield, standalone: true },
      { title: "Templates", url: "templates", icon: FileBox },
      { title: "Work Health", url: "work-health", icon: HeartPulse },
      { title: "Automation", url: "automation", icon: Zap },
      { title: "Audit Packs", url: "audit", icon: FileSearch },
      { title: "Reports", url: "reports", icon: PieChart },
      { title: "Scoring", url: "scoring", icon: Target },
      { title: "Analytics", url: "analytics", icon: BarChart3 },
    ]
  },

  // ═══ RECOGNITION & COMMUNICATION ═══
  {
    label: "Recognition",
    icon: Award,
    items: [
      { title: "Coins", url: "coins", icon: Coins },
      { title: "Awards & Badges", url: "awards-badges", icon: Award },
      { title: "Employee of Month", url: "employee-of-month", icon: Award },
      { title: "Recognition Feed", url: "recognition-feed", icon: HeartPulse },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
    ]
  },
  {
    label: "Communication",
    icon: MessageSquare,
    items: [
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
      { title: "App Feedback", url: "app-feedback", icon: MessageCircle },
    ]
  },

  // ═══ ASSETS ═══
  {
    label: "Assets",
    icon: Package,
    items: [
      { title: "Asset Management", url: "assets", icon: Package },
    ]
  },
];
