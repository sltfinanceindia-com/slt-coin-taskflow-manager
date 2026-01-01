import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project } from '@/hooks/useProjects';
import { Task } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';
import { Edit2, Save, X, Users, CheckCircle, Clock, AlertTriangle, FileText, Hash } from 'lucide-react';

interface ProjectDetailDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  isUpdating?: boolean;
}

export function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  onUpdateProject,
  isUpdating
}: ProjectDetailDialogProps) {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { tasks } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status
  });

  // Filter tasks for this project
  const projectTasks = useMemo(() => 
    tasks.filter(task => task.project_id === project.id),
    [tasks, project.id]
  );

  // Calculate progress
  const progress = useMemo(() => {
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => 
      t.status === 'completed' || t.status === 'verified'
    ).length;
    return Math.round((completed / projectTasks.length) * 100);
  }, [projectTasks]);

  // Task stats
  const taskStats = useMemo(() => ({
    total: projectTasks.length,
    assigned: projectTasks.filter(t => t.status === 'assigned').length,
    inProgress: projectTasks.filter(t => t.status === 'in_progress').length,
    completed: projectTasks.filter(t => t.status === 'completed').length,
    verified: projectTasks.filter(t => t.status === 'verified').length,
    rejected: projectTasks.filter(t => t.status === 'rejected').length,
  }), [projectTasks]);

  // Unique assignees
  const teamMembers = useMemo(() => {
    const members = new Map();
    projectTasks.forEach(task => {
      if (task.assigned_profile && !members.has(task.assigned_profile.id)) {
        members.set(task.assigned_profile.id, task.assigned_profile);
      }
    });
    return Array.from(members.values());
  }, [projectTasks]);

  const projectId = `PRJ-${project.id.slice(0, 8).toUpperCase()}`;

  const handleSave = () => {
    onUpdateProject(project.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: project.name,
      description: project.description || '',
      status: project.status
    });
    setIsEditing(false);
  };

  const handleCreateTask = (taskData: CreateTaskData) => {
    createTask({
      ...taskData,
      project_id: project.id
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xl font-bold"
                />
              ) : (
                <DialogTitle className="text-xl">{project.name}</DialogTitle>
              )}
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {projectId}
                </Badge>
                {isEditing ? (
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as Project['status'] }))}
                  >
                    <SelectTrigger className="w-32 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                )}
              </DialogDescription>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({taskStats.total})</TabsTrigger>
            <TabsTrigger value="team">Team ({teamMembers.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="overview" className="p-4 space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {project.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{progress}%</span>
                    <span className="text-sm text-muted-foreground">
                      {taskStats.verified + taskStats.completed} / {taskStats.total} tasks
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Assigned</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{taskStats.assigned}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">In Progress</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{taskStats.inProgress}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Verified</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{taskStats.verified}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Team</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{teamMembers.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created by</span>
                  <p className="font-medium">{project.creator_profile?.full_name || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created on</span>
                  <p className="font-medium">{format(new Date(project.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="p-4 space-y-4">
              {/* Add Task Button */}
              {isAdmin && (
                <div className="flex justify-end">
                  <CreateTaskDialog 
                    onCreateTask={handleCreateTask} 
                    isCreating={isCreating}
                    defaultProjectId={project.id}
                  />
                </div>
              )}

              {/* Task List */}
              {projectTasks.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No tasks yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create tasks to start tracking work on this project
                  </p>
                  {isAdmin && (
                    <CreateTaskDialog 
                      onCreateTask={handleCreateTask} 
                      isCreating={isCreating}
                      defaultProjectId={project.id}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {projectTasks.map((task) => (
                    <Card key={task.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-[10px]">
                                {task.task_number ? `#${task.task_number}` : task.id.slice(0, 8)}
                              </Badge>
                              <Badge className={`text-[10px] ${getTaskStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm truncate">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Assigned to {task.assigned_profile?.full_name || 'Unassigned'}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>Due {format(new Date(task.end_date), 'MMM d')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="p-4">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No team members</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign tasks to add team members to this project
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teamMembers.map((member: any) => (
                    <Card key={member.id}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="p-4">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">Activity feed coming soon</h3>
                <p className="text-sm text-muted-foreground">
                  Track all changes and updates to this project
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
