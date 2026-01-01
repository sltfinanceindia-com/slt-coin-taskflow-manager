import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import { toast } from 'sonner';
import { AppRole } from '@/hooks/useUserRole';

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: 'org_admin', label: 'Organization Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'employee', label: 'Employee' },
  { value: 'intern', label: 'Intern' },
];

export function BulkRoleAssignment() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { assignRoleToUser } = useCustomRoles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState<AppRole | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['bulk-assignment-members', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url, department')
        .eq('organization_id', profile.organization_id)
        .neq('role', 'super_admin')
        .order('full_name');

      if (error) throw error;
      return profiles || [];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredMembers = members.filter((member) =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredMembers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredMembers.map((m) => m.id));
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAssign = async () => {
    if (!targetRole || selectedUsers.length === 0) {
      toast.error('Please select users and a role');
      return;
    }

    setIsAssigning(true);
    try {
      for (const userId of selectedUsers) {
        await assignRoleToUser({ userId, role: targetRole });
      }
      toast.success(`Role assigned to ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setTargetRole('');
      queryClient.invalidateQueries({ queryKey: ['team-members-roles'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-assignment-members'] });
    } catch (error) {
      console.error('Bulk assignment error:', error);
      toast.error('Failed to assign roles to some users');
    } finally {
      setIsAssigning(false);
    }
  };

  const clearSelection = () => {
    setSelectedUsers([]);
    setTargetRole('');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Role Assignment
        </CardTitle>
        <CardDescription>
          Select multiple team members and assign them the same role at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Select All */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
          >
            {selectedUsers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Selected Count */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between bg-primary/10 text-primary rounded-lg px-4 py-2">
            <span className="text-sm font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* User List */}
        <ScrollArea className="h-[300px] border rounded-lg">
          <div className="p-2 space-y-1">
            {filteredMembers.map((member) => {
              const isSelected = selectedUsers.includes(member.id);
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleUser(member.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleUser(member.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatar_url} alt={member.full_name} />
                    <AvatarFallback>
                      {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.role?.replace('_', ' ') || 'Employee'}
                  </Badge>
                </div>
              );
            })}
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No team members found
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Target Role Selection */}
        <div className="flex items-center gap-3">
          <Select value={targetRole} onValueChange={(v) => setTargetRole(v as AppRole)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select role to assign" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={clearSelection}
          disabled={selectedUsers.length === 0}
        >
          Cancel
        </Button>
        <Button
          onClick={handleBulkAssign}
          disabled={selectedUsers.length === 0 || !targetRole || isAssigning}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          {isAssigning ? 'Assigning...' : `Assign to ${selectedUsers.length} Users`}
        </Button>
      </CardFooter>
    </Card>
  );
}