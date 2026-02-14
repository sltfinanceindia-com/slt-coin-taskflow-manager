import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';

type OrganizationStatus = 'active' | 'suspended' | 'pending' | 'cancelled' | 'trial';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  status: OrganizationStatus;
  created_at: string;
  max_users: number;
  user_count?: number;
  subscription_plan?: { name: string; code: string };
  admin_user?: { full_name: string; email: string };
}

export default function OrganizationsList() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('organizations')
        .select(`
          id,
          name,
          subdomain,
          status,
          created_at,
          max_users,
          subscription_plan:subscription_plans(name, code)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as OrganizationStatus);
      }

      const { data: orgs, error } = await query;
      if (error) throw error;

      // Get user counts and admin info for each org
      const orgsWithDetails = await Promise.all(
        (orgs || []).map(async (org) => {
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .eq('is_active', true);

          // Get org admin
          const { data: adminData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('organization_id', org.id)
            .eq('role', 'admin')
            .limit(1)
            .maybeSingle();

          return {
            ...org,
            user_count: count || 0,
            admin_user: adminData,
          };
        })
      );

      setOrganizations(orgsWithDetails);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations();
    }
  }, [isSuperAdmin, statusFilter]);

  const handleStatusChange = async (orgId: string, newStatus: OrganizationStatus) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orgId);

      if (error) throw error;

      toast.success(`Organization ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization status:', error);
      toast.error('Failed to update organization status');
    }
  };

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

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || org.subscription_plan?.code === planFilter;
    return matchesSearch && matchesPlan;
  });

  const getStatusBadge = (status: OrganizationStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Manage all organizations on the platform
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/super-admin/organizations/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or subdomain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Trial</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-10">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizations Table/Cards */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredOrgs.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden divide-y">
                  {filteredOrgs.map((org) => (
                    <div key={org.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{org.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{org.subdomain}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/super-admin/organizations/${org.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/super-admin/organizations/${org.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {org.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(org.id, 'suspended')}
                                className="text-amber-600"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(org.id, 'active')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {org.user_count}/{org.max_users === -1 ? '∞' : org.max_users} users
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {format(new Date(org.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(org.status)}
                        <Badge variant="outline">{org.subscription_plan?.name || 'Free'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead className="hidden lg:table-cell">Admin</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Created</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrgs.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{org.name}</p>
                                <p className="text-sm text-muted-foreground">{org.subdomain}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {org.admin_user ? (
                              <div>
                                <p className="text-sm">{org.admin_user.full_name}</p>
                                <p className="text-xs text-muted-foreground">{org.admin_user.email}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{org.user_count}</span>
                            <span className="text-muted-foreground">/{org.max_users === -1 ? '∞' : org.max_users}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{org.subscription_plan?.name || 'Free'}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(org.status)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {format(new Date(org.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/super-admin/organizations/${org.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/super-admin/organizations/${org.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {org.status === 'active' ? (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(org.id, 'suspended')}
                                    className="text-amber-600"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(org.id, 'active')}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center py-12 px-4">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No organizations found</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {searchQuery || statusFilter !== 'all' || planFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first organization to get started'}
                </p>
                <Button asChild>
                  <Link to="/super-admin/organizations/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
