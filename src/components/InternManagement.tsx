import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, Plus, Coins, Trash, Eye, UserCheck, UserX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { InternDetailView } from '@/components/InternDetailView';
import { SkeletonCard } from '@/components/ui/skeleton';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'intern';
  department?: string;
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
}

interface InternFormData {
  email: string;
  password: string;
  full_name: string;
  department?: string;
  employee_id?: string;
}

export function InternManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Profile | null>(null);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InternFormData>();

  // Fetch all interns (including inactive for admin management)
  const { data: interns = [], isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'intern')
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Profile[];
    },
  });

  // Add new intern mutation
  const addInternMutation = useMutation({
    mutationFn: async (formData: InternFormData) => {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.full_name,
            role: 'intern',
            department: formData.department,
            employee_id: formData.employee_id,
          }
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      toast({
        title: "Intern Added",
        description: "New intern has been successfully added to the system.",
      });
      setDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Intern",
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

  // Delete intern mutation
  const deleteInternMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      toast({
        title: "Intern Removed",
        description: "Intern has been successfully removed from the system.",
      });
      setDeleteDialogOpen(false);
      setSelectedIntern(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error Removing Intern",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intern Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage team members</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Intern
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Intern</DialogTitle>
              <DialogDescription>
                Create a new intern account with login credentials.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  {...register('full_name', { required: 'Full name is required' })}
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <p className="error-message">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="intern@company.com"
                />
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  placeholder="Enter secure password"
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="employee_id">Employee ID (Optional)</Label>
                <Input
                  id="employee_id"
                  {...register('employee_id')}
                  placeholder="EMP001"
                />
              </div>

              <div>
                <Label htmlFor="department">Department (Optional)</Label>
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
                  {addInternMutation.isPending ? 'Adding...' : 'Add Intern'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Interns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : interns.length > 0 ? (
          interns.map((intern) => (
            <Card key={intern.id} className={`${!intern.is_active ? 'opacity-70 border-red-200 dark:border-red-900' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">{intern.full_name}</CardTitle>
                    <Badge variant={intern.is_active !== false ? "success" : "rejected"}>
                      {intern.is_active !== false ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                      {intern.is_active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedIntern(intern);
                        setDetailViewOpen(true);
                      }}
                      className="text-primary hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedIntern(intern);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{intern.email}</CardDescription>
                {!intern.is_active && intern.deactivation_reason && (
                  <div className="text-xs text-red-700 dark:text-red-400 italic mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <strong>Reason:</strong> {intern.deactivation_reason}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {intern.employee_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Employee ID:</span>
                      <Badge variant="outline">{intern.employee_id}</Badge>
                    </div>
                  )}
                  {intern.department && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Department:</span>
                      <span>{intern.department}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Coins:</span>
                    <div className="flex items-center space-x-1">
                      <Coins className="h-3 w-3 text-coin-gold" />
                      <span className="font-semibold text-coin-gold">{intern.total_coins}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Joined:</span>
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
                        onCheckedChange={(checked) => {
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
                <h3 className="text-lg font-semibold mb-2">No interns yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Start building your team by adding intern members to the system.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Intern
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Intern</DialogTitle>
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
              {deleteInternMutation.isPending ? 'Removing...' : 'Remove Intern'}
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