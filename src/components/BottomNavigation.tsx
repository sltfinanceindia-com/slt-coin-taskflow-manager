import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sparkles, 
  DollarSign, 
  LogIn,
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

// After Login Navigation Items
const privateNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', tab: 'overview' },
  { icon: CheckSquare, label: 'Tasks', tab: 'tasks' },
  { icon: MessageSquare, label: 'Chat', tab: 'communication' },
  { icon: User, label: 'Profile', path: '/profile' }
];

interface BottomNavigationProps {
  variant: 'public' | 'private';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BottomNavigation({ variant, activeTab, onTabChange }: BottomNavigationProps) {
  const location = useLocation();
  const items = variant === 'public' ? publicNavItems : privateNavItems;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
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
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          }
          
          return (
            <button
              key={item.label}
              onClick={() => item.tab && onTabChange?.(item.tab)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}