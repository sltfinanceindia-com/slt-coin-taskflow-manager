import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Search,
  ArrowUpDown,
  Shield,
  Users,
  UserCheck,
  GraduationCap,
  Check,
  Download,
  History,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import { toast } from 'sonner';
import { AppRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';

const ROLE_ICONS: Record<string, React.ElementType> = {
  super_admin: Shield,
  org_admin: Shield,
  admin: Shield,
  hr_admin: Shield,
  project_manager: Users,
  finance_manager: Users,
  manager: Users,
  team_lead: UserCheck,
  employee: User,
  intern: GraduationCap,
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  org_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  hr_admin: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  project_manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  finance_manager: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  team_lead: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  employee: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  intern: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const AVAILABLE_ROLES: { value: AppRole; label: string }[] = [
  { value: 'org_admin', label: 'Organization Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'manager', label: 'Manager' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'employee', label: 'Employee' },
  { value: 'intern', label: 'Intern' },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Organization Admin',
  admin: 'Admin',
  hr_admin: 'HR Admin',
  project_manager: 'Project Manager',
  finance_manager: 'Finance Manager',
  manager: 'Manager',
  team_lead: 'Team Lead',
  employee: 'Employee',
  intern: 'Intern',
};

export function TeamRoleAssignment() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { assignRoleToUser } = useCustomRoles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'role'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [historyOpen, setHistoryOpen] = useState(false);

  // Fetch all team members with roles from user_roles table (source of truth)
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members-roles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      // First get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          avatar_url,
          department,
          is_active,
          custom_role_id
        `)
        .eq('organization_id', profile.organization_id)
        .order('full_name');

      if (profilesError) throw profilesError;
      
      // Then get user_roles for this organization (source of truth)
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('organization_id', profile.organization_id);
      
      if (rolesError) throw rolesError;
      
      // Create a map of user_id to role from user_roles
      const roleMap = new Map(userRoles?.map(r => [r.user_id, r.role]) || []);
      
      // Merge - use user_roles.role as source of truth
      return (profiles || [])
        .map(p => ({
          ...p,
          // Use role from user_roles table (source of truth), fallback to profiles.role
          role: roleMap.get(p.id) || p.role || 'employee'
        }))
        .filter(p => p.role !== 'super_admin');
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch role change history from audit_logs
  const { data: roleHistory = [] } = useQuery({
    queryKey: ['role-change-history', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          old_values,
          new_values,
          timestamp,
          performed_by,
          user_id
        `)
        .eq('organization_id', profile.organization_id)
        .eq('table_name', 'user_roles')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Get user names for display
      const userIds = [...new Set([
        ...data.map(d => d.user_id),
        ...data.map(d => d.performed_by)
      ])];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const nameMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      
      return data.map(log => ({
        ...log,
        user_name: nameMap.get(log.user_id) || 'Unknown User',
        performed_by_name: nameMap.get(log.performed_by) || 'System',
        old_role: (log.old_values as any)?.role || 'none',
        new_role: (log.new_values as any)?.role || 'unknown',
      }));
    },
    enabled: !!profile?.organization_id && historyOpen,
  });

  // Filter and sort
  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter.length === 0 || roleFilter.includes(member.role || 'employee');
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && member.is_active !== false) ||
      (statusFilter === 'inactive' && member.is_active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue = '';
    let bValue = '';
    
    if (sortField === 'name') {
      aValue = a.full_name || '';
      bValue = b.full_name || '';
    } else {
      aValue = a.role || '';
      bValue = b.role || '';
    }
    
    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const toggleSort = (field: 'name' | 'role') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setSavingUserId(userId);
    try {
      await assignRoleToUser({ userId, role: newRole });
      queryClient.invalidateQueries({ queryKey: ['team-members-roles'] });
      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Failed to assign role:', error);
      toast.error('Failed to assign role');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleExport = () => {
    const csvData = [
      ['Name', 'Email', 'Role', 'Department', 'Status'],
      ...sortedMembers.map(m => [
        m.full_name || '',
        m.email || '',
        ROLE_LABELS[m.role || 'employee'] || m.role || 'Employee',
        m.department || '',
        m.is_active !== false ? 'Active' : 'Inactive'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `team-roles-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  const clearFilters = () => {
    setRoleFilter([]);
    setStatusFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = roleFilter.length > 0 || statusFilter !== 'all' || searchQuery !== '';

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {/* Role Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Role
                {roleFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {roleFilter.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {AVAILABLE_ROLES.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role.value}
                  checked={roleFilter.includes(role.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setRoleFilter([...roleFilter, role.value]);
                    } else {
                      setRoleFilter(roleFilter.filter(r => r !== role.value));
                    }
                  }}
                >
                  {role.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* History */}
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Role Change History</SheetTitle>
                <SheetDescription>
                  Recent role assignments and changes
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                <div className="space-y-4 pr-4">
                  {roleHistory.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No role changes recorded yet
                    </p>
                  ) : (
                    roleHistory.map((log) => (
                      <div key={log.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{log.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className={ROLE_COLORS[log.old_role] || ''}>
                            {ROLE_LABELS[log.old_role] || log.old_role}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge className={ROLE_COLORS[log.new_role] || ''}>
                            {ROLE_LABELS[log.new_role] || log.new_role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Changed by {log.performed_by_name}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          {/* Export */}
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {sortedMembers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No team members found</p>
          <p className="text-sm">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Add team members to assign them roles'}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => toggleSort('name')}
                    >
                      Team Member
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => toggleSort('role')}
                    >
                      Current Role
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Assign Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => {
                  const Icon = ROLE_ICONS[member.role || 'employee'] || User;
                  const colorClass = ROLE_COLORS[member.role || 'employee'] || ROLE_COLORS.employee;
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={member.avatar_url} alt={member.full_name} />
                            <AvatarFallback>
                              {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.full_name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={colorClass}>
                          <Icon className="h-3 w-3 mr-1" />
                          {ROLE_LABELS[member.role || 'employee'] || member.role?.replace('_', ' ') || 'Employee'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={member.role || 'employee'}
                          onValueChange={(value) => handleRoleChange(member.id, value as AppRole)}
                          disabled={savingUserId === member.id}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {member.is_active !== false ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {sortedMembers.length} of {members.length} team members
          </p>
        </>
      )}
    </div>
  );
}
