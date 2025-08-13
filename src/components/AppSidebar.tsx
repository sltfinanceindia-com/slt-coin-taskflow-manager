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
  ChevronRight,
  Zap
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
  { title: "Coins", url: "coins", icon: Coins },
  { title: "Interns", url: "interns", icon: Users },
  { title: "Productivity", url: "productivity", icon: Activity },
  { title: "Time Tracking", url: "time-tracking", icon: Monitor },
  { title: "Analytics", url: "analytics", icon: BarChart3 },
]

const internItems = [
  { title: "Overview", url: "overview", icon: LayoutDashboard },
  { title: "My Tasks", url: "tasks", icon: CheckSquare },
  { title: "Projects", url: "projects", icon: FolderOpen },
  { title: "Training", url: "training", icon: BookOpen },
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
    <>
      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .workfront-sidebar {
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 4px 0 20px rgba(102, 126, 234, 0.15);
          backdrop-filter: blur(20px);
        }
        .workfront-logo-section {
          background: rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .workfront-user-section {
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .workfront-user-avatar {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .workfront-badge-admin {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        .workfront-badge-intern {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        .workfront-nav-item {
          color: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .workfront-nav-item:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateX(4px);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
        }
        .workfront-nav-item-active {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
          color: white;
          border-left: 4px solid white;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
        }
        .workfront-nav-item-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
          pointer-events: none;
        }
        .workfront-section-label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 11px;
        }
        .workfront-settings-section {
          background: rgba(255, 255, 255, 0.05);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .workfront-settings-item {
          color: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .workfront-settings-item:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateX(2px);
        }
        .workfront-coin-display {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
          font-size: 11px;
        }
        .workfront-logo {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        .workfront-brand-text {
          color: white;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .workfront-brand-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        .nav-item-icon {
          transition: all 0.3s ease;
        }
        .workfront-nav-item:hover .nav-item-icon {
          transform: scale(1.1);
        }
        .workfront-nav-item-active .nav-item-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
        }
      `}</style>

      <Sidebar
        className={`workfront-sidebar ${collapsed ? "w-12 sm:w-14" : "w-56 sm:w-64"} transition-all duration-300`}
        collapsible="icon"
      >
        <SidebarContent className="workfront-sidebar">
          {/* Enhanced Logo Section */}
          <div className="workfront-logo-section p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="workfront-user-avatar p-1.5 rounded-xl">
                  <img 
                    src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
                    alt="SLT Finance India"
                    className="workfront-logo h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0"
                  />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <h2 className="workfront-brand-text text-sm sm:text-base truncate leading-tight">
                      SLT Finance
                    </h2>
                    <p className="workfront-brand-subtitle text-xs truncate leading-tight">
                      Task Management System
                    </p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <div className="shrink-0">
                  <NotificationCenter />
                </div>
              )}
            </div>
          </div>

          {/* Enhanced User Info */}
          {!collapsed && (
            <div className="workfront-user-section p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="workfront-user-avatar h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-tight">
                    {profile?.full_name || 'User Name'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      className={`${profile?.role === 'admin' ? 'workfront-badge-admin' : 'workfront-badge-intern'} text-xs px-2 py-1 leading-none`}
                    >
                      {profile?.role === 'admin' ? 'Administrator' : 'Intern'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="workfront-coin-display flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      <span>{profile?.total_coins || 0} Coins</span>
                    </div>
                    {profile?.role === 'admin' && (
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <Zap className="h-3 w-3" />
                        <span>Admin</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Navigation */}
          <SidebarGroup className="flex-1 px-3">
            <SidebarGroupLabel className="workfront-section-label px-3 py-2 mb-2">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className="p-0 h-auto"
                    >
                      <button
                        onClick={() => onTabChange(item.url)}
                        className={`workfront-nav-item ${
                          isActive(item.url) ? 'workfront-nav-item-active' : ''
                        } w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group`}
                      >
                        <item.icon className="nav-item-icon h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <span className="text-sm font-medium truncate text-left flex-1">
                            {item.title}
                          </span>
                        )}
                        {!collapsed && isActive(item.url) && (
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Enhanced Settings */}
          <div className="workfront-settings-section mt-auto p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="p-0 h-auto">
                  <NavLink 
                    to="/profile" 
                    className="workfront-settings-item flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300"
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">
                        Settings & Profile
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  )
}
