import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnhancedProject } from '@/hooks/useEnhancedProjects';
import { Task } from '@/types/task';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, Users, Target, DollarSign, CheckCircle2, Clock, 
  AlertTriangle, TrendingUp, ArrowRight, ExternalLink
} from 'lucide-react';

interface ProjectDetailDialogProps {
  project: EnhancedProject | null;
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewAllTasks?: (projectId: string) => void;
}

export function ProjectDetailDialog({ 
  project, 
  tasks, 
  open, 
  onOpenChange,
  onViewAllTasks 
}: ProjectDetailDialogProps) {
  if (!project) return null;

  const projectTasks = tasks.filter(t => t.project_id === project.id);
  const completedTasks = projectTasks.filter(t => ['completed', 'verified'].includes(t.status));
  const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress');
  const assignedTasks = projectTasks.filter(t => t.status === 'assigned');
  
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'amber': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'red': return 'bg-red-500/10 text-red-700 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'planned': return 'bg-blue-500/10 text-blue-700';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-700';
      case 'on_hold': return 'bg-orange-500/10 text-orange-700';
      case 'completed': return 'bg-green-500/10 text-green-700';
      case 'cancelled': return 'bg-red-500/10 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const budgetUsed = project.budget > 0 
    ? Math.round((project.spent_budget / project.budget) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold">{project.name}</DialogTitle>
              <DialogDescription className="mt-1">{project.description}</DialogDescription>
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge className={getStageColor(project.stage)}>
                {project.stage.replace('_', ' ')}
              </Badge>
              <Badge className={`border ${getHealthColor(project.health_status)}`}>
                {project.health_status === 'green' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {project.health_status === 'amber' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {project.health_status === 'red' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {project.health_status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({projectTasks.length})</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Target className="h-4 w-4" />
                    Progress
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{project.completion_rate || 0}%</div>
                    <Progress value={project.completion_rate || 0} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Tasks
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{completedTasks.length}/{projectTasks.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">completed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{budgetUsed}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${project.spent_budget.toLocaleString()} / ${project.budget.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">
                      {project.start_date ? format(parseISO(project.start_date), 'MMM dd') : 'TBD'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      to {project.target_end_date ? format(parseISO(project.target_end_date), 'MMM dd, yyyy') : 'TBD'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {project.sponsor && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sponsor</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={project.sponsor.avatar_url || ''} />
                          <AvatarFallback>{project.sponsor.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{project.sponsor.full_name}</span>
                      </div>
                    </div>
                  )}
                  {project.creator && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created by</span>
                      <span>{project.creator.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <Badge variant="outline">{project.priority}</Badge>
                  </div>
                  {project.program && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Program</span>
                      <span>{project.program.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {project.business_case && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Business Case</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{project.business_case}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Project Tasks</h3>
              {onViewAllTasks && (
                <Button variant="outline" size="sm" onClick={() => onViewAllTasks(project.id)}>
                  View All Tasks <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Task Status Summary */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-700">{assignedTasks.length}</div>
                <div className="text-xs text-blue-600">Assigned</div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-yellow-700">{inProgressTasks.length}</div>
                <div className="text-xs text-yellow-600">In Progress</div>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-700">
                  {projectTasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-xs text-purple-600">Completed</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-700">
                  {projectTasks.filter(t => t.status === 'verified').length}
                </div>
                <div className="text-xs text-green-600">Verified</div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="space-y-2">
              {projectTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {task.task_number && (
                        <span className="text-xs font-mono text-muted-foreground">{task.task_number}</span>
                      )}
                      <span className="font-medium text-sm truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {task.assigned_profile?.full_name || 'Unassigned'}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Due {format(new Date(task.end_date), 'MMM dd')}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 ml-2">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {projectTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tasks in this project yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Team members are derived from task assignments</p>
                  <p className="text-sm mt-2">
                    {[...new Set(projectTasks.map(t => t.assigned_profile?.full_name).filter(Boolean))].length} team members assigned
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="mt-4 space-y-4">
            {/* KPIs */}
            {project.kpis && project.kpis.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.kpis.map((kpi, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{kpi.name}</span>
                        <span className="font-medium">
                          {kpi.current} / {kpi.target} {kpi.unit}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((kpi.current / kpi.target) * 100, 100)} 
                        className="mt-1 h-2" 
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Health Reason */}
            {project.health_reason && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Health Status Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.health_reason}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
