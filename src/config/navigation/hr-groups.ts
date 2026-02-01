/**
 * HR Admin Navigation Groups
 * Navigation specifically for HR Admin role
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
    label: "HR Management",
    icon: Users,
    items: [
      { title: "Employees", url: "interns", icon: Users },
      { title: "Onboarding", url: "onboarding", icon: UserCheck },
      { title: "Exit Management", url: "exit", icon: Users2 },
      { title: "Org Chart", url: "org-chart", icon: Users2, standalone: true },
      { title: "Documents", url: "documents", icon: FileText },
      { title: "Contracts", url: "contracts", icon: FileText },
      { title: "Verification", url: "verification", icon: Shield },
      { title: "Probation", url: "probation", icon: Clock },
      { title: "Confirmations", url: "confirmations", icon: FileText },
      { title: "Handbook", url: "handbook", icon: BookOpen },
      { title: "Grievances", url: "grievances", icon: MessageCircle },
      { title: "Disciplinary", url: "disciplinary", icon: AlertTriangle },
    ]
  },
  {
    label: "Attendance & Leave",
    icon: Clock,
    items: [
      { title: "Attendance", url: "attendance", icon: MapPin },
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
    label: "Payroll",
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
    icon: BookOpen,
    items: [
      { title: "Programs", url: "training", icon: BookOpen, standalone: true },
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
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
