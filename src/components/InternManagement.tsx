import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { usePagination } from '@/hooks/usePagination';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { Users, Plus, Coins, Trash, Eye, UserCheck, UserX, AlertTriangle, Crown, Building2, CalendarDays, Briefcase } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { InternDetailView } from '@/components/InternDetailView';
import { SkeletonCard } from '@/components/ui/skeleton';
import { PaginationControls } from '@/components/common/PaginationControls';
import { internFormSchema, type InternFormData } from '@/utils/validation-schemas';

interface DepartmentInfo {
  id: string;
  name: string;
  color?: string;
}

interface DesignationInfo {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'intern' | 'org_admin' | 'manager' | 'employee';
  department?: string;
  department_id?: string;
  department_info?: DepartmentInfo;
  designation_id?: string;
  designation_info?: DesignationInfo;
  employee_id?: string;
  avatar_url?: string;
  total_coins: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  deactivated_at?: string;
  deactivation_reason?: string;
  reactivated_at?: string;
  organization_id?: string;
  location?: string;
}

export function InternManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Profile | null>(null);
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { organization, userCount } = useOrganization();
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InternFormData>({
    resolver: zodResolver(internFormSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      department: '',
      employee_id: '',
      role: 'employee',
    }
  });

  // Calculate subscription limits
  const maxUsers = organization?.max_users || 5;
  const isUnlimited = maxUsers === -1;
  const usagePercentage = isUnlimited ? 0 : Math.round((userCount / maxUsers) * 100);
  const isAtLimit = !isUnlimited && userCount >= maxUsers;
  const isNearLimit = !isUnlimited && usagePercentage >= 80;

  const coinName = organization?.coin_name || 'Coins';

  // Fetch custom roles from database for dynamic role dropdown
  const { roles: customRoles } = useCustomRoles();

  // System roles that are always available
  const systemRoles = [
    { value: 'org_admin', label: 'Organization Admin' },
    { value: 'hr_admin', label: 'HR Admin' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'manager', label: 'Manager' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'employee', label: 'Employee' },
    { value: 'intern', label: 'Intern' },
  ];

  // Fetch all users from this organization with their roles and department info
  const { data: interns = [], isLoading } = useQuery({
    queryKey: ['interns', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      // Get profiles with department join only (designations may not have FK)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          department_info:departments(id, name, color)
        `)
        .eq('organization_id', profile.organization_id)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Fallback to simple query without joins
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('is_active', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        
        // Get roles and merge
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('organization_id', profile.organization_id);
        
        const roleMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);
        
        return (fallbackData || [])
          .map(p => ({
            ...p,
            role: roleMap.get(p.id) || p.role || 'employee'
          }))
          .filter(p => p.role !== 'super_admin') as Profile[];
      }
      
      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('organization_id', profile.organization_id);
      
      if (rolesError) console.error('Error fetching roles:', rolesError);
      
      // Create a map of user_id to role
      const roleMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);
      
      // Merge profiles with roles from user_roles table
      const mergedData = (profilesData || [])
        .map(p => ({
          ...p,
          role: roleMap.get(p.id) || p.role || 'employee'
        }))
        .filter(p => p.role !== 'super_admin');
      
      return mergedData as unknown as Profile[];
    },
    enabled: !!profile?.organization_id,
  });

  // Pagination for team members
  const {
    paginatedData: paginatedInterns,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    pageNumbers,
    canNextPage,
    canPrevPage,
    pageSizeOptions,
    setPage,
    setPageSize,
  } = usePagination(interns, { initialPageSize: 12 });

  // Add new intern mutation - uses edge function to avoid auto-login
  const addInternMutation = useMutation({
    mutationFn: async (formData: InternFormData) => {
      // Check subscription limit before adding
      if (isAtLimit) {
        throw new Error(`You've reached your plan limit of ${maxUsers} users. Please upgrade your plan to add more users.`);
      }

      // Use edge function to create user without logging them in
      const { data, error } = await supabase.functions.invoke('create-organization-user', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
          department: formData.department,
          employee_id: formData.employee_id,
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      toast({
        title: "Team Member Added",
        description: "New team member has been successfully added to the system.",
      });
      setDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Team Member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle user active status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data, error } = await supabase.functions.invoke('manage-user-credentials', {
        body: { 
          action: isActive ? 'deactivate' : 'activate',
          userId 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      toast({
        title: variables.isActive ? "User Deactivated" : "User Reactivated",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    },
  });

  // Delete intern mutation - uses secure edge function instead of client-side admin API
  const deleteInternMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      toast({
        title: "Team Member Removed",
        description: "Team member has been successfully removed from the system.",
      });
      setDeleteDialogOpen(false);
      setSelectedIntern(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error Removing Team Member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InternFormData) => {
    addInternMutation.mutate(data);
  };

  const handleDeleteIntern = () => {
    if (selectedIntern) {
      deleteInternMutation.mutate(selectedIntern.user_id);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'org_admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"><Crown className="h-3 w-3 mr-1" />Org Admin</Badge>;
      case 'admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'hr_admin':
        return <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"><Crown className="h-3 w-3 mr-1" />HR Admin</Badge>;
      case 'project_manager':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"><Crown className="h-3 w-3 mr-1" />Project Manager</Badge>;
      case 'finance_manager':
        return <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300"><Crown className="h-3 w-3 mr-1" />Finance Manager</Badge>;
      case 'manager':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><Crown className="h-3 w-3 mr-1" />Manager</Badge>;
      case 'team_lead':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">Team Lead</Badge>;
      case 'employee':
        return <Badge variant="outline">Employee</Badge>;
      case 'intern':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Intern</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Add, edit, and manage team members</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isAtLimit} size="sm" className="sm:size-default w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Create a new team member account with login credentials.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="user@company.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Enter secure password (min 8 characters)"
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>System Roles</SelectLabel>
                          {systemRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        {customRoles.length > 0 && (
                          <>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Custom Roles</SelectLabel>
                              {customRoles.map((role) => (
                                <SelectItem key={role.id} value={role.role_type}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1">This determines the user's permissions level.</p>
              </div>

              <div>
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  {...register('employee_id')}
                  placeholder="EMP001"
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="Finance"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addInternMutation.isPending}>
                  {addInternMutation.isPending ? 'Adding...' : 'Add Team Member'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscription Limit Warning */}
      {!isUnlimited && (
        <Card className={isAtLimit ? 'border-destructive' : isNearLimit ? 'border-amber-500' : ''}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Team Members</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {userCount} / {maxUsers} users
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {isAtLimit && (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your plan limit. Upgrade to add more team members.
                </AlertDescription>
              </Alert>
            )}
            {isNearLimit && !isAtLimit && (
              <p className="text-sm text-amber-600 mt-2">
                You're approaching your user limit. Consider upgrading your plan.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : paginatedInterns.length > 0 ? (
          paginatedInterns.map((intern) => (
            <Card key={intern.id} className={`${!intern.is_active ? 'opacity-70 border-destructive/50' : ''}`}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">{intern.full_name}</CardTitle>
                    <Badge variant={intern.is_active !== false ? "default" : "destructive"} className="text-[10px] sm:text-xs w-fit">
                      {intern.is_active !== false ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                      {intern.is_active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedIntern(intern);
                        setDetailViewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedIntern(intern);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs sm:text-sm truncate">{intern.email}</CardDescription>
                {!intern.is_active && intern.deactivation_reason && (
                  <div className="text-[10px] sm:text-xs text-destructive italic mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                    <strong>Reason:</strong> {intern.deactivation_reason}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    {getRoleBadge(intern.role)}
                  </div>
                  {intern.employee_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Employee ID:</span>
                      <Badge variant="outline">{intern.employee_id}</Badge>
                    </div>
                  )}
                  {/* Show department from relationship or fallback to string field */}
                  {(intern.department_info || intern.department) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Department:
                      </span>
                      {intern.department_info ? (
                        <Badge 
                          variant="secondary" 
                          style={{ 
                            backgroundColor: intern.department_info.color ? `${intern.department_info.color}20` : undefined,
                            color: intern.department_info.color || undefined,
                            borderColor: intern.department_info.color || undefined 
                          }}
                        >
                          {intern.department_info.name}
                        </Badge>
                      ) : (
                        <span>{intern.department}</span>
                      )}
                    </div>
                  )}
                  {/* Show designation if available */}
                  {intern.designation_info && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Designation:
                      </span>
                      <span className="font-medium">{intern.designation_info.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total {coinName}:</span>
                    <div className="flex items-center space-x-1">
                      <Coins className="h-3 w-3 text-coin-gold" />
                      <span className="font-semibold text-coin-gold">{intern.total_coins}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Joined:
                    </span>
                    <span>{new Date(intern.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Account Status:</span>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`status-${intern.id}`} className="text-xs">
                        {intern.is_active !== false ? 'Active' : 'Inactive'}
                      </Label>
                      <Switch
                        id={`status-${intern.id}`}
                        checked={intern.is_active !== false}
                        onCheckedChange={() => {
                          toggleStatusMutation.mutate({ 
                            userId: intern.id, 
                            isActive: intern.is_active !== false
                          });
                        }}
                        disabled={toggleStatusMutation.isPending}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Start building your team by adding members to the system.
                </p>
                <Button onClick={() => setDialogOpen(true)} disabled={isAtLimit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Team Member
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && interns.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          pageNumbers={pageNumbers}
          canNextPage={canNextPage}
          canPrevPage={canPrevPage}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedIntern?.full_name} from the system? 
              This action cannot be undone and will delete all their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteIntern}
              disabled={deleteInternMutation.isPending}
            >
              {deleteInternMutation.isPending ? 'Removing...' : 'Remove Team Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Intern Detail View */}
      {detailViewOpen && selectedIntern && (
        <InternDetailView 
          internId={selectedIntern.id}
          onClose={() => {
            setDetailViewOpen(false);
            setSelectedIntern(null);
          }}
        />
      )}
    </div>
  );
}