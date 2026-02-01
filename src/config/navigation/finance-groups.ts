/**
 * Finance Manager Navigation Groups
 * Navigation specifically for Finance Manager role
 */

import { 
  LayoutDashboard, 
  BarChart3, 
  BookOpen,
  Shield,
  TrendingUp,
  FileBox,
  GitBranch,
  Wallet,
  Receipt,
  FileText,
  PieChart,
  Banknote,
  HeartPulse,
  Coins,
  Building2,
  Activity,
  Clock,
  ClipboardCheck,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { NavGroup } from './types';

/**
 * Finance Manager navigation groups
 * Full access to payroll, expenses, loans, reimbursements, financial reports, budgets
 */
export const financeManagerNavGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview", icon: LayoutDashboard },
      { title: "Finance Dashboard", url: "analytics", icon: BarChart3 },
      { title: "Updates", url: "updates", icon: Activity },
    ]
  },
  {
    label: "Payroll",
    icon: Wallet,
    items: [
      { title: "Payroll Processing", url: "payroll", icon: Wallet },
      { title: "Salary Structures", url: "salary-structure", icon: Wallet },
      { title: "Salary Revisions", url: "salary-revisions", icon: TrendingUp },
      { title: "Bonus Management", url: "bonus", icon: Coins },
      { title: "Benefits", url: "benefits", icon: HeartPulse },
      { title: "Gratuity", url: "gratuity", icon: Coins },
      { title: "F&F Settlement", url: "fnf", icon: FileBox },
    ]
  },
  {
    label: "Expenses",
    icon: Receipt,
    items: [
      { title: "Expense Approvals", url: "expenses", icon: Receipt },
      { title: "Expense Categories", url: "expense-categories", icon: Receipt },
      { title: "Reimbursements", url: "reimbursements", icon: Receipt },
    ]
  },
  {
    label: "Loans & Advances",
    icon: Banknote,
    items: [
      { title: "Loan Requests", url: "loans", icon: Banknote },
    ]
  },
  {
    label: "Tax & Compliance",
    icon: Shield,
    items: [
      { title: "Tax Management", url: "tax-management", icon: Receipt },
      { title: "Form 16", url: "form16", icon: FileText },
      { title: "Investments", url: "investments", icon: Coins },
      { title: "Compliance", url: "compliance", icon: Shield },
    ]
  },
  {
    label: "Budgets",
    icon: PieChart,
    items: [
      { title: "Budget Planning", url: "budget-planning", icon: Wallet },
      { title: "Cost Centers", url: "cost-centers", icon: Building2 },
    ]
  },
  {
    label: "Time & Attendance",
    icon: Clock,
    items: [
      { title: "Timesheets", url: "timesheets", icon: ClipboardCheck },
      { title: "Time Logs", url: "time", icon: Clock },
    ]
  },
  {
    label: "Reports",
    icon: BarChart3,
    items: [
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Reports", url: "reports", icon: PieChart },
      { title: "Analytics", url: "analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Resources",
    icon: BookOpen,
    items: [
      { title: "Tutorial", url: "tutorial", icon: BookOpen, standalone: true },
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse, standalone: true },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle, standalone: true },
    ]
  },
];
