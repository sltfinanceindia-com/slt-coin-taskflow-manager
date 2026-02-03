/**
 * Project Manager Dashboard
 * Shows PM-specific widgets: Project Status, Resource Allocation, Task Burndown
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Folder, CheckCircle, Clock, Users, ArrowRight,
  TrendingUp, AlertCircle, BarChart3, Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays } from 'date-fns';

export function ProjectManagerDashboard() {
  const { profile } = useAuth();

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['pm-projects', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch all tasks for projects
  const { data: tasks = [] } = useQuery({
    queryKey: ['pm-tasks', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles:assigned_to(full_name), projects:project_id(name)')
        .eq('organization_id', profile?.organization_id)
        .order('end_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch time logs for utilization
  const { data: timeLogs = [] } = useQuery({
    queryKey: ['pm-timelogs', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_logs')
        .select('*, profiles:user_id(full_name)')
        .eq('organization_id', profile?.organization_id)
        .gte('date_logged', format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Calculate metrics
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  
  const openTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'verified');
  const overdueTasks = openTasks.filter(t => {
    if (!t.end_date) return false;
    return new Date(t.end_date) < new Date();
  });
  const highPriorityTasks = openTasks.filter(t => t.priority === 'high' || t.priority === 'urgent');

  // Calculate team hours this week
  const totalHoursThisWeek = timeLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);

  const navigateToTab = (tab: string) => {
    const event = new CustomEvent('navigate-to-tab', { detail: { tab } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold">Project Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Manage projects, tasks, and team resources
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
                <p className="text-xs text-muted-foreground">
                  {completedProjects.length} completed
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Folder className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tasks</p>
                <p className="text-2xl font-bold">{openTasks.length}</p>
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {overdueTasks.length} overdue
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <Target className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Hours</p>
                <p className="text-2xl font-bold">{Math.round(totalHoursThisWeek)}h</p>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <Clock className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{highPriorityTasks.length}</p>
                <p className="text-xs text-muted-foreground">
                  Tasks needing attention
                </p>
              </div>
              <div className="p-3 rounded-full bg-destructive/10">
                <TrendingUp className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('projects')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Folder className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">All Projects</p>
              <p className="text-sm text-muted-foreground">{projects.length} total</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('tasks')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div className="flex-1">
              <p className="font-medium">Task Board</p>
              <p className="text-sm text-muted-foreground">{openTasks.length} open</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToTab('capacity')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-info" />
            <div className="flex-1">
              <p className="font-medium">Capacity</p>
              <p className="text-sm text-muted-foreground">Resource planning</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Active Projects
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('projects')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.slice(0, 5).map((project) => {
                const projectTasks = tasks.filter(t => t.project_id === project.id);
                const completedTasks = projectTasks.filter(t => t.status === 'completed' || t.status === 'verified');
                const progress = projectTasks.length > 0 
                  ? Math.round((completedTasks.length / projectTasks.length) * 100)
                  : 0;

                return (
                  <div 
                    key={project.id} 
                    className="p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {projectTasks.length} tasks • {completedTasks.length} completed
                        </p>
                      </div>
                      <Badge variant={progress >= 80 ? 'default' : progress >= 50 ? 'secondary' : 'outline'}>
                        {progress}%
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No active projects
            </p>
          )}
        </CardContent>
      </Card>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Overdue Tasks
              <Badge variant="destructive">{overdueTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueTasks.slice(0, 5).map((task: any) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.profiles?.full_name} • {task.projects?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-destructive font-medium">
                      {differenceInDays(new Date(), parseISO(task.end_date))} days overdue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Tasks Needing Attention
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('tasks')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {highPriorityTasks.length > 0 ? (
            <div className="space-y-3">
              {highPriorityTasks.slice(0, 5).map((task: any) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.profiles?.full_name} • {task.projects?.name}
                    </p>
                  </div>
                  <Badge 
                    variant={task.priority === 'urgent' ? 'destructive' : 'default'}
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No high priority tasks
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
