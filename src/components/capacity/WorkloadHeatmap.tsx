import React, { useState } from 'react';
import { useWorkload, EmployeeWorkload } from '@/hooks/useWorkload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, TrendingDown, Minus, Calendar, Filter } from 'lucide-react';
import { addDays, format, startOfWeek } from 'date-fns';

type FilterStatus = 'all' | 'under' | 'optimal' | 'over';

export function WorkloadHeatmap() {
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  
  const startDate = startOfWeek(new Date());
  const endDate = dateRange === 'week' ? addDays(startDate, 6) : addDays(startDate, 29);
  
  const { workloads, isLoading } = useWorkload(startDate, endDate);

  const filteredWorkloads = workloads.filter(w => 
    statusFilter === 'all' || w.status === statusFilter
  );

  const stats = {
    total: workloads.length,
    under: workloads.filter(w => w.status === 'under').length,
    optimal: workloads.filter(w => w.status === 'optimal').length,
    over: workloads.filter(w => w.status === 'over').length,
    avgUtilization: workloads.length > 0 
      ? Math.round(workloads.reduce((sum, w) => sum + w.utilization, 0) / workloads.length)
      : 0,
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return 'bg-blue-500';
    if (utilization < 70) return 'bg-green-500';
    if (utilization < 90) return 'bg-yellow-500';
    if (utilization < 110) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: EmployeeWorkload['status']) => {
    switch (status) {
      case 'under':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case 'over':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: EmployeeWorkload['status']) => {
    switch (status) {
      case 'under':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Under-utilized</Badge>;
      case 'over':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600">Overloaded</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600">Optimal</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Team Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.optimal}</p>
              <p className="text-xs text-muted-foreground">Optimal Load</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.over}</p>
              <p className="text-xs text-muted-foreground">Overloaded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.under}</p>
              <p className="text-xs text-muted-foreground">Under-utilized</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.avgUtilization}%</p>
              <p className="text-xs text-muted-foreground">Avg Utilization</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Team Workload Heatmap
            </CardTitle>
            <CardDescription>
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="under">Under</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
                <SelectItem value="over">Over</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as 'week' | 'month')}>
              <SelectTrigger className="w-28">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredWorkloads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Team Members"
              description="No team members found for the selected filter"
            />
          ) : (
            <div className="space-y-3">
              {filteredWorkloads.map((employee) => (
                <TooltipProvider key={employee.profile_id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/5 transition-colors cursor-default">
                        {/* Avatar & Info */}
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={employee.avatar_url || ''} />
                          <AvatarFallback>
                            {employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{employee.full_name}</span>
                            {getStatusBadge(employee.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{employee.task_count} tasks</span>
                            <span>{employee.assigned_hours}h / {employee.weekly_hours}h weekly</span>
                          </div>
                        </div>

                        {/* Utilization Bar */}
                        <div className="w-32 sm:w-48 shrink-0">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{employee.utilization}%</span>
                            {getStatusIcon(employee.status)}
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getUtilizationColor(employee.utilization)}`}
                              style={{ width: `${Math.min(100, employee.utilization)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{employee.full_name}</p>
                        <p className="text-xs capitalize">{employee.role}</p>
                        <p className="text-xs">
                          Assigned: {employee.assigned_hours}h of {employee.weekly_hours}h capacity
                        </p>
                        <p className="text-xs">
                          {employee.status === 'under' && 'Has available capacity for more work'}
                          {employee.status === 'optimal' && 'Workload is balanced'}
                          {employee.status === 'over' && 'At risk of burnout - consider reassigning tasks'}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-blue-500" />
              <span>&lt;50% Under</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-green-500" />
              <span>50-70% Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-yellow-500" />
              <span>70-90% Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-orange-500" />
              <span>90-110% High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-red-500" />
              <span>&gt;110% Overloaded</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
