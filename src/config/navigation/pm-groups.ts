/**
 * Project Manager Navigation Groups
 * Navigation specifically for Project Manager role
 */

import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  FolderOpen,
  BookOpen,
  CalendarDays,
  Target,
  AlertTriangle,
  Activity,
  HeartPulse,
  Users2,
  FileBox,
  GitBranch,
  Gauge,
  Inbox,
  FileText,
  Calendar,
  GanttChart,
  MessageSquare,
  MessageCircle,
  ClipboardCheck,
  Ticket,
} from 'lucide-react';
import { NavGroup } from './types';

/**
 * Project Manager navigation groups
 * Full access to projects, tasks, sprints, capacity, team calendar, reports
 */
export const projectManagerNavGroups: NavGroup[] = [
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
    label: "Projects",
    icon: FolderOpen,
    items: [
      { title: "All Projects", url: "projects", icon: FolderOpen },
      { title: "Kanban Board", url: "tasks", icon: CheckSquare },
      { title: "Gantt Chart", url: "gantt", icon: GanttChart },
      { title: "Project Templates", url: "project-templates", icon: FileBox },
    ]
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    items: [
      { title: "All Tasks", url: "tasks", icon: CheckSquare },
      { title: "Task Templates", url: "task-templates", icon: FileBox },
      { title: "Recurring Tasks", url: "recurring-tasks", icon: Clock },
      { title: "Work Calendars", url: "work-calendars", icon: Calendar },
    ]
  },
  {
    label: "Sprints & Backlog",
    icon: Target,
    items: [
      { title: "Sprint Planning", url: "sprints", icon: Target },
      { title: "Backlog", url: "backlog", icon: FileBox },
      { title: "Milestones", url: "milestones", icon: Target },
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
      { title: "Scoring", url: "scoring", icon: Target },
    ]
  },
  {
    label: "Resources",
    icon: Users2,
    items: [
      { title: "Capacity", url: "capacity", icon: Gauge },
      { title: "Resource Allocation", url: "resources", icon: Users2 },
      { title: "Workload", url: "workload", icon: Gauge },
      { title: "Org Chart", url: "org-chart", icon: Users2, standalone: true },
    ]
  },
  {
    label: "Time & Attendance",
    icon: Clock,
    items: [
      { title: "Time Logs", url: "time", icon: Clock },
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
      { title: "Overtime", url: "overtime", icon: Clock },
    ]
  },
  {
    label: "Documentation",
    icon: FileText,
    items: [
      { title: "Meeting Notes", url: "meeting-notes", icon: FileText },
      { title: "Decisions", url: "decisions", icon: FileText },
      { title: "Lessons Learned", url: "lessons", icon: BookOpen },
    ]
  },
  {
    label: "Reports",
    icon: BarChart3,
    items: [
      { title: "Requests", url: "requests", icon: Inbox },
      { title: "Service Desk", url: "service-desk", icon: Ticket },
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Reports", url: "reports", icon: BarChart3 },
      { title: "Analytics", url: "analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Communication",
    icon: MessageSquare,
    items: [
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
    ]
  },
];
