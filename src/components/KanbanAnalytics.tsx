import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import { SimpleBarChart, SimpleLineChart } from '@/components/SimpleChart';
import { TrendingUp, Clock, Target, Users, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import { PowerBIIntegration } from '@/components/PowerBIIntegration';

interface KanbanAnalyticsProps {
  tasks: Task[];
}

export function KanbanAnalytics({ tasks }: KanbanAnalyticsProps) {
  const [showPowerBI, setShowPowerBI] = useState(false);

  const analytics = useMemo(() => {
    const statusCounts = {
      assigned: tasks.filter(t => t.status === 'assigned').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      verified: tasks.filter(t => t.status === 'verified').length,
      rejected: tasks.filter(t => t.status === 'rejected').length,
    };

    const priorityCounts = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
    };

    const avgCycleTime = tasks
      .filter(t => t.status === 'verified')
      .reduce((acc, task) => {
        const created = new Date(task.created_at);
        const updated = new Date(task.updated_at);
        return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / tasks.filter(t => t.status === 'verified').length || 0;

    const throughput = tasks.filter(t => {
      const updated = new Date(t.updated_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return t.status === 'verified' && updated >= weekAgo;
    }).length;

    const completedTasks = tasks.filter(t => t.status === 'verified').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return {
      statusCounts,
      priorityCounts,
      avgCycleTime: Math.round(avgCycleTime * 10) / 10,
      throughput,
      totalTasks: tasks.length,
      completedTasks,
      completionRate,
      tasks, // Include raw tasks for PowerBI
      wipLimit: tasks.filter(t => t.status === 'in_progress').length,
    };
  }, [tasks]);

  const statusData = [
    { name: 'Assigned', value: analytics.statusCounts.assigned, color: '#3b82f6' },
    { name: 'In Progress', value: analytics.statusCounts.in_progress, color: '#f59e0b' },
    { name: 'Completed', value: analytics.statusCounts.completed, color: '#8b5cf6' },
    { name: 'Verified', value: analytics.statusCounts.verified, color: '#10b981' },
    { name: 'Rejected', value: analytics.statusCounts.rejected, color: '#ef4444' },
  ];

  const priorityData = [
    { name: 'Low', value: analytics.priorityCounts.low, color: '#6b7280' },
    { name: 'Medium', value: analytics.priorityCounts.medium, color: '#3b82f6' },
    { name: 'High', value: analytics.priorityCounts.high, color: '#f59e0b' },
    { name: 'Urgent', value: analytics.priorityCounts.urgent, color: '#ef4444' },
  ];

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.updated_at);
        return taskDate.toDateString() === date.toDateString() && task.status === 'verified';
      });
      
      // Calculate actual cycle time from created_at to updated_at
      const avgCycleTime = dayTasks.length > 0
        ? dayTasks.reduce((sum, task) => {
            const created = new Date(task.created_at);
            const updated = new Date(task.updated_at);
            return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / dayTasks.length
        : 0;
      
      return { 
        day, 
        completed: dayTasks.length,
        cycleTime: Math.round(avgCycleTime * 10) / 10
      };
    });
  }, [tasks]);

  const assigneeData = useMemo(() => {
    const assignees = tasks.reduce((acc, task) => {
      const assignee = task.assigned_profile?.full_name || 'Unassigned';
      if (!acc[assignee]) {
        acc[assignee] = { assigned: 0, completed: 0 };
      }
      acc[assignee].assigned++;
      if (task.status === 'verified') {
        acc[assignee].completed++;
      }
      return acc;
    }, {} as Record<string, { assigned: number; completed: number }>);

    return Object.entries(assignees).map(([name, stats]) => ({
      assignee: name,
      assigned: stats.assigned,
      completed: stats.completed,
      completion_rate: stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0
    }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{analytics.totalTasks}</p>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{analytics.throughput}</p>
            <p className="text-sm text-muted-foreground">Weekly Throughput</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{analytics.avgCycleTime}d</p>
            <p className="text-sm text-muted-foreground">Avg Cycle Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{assigneeData.length}</p>
            <p className="text-sm text-muted-foreground">Active Assignees</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium">{entry.name}</span>
                  </div>
                  <Badge variant="secondary">{entry.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={priorityData}
              dataKey="value"
              xAxisKey="name"
              height={250}
            />
          </CardContent>
        </Card>

        {/* Weekly Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={weeklyData}
              dataKey="completed"
              xAxisKey="day"
              height={250}
            />
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={assigneeData.slice(0, 5)}
              dataKey="completion_rate"
              xAxisKey="assignee"
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* PowerBI Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Advanced Analytics</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPowerBI(!showPowerBI)}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {showPowerBI ? 'Hide' : 'Show'} PowerBI Dashboard
          </Button>
        </CardHeader>
        {showPowerBI && (
          <CardContent>
            <PowerBIIntegration data={analytics} onClose={() => setShowPowerBI(false)} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}