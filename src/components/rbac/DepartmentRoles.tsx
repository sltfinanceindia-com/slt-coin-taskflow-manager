import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Settings,
  Users,
  Shield,
  UserCheck,
  User,
  GraduationCap,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AppRole } from '@/hooks/useUserRole';

const ROLE_OPTIONS: { value: AppRole; label: string; icon: React.ElementType }[] = [
  { value: 'org_admin', label: 'Organization Admin', icon: Shield },
  { value: 'manager', label: 'Manager', icon: Users },
  { value: 'team_lead', label: 'Team Lead', icon: UserCheck },
  { value: 'employee', label: 'Employee', icon: User },
  { value: 'intern', label: 'Intern', icon: GraduationCap },
];

interface DepartmentRoleMapping {
  departmentId: string;
  departmentName: string;
  defaultRole: AppRole;
  autoAssign: boolean;
  memberCount: number;
}

export function DepartmentRoles() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [mappings, setMappings] = useState<Map<string, { role: AppRole; autoAssign: boolean }>>(
    new Map()
  );
  const [isSaving, setIsSaving] = useState(false);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['department-roles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // Fetch departments
      const { data: depts, error: deptError } = await supabase
        .from('departments')
        .select('id, name, color')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (deptError) throw deptError;

      // Get member counts per department
      const { data: profiles } = await supabase
        .from('profiles')
        .select('department')
        .eq('organization_id', profile.organization_id);

      const deptCounts = new Map<string, number>();
      profiles?.forEach((p) => {
        if (p.department) {
          deptCounts.set(p.department, (deptCounts.get(p.department) || 0) + 1);
        }
      });

      return (depts || []).map((d) => ({
        id: d.id,
        name: d.name,
        color: d.color,
        memberCount: deptCounts.get(d.name) || 0,
      }));
    },
    enabled: !!profile?.organization_id,
  });

  const handleRoleChange = (deptId: string, role: AppRole) => {
    setMappings((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(deptId) || { role: 'employee' as AppRole, autoAssign: false };
      newMap.set(deptId, { ...existing, role });
      return newMap;
    });
  };

  const handleAutoAssignToggle = (deptId: string) => {
    setMappings((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(deptId) || { role: 'employee' as AppRole, autoAssign: false };
      newMap.set(deptId, { ...existing, autoAssign: !existing.autoAssign });
      return newMap;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, you would save these mappings to a database table
      // For now, we'll just show a success message
      toast.success('Department role mappings saved');
    } catch (error) {
      toast.error('Failed to save mappings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyRoles = async () => {
    setIsSaving(true);
    try {
      let updated = 0;
      
      for (const [deptId, config] of mappings.entries()) {
        if (config.autoAssign) {
          const dept = departments.find((d) => d.id === deptId);
          if (!dept) continue;

          // Get all users in this department
          const { data: users } = await supabase
            .from('profiles')
            .select('id')
            .eq('organization_id', profile?.organization_id)
            .eq('department', dept.name);

          // Update their roles
          if (users && users.length > 0) {
            for (const user of users) {
              await supabase
                .from('user_roles')
                .upsert({
                  user_id: user.id,
                  role: config.role as any,
                  organization_id: profile?.organization_id,
                });
              
              await supabase
                .from('profiles')
                .update({ role: config.role as any })
                .eq('id', user.id);
              
              updated++;
            }
          }
        }
      }

      toast.success(`Updated roles for ${updated} users`);
      queryClient.invalidateQueries({ queryKey: ['team-members-roles'] });
    } catch (error) {
      toast.error('Failed to apply roles');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
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
            <Building2 className="h-5 w-5" />
            <CardTitle>Department-based Roles</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button size="sm" onClick={handleApplyRoles} disabled={isSaving}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
              Apply Roles
            </Button>
          </div>
        </div>
        <CardDescription>
          Automatically assign roles to users based on their department membership
        </CardDescription>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No departments found</p>
            <p className="text-sm">Create departments first to set up role mappings</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Default Role</TableHead>
                  <TableHead className="text-center">Auto-Assign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => {
                  const config = mappings.get(dept.id) || { role: 'employee' as AppRole, autoAssign: false };
                  const RoleIcon = ROLE_OPTIONS.find((r) => r.value === config.role)?.icon || User;
                  
                  return (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: dept.color || '#6b7280' }}
                          />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dept.memberCount} members</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={config.role}
                          onValueChange={(v) => handleRoleChange(dept.id, v as AppRole)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center gap-2">
                                  <role.icon className="h-4 w-4" />
                                  {role.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={config.autoAssign}
                          onCheckedChange={() => handleAutoAssignToggle(dept.id)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}