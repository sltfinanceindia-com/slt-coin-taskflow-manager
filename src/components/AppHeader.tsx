import { Moon, Sun, Bell, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OnlineIndicator } from "@/components/ui/online-indicator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
import { useViewMode } from "@/hooks/useViewMode"
import { useUserRole } from "@/hooks/useUserRole"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { GlobalSearch } from "@/components/search/GlobalSearch"
import { OrganizationSwitcher } from "@/components/navigation/OrganizationSwitcher"

export function AppHeader() {
  const { profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { getPendingCoins } = useCoinTransactions()
  const { isSuperAdmin, role } = useUserRole()
  const navigate = useNavigate()
  
  const pendingCoins = getPendingCoins()
  
  // Use role from useUserRole (authoritative from user_roles table)
  const displayRole = role || profile?.role || 'employee'

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      
      // Always show success and redirect - state is cleared regardless of API response
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      
      // Force navigation to auth page after sign out
      window.location.href = '/auth';
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Even on error, force redirect to ensure clean state
      toast({
        title: "Signed Out",
        description: "Session ended. Redirecting to login.",
      });
      window.location.href = '/auth';
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 w-full bg-background border-b border-border shadow-sm">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted" />
          <OrganizationSwitcher className="hidden md:flex" />
          <GlobalSearch />
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Super Admin Toggle - Navigate to Super Admin Panel */}
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin')}
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg transition-all duration-200 gap-1.5 bg-purple-100/50 border-purple-300 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-xs font-medium">
                Super Admin
              </span>
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted transition-all duration-200"
          >
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label={`Notifications ${pendingCoins > 0 ? `(${pendingCoins} pending)` : ''}`}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted relative transition-all duration-200"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {pendingCoins > 0 && (
              <Badge 
                variant="count"
                className="absolute -top-1 -right-1 h-4 sm:h-5 min-w-[1rem] sm:min-w-[1.25rem] px-1 sm:px-1.5 py-0 sm:py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-medium border-2 border-background animate-pulse-ring"
              >
                {pendingCoins > 9 ? '9+' : pendingCoins}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 h-9 sm:h-10 px-2 sm:px-3 rounded-lg hover:bg-muted transition-all duration-200 focus-ring"
                aria-label="Open user menu"
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 relative">
                  <AvatarImage 
                    src={profile?.avatar_url} 
                    alt={profile?.full_name || 'User'} 
                  />
                  <AvatarFallback className="bg-gradient-secondary text-secondary-foreground text-sm sm:text-base font-medium">
                    {profile?.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                  <OnlineIndicator online={true} className="absolute bottom-0 right-0" />
                </Avatar>
                <span className="text-sm font-medium hidden md:block max-w-24 lg:max-w-32 truncate">{profile?.full_name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-fade-in bg-popover">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                  <Badge variant={displayRole === 'admin' || displayRole === 'org_admin' || displayRole === 'super_admin' ? 'admin' : displayRole === 'manager' ? 'default' : 'intern'} className="text-xs capitalize">
                    {displayRole}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="text-destructive cursor-pointer focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}