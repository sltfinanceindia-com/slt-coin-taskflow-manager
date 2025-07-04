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
  User,
  Settings
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

const adminItems = [
  { title: "Overview", url: "overview", icon: LayoutDashboard },
  { title: "Tasks", url: "tasks", icon: CheckSquare },
  { title: "Projects", url: "projects", icon: FolderOpen },
  { title: "Time Logs", url: "time", icon: Clock },
  { title: "Coins", url: "coins", icon: Coins },
  { title: "Interns", url: "interns", icon: Users },
  { title: "Analytics", url: "analytics", icon: BarChart3 },
]

const internItems = [
  { title: "Overview", url: "overview", icon: LayoutDashboard },
  { title: "My Tasks", url: "tasks", icon: CheckSquare },
  { title: "Projects", url: "projects", icon: FolderOpen },
  { title: "Time Logs", url: "time", icon: Clock },
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
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
              alt="SLT Finance India"
              className="h-8 w-8 object-contain"
            />
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sidebar-foreground">SLT Finance</h2>
                <p className="text-xs text-sidebar-foreground/60">Task Management</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={profile?.role === 'admin' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {profile?.role === 'admin' ? 'Admin' : 'Intern'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-coin-gold" />
                    <span className="text-xs text-coin-gold font-medium">
                      {profile?.total_coins || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                  >
                    <button
                      onClick={() => onTabChange(item.url)}
                      className="w-full flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/profile" className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  {!collapsed && <span>Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}