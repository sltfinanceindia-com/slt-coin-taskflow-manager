import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Search,
  Check,
  X,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useReportingStructure } from '@/hooks/useReportingStructure';

interface ReportingManagerAssignmentProps {
  userId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportingManagerAssignment({
  userId,
  open,
  onOpenChange,
}: ReportingManagerAssignmentProps) {
  const { profile } = useAuth();
  const { assignManager, removeManager } = useReportingStructure();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(userId || null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all employees
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees-for-assignment', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          role,
          reporting_manager_id,
          departments:department_id(name)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id && open,
  });

  // Get the selected employee's current manager
  const selectedEmployeeData = employees?.find((e: any) => e.id === selectedEmployee);
  const currentManagerId = selectedEmployeeData?.reporting_manager_id;

  // Filter employees for manager selection (exclude the selected employee)
  const availableManagers = employees?.filter((e: any) => 
    e.id !== selectedEmployee &&
    (e.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     e.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Filter employees for employee selection
  const filteredEmployees = employees?.filter((e: any) =>
    e.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  useEffect(() => {
    if (userId) {
      setSelectedEmployee(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (selectedEmployeeData?.reporting_manager_id) {
      setSelectedManager(selectedEmployeeData.reporting_manager_id);
    } else {
      setSelectedManager(null);
    }
  }, [selectedEmployeeData]);

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedManager) {
        await assignManager(selectedEmployee, selectedManager);
        toast.success('Manager assigned successfully');
      } else if (currentManagerId) {
        await removeManager(selectedEmployee);
        toast.success('Manager removed successfully');
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating manager:', error);
      toast.error('Failed to update manager assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveManager = async () => {
    if (!selectedEmployee || !currentManagerId) return;
    
    setIsSubmitting(true);
    try {
      await removeManager(selectedEmployee);
      toast.success('Manager removed successfully');
      setSelectedManager(null);
    } catch (error) {
      toast.error('Failed to remove manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Reporting Manager</DialogTitle>
          <DialogDescription>
            Select an employee and assign their reporting manager
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Employee</label>
            {userId ? (
              selectedEmployeeData && (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedEmployeeData.avatar_url} />
                    <AvatarFallback>
                      {selectedEmployeeData.full_name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedEmployeeData.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedEmployeeData.email}</p>
                  </div>
                </div>
              )
            ) : (
              <Select value={selectedEmployee || ''} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {filteredEmployees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={emp.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {emp.full_name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{emp.full_name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {emp.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Current Manager (if any) */}
          {selectedEmployee && currentManagerId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Manager</label>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                {(() => {
                  const manager = employees?.find((e: any) => e.id === currentManagerId);
                  if (!manager) return <span className="text-muted-foreground">Unknown</span>;
                  return (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={manager.avatar_url} />
                        <AvatarFallback>
                          {manager.full_name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{manager.full_name}</p>
                        <p className="text-xs text-muted-foreground">{manager.role}</p>
                      </div>
                    </div>
                  );
                })()}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleRemoveManager}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Manager Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {currentManagerId ? 'Change Manager To' : 'Assign Manager'}
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search managers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-[200px] border rounded-lg">
              {employeesLoading ? (
                <div className="p-2 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : availableManagers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No managers found</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {availableManagers.map((manager: any) => (
                    <button
                      key={manager.id}
                      onClick={() => setSelectedManager(manager.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        selectedManager === manager.id
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={manager.avatar_url} />
                          <AvatarFallback>
                            {manager.full_name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-medium text-sm">{manager.full_name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {manager.role}
                            </Badge>
                            {manager.departments?.name && (
                              <span className="text-xs text-muted-foreground">
                                {manager.departments.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedManager === manager.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedEmployee || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
