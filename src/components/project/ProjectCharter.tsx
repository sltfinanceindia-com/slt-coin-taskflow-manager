import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  FolderOpen,
  DollarSign,
  Calendar,
  Target,
  FileText,
  ArrowLeft,
  CheckCircle,
  X
} from 'lucide-react';
import { useEnhancedProjects, EnhancedProject, CreateEnhancedProjectData } from '@/hooks/useEnhancedProjects';
import { usePrograms } from '@/hooks/usePrograms';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useUserRole } from '@/hooks/useUserRole';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ProjectHealthIndicator } from './ProjectHealthIndicator';

const stageOptions = [
  { value: 'planned', label: 'Planned', color: 'bg-slate-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-amber-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-slate-500' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
];

const healthOptions = [
  { value: 'green', label: 'On Track' },
  { value: 'amber', label: 'At Risk' },
  { value: 'red', label: 'Critical' },
];

interface KPI {
  name: string;
  target: number;
  current: number;
  unit: string;
}

interface ProjectFormProps {
  project?: EnhancedProject;
  programId?: string;
  onSubmit: (data: CreateEnhancedProjectData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, programId, onSubmit, onClose, isLoading }) => {
  const { employees } = useEmployeeDirectory();
  const { programs } = usePrograms();
  const [formData, setFormData] = useState<CreateEnhancedProjectData>({
    name: project?.name || '',
    description: project?.description || '',
    program_id: project?.program_id || programId || '',
    stage: project?.stage || 'planned',
    health_status: project?.health_status || 'green',
    health_reason: project?.health_reason || '',
    sponsor_id: project?.sponsor_id || '',
    business_case: project?.business_case || '',
    budget: project?.budget || 0,
    start_date: project?.start_date || '',
    target_end_date: project?.target_end_date || '',
    priority: project?.priority || 'medium',
    kpis: project?.kpis || [],
  });
  const [newKpi, setNewKpi] = useState<KPI>({ name: '', target: 0, current: 0, unit: '' });

  const handleAddKpi = () => {
    if (newKpi.name) {
      setFormData({
        ...formData,
        kpis: [...(formData.kpis || []), newKpi],
      });
      setNewKpi({ name: '', target: 0, current: 0, unit: '' });
    }
  };

  const handleRemoveKpi = (index: number) => {
    setFormData({
      ...formData,
      kpis: formData.kpis?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Website Redesign"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project objectives and scope..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="program">Program</Label>
            <Select
              value={formData.program_id}
              onValueChange={(value) => setFormData({ ...formData, program_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select program (optional)" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value: EnhancedProject['stage']) => setFormData({ ...formData, stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${opt.color}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: EnhancedProject['priority']) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={opt.color}>{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="business_case">Business Case</Label>
            <Textarea
              id="business_case"
              value={formData.business_case}
              onChange={(e) => setFormData({ ...formData, business_case: e.target.value })}
              placeholder="Why is this project needed? What problem does it solve?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sponsor">Sponsor</Label>
              <Select
                value={formData.sponsor_id}
                onValueChange={(value) => setFormData({ ...formData, sponsor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sponsor" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                placeholder="25000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="target_end_date">Target End Date</Label>
              <Input
                id="target_end_date"
                type="date"
                value={formData.target_end_date}
                onChange={(e) => setFormData({ ...formData, target_end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="health_status">Health Status</Label>
              <Select
                value={formData.health_status}
                onValueChange={(value: EnhancedProject['health_status']) => setFormData({ ...formData, health_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {healthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <ProjectHealthIndicator status={opt.value as EnhancedProject['health_status']} size="sm" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.health_status !== 'green' && (
            <div>
              <Label htmlFor="health_reason">Health Status Reason</Label>
              <Textarea
                id="health_reason"
                value={formData.health_reason}
                onChange={(e) => setFormData({ ...formData, health_reason: e.target.value })}
                placeholder="Explain why the project is at risk or critical..."
                rows={2}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label>Project KPIs</Label>
            
            {formData.kpis && formData.kpis.length > 0 && (
              <div className="space-y-2">
                {formData.kpis.map((kpi, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{kpi.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {kpi.current} / {kpi.target} {kpi.unit}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      onClick={() => handleRemoveKpi(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Input
                placeholder="KPI Name"
                value={newKpi.name}
                onChange={(e) => setNewKpi({ ...newKpi, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Target"
                value={newKpi.target || ''}
                onChange={(e) => setNewKpi({ ...newKpi, target: parseFloat(e.target.value) || 0 })}
              />
              <Input
                type="number"
                placeholder="Current"
                value={newKpi.current || ''}
                onChange={(e) => setNewKpi({ ...newKpi, current: parseFloat(e.target.value) || 0 })}
              />
              <Input
                placeholder="Unit"
                value={newKpi.unit}
                onChange={(e) => setNewKpi({ ...newKpi, unit: e.target.value })}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddKpi} disabled={!newKpi.name}>
              <Plus className="h-4 w-4 mr-1" /> Add KPI
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="gap-2 sm:gap-0 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name}>
          {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface ProjectCardProps {
  project: EnhancedProject;
  onEdit: (project: EnhancedProject) => void;
  onDelete: (id: string) => void;
  onClick: (project: EnhancedProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onClick }) => {
  const stageConfig = stageOptions.find(s => s.value === project.stage);
  const priorityConfig = priorityOptions.find(p => p.value === project.priority);
  const budgetUsed = project.budget > 0 
    ? Math.round((project.spent_budget / project.budget) * 100) 
    : 0;

  return (
    <Card 
      className="group hover:shadow-md transition-all cursor-pointer"
      onClick={() => onClick(project)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 rounded-lg bg-primary/10 p-2 mt-0.5">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg truncate">{project.name}</CardTitle>
                <ProjectHealthIndicator 
                  status={project.health_status} 
                  reason={project.health_reason}
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <div className={`h-1.5 w-1.5 rounded-full ${stageConfig?.color} mr-1`} />
                  {stageConfig?.label}
                </Badge>
                <span className={`text-xs font-medium ${priorityConfig?.color}`}>
                  {priorityConfig?.label}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(project); }}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg sm:text-xl font-bold">{project.tasks_count || 0}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg sm:text-xl font-bold">{project.completion_rate || 0}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        {project.budget > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Budget
              </span>
              <span className="font-medium">{budgetUsed}%</span>
            </div>
            <Progress value={budgetUsed} className="h-2" />
          </div>
        )}

        {project.kpis && project.kpis.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Target className="h-3 w-3" /> KPIs
            </div>
            <div className="space-y-1">
              {project.kpis.slice(0, 2).map((kpi, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="truncate">{kpi.name}</span>
                  <span className="font-medium">
                    {kpi.current}/{kpi.target} {kpi.unit}
                  </span>
                </div>
              ))}
              {project.kpis.length > 2 && (
                <span className="text-xs text-muted-foreground">+{project.kpis.length - 2} more</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ProjectCharterProps {
  programId?: string;
  programName?: string;
  onBack?: () => void;
  onSelectProject?: (project: EnhancedProject) => void;
}

export const ProjectCharter: React.FC<ProjectCharterProps> = ({ 
  programId, 
  programName,
  onBack,
  onSelectProject 
}) => {
  const { projects, isLoading, createProject, updateProject, deleteProject, isCreating, isUpdating } = useEnhancedProjects(programId);
  const { isAdmin } = useUserRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<EnhancedProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (data: CreateEnhancedProjectData) => {
    if (editingProject) {
      updateProject({ id: editingProject.id, ...data });
    } else {
      createProject(data);
    }
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const handleEdit = (project: EnhancedProject) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              Projects
            </h2>
            {programName && (
              <p className="text-sm text-muted-foreground mt-1">
                in {programName}
              </p>
            )}
          </div>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingProject(null);
          }}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Edit Project' : 'Create Project'}
                </DialogTitle>
              </DialogHeader>
              <ProjectForm
                project={editingProject || undefined}
                programId={programId}
                onSubmit={handleSubmit}
                onClose={() => {
                  setIsDialogOpen(false);
                  setEditingProject(null);
                }}
                isLoading={isCreating || isUpdating}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={searchQuery ? 'No projects found' : 'No projects yet'}
          description={searchQuery 
            ? 'Try adjusting your search terms' 
            : 'Create your first project with a charter to get started'
          }
          action={
            isAdmin && !searchQuery ? (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={(p) => onSelectProject?.(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectCharter;
