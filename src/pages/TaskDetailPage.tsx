import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { EnhancedSubtaskList } from '@/components/tasks/EnhancedSubtaskList';
import { ChecklistEditor } from '@/components/tasks/ChecklistEditor';
import { TaskComments } from '@/components/TaskComments';
import { SubtaskTemplates } from '@/components/tasks/SubtaskTemplates';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  Coins,
  CheckSquare,
  ListChecks,
  MessageSquare,
  Activity,
  ExternalLink,
  FileText,
  DollarSign,
  Users
} from 'lucide-react';

const statusColors: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30',
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30',
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task-detail', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url),
          creator_profile:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url),
          project_owner_profile:profiles!tasks_project_owner_id_fkey(id, full_name, email, avatar_url),
          project:projects(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch subtasks count and progress
  const { data: subtasksData } = useQuery({
    queryKey: ['task-subtasks-stats', id],
    queryFn: async () => {
      if (!id) return { total: 0, completed: 0 };
      
      const { data, error } = await supabase
        .from('tasks')
        .select('id, status, completion_percentage')
        .eq('parent_task_id', id);

      if (error) throw error;
      
      const total = data?.length || 0;
      const completed = data?.filter(s => s.status === 'completed' || s.status === 'verified').length || 0;
      const avgProgress = total > 0 
        ? Math.round(data.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) / total) 
        : 0;
      
      return { total, completed, avgProgress };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Task Not Found</h1>
        <Button onClick={() => navigate('/dashboard?tab=tasks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  const overallProgress = subtasksData?.total > 0 
    ? Math.round((subtasksData.completed / subtasksData.total) * 100)
    : task.completion_percentage || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => window.close()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-mono">
                    {task.task_number}
                  </span>
                  <Badge className={statusColors[task.status] || ''}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={priorityColors[task.priority] || ''}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>
                </div>
                <h1 className="text-xl font-bold mt-1">{task.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Coins className="h-3 w-3 text-amber-500" />
                {task.slt_coin_value} coins
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={overallProgress} className="flex-1" />
                  <span className="text-2xl font-bold">{overallProgress}%</span>
                </div>
                {subtasksData && subtasksData.total > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {subtasksData.completed} of {subtasksData.total} subtasks completed
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Tabs for Subtasks, Checklists, Comments, Controls */}
            <Tabs defaultValue="subtasks" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="subtasks" className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Subtasks</span>
                  {subtasksData && subtasksData.total > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {subtasksData.total}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="checklists" className="gap-2">
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">Checklists</span>
                </TabsTrigger>
                <TabsTrigger value="comments" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Comments</span>
                </TabsTrigger>
                <TabsTrigger value="controls" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Controls</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subtasks" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Subtasks</CardTitle>
                      {task.project_id && (
                        <SubtaskTemplates 
                          parentTaskId={task.id} 
                          projectId={task.project_id} 
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <EnhancedSubtaskList parentTaskId={task.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checklists" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ChecklistEditor taskId={task.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <TaskComments taskId={task.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="controls" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Finance Controls */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Finance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coin Value</span>
                        <span className="font-medium">{task.slt_coin_value} coins</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Hours</span>
                        <span className="font-medium">{task.estimated_hours || 0}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Actual Hours</span>
                        <span className="font-medium">{task.actual_hours || 0}h</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time & Resources */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time & Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={task.progress_percentage || 0} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Is Critical</span>
                        <Badge variant={task.is_critical ? 'destructive' : 'secondary'}>
                          {task.is_critical ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Is Milestone</span>
                        <Badge variant={task.is_milestone ? 'default' : 'secondary'}>
                          {task.is_milestone ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Documents & Attachments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        No documents attached to this task yet.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Task Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignee */}
                {task.assigned_profile && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assignee</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assigned_profile.avatar_url} />
                        <AvatarFallback>
                          {task.assigned_profile.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {task.assigned_profile.full_name}
                      </span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Creator */}
                {task.creator_profile && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created by</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.creator_profile.avatar_url} />
                        <AvatarFallback>
                          {task.creator_profile.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {task.creator_profile.full_name}
                      </span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Project */}
                {task.project && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Project</span>
                      <span className="text-sm font-medium">{task.project.name}</span>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Dates */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {task.start_date ? format(parseISO(task.start_date), 'MMM dd, yyyy') : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.end_date ? format(parseISO(task.end_date), 'MMM dd, yyyy') : '-'}
                  </span>
                </div>

                <Separator />

                {/* Created At */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {format(parseISO(task.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Submission Notes */}
            {task.submission_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Submission Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.submission_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Admin Feedback */}
            {task.admin_feedback && (
              <Card className="border-amber-200 dark:border-amber-900/50">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-600">Admin Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{task.admin_feedback}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
