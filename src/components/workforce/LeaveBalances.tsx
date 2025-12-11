import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeaveManagement } from '@/hooks/useLeaveManagement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';

export const LeaveBalances: React.FC = () => {
  const { leaveTypes, allBalances, isAdminLoading, initializeBalances } = useLeaveManagement();

  // Fetch all employees
  const { data: employees = [] } = useQuery({
    queryKey: ['all-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  // Group balances by employee
  const employeeBalances = employees.map(employee => {
    const balances = allBalances.filter(b => b.employee_id === employee.id);
    return { ...employee, balances };
  });

  const handleInitializeAll = async () => {
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
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            Employee Leave Balances
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage leave balances for all employees</CardDescription>
        </div>
        <Button onClick={handleInitializeAll} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Initialize All
        </Button>
      </CardHeader>
      <CardContent>
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
  );
};