import { Moon, Sun, Bell, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/components/ThemeProvider"
import { toast } from "@/hooks/use-toast"
import { useCoinTransactions } from "@/hooks/useCoinTransactions"

export function AppHeader() {
  const { profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { getPendingCoins } = useCoinTransactions()
  const pendingCoins = getPendingCoins()

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Failed",
          description: error.message || "An error occurred during sign out",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <>
      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .workfront-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
        }
        .workfront-header-light {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
          border-bottom: 1px solid #e2e8f0;
          backdrop-filter: blur(20px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
        }
        .workfront-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }
        .workfront-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }
        .workfront-button-light {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          color: #667eea;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .workfront-button-light:hover {
          background: rgba(102, 126, 234, 0.15);
          border-color: rgba(102, 126, 234, 0.3);
          color: #764ba2;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }
        .workfront-user-avatar {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .workfront-user-avatar-light {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 2px solid rgba(102, 126, 234, 0.2);
          color: white;
          box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
        }
        .workfront-badge {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          font-weight: 700;
          animation: pulse 2s infinite;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }
        .workfront-dropdown {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-radius: 12px;
          backdrop-filter: blur(20px);
        }
        .workfront-dropdown-dark {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid #475569;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
        }
        .workfront-dropdown-item {
          transition: all 0.2s ease;
          border-radius: 6px;
          margin: 2px;
        }
        .workfront-dropdown-item:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .sidebar-trigger-enhanced {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .sidebar-trigger-enhanced:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(2px);
        }
        .sidebar-trigger-light {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          color: #667eea;
        }
        .sidebar-trigger-light:hover {
          background: rgba(102, 126, 234, 0.15);
          color: #764ba2;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .notification-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>

      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          theme === 'dark' ? 'workfront-header' : 'workfront-header-light'
        }`}
      >
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 sm:px-6">
          {/* Enhanced Sidebar Trigger */}
          <div className="mr-4 flex">
            <SidebarTrigger 
              className={`-ml-1 h-9 w-9 ${
                theme === 'dark' ? 'sidebar-trigger-enhanced' : 'sidebar-trigger-light'
              }`} 
            />
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
            {/* Brand/Search Area */}
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="hidden md:flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'workfront-user-avatar' : 'workfront-user-avatar-light'
                }`}>
                  <span className="text-xs font-bold">W</span>
                </div>
                <span className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}>
                  Workfront Style
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Enhanced Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`h-9 w-9 px-0 shrink-0 relative overflow-hidden ${
                  theme === 'dark' ? 'workfront-button' : 'workfront-button-light'
                }`}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Enhanced Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-9 w-9 px-0 relative shrink-0 ${
                  theme === 'dark' ? 'workfront-button' : 'workfront-button-light'
                }`}
              >
                <Bell className="h-4 w-4" />
                {pendingCoins > 0 && (
                  <>
                    <Badge 
                      className="workfront-badge absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
                    >
                      {pendingCoins > 9 ? '9+' : pendingCoins}
                    </Badge>
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-400 rounded-full notification-ping"></div>
                  </>
                )}
              </Button>

              {/* Enhanced User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`h-9 px-3 shrink-0 ${
                      theme === 'dark' ? 'workfront-button' : 'workfront-button-light'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                        theme === 'dark' ? 'workfront-user-avatar' : 'workfront-user-avatar-light'
                      }`}>
                        <span className="text-xs font-bold">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="hidden lg:flex flex-col items-start">
                        <span className="text-sm font-semibold leading-none">
                          {profile?.full_name || 'User'}
                        </span>
                        <span className={`text-xs leading-none mt-1 ${
                          theme === 'dark' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {profile?.role || 'Member'}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                  align="end" 
                  className={`w-64 ${
                    theme === 'dark' ? 'workfront-dropdown-dark' : 'workfront-dropdown'
                  }`}
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'workfront-user-avatar' : 'workfront-user-avatar-light'
                      }`}>
                        <span className="text-sm font-bold">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">
                          {profile?.full_name || 'User Name'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email || 'user@example.com'}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className="workfront-badge !text-[10px] !px-2 !py-0.5">
                            {profile?.role || 'Member'}
                          </Badge>
                          {pendingCoins > 0 && (
                            <Badge variant="outline" className="!text-[10px] !px-2 !py-0.5">
                              {pendingCoins} coins pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="my-2" />
                  
                  <DropdownMenuItem className="workfront-dropdown-item p-3">
                    <User className="mr-3 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Profile Settings</span>
                      <span className="text-xs text-muted-foreground">Manage your account</span>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="workfront-dropdown-item p-3">
                    <Settings className="mr-3 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Preferences</span>
                      <span className="text-xs text-muted-foreground">Customize your experience</span>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-2" />
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="workfront-dropdown-item p-3 !text-red-600 dark:!text-red-400"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Sign Out</span>
                      <span className="text-xs opacity-70">End your session</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
