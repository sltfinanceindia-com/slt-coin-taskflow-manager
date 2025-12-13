import { useEffect, useState } from 'react';
import { Navigate, useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Edit, 
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Crown,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { OrganizationActivityLog } from '@/components/activity/OrganizationActivityLog';

type OrganizationStatus = 'active' | 'suspended' | 'pending' | 'cancelled' | 'trial';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  logo_url: string | null;
  status: OrganizationStatus;
  created_at: string;
  max_users: number;
  contact_email: string | null;
  contact_phone: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  subscription_plan?: { name: string; code: string; max_users: number };
}

interface OrgUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);

  const fetchOrganization = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const { data: org, error } = await supabase
        .from('organizations')
        .select(`
          *,
          subscription_plan:subscription_plans(name, code, max_users)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrganization(org);

      // Fetch users
      const { data: orgUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, is_active, created_at')
        .eq('organization_id', id)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(orgUsers || []);
      setUserCount(orgUsers?.filter(u => u.is_active).length || 0);
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast.error('Failed to load organization details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin && id) {
      fetchOrganization();
    }
  }, [isSuperAdmin, id]);

  const handleStatusChange = async (newStatus: OrganizationStatus) => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', organization.id);

      if (error) throw error;

      toast.success(`Organization ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
      fetchOrganization();
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-amber-500">Admin</Badge>;
      case 'org_admin':
        return <Badge className="bg-amber-500">Org Admin</Badge>;
      case 'manager':
        return <Badge variant="secondary">Manager</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const usagePercent = organization ? (userCount / organization.max_users) * 100 : 0;

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{organization?.name || 'Loading...'}</h1>
                {organization && getStatusBadge(organization.status)}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{organization?.subdomain}.sltworkhub.com</p>
            </div>
          </div>
          {organization && (
            <div className="flex gap-2 ml-auto sm:ml-0">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/super-admin/organizations/${id}/edit`}>
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </Button>
              {organization.status === 'active' ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Ban className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Suspend</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspend Organization?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will prevent all users from this organization from accessing the platform.
                        You can reactivate the organization at any time.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusChange('suspended')}>
                        Suspend
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button variant="default" size="sm" onClick={() => handleStatusChange('active')}>
                  <CheckCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Activate</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : organization ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Organization Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Organization Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {organization.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p>{organization.description}</p>
                      </div>
                    )}
                    {organization.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{organization.contact_email}</span>
                      </div>
                    )}
                    {organization.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{organization.contact_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Created {format(new Date(organization.created_at), 'MMMM dd, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-500" />
                      Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <Badge variant="outline" className="text-base">
                        {organization.subscription_plan?.name || 'Free'}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-medium">
                          {userCount} / {organization.max_users === -1 ? '∞' : organization.max_users}
                        </span>
                      </div>
                      <Progress value={Math.min(usagePercent, 100)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Organization Users</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">All users belonging to this organization</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                  {users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">Name</TableHead>
                            <TableHead className="min-w-[180px] hidden sm:table-cell">Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{user.full_name}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm">{user.email}</TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>
                                {user.is_active ? (
                                  <Badge className="bg-emerald-500 text-xs">Active</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                {format(new Date(user.created_at), 'MMM dd, yyyy')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm px-4">
                      No users found in this organization
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <OrganizationActivityLog organizationId={organization.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Organization not found
            </CardContent>
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
}
