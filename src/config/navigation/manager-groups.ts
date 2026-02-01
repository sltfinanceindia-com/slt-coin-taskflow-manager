/**
 * Manager & Team Lead Navigation Groups
 * Navigation for Manager and Team Lead roles
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
  UserCheck,
  AlertTriangle,
  Activity,
  HeartPulse,
  Users2,
  GitBranch,
  Gauge,
  Inbox,
  FileText,
  Calendar,
  GanttChart,
  MessageSquare,
  ClipboardCheck,
  Receipt,
  Coins,
  Banknote,
} from 'lucide-react';
import { NavGroup } from './types';

/**
 * Manager navigation groups
 * Access to team data, approvals, reports
 */
export const managerNavGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "My Work", url: "my-work", icon: Inbox },
      { title: "Updates", url: "updates", icon: Activity },
    ]
  },
  {
    label: "My Team",
    icon: Users2,
    items: [
      { title: "Team Overview", url: "interns", icon: Users2 },
      { title: "Org Chart", url: "org-chart", icon: Users2, standalone: true },
      { title: "Team Calendar", url: "work-calendars", icon: Calendar },
    ]
  },
  {
    label: "Tasks & Projects",
    icon: CheckSquare,
    items: [
      { title: "All Tasks", url: "tasks", icon: CheckSquare },
      { title: "Projects", url: "projects", icon: FolderOpen },
      { title: "Gantt Chart", url: "gantt", icon: GanttChart },
      { title: "Milestones", url: "milestones", icon: Target },
      { title: "Issues", url: "issues", icon: AlertTriangle },
    ]
  },
  {
    label: "Attendance & Leave",
    icon: Clock,
    items: [
      { title: "Team Attendance", url: "attendance", icon: MapPin },
      { title: "Shifts", url: "shifts", icon: CalendarDays },
      { title: "Leave Requests", url: "leave", icon: Palmtree },
      { title: "WFH", url: "wfh", icon: Home },
      { title: "Holidays", url: "holidays", icon: Calendar },
    ]
  },
  {
    label: "Time Management",
    icon: Clock,
    items: [
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
      { title: "Capacity", url: "capacity", icon: Gauge },
      { title: "Workload", url: "workload", icon: Gauge },
    ]
  },
  {
    label: "Performance",
    icon: Target,
    items: [
      { title: "Team OKRs", url: "okrs", icon: Target },
      { title: "360° Feedback", url: "feedback", icon: MessageCircle },
      { title: "1:1 Meetings", url: "meetings", icon: UserCheck },
    ]
  },
  {
    label: "Finance",
    icon: Receipt,
    items: [
      { title: "Expenses", url: "expenses", icon: Receipt },
      { title: "Loans", url: "loans", icon: Banknote },
    ]
  },
  {
    label: "Reports & Approvals",
    icon: BarChart3,
    items: [
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Reports", url: "reports", icon: BarChart3 },
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
      { title: "My Goals", url: "my-goals", icon: Target, standalone: true },
      { title: "My Coins", url: "my-coins", icon: Coins },
    ]
  },
];

/**
 * Team Lead navigation groups
 * Similar to manager but more limited scope
 */
export const teamLeadNavGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "My Work", url: "my-work", icon: Inbox },
      { title: "Updates", url: "updates", icon: Activity },
    ]
  },
  {
    label: "My Team",
    icon: Users2,
    items: [
      { title: "Team Members", url: "interns", icon: Users2 },
      { title: "Org Chart", url: "org-chart", icon: Users2, standalone: true },
    ]
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    items: [
      { title: "All Tasks", url: "tasks", icon: CheckSquare },
      { title: "Projects", url: "projects", icon: FolderOpen },
      { title: "Issues", url: "issues", icon: AlertTriangle },
    ]
  },
  {
    label: "Attendance & Leave",
    icon: Clock,
    items: [
      { title: "Team Attendance", url: "attendance", icon: MapPin },
      { title: "Leave Requests", url: "leave", icon: Palmtree },
      { title: "WFH", url: "wfh", icon: Home },
      { title: "Holidays", url: "holidays", icon: Calendar },
    ]
  },
  {
    label: "Time",
    icon: Clock,
    items: [
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
    ]
  },
  {
    label: "Reports",
    icon: BarChart3,
    items: [
      { title: "Approvals", url: "approvals", icon: GitBranch },
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
      { title: "My Goals", url: "my-goals", icon: Target, standalone: true },
      { title: "My Coins", url: "my-coins", icon: Coins },
    ]
  },
];
