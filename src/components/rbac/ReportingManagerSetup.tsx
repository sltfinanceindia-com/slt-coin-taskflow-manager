import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Network,
  Search,
  ChevronRight,
  User,
  Users,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string | null;
  department: string | null;
  reporting_manager_id: string | null;
}

export function ReportingManagerSetup() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, string | null>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['reporting-structure', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role, department, reporting_manager_id')
        .eq('organization_id', profile.organization_id)
        .neq('role', 'super_admin')
        .order('full_name');

      if (error) throw error;
      return (data || []) as TeamMember[];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredMembers = members.filter((member) =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getManagerName = (managerId: string | null) => {
    if (!managerId) return 'No Manager';
    const manager = members.find((m) => m.id === managerId);
    return manager?.full_name || 'Unknown';
  };

  const getManagerOptions = (userId: string) => {
    // Can't be your own manager
    return members.filter((m) => m.id !== userId);
  };

  const handleManagerChange = (userId: string, managerId: string | null) => {
    setPendingChanges((prev) => {
      const newMap = new Map(prev);
      newMap.set(userId, managerId);
      return newMap;
    });
    setEditingUserId(null);
  };

  const getEffectiveManager = (member: TeamMember) => {
    if (pendingChanges.has(member.id)) {
      return pendingChanges.get(member.id);
    }
    return member.reporting_manager_id;
  };

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      for (const [userId, managerId] of pendingChanges.entries()) {
        const { error } = await supabase
          .from('profiles')
          .update({ reporting_manager_id: managerId })
          .eq('id', userId);

        if (error) throw error;
      }

      toast.success(`Updated ${pendingChanges.size} reporting relationships`);
      setPendingChanges(new Map());
      queryClient.invalidateQueries({ queryKey: ['reporting-structure'] });
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearChanges = () => {
    setPendingChanges(new Map());
    setEditingUserId(null);
  };

  const getDirectReports = (managerId: string) => {
    return members.filter((m) => {
      const effectiveManager = getEffectiveManager(m);
      return effectiveManager === managerId;
    });
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            <CardTitle>Reporting Manager Setup</CardTitle>
          </div>
          <div className="flex gap-2">
            {pendingChanges.size > 0 && (
              <>
                <Badge variant="secondary">{pendingChanges.size} pending changes</Badge>
                <Button variant="ghost" size="sm" onClick={handleClearChanges}>
                  <X className="h-4 w-4 mr-1" />
                  Discard
                </Button>
              </>
            )}
            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={pendingChanges.size === 0 || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save All'}
            </Button>
          </div>
        </div>
        <CardDescription>
          Configure who reports to whom in your organization's hierarchy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                <TableHead>Team Member</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Reports To</TableHead>
                <TableHead>Direct Reports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const effectiveManager = getEffectiveManager(member);
                const hasChange = pendingChanges.has(member.id);
                const directReports = getDirectReports(member.id);

                return (
                  <TableRow
                    key={member.id}
                    className={hasChange ? 'bg-primary/5' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
                          <AvatarFallback>
                            {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.full_name}</p>
                          <p className="text-xs text-muted-foreground">{member.department || 'No department'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {member.role?.replace('_', ' ') || 'Employee'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingUserId === member.id ? (
                        <Select
                          value={effectiveManager || 'none'}
                          onValueChange={(v) =>
                            handleManagerChange(member.id, v === 'none' ? null : v)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Manager</SelectItem>
                            {getManagerOptions(member.id).map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={m.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {m.full_name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{m.full_name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto py-1 px-2 font-normal"
                          onClick={() => setEditingUserId(member.id)}
                        >
                          <div className="flex items-center gap-2">
                            {effectiveManager ? (
                              <>
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={
                                      members.find((m) => m.id === effectiveManager)
                                        ?.avatar_url || undefined
                                    }
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getManagerName(effectiveManager).charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{getManagerName(effectiveManager)}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Click to assign</span>
                            )}
                            {hasChange && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Changed
                              </Badge>
                            )}
                          </div>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {directReports.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{directReports.length}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No team members found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}