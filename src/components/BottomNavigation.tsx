import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sparkles, 
  DollarSign, 
  LogIn,
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  User,
  MoreHorizontal,
  Calendar,
  FolderKanban,
  Clock,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  tab?: string;
}

// Before Login Navigation Items
const publicNavItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Sparkles, label: 'Features', path: '/features' },
  { icon: DollarSign, label: 'Pricing', path: '/pricing' },
  { icon: LogIn, label: 'Sign In', path: '/auth' }
];

// After Login Navigation Items - Main items shown in bottom nav
const privateNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Home', tab: 'overview' },
  { icon: CheckSquare, label: 'Tasks', tab: 'tasks' },
  { icon: MessageSquare, label: 'Chat', tab: 'communication' },
  { icon: User, label: 'Profile', path: '/profile' }
];

// More menu items for quick access to other features
const moreMenuItems: NavItem[] = [
  { icon: FolderKanban, label: 'Projects', tab: 'projects' },
  { icon: Calendar, label: 'Calendar', tab: 'calendar' },
  { icon: Clock, label: 'Time Logs', tab: 'time' },
  { icon: TrendingUp, label: 'Analytics', tab: 'analytics' },
  { icon: GraduationCap, label: 'Training', tab: 'training' },
];

interface BottomNavigationProps {
  variant: 'public' | 'private';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BottomNavigation({ variant, activeTab, onTabChange }: BottomNavigationProps) {
  const location = useLocation();
  const items = variant === 'public' ? publicNavItems : privateNavItems;
  const isPrivate = variant === 'private';

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-md border-t border-border md:hidden shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', position: 'fixed' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          
          // Determine if this item is active
          const isActive = item.path 
            ? location.pathname === item.path 
            : item.tab === activeTab;
          
          if (item.path) {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          }
          
          return (
            <button
              key={item.label}
              onClick={() => item.tab && onTabChange?.(item.tab)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        
        {/* More menu for private navigation */}
        {isPrivate && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
                  moreMenuItems.some(item => item.tab === activeTab)
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Quick Access
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.tab === activeTab;
                return (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={() => item.tab && onTabChange?.(item.tab)}
                    className={cn(
                      "gap-2 cursor-pointer",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
