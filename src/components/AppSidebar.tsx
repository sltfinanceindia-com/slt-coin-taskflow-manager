import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
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
  Activity,
  Monitor,
  MessageSquare
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "@/components/NotificationCenter"

const adminItems = [
  { title: "Overview", url: "overview", icon: LayoutDashboard },
  { title: "Kanban Board", url: "tasks", icon: CheckSquare },
  { title: "Projects", url: "projects", icon: FolderOpen },
  { title: "Time Logs", url: "time", icon: Clock },
  { title: "Training", url: "training", icon: BookOpen },
  { title: "Communication", url: "communication", icon: MessageSquare },
  { title: "Coins", url: "coins", icon: Coins },
  { title: "Interns", url: "interns", icon: Users },
  { title: "Attendance", url: "attendance", icon: Clock },
  { title: "Analytics", url: "analytics", icon: BarChart3 },
]

const internItems = [
  { title: "Overview", url: "overview", icon: LayoutDashboard },
  { title: "My Tasks", url: "tasks", icon: CheckSquare },
  { title: "Projects", url: "projects", icon: FolderOpen },
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
  
  const items = profile?.role === 'admin' ? adminItems : internItems
  const collapsed = state === "collapsed"

  const isActive = (tab: string) => activeTab === tab

  return (
    <Sidebar
      className={collapsed ? "w-12 sm:w-14" : "w-56 sm:w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="p-2 sm:p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
                alt="SLT Finance India"
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain shrink-0"
              />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-sidebar-foreground text-sm sm:text-base truncate">SLT Finance</h2>
                  <p className="text-xs text-sidebar-foreground/60 truncate">Task Management</p>
                </div>
              )}
            </div>
            {!collapsed && <NotificationCenter />}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-2 sm:p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name}
                </p>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <Badge 
                    variant={profile?.role === 'admin' ? 'default' : 'secondary'} 
                    className="text-xs px-1.5 py-0.5"
                  >
                    {profile?.role === 'admin' ? 'Admin' : 'Intern'}
                  </Badge>
                  <div className="flex items-center gap-1 min-w-0">
                    <Coins className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-coin-gold shrink-0" />
                    <span className="text-xs text-coin-gold font-medium truncate">
                      {profile?.total_coins || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="px-2 sm:px-4 text-xs">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.url.startsWith('/') ? (
                    <NavLink to={item.url} className="w-full">
                      {({ isActive: navIsActive }) => (
                        <SidebarMenuButton 
                          className={`${navIsActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""} h-8 sm:h-10 w-full`}
                        >
                          <item.icon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          {!collapsed && <span className="text-xs sm:text-sm truncate">{item.title}</span>}
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  ) : (
                    <SidebarMenuButton 
                      asChild
                      className={`${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""} h-8 sm:h-10`}
                    >
                      <button
                        onClick={() => onTabChange(item.url)}
                        className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3"
                      >
                        <item.icon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                        {!collapsed && <span className="text-xs sm:text-sm truncate">{item.title}</span>}
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <div className="mt-auto p-2 sm:p-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-8 sm:h-10">
                <NavLink to="/profile" className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  {!collapsed && <span className="text-xs sm:text-sm truncate">Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}