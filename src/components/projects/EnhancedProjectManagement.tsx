import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedProjects, EnhancedProject, CreateEnhancedProjectData } from '@/hooks/useEnhancedProjects';
import { useTasks } from '@/hooks/useTasks';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { ProjectDetailDialog } from '@/components/projects/ProjectDetailDialog';
import { format, parseISO } from 'date-fns';
import { 
  Plus, FolderOpen, Calendar, Users, DollarSign, 
  CheckCircle2, AlertTriangle, TrendingUp, Eye, Download
} from 'lucide-react';
import { exportToCSV, formatDateForExport } from '@/lib/export';

export function EnhancedProjectManagement() {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { projects, isLoading, createProject, isCreating } = useEnhancedProjects();
  const { tasks } = useTasks();
  const { employees } = useEmployeeDirectory();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [newProject, setNewProject] = useState<CreateEnhancedProjectData>({
    name: '',
    description: '',
    stage: 'planned',
    priority: 'medium',
    budget: 0,
    start_date: new Date().toISOString().split('T')[0],
    target_end_date: '',
    sponsor_id: '',
    business_case: '',
  });

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    
    createProject(newProject);
    setIsCreateOpen(false);
    setNewProject({
      name: '',
      description: '',
      stage: 'planned',
      priority: 'medium',
      budget: 0,
      start_date: new Date().toISOString().split('T')[0],
      target_end_date: '',
      sponsor_id: '',
      business_case: '',
    });
  };

  const handleViewProject = (project: EnhancedProject) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const handleViewAllTasks = (projectId: string) => {
    // Navigate to tasks with project filter - you can implement routing here
    setDetailOpen(false);
    // For now, just log - implement navigation as needed
    console.log('Navigate to tasks for project:', projectId);
  };

  const handleExportProjects = () => {
    const exportData = projects.map(project => ({
      name: project.name,
      description: project.description || '',
      stage: project.stage,
      health_status: project.health_status,
      priority: project.priority,
      start_date: project.start_date ? formatDateForExport(project.start_date) : '',
      target_end_date: project.target_end_date ? formatDateForExport(project.target_end_date) : '',
      budget: project.budget,
      spent_budget: project.spent_budget,
      completion_rate: `${project.completion_rate || 0}%`,
      tasks_count: project.tasks_count || 0,
      completed_tasks: project.completed_tasks_count || 0,
      sponsor: project.sponsor?.full_name || '',
      created_by: project.creator?.full_name || '',
      created_at: formatDateForExport(project.created_at),
    }));

    exportToCSV(exportData, 'projects-export', [
      { key: 'name', label: 'Project Name' },
      { key: 'description', label: 'Description' },
      { key: 'stage', label: 'Stage' },
      { key: 'health_status', label: 'Health' },
      { key: 'priority', label: 'Priority' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'target_end_date', label: 'Target End Date' },
      { key: 'budget', label: 'Budget' },
      { key: 'spent_budget', label: 'Spent' },
      { key: 'completion_rate', label: 'Completion' },
      { key: 'tasks_count', label: 'Total Tasks' },
      { key: 'completed_tasks', label: 'Completed Tasks' },
      { key: 'sponsor', label: 'Sponsor' },
      { key: 'created_by', label: 'Created By' },
      { key: 'created_at', label: 'Created At' },
    ]);
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'green': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'amber': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'red': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'planned': return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
      case 'on_hold': return 'bg-orange-500/10 text-orange-700 border-orange-500/30';
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-700 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-700';
      case 'high': return 'bg-orange-500/10 text-orange-700';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700';
      case 'low': return 'bg-green-500/10 text-green-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportProjects}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Project Name *</Label>
                    <Input
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Project description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stage</Label>
                      <Select
                        value={newProject.stage}
                        onValueChange={(v: EnhancedProject['stage']) => 
                          setNewProject(prev => ({ ...prev, stage: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newProject.priority}
                        onValueChange={(v: EnhancedProject['priority']) => 
                          setNewProject(prev => ({ ...prev, priority: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newProject.start_date}
                        onChange={(e) => setNewProject(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target End Date</Label>
                      <Input
                        type="date"
                        value={newProject.target_end_date}
                        onChange={(e) => setNewProject(prev => ({ ...prev, target_end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Budget ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newProject.budget}
                      onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project Sponsor</Label>
                    <Select
                      value={newProject.sponsor_id || 'none'}
                      onValueChange={(v) => setNewProject(prev => ({ ...prev, sponsor_id: v === 'none' ? '' : v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sponsor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Sponsor</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Case</Label>
                    <Textarea
                      value={newProject.business_case}
                      onChange={(e) => setNewProject(prev => ({ ...prev, business_case: e.target.value }))}
                      placeholder="Why is this project needed?"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} disabled={isCreating || !newProject.name.trim()}>
                      {isCreating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Project Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
              onClick={() => handleViewProject(project)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description}
                      </CardDescription>
                    )}
                  </div>
                  {getHealthIcon(project.health_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={`${getStageColor(project.stage)} text-xs border`}>
                    {project.stage.replace('_', ' ')}
                  </Badge>
                  <Badge className={`${getPriorityColor(project.priority)} text-xs`}>
                    {project.priority}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.completion_rate || 0}%</span>
                  </div>
                  <Progress value={project.completion_rate || 0} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-lg font-bold">{project.tasks_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <div className="text-lg font-bold text-green-600">{project.completed_tasks_count || 0}</div>
                    <div className="text-xs text-green-600">Done</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                    <div className="text-lg font-bold text-blue-600">
                      ${(project.budget / 1000).toFixed(0)}k
                    </div>
                    <div className="text-xs text-blue-600">Budget</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {project.start_date && format(parseISO(project.start_date), 'MMM dd')}
                  {project.target_end_date && (
                    <>
                      <span>→</span>
                      {format(parseISO(project.target_end_date), 'MMM dd, yyyy')}
                    </>
                  )}
                </div>

                {/* View Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Create your first project to start organizing your work and tasks.
            </p>
            {isAdmin && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Detail Dialog */}
      <ProjectDetailDialog
        project={selectedProject}
        tasks={tasks}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onViewAllTasks={handleViewAllTasks}
      />
    </div>
  );
}
