/**
 * HR Admin Navigation Groups
 * Navigation specifically for HR Admin role
 * Aligned with TeneXA specification
 */

import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  BookOpen,
  Shield,
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
  TrendingUp,
  Users2,
  FileBox,
  GitBranch,
  Inbox,
  Wallet,
  FileText,
  Calendar,
  Coins,
  Clock,
  Receipt,
  MessageSquare,
  Building2,
  GraduationCap,
  Upload,
} from 'lucide-react';
import { NavGroup } from './types';

/**
 * HR Admin navigation groups
 * Full access to HR modules, employees, attendance, leaves, payroll, 
 * performance, recruitment, training
 */
export const hrAdminNavGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "HR Dashboard", url: "hr-analytics", icon: BarChart3 },
      { title: "Updates", url: "updates", icon: Activity },
    ]
  },
  {
    label: "Employees",
    icon: Users,
    items: [
      { title: "All Employees", url: "interns", icon: Users },
      { title: "Bulk Import", url: "bulk-import", icon: Upload },
      { title: "Employee Analytics", url: "hr-analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Employee Lifecycle",
    icon: UserCheck,
    items: [
      { title: "Onboarding", url: "onboarding", icon: UserCheck },
      { title: "Probation", url: "probation", icon: Clock },
      { title: "Confirmations", url: "confirmations", icon: FileText },
      { title: "Exit Management", url: "exit", icon: Users2 },
    ]
  },
  {
    label: "Organization",
    icon: Building2,
    items: [
      { title: "Org Chart", url: "org-chart", icon: Users2, standalone: true },
      { title: "Departments", url: "departments", icon: Building2 },
      { title: "Teams", url: "teams", icon: Users2 },
      { title: "Locations", url: "locations", icon: MapPin },
    ]
  },
  {
    label: "Documents & Compliance",
    icon: FileText,
    items: [
      { title: "Documents", url: "documents", icon: FileText },
      { title: "Contracts", url: "contracts", icon: FileText },
      { title: "Verification", url: "verification", icon: Shield },
      { title: "Handbook", url: "handbook", icon: BookOpen },
    ]
  },
  {
    label: "Attendance & Leave",
    icon: Clock,
    items: [
      { title: "Attendance", url: "attendance", icon: MapPin },
      { title: "Regularization", url: "regularization", icon: Clock },
      { title: "Shifts", url: "shifts", icon: CalendarDays },
      { title: "Leave Management", url: "leave", icon: Palmtree },
      { title: "WFH", url: "wfh", icon: Home },
      { title: "Holidays", url: "holidays", icon: Calendar },
      { title: "Comp-Off", url: "comp-off", icon: CalendarDays },
      { title: "Shift Swap", url: "shift-swap", icon: CalendarDays },
      { title: "Overtime", url: "overtime", icon: Clock },
    ]
  },
  {
    label: "Payroll & Benefits",
    icon: Wallet,
    items: [
      { title: "Payroll Processing", url: "payroll", icon: Wallet },
      { title: "Salary Structure", url: "salary-structure", icon: Wallet },
      { title: "Salary Revisions", url: "salary-revisions", icon: TrendingUp },
      { title: "Bonus", url: "bonus", icon: Coins },
      { title: "Benefits", url: "benefits", icon: HeartPulse },
      { title: "Expenses", url: "expenses", icon: Receipt },
      { title: "Loans", url: "loans", icon: Wallet },
      { title: "Reimbursements", url: "reimbursements", icon: Receipt },
      { title: "F&F Settlement", url: "fnf", icon: FileBox },
      { title: "Gratuity", url: "gratuity", icon: Coins },
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
      { title: "Career Paths", url: "career-paths", icon: GitBranch },
      { title: "Succession", url: "succession", icon: Users2 },
      { title: "Benchmarking", url: "benchmarking", icon: TrendingUp },
    ]
  },
  {
    label: "Recruitment",
    icon: Users,
    items: [
      { title: "Job Postings", url: "job-postings", icon: Inbox },
      { title: "Applications", url: "recruitment", icon: Users },
      { title: "Interviews", url: "interviews", icon: Calendar },
      { title: "Offers", url: "offers", icon: FileText },
    ]
  },
  {
    label: "Training",
    icon: GraduationCap,
    items: [
      { title: "Programs", url: "training", icon: BookOpen, standalone: true },
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
    ]
  },
  {
    label: "Employee Relations",
    icon: MessageCircle,
    items: [
      { title: "Grievances", url: "grievances", icon: MessageCircle },
      { title: "Disciplinary", url: "disciplinary", icon: AlertTriangle },
    ]
  },
  {
    label: "Reports & Approvals",
    icon: BarChart3,
    items: [
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "HR Analytics", url: "hr-analytics", icon: BarChart3 },
      { title: "Reports", url: "reports", icon: FileBox },
    ]
  },
  {
    label: "Resources",
    icon: BookOpen,
    items: [
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
    ]
  },
];
