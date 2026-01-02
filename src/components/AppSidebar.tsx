import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
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
  ChevronDown,
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
  UserCircle
} from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import { cn } from "@/lib/utils"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { useViewMode } from "@/hooks/useViewMode"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "@/components/NotificationCenter"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { SidebarNotificationWidget } from "@/components/SidebarNotificationWidget"

// Navigation structure with groups
const adminNavGroups = [
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
    ]
  },
  {
    label: "Admin Tools",
    icon: Shield,
    items: [
      { title: "Roles & Permissions", url: "roles", icon: Shield },
      { title: "Org Chart", url: "org-chart", icon: Users2 },
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
      { title: "Tutorial", url: "tutorial", icon: BookOpen },
      { title: "Training", url: "training", icon: BookOpen },
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle },
      { title: "App Feedback", url: "app-feedback", icon: MessageCircle },
    ]
  },
]

const internNavGroups = [
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
    ]
  },
  {
    label: "Finance",
    icon: Wallet,
    items: [
      { title: "Expenses", url: "expenses", icon: Receipt },
      { title: "Loans & Advances", url: "loans", icon: Banknote },
    ]
  },
  {
    label: "Resources",
    icon: BookOpen,
    items: [
      { title: "Tutorial", url: "tutorial", icon: BookOpen },
      { title: "Approvals", url: "approvals", icon: GitBranch },
      { title: "Training", url: "training", icon: BookOpen },
      { title: "Communication", url: "communication", icon: MessageSquare },
      { title: "Kudos Wall", url: "kudos", icon: HeartPulse },
      { title: "Pulse Surveys", url: "pulse-surveys", icon: MessageCircle },
      { title: "My Goals", url: "my-goals", icon: Target },
      { title: "My Coins", url: "my-coins", icon: Coins },
      { title: "Analytics", url: "analytics", icon: BarChart3 },
      { title: "Feedback", url: "feedback", icon: MessageCircle },
    ]
  },
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state, setOpenMobile, isMobile } = useSidebar()
  const { profile } = useAuth()
  const { isSuperAdmin, isAdmin, isManager, isTeamLead, role, isLoading: roleLoading } = useUserRole()
  const { isViewingSuperAdmin, isViewingOrgAdmin } = useViewMode()
  const { organization } = useOrganization()
  const navigate = useNavigate()
  
  // isAdmin includes org_admin and admin with same privileges
  const navGroups = isAdmin ? adminNavGroups : internNavGroups
  const collapsed = state === "collapsed"

  // Pages that have their own routes (not dashboard tabs)
  const standaloneRoutes: Record<string, string> = {
    'tutorial': '/tutorial',
    'training': '/training',
    'kudos': '/kudos',
    'pulse-surveys': '/pulse-surveys',
    'my-goals': '/my-goals',
    'roles': '/admin/roles-permissions',
    'org-chart': '/organization/chart',
  }

  // Handle tab change and close sidebar on mobile
  const handleTabChange = (tab: string) => {
    // Check if this is a standalone route
    if (standaloneRoutes[tab]) {
      navigate(standaloneRoutes[tab]);
    } else {
      onTabChange(tab);
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Track which groups are open - default first group open
  const [openGroups, setOpenGroups] = useState<string[]>(["Main"])

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    )
  }

  const isActive = (tab: string) => activeTab === tab

  // Check if any item in a group is active
  const isGroupActive = (items: { url: string }[]) => 
    items.some(item => isActive(item.url))

  // Role display logic
  const getRoleBadge = () => {
    if (isSuperAdmin && isViewingSuperAdmin) {
      return { label: 'Super Admin', variant: 'default' as const, icon: Crown }
    }
    if (isSuperAdmin && isViewingOrgAdmin) {
      return { label: 'Org View', variant: 'default' as const, icon: Building2 }
    }
    if (role === 'org_admin' || role === 'admin') {
      return { label: 'Admin', variant: 'default' as const, icon: Shield }
    }
    if (role === 'manager') {
      return { label: 'Manager', variant: 'default' as const, icon: Users }
    }
    if (role === 'team_lead') {
      return { label: 'Team Lead', variant: 'default' as const, icon: UserCheck }
    }
    if (role === 'employee') {
      return { label: 'Employee', variant: 'secondary' as const, icon: User }
    }
    return { label: 'Intern', variant: 'secondary' as const, icon: User }
  }

  const roleBadge = getRoleBadge()
  const RoleIcon = roleBadge.icon

  return (
    <Sidebar
      className={cn(
        "transition-all duration-300 ease-in-out border-r border-sidebar-border shadow-sm hidden md:flex",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar h-screen flex flex-col">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img 
                src="/slt-hub-icon.png" 
                alt="Tenexa"
                className="h-9 w-auto object-contain shrink-0 rounded-xl"
              />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <h2 className="text-sidebar-foreground text-base truncate font-black">
                    Tenexa
                  </h2>
                </div>
              )}
            </div>
            {!collapsed && <NotificationCenter />}
          </div>
        </div>

        {/* User Info - Compact */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border shrink-0">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage 
                  src={profile?.avatar_url} 
                  alt={profile?.full_name || 'User'} 
                />
                <AvatarFallback className={cn(
                  "text-sm font-medium",
                  isSuperAdmin 
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400" 
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
                )}>
                  {profile?.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{roleBadge.label}</span>
                  <span className="text-xs text-coin-gold font-medium flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {profile?.total_coins || 0}
                  </span>
                </div>
                {organization?.name && (
                  <p className="text-xs text-muted-foreground truncate">
                    {organization.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Super Admin Quick Access */}
        {isSuperAdmin && (
          <div className="px-3 py-2 border-b border-sidebar-border shrink-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink to="/super-admin" className="w-full">
                  {({ isActive: navIsActive }) => (
                    <SidebarMenuButton 
                      className={cn(
                        "h-9 w-full px-3 py-2 rounded-lg gap-3 transition-colors",
                        navIsActive 
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 font-medium"
                          : "hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      )}
                    >
                      <Crown className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm truncate">Super Admin Panel</span>}
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}

        {/* Pending Items Notification */}
        <div className="px-3 py-2 shrink-0">
          <SidebarNotificationWidget collapsed={collapsed} />
        </div>

        {/* Navigation with Collapsible Groups */}
        <ScrollArea className="flex-1">
          <div className="px-3 py-3 space-y-1">
            {navGroups.map((group) => {
              const GroupIcon = group.icon
              const groupIsActive = isGroupActive(group.items)
              const isOpen = openGroups.includes(group.label) || groupIsActive

              if (collapsed) {
                // In collapsed mode, show only icons for first item of each group
                return (
                  <div key={group.label} className="space-y-1">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild
                          className={cn(
                            "h-9 w-full px-3 py-2 rounded-lg gap-3 hover:bg-muted transition-colors",
                            isActive(item.url) && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <button
                            onClick={() => handleTabChange(item.url)}
                            className="w-full flex items-center justify-center"
                            title={item.title}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </div>
                )
              }

              return (
                <Collapsible
                  key={group.label}
                  open={isOpen}
                  onOpenChange={() => toggleGroup(group.label)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-muted text-sidebar-foreground",
                        groupIsActive && "text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GroupIcon className="h-4 w-4" />
                        <span>{group.label}</span>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 mt-1 space-y-0.5">
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild
                            className={cn(
                              "h-8 w-full px-3 py-1.5 rounded-md gap-2 hover:bg-muted transition-colors text-sm",
                              isActive(item.url) && "bg-primary/10 text-primary font-medium"
                            )}
                          >
                            <button
                              onClick={() => handleTabChange(item.url)}
                              className="w-full flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </ScrollArea>

        {/* Settings */}
        <div className="mt-auto p-3 pt-2 border-t border-sidebar-border shrink-0">
          <SidebarMenu>
            {isAdmin && !isSuperAdmin && !collapsed && (
              <SidebarMenuItem>
                <NavLink to="/admin/settings" className="w-full">
                  {({ isActive: navIsActive }) => (
                    <SidebarMenuButton 
                      className={cn(
                        "h-9 w-full px-3 py-2 rounded-lg gap-2 hover:bg-muted transition-colors",
                        navIsActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="text-sm truncate">Organization</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-9 px-3 py-2 rounded-lg gap-2 hover:bg-muted transition-colors">
                <NavLink to="/profile" className="flex items-center gap-2">
                  <Settings className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="text-sm truncate">Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}