import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, FolderOpen, Users, Calendar } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';

export function ProjectManagement() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { projects, createProject, isCreating } = useProjects();
  const { tasks } = useTasks();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  });

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId);
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(task => 
      task.status === 'completed' || task.status === 'verified'
    ).length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    
    createProject(newProject);
    setNewProject({ name: '', description: '' });
    setShowCreateDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground text-sm">
            Organize and track your tasks within projects
          </p>
        </div>
        {isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new project to organize related tasks together.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 px-6 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name..."
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Project description (optional)..."
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <Button
                  onClick={handleCreateProject}
                  disabled={!newProject.name.trim() || isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <EmptyState
              icon={FolderOpen}
              title="No Projects Yet"
              description={
                isAdmin 
                  ? "Create your first project to start organizing tasks."
                  : "Projects will appear here when admins create them."
              }
              actionLabel={isAdmin ? "Create First Project" : undefined}
              onAction={isAdmin ? () => setShowCreateDialog(true) : undefined}
            />
          </Card>
        ) : (
          projects.map((project) => {
            const projectTasks = getProjectTasks(project.id);
            const progress = getProjectProgress(project.id);
            
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{projectTasks.length} Tasks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(project.created_at), 'MMM yyyy')}</span>
                    </div>
                  </div>

                  {/* Creator */}
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Created by {project.creator_profile?.full_name || 'Unknown'}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}