import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, Target, Users, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import { PowerBIIntegration } from '@/components/PowerBIIntegration';

interface KanbanAnalyticsProps {
  tasks: Task[];
}

export function KanbanAnalytics({ tasks }: KanbanAnalyticsProps) {
  const [showPowerBI, setShowPowerBI] = useState(false);

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    const statusDistribution = [
      { name: 'Assigned', count: tasks.filter(t => t.status === 'assigned').length, fill: '#3b82f6' },
      { name: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, fill: '#eab308' },
      { name: 'Completed', count: tasks.filter(t => t.status === 'completed').length, fill: '#8b5cf6' },
      { name: 'Verified', count: tasks.filter(t => t.status === 'verified').length, fill: '#10b981' },
      { name: 'Rejected', count: tasks.filter(t => t.status === 'rejected').length, fill: '#ef4444' },
    ];

    const priorityDistribution = [
      { name: 'Low', count: tasks.filter(t => t.priority === 'low').length, fill: '#10b981' },
      { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length, fill: '#eab308' },
      { name: 'High', count: tasks.filter(t => t.priority === 'high').length, fill: '#f97316' },
      { name: 'Urgent', count: tasks.filter(t => t.priority === 'urgent').length, fill: '#ef4444' },
    ];

    // Calculate cycle time (from assigned to verified)
    const completedTasks = tasks.filter(t => t.status === 'verified');
    const avgCycleTime = completedTasks.length > 0 
      ? completedTasks.reduce((acc, task) => {
          const start = new Date(task.created_at);
          const end = new Date(task.updated_at);
          return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedTasks.length
      : 0;

    // Lead time analysis
    const leadTimeData = tasks
      .filter(t => t.status === 'verified')
      .map(task => {
        const start = new Date(task.created_at);
        const end = new Date(task.updated_at);
        const leadTime = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return {
          taskName: task.title.substring(0, 20) + '...',
          leadTime: Math.round(leadTime * 10) / 10,
          priority: task.priority,
        };
      })
      .slice(-10); // Last 10 completed tasks

    // Throughput analysis (tasks completed per week)
    const throughputData = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const tasksCompleted = tasks.filter(t => {
        const updatedDate = new Date(t.updated_at);
        return t.status === 'verified' && updatedDate >= weekStart && updatedDate < weekEnd;
      }).length;
      
      throughputData.push({
        week: `Week ${8 - i}`,
        completed: tasksCompleted,
      });
    }

    // Team performance metrics
    const teamPerformance = tasks.reduce((acc, task) => {
      const assignee = task.assigned_profile?.full_name || 'Unassigned';
      if (!acc[assignee]) {
        acc[assignee] = {
          assigned: 0,
          completed: 0,
          avgCycleTime: 0,
          coins: 0,
        };
      }
      
      acc[assignee].assigned++;
      if (task.status === 'verified') {
        acc[assignee].completed++;
        acc[assignee].coins += task.slt_coin_value;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate efficiency metrics
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    const wipLimit = tasks.filter(t => t.status === 'in_progress').length;
    const bottleneckIndicator = wipLimit > completedTasks.length * 0.3;

    return {
      statusDistribution,
      priorityDistribution,
      avgCycleTime,
      leadTimeData,
      throughputData,
      teamPerformance,
      completionRate,
      wipLimit,
      bottleneckIndicator,
      totalTasks,
      completedTasks: completedTasks.length,
    };
  }, [tasks]);

  const exportToPowerBI = async () => {
    // Prepare data for Power BI export
    const powerBIData = {
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignee: task.assigned_profile?.full_name || 'Unassigned',
        created_at: task.created_at,
        updated_at: task.updated_at,
        slt_coin_value: task.slt_coin_value,
        project_id: task.project_id,
      })),
      analytics: analytics,
      timestamp: new Date().toISOString(),
    };

    // This would typically push to Power BI via API
    console.log('Exporting to Power BI:', powerBIData);
    setShowPowerBI(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kanban Analytics Dashboard</h3>
        <div className="flex gap-2">
          <Button onClick={exportToPowerBI} size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Export to Power BI
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Avg Cycle Time</p>
                <p className="text-2xl font-bold">{analytics.avgCycleTime.toFixed(1)}d</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">WIP Limit</p>
                <p className="text-2xl font-bold">
                  {analytics.wipLimit}
                  {analytics.bottleneckIndicator && (
                    <Badge variant="destructive" className="ml-2 text-xs">High</Badge>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold">{analytics.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Throughput Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.throughputData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Time Analysis (Last 10 Tasks)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.leadTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="taskName" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leadTime" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Team Member</th>
                  <th className="text-left py-2">Assigned</th>
                  <th className="text-left py-2">Completed</th>
                  <th className="text-left py-2">Completion Rate</th>
                  <th className="text-left py-2">Coins Earned</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.teamPerformance).map(([member, stats]) => (
                  <tr key={member} className="border-b">
                    <td className="py-2 font-medium">{member}</td>
                    <td className="py-2">{stats.assigned}</td>
                    <td className="py-2">{stats.completed}</td>
                    <td className="py-2">
                      {stats.assigned > 0 ? ((stats.completed / stats.assigned) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="py-2">{stats.coins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Power BI Integration */}
      {showPowerBI && (
        <PowerBIIntegration 
          data={analytics} 
          onClose={() => setShowPowerBI(false)} 
        />
      )}
    </div>
  );
}