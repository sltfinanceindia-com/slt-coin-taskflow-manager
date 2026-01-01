import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  UserMinus,
  UserPlus,
  Eye,
  Search,
  ArrowUpDown,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useReportingStructure, useOrgChart } from '@/hooks/useReportingStructure';
import { useUserRole } from '@/hooks/useUserRole';

interface TeamMemberListProps {
  managerId?: string;
  showAll?: boolean;
  onSelectUser?: (userId: string) => void;
}

export function TeamMemberList({ managerId, showAll = false, onSelectUser }: TeamMemberListProps) {
  const { directReports, allTeamMembers, isLoading: structureLoading } = useReportingStructure();
  const { data: allUsers, isLoading: allUsersLoading } = useOrgChart();
  const { isAdmin } = useUserRole();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'role' | 'department'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isLoading = showAll ? allUsersLoading : structureLoading;
  
  // Get the appropriate list based on props
  // If showAll, show everyone in org
  // If managerId is provided, filter to show only direct reports of that manager
  // Otherwise show all team members the current user has access to
  const members = showAll
    ? allUsers || []
    : managerId
    ? (allUsers || []).filter((user: any) => user.reporting_manager_id === managerId)
    : directReports.length > 0 ? directReports : allTeamMembers;

  // Filter by search
  const filteredMembers = members.filter((member: any) =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.departments?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort members
  const sortedMembers = [...filteredMembers].sort((a: any, b: any) => {
    let aValue = '';
    let bValue = '';
    
    switch (sortField) {
      case 'name':
        aValue = a.full_name || '';
        bValue = b.full_name || '';
        break;
      case 'role':
        aValue = a.role || '';
        bValue = b.role || '';
        break;
      case 'department':
        aValue = a.departments?.name || '';
        bValue = b.departments?.name || '';
        break;
    }
    
    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const toggleSort = (field: 'name' | 'role' | 'department') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
        <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No team members found</p>
        <p className="text-sm">
          {showAll
            ? 'No employees in the organization yet'
            : 'You don\'t have any direct reports'}
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
                  Employee
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
                  Role
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => toggleSort('department')}
                >
                  Department
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Reports To</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMembers.map((member: any) => (
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
                  <Badge variant="outline" className="capitalize">
                    {member.role?.replace('_', ' ') || 'Employee'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.departments?.name ? (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{member.departments.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {member.reporting_manager ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={member.reporting_manager.avatar_url}
                          alt={member.reporting_manager.full_name}
                        />
                        <AvatarFallback className="text-xs">
                          {member.reporting_manager.full_name?.charAt(0)?.toUpperCase() || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.reporting_manager.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectUser?.(member.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onSelectUser?.(member.id)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Manager
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {sortedMembers.length} of {members.length} team members
      </p>
    </div>
  );
}
