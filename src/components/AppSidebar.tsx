import { useMemo, useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
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
   ChevronUp,
   PanelTopClose,
   PanelTopOpen,
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
import { standaloneRoutes } from "@/config/navigation"
import { getNavGroupsForRole, filterNavGroupsByFeatures } from "@/config/navigation/index"
import type { AppRole } from "@/config/navigation/types"
import { useOrganization } from "@/hooks/useOrganization"
import { cn } from "@/lib/utils"
import { useSidebarState } from "@/contexts/SidebarContext"

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

// Note: Navigation groups are now imported from @/config/navigation
// The hardcoded adminNavGroups and internNavGroups have been removed.
// The sidebar uses getNavGroupsForRole() from the navigation config.

// Collapsible wrapper for sidebar header (Logo, User Info, Super Admin)
function SidebarHeaderCollapsible({ 
  collapsed: sidebarCollapsed, 
  isMobile, 
  children 
}: { 
  collapsed: boolean; 
  isMobile: boolean; 
  children: React.ReactNode;
}) {
  const [headerHidden, setHeaderHidden] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('sidebar-header-collapsed');
    if (saved !== null) return JSON.parse(saved);
    return false; // default expanded
  });

  useEffect(() => {
    localStorage.setItem('sidebar-header-collapsed', JSON.stringify(headerHidden));
  }, [headerHidden]);

  if (sidebarCollapsed) {
    // When sidebar is icon-collapsed, just render children normally
    return <>{children}</>;
  }

  return (
    <Collapsible open={!headerHidden} onOpenChange={(open) => setHeaderHidden(!open)}>
      <CollapsibleContent>{children}</CollapsibleContent>
      <CollapsibleTrigger asChild>
        <button
          className="flex items-center justify-center w-full py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-b border-sidebar-border"
          title={headerHidden ? 'Show header' : 'Hide header'}
        >
          {headerHidden ? (
            <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Show Profile</>
          ) : (
            <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Hide Profile</>
          )}
        </button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}

interface AppSidebarProps {
  activeTab: string
  onTabChange?: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state, setOpenMobile, isMobile } = useSidebar()
  const { profile } = useAuth()
  const { 
    isSuperAdmin, 
    isAdmin, 
    isManager, 
    isTeamLead, 
    isHRAdmin, 
    isProjectManager, 
    isFinanceManager,
    role, 
    isLoading: roleLoading 
  } = useUserRole()
  const { isViewingSuperAdmin, isViewingOrgAdmin } = useViewMode()
  const { organization } = useOrganization()
  const navigate = useNavigate()
  
  // Get enabled features from organization
  const enabledFeatures = organization?.enabled_features || {};
  
  // Get role-based navigation groups using the new navigation system
  const navGroups = useMemo(() => {
    const userRole = (role || 'employee') as AppRole;
    const baseGroups = getNavGroupsForRole(userRole);
    return filterNavGroupsByFeatures(baseGroups, enabledFeatures as Record<string, boolean> | undefined);
  }, [role, enabledFeatures]);
  
  const collapsed = state === "collapsed"

  // standaloneRoutes imported from @/config/navigation

  // Handle tab change and close sidebar on mobile
  const handleTabChange = (tab: string) => {
    // Check if this is a standalone route
    if (standaloneRoutes[tab]) {
      navigate(standaloneRoutes[tab]);
    } else {
      // Handle tabs that include query params (e.g., "tasks?view=kanban")
      if (tab.includes('?')) {
        const [baseTab, queryString] = tab.split('?');
        navigate(`/dashboard?tab=${baseTab}&${queryString}`);
      } else {
        navigate(`/dashboard?tab=${tab}`);
      }
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Use context for persistent sidebar state across navigation
  const { openGroups, toggleGroup, expandAllGroups, collapseAllGroups } = useSidebarState();

  const handleExpandAll = () => {
    const allLabels = navGroups.map(g => g.label);
    expandAllGroups(allLabels);
  };

  const allExpanded = openGroups.length === navGroups.length;

  // Check if tab is active, handling query param tabs (e.g., "tasks?view=kanban" matches activeTab "tasks")
  const isActive = (tab: string) => {
    const baseTab = tab.split('?')[0];
    return activeTab === baseTab || activeTab === tab;
  }

  // Scroll active sidebar item into view when tab changes
  useEffect(() => {
    const el = document.querySelector(`[data-tab-url="${activeTab}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeTab]);

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
    if (role === 'hr_admin') {
      return { label: 'HR Admin', variant: 'default' as const, icon: Users }
    }
    if (role === 'project_manager') {
      return { label: 'Project Manager', variant: 'default' as const, icon: Briefcase }
    }
    if (role === 'finance_manager') {
      return { label: 'Finance Manager', variant: 'default' as const, icon: Wallet }
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
        {/* Collapsible Header: Logo + User Info + Super Admin */}
        <SidebarHeaderCollapsible collapsed={collapsed} isMobile={isMobile}>
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
                      : "bg-primary/10 text-primary"
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
                          "h-9 w-full px-3 py-2 rounded-lg gap-3 transition-colors text-nav",
                          navIsActive 
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 font-medium"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        )}
                      >
                        <Crown className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">Super Admin Panel</span>}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          )}
        </SidebarHeaderCollapsible>

        {/* Expand/Collapse All + Notification Widget - Compact */}
        <div className="px-3 py-2 border-b border-sidebar-border shrink-0 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 text-xs text-muted-foreground hover:text-foreground transition-all",
              collapsed ? "w-full justify-center p-1" : "w-full justify-start px-3"
            )}
            onClick={allExpanded ? collapseAllGroups : handleExpandAll}
            title={allExpanded ? 'Collapse All Groups' : 'Expand All Groups'}
          >
            {collapsed ? (
              allExpanded ? '⊟' : '⊞'
            ) : (
              allExpanded ? '⊟ Collapse All' : '⊞ Expand All'
            )}
          </Button>
          <SidebarNotificationWidget collapsed={collapsed} />
        </div>

        {/* Navigation with Collapsible Groups */}
        <ScrollArea className="flex-1">
          <div className="px-3 py-3 space-y-2">
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
                            data-tab-url={item.url.split('?')[0]}
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
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg text-nav font-medium transition-colors",
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
                  <CollapsibleContent className="pl-4 mt-1.5 space-y-1 border-l-2 border-muted ml-3">
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild
                            className={cn(
                              "h-8 w-full px-3 py-1.5 rounded-md gap-2 hover:bg-muted transition-colors text-nav",
                              isActive(item.url) && "bg-primary/10 text-primary font-medium"
                            )}
                          >
                            <button
                              onClick={() => handleTabChange(item.url)}
                              className="w-full flex items-center gap-2"
                              data-tab-url={item.url.split('?')[0]}
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
                        "h-9 w-full px-3 py-2 rounded-lg gap-2 hover:bg-muted transition-colors text-nav",
                        navIsActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">Organization</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-9 px-3 py-2 rounded-lg gap-2 hover:bg-muted transition-colors text-nav">
                <NavLink to="/profile" className="flex items-center gap-2">
                  <Settings className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}