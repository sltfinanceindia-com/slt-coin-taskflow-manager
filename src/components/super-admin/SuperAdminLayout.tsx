import { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  Crown,
  LogOut,
  Menu,
  X,
  CreditCard,
  BarChart3,
  Package,
  Gift,
  Megaphone,
  Activity,
  FileText,
  Search,
  Bell,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { title: 'Dashboard', url: '/super-admin', icon: LayoutDashboard },
  { title: 'Organizations', url: '/super-admin/organizations', icon: Building2 },
  { title: 'All Users', url: '/super-admin/users', icon: Users },
  { title: 'Feedback Rewards', url: '/super-admin/feedback-rewards', icon: Gift },
  { title: 'Announcements', url: '/super-admin/announcements', icon: Megaphone },
  { title: 'System Health', url: '/super-admin/health', icon: Activity },
  { title: 'Audit Trail', url: '/super-admin/audit', icon: FileText },
  { title: 'Billing', url: '/super-admin/billing', icon: CreditCard },
  { title: 'Analytics', url: '/super-admin/analytics', icon: BarChart3 },
  { title: 'Plans', url: '/super-admin/plans', icon: Package },
  { title: 'Settings', url: '/super-admin/settings', icon: Settings },
];

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

interface QuickStats {
  totalOrgs: number;
  totalUsers: number;
  activeOrgs: number;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickStats, setQuickStats] = useState<QuickStats>({ totalOrgs: 0, totalUsers: 0, activeOrgs: 0 });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const [{ count: orgCount }, { count: activeOrgCount }, { count: userCount }] = await Promise.all([
          supabase.from('organizations').select('*', { count: 'exact', head: true }),
          supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        ]);
        setQuickStats({
          totalOrgs: orgCount || 0,
          activeOrgs: activeOrgCount || 0,
          totalUsers: userCount || 0,
        });
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      }
    };
    fetchQuickStats();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Get current page title for breadcrumb
  const currentPage = navItems.find(item => 
    item.url === location.pathname || 
    (item.url !== '/super-admin' && location.pathname.startsWith(item.url))
  );

  const filteredNavItems = searchQuery 
    ? navItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : navItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/10 dark:to-amber-950/10">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">Super Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 bg-card/95 backdrop-blur-xl border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl lg:shadow-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b hidden lg:block bg-gradient-to-r from-amber-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">SLT Work Hub</h2>
                  <p className="text-xs text-amber-600 font-medium">Super Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b bg-muted/30">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <p className="text-lg font-bold text-primary">{quickStats.totalOrgs}</p>
                  <p className="text-[10px] text-muted-foreground">Orgs</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <p className="text-lg font-bold text-emerald-600">{quickStats.activeOrgs}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-background/50">
                  <p className="text-lg font-bold text-blue-600">{quickStats.totalUsers}</p>
                  <p className="text-[10px] text-muted-foreground">Users</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{profile?.full_name}</p>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500 text-amber-600">
                    Super Admin
                  </Badge>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search menu..." 
                  className="pl-9 h-9 text-sm bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  end={item.url === '/super-admin'}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium shadow-md shadow-amber-500/20"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                  {item.title === 'Organizations' && quickStats.totalOrgs > 0 && (
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                      {quickStats.totalOrgs}
                    </Badge>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="p-4 border-t space-y-2 bg-muted/30">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          {/* Desktop Header with Breadcrumb */}
          <div className="hidden lg:flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/super-admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              {currentPage && currentPage.url !== '/super-admin' && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{currentPage.title}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>

          <div className="p-4 lg:p-6 xl:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
