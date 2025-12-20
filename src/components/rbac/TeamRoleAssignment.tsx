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
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import { toast } from 'sonner';
import { AppRole } from '@/hooks/useUserRole';

const ROLE_ICONS: Record<string, React.ElementType> = {
  super_admin: Shield,
  org_admin: Shield,
  admin: Shield,
  manager: Users,
  team_lead: UserCheck,
  employee: User,
  intern: GraduationCap,
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  org_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  team_lead: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  employee: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  intern: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const AVAILABLE_ROLES: { value: AppRole; label: string }[] = [
  { value: 'org_admin', label: 'Organization Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'employee', label: 'Employee' },
  { value: 'intern', label: 'Intern' },
];

export function TeamRoleAssignment() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { assignRoleToUser, roles: customRoles } = useCustomRoles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'role'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  // Fetch all team members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members-roles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
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
        .neq('role', 'super_admin')
        .order('full_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Filter and sort
  const filteredMembers = members.filter((member) =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    } catch (error) {
      console.error('Failed to assign role:', error);
      toast.error('Failed to assign role');
    } finally {
      setSavingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sortedMembers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No team members found</p>
        <p className="text-sm">
          Add team members to assign them roles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

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
                      {member.role?.replace('_', ' ') || 'Employee'}
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
    </div>
  );
}
