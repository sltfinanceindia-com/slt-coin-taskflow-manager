import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserCog, AlertTriangle, CheckCircle, Briefcase } from 'lucide-react';

export function ResourceAllocationManagement() {
  const { profile } = useAuth();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['resource-employees', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, email, avatar_url, department').eq('organization_id', profile?.organization_id).eq('is_active', true).order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const { data: tasks } = useQuery({
    queryKey: ['resource-tasks', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('id, assigned_to, status').eq('organization_id', profile?.organization_id).in('status', ['assigned', 'in_progress']);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const { data: projects } = useQuery({
    queryKey: ['resource-projects', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name').eq('organization_id', profile?.organization_id).eq('status', 'active');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const getEmployeeUtilization = (employeeId: string) => {
    const employeeTasks = tasks?.filter(t => t.assigned_to === employeeId) || [];
    return Math.min(employeeTasks.length * 20, 100);
  };

  const getUtilizationBadge = (utilization: number) => {
    if (utilization > 100) return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Over-allocated</Badge>;
    if (utilization >= 80) return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Optimal</Badge>;
    if (utilization >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Under-utilized</Badge>;
    return <Badge variant="secondary">Available</Badge>;
  };

  const totalEmployees = employees?.length || 0;
  const overAllocated = employees?.filter(e => getEmployeeUtilization(e.id) > 100).length || 0;
  const available = employees?.filter(e => getEmployeeUtilization(e.id) < 50).length || 0;
  const activeProjects = projects?.length || 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><UserCog className="h-6 w-6 text-primary" />Resource Allocation</h1><p className="text-muted-foreground">Manage team assignments and capacity</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Resources</CardTitle><Users className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalEmployees}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Over-allocated</CardTitle><AlertTriangle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{overAllocated}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Available</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{available}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Projects</CardTitle><Briefcase className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{activeProjects}</div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Team Utilization</CardTitle><CardDescription>View resource allocation across projects</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : employees && employees.length > 0 ? (
            <Table><TableHeader><TableRow><TableHead>Team Member</TableHead><TableHead>Department</TableHead><TableHead>Active Tasks</TableHead><TableHead>Utilization</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {employees.map((employee) => {
                  const utilization = getEmployeeUtilization(employee.id);
                  const taskCount = tasks?.filter(t => t.assigned_to === employee.id).length || 0;
                  return (
                    <TableRow key={employee.id}>
                      <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={employee.avatar_url || undefined} /><AvatarFallback>{employee.full_name.charAt(0)}</AvatarFallback></Avatar><div><div className="font-medium">{employee.full_name}</div><div className="text-sm text-muted-foreground">{employee.email}</div></div></div></TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell><Badge variant="outline">{taskCount} tasks</Badge></TableCell>
                      <TableCell><div className="space-y-1"><div className="flex justify-between text-sm"><span>{utilization}%</span></div><Progress value={Math.min(utilization, 100)} className={`h-2 ${utilization > 100 ? '[&>div]:bg-red-500' : ''}`} /></div></TableCell>
                      <TableCell>{getUtilizationBadge(utilization)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No team members found</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
