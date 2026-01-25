import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Coins, X, AlertCircle, FolderOpen, User, Search, FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { validateTaskData } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AITaskAssistant } from '@/components/tasks/AITaskAssistant';
import { useTaskTemplates, TemplateTask } from '@/hooks/useTaskTemplates';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateTaskDialogProps {
  onCreateTask: (taskData: {
    title: string;
    description: string;
    assigned_to: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    slt_coin_value: number;
    start_date: string;
    end_date: string;
    project_id?: string;
    project_owner_id?: string;
  }) => void;
  isCreating: boolean;
}

export function CreateTaskDialog({ onCreateTask, isCreating }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    slt_coin_value: 10,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    project_id: '',
    project_owner_id: '',
  });

  const { profile } = useAuth();
  const { templates, isLoading: templatesLoading, parseTemplateTasks } = useTaskTemplates();

  // Fetch employee profiles (including interns) from the same organization
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['assignable-employees', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', profile.organization_id)
        .in('role', ['intern', 'employee'])
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch managers/admins for project owner selection
  const { data: projectOwners, isLoading: ownersLoading } = useQuery({
    queryKey: ['project-owners', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data?.filter(p => ['admin', 'org_admin', 'employee'].includes(p.role)) || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch projects from the same organization
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['assignable-projects', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    if (!employeeSearch.trim()) return employees;
    
    const search = employeeSearch.toLowerCase();
    return employees.filter(emp => 
      emp.full_name?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search)
    );
  }, [employees, employeeSearch]);

  // Apply template
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'none') return;
    
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const tasks = parseTemplateTasks(template);
    if (tasks.length > 0) {
      const firstTask = tasks[0];
      setFormData(prev => ({
        ...prev,
        title: firstTask.title || prev.title,
        description: firstTask.description || prev.description,
        priority: firstTask.priority || prev.priority,
        slt_coin_value: firstTask.slt_coin_value || prev.slt_coin_value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Validate task data
    const validation = validateTaskData({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      slt_coin_value: formData.slt_coin_value
    });

    const errors = [...validation.errors];

    // Additional validations
    if (formData.assigned_to.length === 0) {
      errors.push('At least one employee must be assigned to the task');
    }

    if (!formData.end_date) {
      errors.push('Due date is required');
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.push('Due date must be after start date');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Use sanitized data
    onCreateTask({
      ...formData,
      title: validation.sanitizedData.title || formData.title,
      description: validation.sanitizedData.description || formData.description,
      project_id: formData.project_id || undefined,
      project_owner_id: formData.project_owner_id || undefined,
    });
    
    setOpen(false);
    setValidationErrors([]);
    setEmployeeSearch('');
    setFormData({
      title: '',
      description: '',
      assigned_to: [],
      priority: 'medium',
      slt_coin_value: 10,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      project_id: '',
      project_owner_id: '',
    });
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(employeeId) 
        ? prev.assigned_to.filter(id => id !== employeeId)
        : [...prev.assigned_to, employeeId]
    }));
  };

  const removeEmployee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.filter(id => id !== employeeId)
    }));
  };

  const getEmployeeName = (employeeId: string) => {
    return employees?.find(emp => emp.id === employeeId)?.full_name || 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="animate-scale-in">
          <Plus className="h-4 w-4 mr-2" />
          Create New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2 p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-coin-gold" />
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Create a new task and assign Coins as reward for completion.
          </DialogDescription>
        </DialogHeader>

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Use Template
              </Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        {template.category && (
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              required
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm">Description</Label>
              <AITaskAssistant
                taskTitle={formData.title}
                taskDescription={formData.description}
                onDescriptionGenerated={(desc) => setFormData({ ...formData, description: desc })}
                onPrioritySuggested={(priority) => setFormData({ ...formData, priority })}
              />
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task requirements..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Employee Assignment with Search */}
          <div className="space-y-1.5">
            <Label className="text-sm">Assign to Employees *</Label>
            
            {/* Selected Employees */}
            {formData.assigned_to.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.assigned_to.map((id) => (
                  <Badge key={id} variant="secondary" className="gap-1 pr-1">
                    {getEmployeeName(id)}
                    <button
                      type="button"
                      onClick={() => removeEmployee(id)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>

            {/* Employee List */}
            <ScrollArea className="border rounded-md h-32">
              {employeesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredEmployees.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2 py-1 px-1 hover:bg-muted/50 rounded">
                      <Checkbox
                        id={employee.id}
                        checked={formData.assigned_to.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={employee.id} className="flex-1 cursor-pointer text-sm">
                        <span>{employee.full_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{employee.email}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  {employeeSearch ? 'No employees found' : 'No employees available'}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project Selection */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm">
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              Project (Optional)
            </Label>
            <Select
              value={formData.project_id || 'none'}
              onValueChange={(value) => setFormData({ ...formData, project_id: value === 'none' ? '' : value })}
            >
              <SelectTrigger className="h-9">
                {projectsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue placeholder="Select project" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Owner Selection */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Project Owner (Optional)
            </Label>
            <Select
              value={formData.project_owner_id || 'none'}
              onValueChange={(value) => setFormData({ ...formData, project_owner_id: value === 'none' ? '' : value })}
            >
              <SelectTrigger className="h-9">
                {ownersLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue placeholder="Select project owner" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Owner</SelectItem>
                {projectOwners?.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    <span className="flex items-center gap-2">
                      <span>{owner.full_name}</span>
                      <span className="text-xs text-muted-foreground">({owner.role})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The person accountable for this task's completion
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coins" className="text-sm">Coin Reward *</Label>
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-coin-gold shrink-0" />
              <Input
                id="coins"
                type="number"
                inputMode="numeric"
                min="1"
                max="1000"
                value={formData.slt_coin_value}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, slt_coin_value: Math.min(Math.max(value, 0), 1000) });
                }}
                className="flex-1 h-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start_date" className="text-sm">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end_date" className="text-sm">Due Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date}
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} size="sm">
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
