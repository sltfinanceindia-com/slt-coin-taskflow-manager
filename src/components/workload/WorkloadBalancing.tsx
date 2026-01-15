import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Gauge, Users, AlertTriangle, TrendingUp, TrendingDown,
  Clock, CheckCircle, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface TeamMemberWorkload {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  estimatedHours: number;
  actualHours: number;
  utilizationPercent: number;
  status: 'underloaded' | 'optimal' | 'overloaded';
}

export function WorkloadBalancing() {
  const { profile } = useAuth();
  const [timeRange, setTimeRange] = useState('current');
  const [department, setDepartment] = useState('all');

  // Fetch team members with their workload
  const { data: workloadData, isLoading } = useQuery({
    queryKey: ['workload-balancing', profile?.organization_id, timeRange],
    queryFn: async () => {
      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url, department')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true);

      if (membersError) throw membersError;

      // Get tasks for each member
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, assigned_to, status, estimated_hours, actual_hours, priority')
        .eq('organization_id', profile?.organization_id)
        .in('status', ['assigned', 'in_progress', 'completed']);

      if (tasksError) throw tasksError;

      // Calculate workload per member
      const workloadMap = new Map<string, TeamMemberWorkload>();

      members?.forEach(member => {
        const memberTasks = tasks?.filter(t => t.assigned_to === member.id) || [];
        const totalTasks = memberTasks.length;
        const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = memberTasks.filter(t => t.status === 'in_progress').length;
        const estimatedHours = memberTasks.reduce((sum, t) => sum + (t.estimated_hours || 2), 0);
        const actualHours = memberTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);
        
        // Assuming 40 hours/week capacity
        const weeklyCapacity = 40;
        const utilizationPercent = Math.round((estimatedHours / weeklyCapacity) * 100);

        let status: 'underloaded' | 'optimal' | 'overloaded' = 'optimal';
        if (utilizationPercent < 50) status = 'underloaded';
        else if (utilizationPercent > 100) status = 'overloaded';

        workloadMap.set(member.id, {
          id: member.id,
          name: member.full_name || member.email,
          email: member.email,
          role: member.role || 'Team Member',
          avatar_url: member.avatar_url,
          totalTasks,
          completedTasks,
          inProgressTasks,
          estimatedHours,
          actualHours,
          utilizationPercent,
          status,
        });
      });

      return Array.from(workloadMap.values());
    },
    enabled: !!profile?.organization_id,
  });

  const overloadedCount = workloadData?.filter(w => w.status === 'overloaded').length || 0;
  const underloadedCount = workloadData?.filter(w => w.status === 'underloaded').length || 0;
  const optimalCount = workloadData?.filter(w => w.status === 'optimal').length || 0;
  const avgUtilization = workloadData?.length 
    ? Math.round(workloadData.reduce((sum, w) => sum + w.utilizationPercent, 0) / workloadData.length) 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overloaded':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30"><AlertTriangle className="h-3 w-3 mr-1" />Overloaded</Badge>;
      case 'underloaded':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30"><TrendingDown className="h-3 w-3 mr-1" />Underloaded</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30"><CheckCircle className="h-3 w-3 mr-1" />Optimal</Badge>;
    }
  };

  const getUtilizationColor = (percent: number) => {
    if (percent > 100) return 'text-red-600';
    if (percent < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const chartData = workloadData?.map(w => ({
    name: w.name.split(' ')[0],
    utilization: w.utilizationPercent,
    tasks: w.totalTasks,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workload Balancing</h1>
          <p className="text-muted-foreground">Monitor and optimize team workload distribution</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">This Week</SelectItem>
              <SelectItem value="next">Next Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(avgUtilization)}`}>{avgUtilization}%</div>
            <Progress value={Math.min(avgUtilization, 100)} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overloadedCount}</div>
            <p className="text-xs text-muted-foreground">Team members &gt;100% capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Optimal</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{optimalCount}</div>
            <p className="text-xs text-muted-foreground">Team members 50-100%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Underloaded</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{underloadedCount}</div>
            <p className="text-xs text-muted-foreground">Team members &lt;50% capacity</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution">
        <TabsList>
          <TabsTrigger value="distribution">Team Distribution</TabsTrigger>
          <TabsTrigger value="chart">Utilization Chart</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Workload Distribution</CardTitle>
              <CardDescription>Individual workload breakdown for each team member</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : workloadData && workloadData.length > 0 ? (
                <div className="space-y-4">
                  {workloadData.sort((a, b) => b.utilizationPercent - a.utilizationPercent).map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">{member.name.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(member.status)}
                          <div className={`text-2xl font-bold ${getUtilizationColor(member.utilizationPercent)}`}>
                            {member.utilizationPercent}%
                          </div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={Math.min(member.utilizationPercent, 100)} 
                        className="h-2 mb-3"
                      />
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Total Tasks</div>
                          <div className="font-medium">{member.totalTasks}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">In Progress</div>
                          <div className="font-medium text-blue-600">{member.inProgressTasks}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Completed</div>
                          <div className="font-medium text-green-600">{member.completedTasks}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Est. Hours</div>
                          <div className="font-medium">{member.estimatedHours}h</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Utilization Overview</CardTitle>
              <CardDescription>Visual comparison of workload across team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 150]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'utilization' ? `${value}%` : value,
                        name === 'utilization' ? 'Utilization' : 'Tasks'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="utilization" name="Utilization %" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.utilization > 100 ? '#ef4444' : entry.utilization < 50 ? '#eab308' : '#22c55e'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span>Overloaded (&gt;100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span>Optimal (50-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span>Underloaded (&lt;50%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="space-y-4">
            {overloadedCount > 0 && (
              <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Overload Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {overloadedCount} team member(s) are currently overloaded. Consider redistributing tasks.
                  </p>
                  <div className="space-y-2">
                    {workloadData?.filter(w => w.status === 'overloaded').map(member => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="font-medium">{member.name}</span>
                        <Badge variant="destructive">{member.utilizationPercent}% utilized</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {underloadedCount > 0 && (
              <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <TrendingDown className="h-5 w-5" />
                    Capacity Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {underloadedCount} team member(s) have available capacity for additional tasks.
                  </p>
                  <div className="space-y-2">
                    {workloadData?.filter(w => w.status === 'underloaded').map(member => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="font-medium">{member.name}</span>
                        <Badge variant="secondary">{100 - member.utilizationPercent}% available</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Optimization Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {overloadedCount > 0 && underloadedCount > 0 && (
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Move tasks from overloaded to underloaded members to balance workload</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                    <span>Review task estimates to ensure accurate capacity planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                    <span>Consider hiring if team consistently exceeds 80% average utilization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
