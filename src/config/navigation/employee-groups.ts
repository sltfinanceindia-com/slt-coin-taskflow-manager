/**
 * Employee & Intern Navigation Groups
 * Navigation for Employee and Intern roles (self-service focused)
 * Aligned with TeneXA specification
 */

import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  FolderOpen,
  BookOpen,
  CalendarDays,
  MapPin,
  Home,
  Palmtree,
  Target,
  MessageCircle,
  Activity,
  HeartPulse,
  GitBranch,
  Inbox,
  Calendar,
  MessageSquare,
  ClipboardCheck,
  Receipt,
  UserCircle,
  Coins,
  Banknote,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { NavGroup } from './types';

/**
 * Employee navigation groups
 * Own data, assigned tasks, self-service
 */
export const employeeNavGroups: NavGroup[] = [
  {
    label: "Main",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "My Work", url: "my-work", icon: Inbox },
      { title: "My Tasks", url: "tasks", icon: CheckSquare },
      { title: "Projects", url: "projects", icon: FolderOpen },
      { title: "Updates", url: "updates", icon: Activity },
    ]
  },
  {
    label: "Self-Service",
    icon: UserCircle,
    items: [
      { title: "Self-Service Portal", url: "self-service", icon: UserCircle },
      { title: "My Documents", url: "documents", icon: FileText },
    ]
  },
  {
    label: "Time & Attendance",
    icon: Clock,
    items: [
      { title: "Attendance", url: "attendance", icon: MapPin },
      { title: "Regularization", url: "regularization", icon: Clock },
      { title: "My Shifts", url: "shifts", icon: CalendarDays },
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
    ]
  },
  {
    label: "Leave",
    icon: Palmtree,
    items: [
      { title: "Apply Leave", url: "leave", icon: Palmtree },
      { title: "WFH Requests", url: "wfh", icon: Home },
      { title: "Holidays", url: "holidays", icon: Calendar },
    ]
  },
  {
    label: "Finance",
    icon: Receipt,
    items: [
      { title: "My Payslips", url: "my-payslips", icon: Receipt },
      { title: "My Expenses", url: "expenses", icon: Receipt },
      { title: "Loans & Advances", url: "loans", icon: Banknote },
      { title: "Investments", url: "investments", icon: Coins },
    ]
  },
  {
    label: "Performance",
    icon: Target,
    items: [
      { title: "My OKRs", url: "okrs", icon: Target },
      { title: "Feedback", url: "feedback", icon: MessageCircle },
      { title: "Career Paths", url: "career-paths", icon: Target },
    ]
  },
  {
    label: "Calendar",
    icon: Calendar,
    items: [
      { title: "My Calendar", url: "calendar", icon: Calendar },
      { title: "Requests", url: "requests", icon: Inbox },
    ]
  },
  {
    label: "Learning & Growth",
    icon: GraduationCap,
    items: [
      { title: "Training", url: "training", icon: BookOpen, standalone: true },
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
      { title: "My Goals", url: "my-goals", icon: Target, standalone: true },
    ]
  },
  {
    label: "Resources",
    icon: BookOpen,
    items: [
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Handbook", url: "handbook", icon: BookOpen },
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
      { title: "My Coins", url: "my-coins", icon: Coins },
      { title: "Analytics", url: "analytics", icon: BarChart3 },
    ]
  },
];

/**
 * Intern navigation groups
 * Limited self-service with focus on learning and basic tasks
 */
export const internNavGroups: NavGroup[] = [
  {
    label: "Main",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "My Work", url: "my-work", icon: Inbox },
      { title: "My Tasks", url: "tasks", icon: CheckSquare },
      { title: "Projects", url: "projects", icon: FolderOpen },
      { title: "Updates", url: "updates", icon: Activity },
    ]
  },
  {
    label: "Self-Service",
    icon: UserCircle,
    items: [
      { title: "Self-Service Portal", url: "self-service", icon: UserCircle },
    ]
  },
  {
    label: "Time & Attendance",
    icon: Clock,
    items: [
      { title: "Attendance", url: "attendance", icon: MapPin },
      { title: "Regularization", url: "regularization", icon: Clock },
      { title: "My Shifts", url: "shifts", icon: CalendarDays },
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
    ]
  },
  {
    label: "Leave",
    icon: Palmtree,
    items: [
      { title: "Apply Leave", url: "leave", icon: Palmtree },
      { title: "WFH Requests", url: "wfh", icon: Home },
      { title: "Holidays", url: "holidays", icon: Calendar },
    ]
  },
  {
    label: "Finance",
    icon: Receipt,
    items: [
      { title: "My Expenses", url: "expenses", icon: Receipt },
      { title: "Loans & Advances", url: "loans", icon: Banknote },
    ]
  },
  {
    label: "Learning",
    icon: GraduationCap,
    items: [
      { title: "Training", url: "training", icon: BookOpen, standalone: true },
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
      { title: "My Goals", url: "my-goals", icon: Target, standalone: true },
    ]
  },
  {
    label: "Resources",
    icon: BookOpen,
    items: [
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
      { title: "My Coins", url: "my-coins", icon: Coins },
      { title: "Analytics", url: "analytics", icon: BarChart3 },
      { title: "Feedback", url: "feedback", icon: MessageCircle },
    ]
  },
];
