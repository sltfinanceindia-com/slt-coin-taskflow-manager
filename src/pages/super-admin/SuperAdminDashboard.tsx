import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Activity, 
  TrendingUp,
  Plus,
  ArrowRight,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { format } from 'date-fns';

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
}

interface RecentOrganization {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  created_at: string;
  user_count: number;
  subscription_plan?: { name: string; code: string };
}

export default function SuperAdminDashboard() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    activeOrganizations: 0,
    trialOrganizations: 0,
    suspendedOrganizations: 0,
  });
  const [recentOrgs, setRecentOrgs] = useState<RecentOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch organizations
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select(`
            id,
            name,
            subdomain,
            status,
            created_at,
            subscription_plan:subscription_plans(name, code)
          `)
          .order('created_at', { ascending: false });

        if (orgsError) throw orgsError;

        // Fetch total users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);

        // Calculate stats
        const activeCount = orgs?.filter(o => o.status === 'active').length || 0;
        const trialCount = orgs?.filter(o => o.status === 'pending').length || 0;
        const suspendedCount = orgs?.filter(o => o.status === 'suspended').length || 0;

        setStats({
          totalOrganizations: orgs?.length || 0,
          totalUsers: userCount || 0,
          activeOrganizations: activeCount,
          trialOrganizations: trialCount,
          suspendedOrganizations: suspendedCount,
        });

        // Get user counts for recent orgs
        const recentOrgsWithCounts = await Promise.all(
          (orgs?.slice(0, 5) || []).map(async (org) => {
            const { count } = await supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .eq('organization_id', org.id)
              .eq('is_active', true);
            
            return {
              ...org,
              user_count: count || 0,
            };
          })
        );

        setRecentOrgs(recentOrgsWithCounts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isSuperAdmin) {
      fetchDashboardData();
    }
  }, [isSuperAdmin]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'pending':
        return <Badge variant="secondary">Trial</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Manage all organizations and platform settings
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto text-sm">
            <a href="/super-admin/organizations/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </a>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalOrganizations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeOrganizations} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Across all organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Orgs</CardTitle>
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.activeOrganizations}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Trial Orgs</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.trialOrganizations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.suspendedOrganizations} suspended
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Organizations */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg">Recent Organizations</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Latest organizations registered on the platform</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
              <a href="/super-admin/organizations">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : recentOrgs.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentOrgs.map((org) => (
                  <div
                    key={org.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">{org.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{org.subdomain}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 pl-11 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-medium">{org.user_count} users</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(org.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getStatusBadge(org.status)}
                        <Badge variant="outline" className="text-xs hidden xs:inline-flex">
                          {org.subscription_plan?.name || 'Free'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No organizations found. Create your first organization to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
