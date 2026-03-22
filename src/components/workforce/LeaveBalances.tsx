import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLeaveManagement } from '@/hooks/useLeaveManagement';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Download, Plus, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV } from '@/lib/export';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LeaveTypeFormData {
  name: string;
  description: string;
  days_per_year: number;
  is_paid: boolean;
  color: string;
  allow_carry_forward: boolean;
  max_carry_forward_days: number;
}

export const LeaveBalances: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { leaveTypes, allBalances, isAdminLoading, initializeBalances } = useLeaveManagement();
  const [showAddTypeDialog, setShowAddTypeDialog] = useState(false);
  const [formData, setFormData] = useState<LeaveTypeFormData>({
    name: '',
    description: '',
    days_per_year: 12,
    is_paid: true,
    color: '#3b82f6',
    allow_carry_forward: false,
    max_carry_forward_days: 0,
  });

  // Create leave type mutation
  const createLeaveType = useMutation({
    mutationFn: async (data: LeaveTypeFormData) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { error } = await supabase.from('leave_types').insert({
        ...data,
        organization_id: profile.organization_id,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type created successfully');
      setShowAddTypeDialog(false);
      setFormData({
        name: '',
        description: '',
        days_per_year: 12,
        is_paid: true,
        color: '#3b82f6',
        allow_carry_forward: false,
        max_carry_forward_days: 0,
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Fetch all employees filtered by organization
  const { data: employees = [] } = useQuery({
    queryKey: ['all-employees', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_active', true)
        .eq('organization_id', profile.organization_id)
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Group balances by employee
  const employeeBalances = employees.map(employee => {
    const balances = allBalances.filter(b => b.employee_id === employee.id);
    return { ...employee, balances };
  });

  const handleInitializeAll = async () => {
    if (leaveTypes.length === 0) {
      toast.error('Please add leave types first before initializing balances');
      return;
    }
    let initialized = 0;
    for (const employee of employees) {
      const hasBalances = allBalances.some(b => b.employee_id === employee.id);
      if (!hasBalances) {
        await initializeBalances.mutateAsync(employee.id);
        initialized++;
      }
    }
    if (initialized > 0) {
      toast.success(`Initialized leave balances for ${initialized} employee(s)`);
    } else {
      toast.info('All employees already have leave balances');
    }
  };

  if (isAdminLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 sm:h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Add Leave Type Dialog */}
      <Dialog open={showAddTypeDialog} onOpenChange={setShowAddTypeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Leave Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createLeaveType.mutate(formData); }} className="space-y-4">
            <div>
              <Label htmlFor="name">Leave Type Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Annual Leave, Sick Leave"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="days">Days Per Year *</Label>
                <Input
                  id="days"
                  type="number"
                  min={0}
                  value={formData.days_per_year}
                  onChange={(e) => setFormData({ ...formData, days_per_year: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Label htmlFor="is_paid">Paid Leave</Label>
              <Switch
                id="is_paid"
                checked={formData.is_paid}
                onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="carry_forward">Allow Carry Forward</Label>
              <Switch
                id="carry_forward"
                checked={formData.allow_carry_forward}
                onCheckedChange={(checked) => setFormData({ ...formData, allow_carry_forward: checked })}
              />
            </div>
            {formData.allow_carry_forward && (
              <div>
                <Label htmlFor="max_carry">Max Carry Forward Days</Label>
                <Input
                  id="max_carry"
                  type="number"
                  min={0}
                  value={formData.max_carry_forward_days}
                  onChange={(e) => setFormData({ ...formData, max_carry_forward_days: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddTypeDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLeaveType.isPending || !formData.name}>
                {createLeaveType.isPending ? 'Creating...' : 'Create Leave Type'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Employee Leave Balances
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage leave balances for all employees</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const exportData = employeeBalances.flatMap(emp => 
                  emp.balances.map(b => ({
                    Employee: emp.full_name,
                    Email: emp.email,
                    'Leave Type': leaveTypes.find(t => t.id === b.leave_type_id)?.name || '',
                    Total: Number(b.total_days),
                    Used: Number(b.used_days),
                    Available: Number(b.total_days) - Number(b.used_days),
                    Pending: Number(b.pending_days),
                  }))
                );
                exportToCSV(exportData, 'leave_balances');
                toast.success('Exported leave balances');
              }}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleInitializeAll} variant="outline" size="sm" className="w-full sm:w-auto" disabled={leaveTypes.length === 0}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Initialize All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Leave Types Warning */}
          {leaveTypes.length === 0 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Leave Types Configured</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                <span>Please add leave types first before initializing employee balances.</span>
                <Button size="sm" onClick={() => setShowAddTypeDialog(true)} className="w-fit">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Leave Type
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Leave Types List */}
          {leaveTypes.length > 0 && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configured Leave Types
                </h4>
                <Button size="sm" variant="ghost" onClick={() => setShowAddTypeDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add More
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {leaveTypes.map(type => (
                  <Badge 
                    key={type.id} 
                    variant="outline"
                    style={{ borderColor: type.color, color: type.color }}
                  >
                    {type.name} ({type.days_per_year} days)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {employeeBalances.map(employee => (
            <div key={employee.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{employee.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                </div>
                {employee.balances.length === 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={() => initializeBalances.mutate(employee.id)}
                  >
                    Initialize
                  </Button>
                )}
              </div>
              {employee.balances.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  {leaveTypes.map(type => {
                    const balance = employee.balances.find(b => b.leave_type_id === type.id);
                    if (!balance) return null;
                    const available = Number(balance.total_days) - Number(balance.used_days);
                    return (
                      <div key={type.id} className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-xs text-muted-foreground truncate">{type.name}:</span>
                        <Badge 
                          variant={available > 0 ? 'default' : 'destructive'}
                          className="font-mono text-[10px] h-5 px-1.5"
                        >
                          {available.toFixed(0)}/{Number(balance.total_days).toFixed(0)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">Employee</TableHead>
                {leaveTypes.map(type => (
                  <TableHead key={type.id} className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-xs">{type.name}</span>
                    </div>
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeBalances.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell className="sticky left-0 bg-background font-medium">
                    <div>
                      <p className="text-sm">{employee.full_name}</p>
                      <p className="text-xs text-muted-foreground">{employee.email}</p>
                    </div>
                  </TableCell>
                  {leaveTypes.map(type => {
                    const balance = employee.balances.find(b => b.leave_type_id === type.id);
                    if (!balance) {
                      return (
                        <TableCell key={type.id} className="text-center">
                          <Badge variant="outline" className="text-muted-foreground text-xs">-</Badge>
                        </TableCell>
                      );
                    }
                    const available = Number(balance.total_days) - Number(balance.used_days);
                    return (
                      <TableCell key={type.id} className="text-center">
                        <div className="space-y-1">
                          <Badge 
                            variant={available > 0 ? 'default' : 'destructive'}
                            className="font-mono text-xs"
                          >
                            {available.toFixed(1)} / {Number(balance.total_days).toFixed(1)}
                          </Badge>
                          {Number(balance.pending_days) > 0 && (
                            <p className="text-xs text-amber-600">
                              {Number(balance.pending_days).toFixed(1)} pending
                            </p>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    {employee.balances.length === 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => initializeBalances.mutate(employee.id)}
                      >
                        Initialize
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      </Card>
    </>
  );
};