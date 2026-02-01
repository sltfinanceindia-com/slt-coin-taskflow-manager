/**
 * Employee & Intern Navigation Groups
 * Navigation for Employee and Intern roles (self-service focused)
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
      { title: "Self-Service", url: "self-service", icon: UserCircle },
    ]
  },
  {
    label: "Work Management",
    icon: Clock,
    items: [
      { title: "Requests", url: "requests", icon: Inbox },
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
      { title: "My Shifts", url: "shifts", icon: CalendarDays },
      { title: "Attendance", url: "attendance", icon: MapPin },
      { title: "Leave", url: "leave", icon: Palmtree },
      { title: "WFH", url: "wfh", icon: Home },
      { title: "Holidays", url: "holidays", icon: Calendar },
    ]
  },
  {
    label: "Finance",
    icon: Receipt,
    items: [
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
    label: "Resources",
    icon: BookOpen,
    items: [
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Training", url: "training", icon: BookOpen, standalone: true },
      { title: "Handbook", url: "handbook", icon: BookOpen },
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
      { title: "My Goals", url: "my-goals", icon: Target, standalone: true },
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
      { title: "Self-Service", url: "self-service", icon: UserCircle },
    ]
  },
  {
    label: "Work Management",
    icon: Clock,
    items: [
      { title: "Requests", url: "requests", icon: Inbox },
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
      { title: "My Shifts", url: "shifts", icon: CalendarDays },
      { title: "Attendance", url: "attendance", icon: MapPin },
      { title: "Leave", url: "leave", icon: Palmtree },
      { title: "WFH", url: "wfh", icon: Home },
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
    ]
  },
];
