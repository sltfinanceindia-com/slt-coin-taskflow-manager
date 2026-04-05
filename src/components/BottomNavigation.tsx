import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  GraduationCap,
  Users,
  FileText,
  Shield,
  Briefcase,
  Heart,
  Coins,
  Settings,
  ClipboardList,
  Building2,
  X,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { standaloneRoutes } from '@/config/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  tab?: string;
}

interface NavCategory {
  title: string;
  items: NavItem[];
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

// Full module categories for the "More" drawer
const moduleCategories: NavCategory[] = [
  {
    title: 'Work',
    items: [
      { icon: FolderKanban, label: 'Projects', tab: 'projects' },
      { icon: CheckSquare, label: 'Tasks', tab: 'tasks' },
      { icon: Clock, label: 'Time Logs', tab: 'time' },
      { icon: Calendar, label: 'Calendar', tab: 'calendar' },
      { icon: ClipboardList, label: 'Approvals', tab: 'approvals' },
    ]
  },
  {
    title: 'HR & People',
    items: [
      { icon: Users, label: 'Employees', tab: 'employees' },
      { icon: Briefcase, label: 'Attendance', tab: 'attendance' },
      { icon: Heart, label: 'Leave', tab: 'leave' },
      { icon: Building2, label: 'Org Chart', tab: 'org-chart' },
      { icon: Shield, label: 'Onboarding', tab: 'onboarding' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { icon: DollarSign, label: 'Payroll', tab: 'payroll' },
      { icon: FileText, label: 'Expenses', tab: 'expenses' },
      { icon: Coins, label: 'Coins', tab: 'coins' },
    ]
  },
  {
    title: 'Growth',
    items: [
      { icon: TrendingUp, label: 'Performance', tab: 'okrs' },
      { icon: GraduationCap, label: 'Training', tab: 'training' },
      { icon: BarChart3, label: 'Analytics', tab: 'analytics' },
      { icon: MessageSquare, label: 'Feedback', tab: 'feedback' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { icon: Settings, label: 'Settings', path: '/admin/organization-settings' },
    ]
  },
];

interface BottomNavigationProps {
  variant: 'public' | 'private';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BottomNavigation({ variant, activeTab, onTabChange }: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const items = variant === 'public' ? publicNavItems : privateNavItems;
  const isPrivate = variant === 'private';

  const handleTabChange = (tab: string) => {
    if (standaloneRoutes[tab]) {
      navigate(standaloneRoutes[tab]);
    } else {
      navigate(`/dashboard?tab=${tab}`);
    }
    setDrawerOpen(false);
  };

  const handlePathNav = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isMoreActive = moduleCategories.some(cat => 
    cat.items.some(item => item.tab === activeTab)
  );

  return (
    <>
      {/* Full-screen module drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[9998] md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setDrawerOpen(false)} 
          />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl border-t border-border max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">All Modules</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-full hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <ScrollArea className="flex-1 px-4 py-3">
              {moduleCategories.map((category) => (
                <div key={category.title} className="mb-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{category.title}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.path 
                        ? location.pathname === item.path 
                        : item.tab === activeTab;
                      return (
                        <button
                          key={item.label}
                          onClick={() => item.path ? handlePathNav(item.path) : item.tab && handleTabChange(item.tab)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors",
                            isActive 
                              ? "bg-primary/10 text-primary" 
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-md border-t border-border md:hidden shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        data-testid="bottom-navigation"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 px-1 sm:px-2">
          {items.map((item) => {
            const Icon = item.icon;
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
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                onClick={() => item.tab && handleTabChange(item.tab)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* More button opens full drawer */}
          {isPrivate && (
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
                (isMoreActive || drawerOpen) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
