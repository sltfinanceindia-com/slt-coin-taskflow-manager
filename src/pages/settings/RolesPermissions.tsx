import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  User,
  GraduationCap,
  ChevronLeft,
  Search,
  MoreVertical,
  Copy,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useCustomRoles, RoleWithPermissions } from '@/hooks/useCustomRoles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RoleEditor } from '@/components/rbac/RoleEditor';
import { RolePermissionMatrix, ModulePermission, PERMISSION_TEMPLATES } from '@/components/rbac/RolePermissionMatrix';

const ROLE_ICONS: Record<string, React.ElementType> = {
  org_admin: Shield,
  manager: Users,
  team_lead: UserCheck,
  employee: User,
  intern: GraduationCap,
  admin: Shield,
};

const ROLE_COLORS: Record<string, string> = {
  org_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  team_lead: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  employee: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  intern: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export default function RolesPermissions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { roles, isLoading, createRole, updateRole, deleteRole, updatePermission } = useCustomRoles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [viewingRoleId, setViewingRoleId] = useState<string | null>(null);

  const { data: selectedRoleData, isLoading: roleDataLoading } = useQuery({
    queryKey: ['role-with-permissions', selectedRoleId || viewingRoleId],
    queryFn: async () => {
      const id = selectedRoleId || viewingRoleId;
      if (!id) return null;
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*, role_permissions(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!(selectedRoleId || viewingRoleId),
  });

  const filteredRoles = roles?.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const systemRoles = filteredRoles.filter((r) => r.is_system_role);
  const customRoles = filteredRoles.filter((r) => !r.is_system_role);

  const handleCreateRole = async (data: any) => {
    await createRole({
      name: data.name,
      description: data.description,
      role_type: data.role_type,
      hierarchy_level: data.hierarchy_level,
      permissions: data.permissions,
    });
    setIsCreating(false);
  };

  const handleUpdateRole = async (data: any) => {
    if (!selectedRoleId) return;
    
    // Update the role basic info
    await updateRole({
      id: selectedRoleId,
      name: data.name,
      description: data.description,
    });
    
    // Update permissions separately if provided
    if (data.permissions?.length > 0) {
      for (const perm of data.permissions) {
        await updatePermission({
          roleId: selectedRoleId,
          module: perm.module_name,
          permission: perm,
        });
      }
    }
    
    setIsEditing(false);
    setSelectedRoleId(null);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    await deleteRole(roleToDelete);
    setRoleToDelete(null);
    toast.success('Role deleted successfully');
  };

  const handleDuplicateRole = async (roleId: string) => {
    const role = roles?.find((r) => r.id === roleId);
    if (!role) return;
    
    // Would need to fetch permissions for this role
    toast.info('Duplicating role...');
    await createRole({
      name: `${role.name} (Copy)`,
      description: role.description || '',
      role_type: role.role_type,
      hierarchy_level: role.hierarchy_level,
      permissions: PERMISSION_TEMPLATES[role.role_type as keyof typeof PERMISSION_TEMPLATES] || PERMISSION_TEMPLATES.employee,
    });
    toast.success('Role duplicated successfully');
  };

  if (isCreating || isEditing) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedRoleId(null);
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        <RoleEditor
          initialData={
            isEditing && selectedRoleData
              ? {
                  id: selectedRoleData.id,
                  name: selectedRoleData.name,
                  description: selectedRoleData.description || undefined,
                  role_type: selectedRoleData.role_type,
                  hierarchy_level: selectedRoleData.hierarchy_level,
                  is_system_role: selectedRoleData.is_system_role || false,
                  permissions: selectedRoleData.role_permissions?.map((p: any) => ({
                    module_name: p.module_name,
                    can_view: p.can_view,
                    can_create: p.can_create,
                    can_edit: p.can_edit,
                    can_delete: p.can_delete,
                    can_approve: p.can_approve,
                    can_export: p.can_export,
                    visibility_scope: p.visibility_scope,
                  })),
                }
              : undefined
          }
          onSave={isEditing ? handleUpdateRole : handleCreateRole}
          onCancel={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedRoleId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles and configure what each role can access
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Role List */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Roles</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="px-4 pb-4">
                  {/* System Roles */}
                  {systemRoles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        SYSTEM ROLES
                      </p>
                      <div className="space-y-1">
                        {systemRoles.map((role) => {
                          const Icon = ROLE_ICONS[role.role_type] || User;
                          return (
                            <div
                              key={role.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-md ${ROLE_COLORS[role.role_type] || ROLE_COLORS.employee}`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{role.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Level {role.hierarchy_level}
                                  </p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setViewingRoleId(role.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedRoleId(role.id);
                                      setIsEditing(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateRole(role.id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Roles */}
                  {customRoles.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        CUSTOM ROLES
                      </p>
                      <div className="space-y-1">
                        {customRoles.map((role) => {
                          const Icon = ROLE_ICONS[role.role_type] || User;
                          return (
                            <div
                              key={role.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-md ${ROLE_COLORS[role.role_type] || ROLE_COLORS.employee}`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{role.name}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {role.role_type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setViewingRoleId(role.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedRoleId(role.id);
                                      setIsEditing(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateRole(role.id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setRoleToDelete(role.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filteredRoles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No roles found</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Permission Preview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Permission Overview</CardTitle>
            <CardDescription>
              {viewingRoleId
                ? 'Viewing permissions for selected role'
                : 'Select a role to view its permissions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewingRoleId && selectedRoleData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  {(() => {
                    const Icon = ROLE_ICONS[selectedRoleData.role_type] || User;
                    return (
                      <div
                        className={`p-3 rounded-md ${ROLE_COLORS[selectedRoleData.role_type] || ROLE_COLORS.employee}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRoleData.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoleData.description || 'No description'}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge>{selectedRoleData.role_type}</Badge>
                      <Badge variant="outline">Level {selectedRoleData.hierarchy_level}</Badge>
                      {selectedRoleData.is_system_role && (
                        <Badge variant="secondary">System Role</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <RolePermissionMatrix
                  permissions={
                    selectedRoleData.role_permissions?.map((p: any) => ({
                      module_name: p.module_name,
                      can_view: p.can_view,
                      can_create: p.can_create,
                      can_edit: p.can_edit,
                      can_delete: p.can_delete,
                      can_approve: p.can_approve,
                      can_export: p.can_export,
                      visibility_scope: p.visibility_scope,
                    })) || []
                  }
                  onChange={() => {}}
                  readOnly
                />
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setViewingRoleId(null)}>
                    Close Preview
                  </Button>
                </div>
              </div>
            ) : roleDataLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select a role to preview permissions</p>
                <p className="text-sm">
                  Click the view button on any role to see its configuration
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? Users assigned to this role will
              need to be reassigned. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
