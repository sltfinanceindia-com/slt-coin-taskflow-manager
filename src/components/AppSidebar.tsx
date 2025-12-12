import { NavLink } from "react-router-dom"
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
  Zap
} from "lucide-react"
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
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { useViewMode } from "@/hooks/useViewMode"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "@/components/NotificationCenter"

// Admin navigation items (for org_admin and admin roles)
const adminItems = [
  { title: "Overview", url: "overview", icon: LayoutDashboard },
  { title: "Kanban Board", url: "tasks", icon: CheckSquare },
  { title: "Projects", url: "projects", icon: FolderOpen },
  { title: "Updates", url: "updates", icon: Activity },
  { title: "Work Health", url: "work-health", icon: HeartPulse },
  { title: "Automation", url: "automation", icon: Zap },
  { title: "Shifts", url: "shifts", icon: CalendarDays },
  { title: "Leave", url: "leave", icon: Palmtree },
  { title: "Attendance", url: "attendance", icon: MapPin },
  { title: "WFH", url: "wfh", icon: Home },
  { title: "OKRs", url: "okrs", icon: Target },
  { title: "360° Feedback", url: "feedback", icon: MessageCircle },
  { title: "1:1 Meetings", url: "meetings", icon: UserCheck },
  { title: "PIPs", url: "pips", icon: AlertTriangle },
  { title: "Time Logs", url: "time", icon: Clock },
  { title: "Training", url: "training", icon: BookOpen },
  { title: "Communication", url: "communication", icon: MessageSquare },
  { title: "Coins", url: "coins", icon: Coins },
  { title: "Interns", url: "interns", icon: Users },
  { title: "Analytics", url: "analytics", icon: BarChart3 },
]

// Intern/Employee navigation items
const internItems = [
  { title: "Overview", url: "overview", icon: LayoutDashboard },
  { title: "My Tasks", url: "tasks", icon: CheckSquare },
  { title: "Projects", url: "projects", icon: FolderOpen },
  { title: "Updates", url: "updates", icon: Activity },
  { title: "Leave", url: "leave", icon: Palmtree },
  { title: "Attendance", url: "attendance", icon: MapPin },
  { title: "WFH", url: "wfh", icon: Home },
  { title: "Training", url: "training", icon: BookOpen },
  { title: "Time Logs", url: "time", icon: Clock },
  { title: "Communication", url: "communication", icon: MessageSquare },
  { title: "My Coins", url: "my-coins", icon: Coins },
  { title: "Analytics", url: "analytics", icon: BarChart3 },
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar()
  const { profile } = useAuth()
  const { isSuperAdmin, isAdmin, role, isLoading: roleLoading } = useUserRole()
  const { isViewingSuperAdmin, isViewingOrgAdmin } = useViewMode()
  
  // Use role from useUserRole hook for determining navigation items
  const items = isAdmin ? adminItems : internItems
  const collapsed = state === "collapsed"

  const isActive = (tab: string) => activeTab === tab

  // Role display logic - show current view context
  const getRoleBadge = () => {
    if (isSuperAdmin && isViewingSuperAdmin) {
      return { label: 'Super Admin', variant: 'default' as const, icon: Crown }
    }
    if (isSuperAdmin && isViewingOrgAdmin) {
      return { label: 'Org View', variant: 'default' as const, icon: Building2 }
    }
    if (role === 'org_admin') {
      return { label: 'Org Admin', variant: 'default' as const, icon: Building2 }
    }
    if (role === 'admin') {
      return { label: 'Admin', variant: 'default' as const, icon: Shield }
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
        "transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar h-screen flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
                alt="SLT work HuB"
                className="h-10 w-auto object-contain shrink-0"
              />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <h2 className="text-sidebar-foreground text-lg truncate">
                    <span className="font-black">SLT</span>
                    <span className="font-normal"> work </span>
                    <span className="font-black">HuB</span>
                  </h2>
                  <p className="text-xs text-sidebar-foreground/60 truncate">Task Management</p>
                </div>
              )}
            </div>
            {!collapsed && <NotificationCenter />}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                isSuperAdmin ? "bg-purple-100 dark:bg-purple-900" : "bg-emerald-100 dark:bg-emerald-900"
              )}>
                <RoleIcon className={cn(
                  "h-6 w-6",
                  isSuperAdmin ? "text-purple-600 dark:text-purple-400" : "text-emerald-600 dark:text-emerald-400"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-sidebar-foreground truncate">
                  {profile?.full_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={roleBadge.variant}
                    className={cn(
                      "text-xs px-2 py-0.5",
                      isSuperAdmin && "bg-purple-600 hover:bg-purple-700"
                    )}
                  >
                    {roleBadge.label}
                  </Badge>
                  <div className="flex items-center gap-1 min-w-0">
                    <Coins className="h-3 w-3 text-coin-gold shrink-0" />
                    <span className="text-xs text-coin-gold font-medium truncate">
                      {profile?.total_coins || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Super Admin Quick Access */}
        {isSuperAdmin && (
          <div className="px-3 py-2 border-b border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink to="/super-admin" className="w-full">
                  {({ isActive: navIsActive }) => (
                    <SidebarMenuButton 
                      className={cn(
                        "h-10 w-full px-4 py-2.5 rounded-lg gap-3 transition-colors",
                        navIsActive 
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 font-medium"
                          : "hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      )}
                    >
                      <Crown className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="text-sm truncate">Super Admin Panel</span>}
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup className="flex-1 px-3 py-4">
          <SidebarGroupLabel className="px-4 text-xs mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.url.startsWith('/') ? (
                    <NavLink to={item.url} className="w-full">
                      {({ isActive: navIsActive }) => (
                        <SidebarMenuButton 
                          className={cn(
                            "h-10 w-full px-4 py-2.5 rounded-lg gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                            navIsActive && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 font-medium"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {!collapsed && <span className="text-sm truncate">{item.title}</span>}
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  ) : (
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        "h-10 w-full px-4 py-2.5 rounded-lg gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                        isActive(item.url) && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 font-medium"
                      )}
                    >
                      <button
                        onClick={() => onTabChange(item.url)}
                        className="w-full flex items-center gap-3"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="text-sm truncate">{item.title}</span>}
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <div className="mt-auto p-3 pt-4 border-t border-sidebar-border">
          <SidebarMenu>
            {/* Organization Settings for admins */}
            {isAdmin && !isSuperAdmin && !collapsed && (
              <SidebarMenuItem>
                <NavLink to="/admin/settings" className="w-full">
                  {({ isActive: navIsActive }) => (
                    <SidebarMenuButton 
                      className={cn(
                        "h-10 w-full px-4 py-2.5 rounded-lg gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                        navIsActive && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 font-medium"
                      )}
                    >
                      <Building2 className="h-5 w-5 shrink-0" />
                      <span className="text-sm truncate">Organization</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10 px-4 py-2.5 rounded-lg gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <NavLink to="/profile" className="flex items-center gap-3">
                  <Settings className="h-5 w-5 shrink-0" />
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
