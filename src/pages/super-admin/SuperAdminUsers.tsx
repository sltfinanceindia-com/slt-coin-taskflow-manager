import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
  Users, 
  Search, 
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface UserWithOrg {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  organization?: {
    id: string;
    name: string;
  };
}

export default function SuperAdminUsers() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          is_active,
          created_at,
          organization:organizations(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter as 'admin' | 'employee' | 'intern' | 'org_admin' | 'super_admin');
      }

      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }

      const { data, error } = await query;
      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin, roleFilter, statusFilter]);

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-500">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-amber-500">Admin</Badge>;
      case 'manager':
        return <Badge variant="secondary">Manager</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              All Users
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Manage all users across all organizations
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or organization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-10">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table/Cards */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden divide-y">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.is_active ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, false)}
                                className="text-amber-600"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, true)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">{user.organization?.name || 'No Organization'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getRoleBadge(user.role)}
                        {user.is_active ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Joined</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{user.organization?.name || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.is_active ? (
                              <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {format(new Date(user.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.is_active ? (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(user.id, false)}
                                    className="text-amber-600"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(user.id, true)}
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
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </SuperAdminLayout>
  );
}
