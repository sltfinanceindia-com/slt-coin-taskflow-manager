import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/types/task';
import { Edit, Calendar, AlertCircle, User, Clock, Target, Coins, Activity, FolderOpen, Tags, Paperclip, CheckSquare, ListTree, Users, X, Plus } from 'lucide-react';
import { validateTaskData } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEntityActivityLog } from '@/hooks/useEntityActivityLog';
import { ActivityLogViewer } from '@/components/common/ActivityLogViewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskEditDialogProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  isUpdating: boolean;
}

export function TaskEditDialog({ task, onUpdateTask, isUpdating }: TaskEditDialogProps) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const originalDataRef = useRef<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [checklistItems, setChecklistItems] = useState<{text: string; completed: boolean}[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  
  // Activity logging
  const { activities, isLoading: activitiesLoading, logTaskEdit } = useEntityActivityLog('task', task.id);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    slt_coin_value: task.slt_coin_value,
    start_date: task.start_date || '',
    end_date: task.end_date || '',
    assigned_to: task.assigned_to || '',
    estimated_hours: task.estimated_hours || 0,
    actual_hours: task.actual_hours || 0,
    progress_percentage: task.progress_percentage || 0,
    project_id: task.project_id || '',
  });

  // Fetch organization members for assignee dropdown
  const { data: members = [] } = useQuery({
    queryKey: ['org-members', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('organization_id', profile.organization_id)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id && open,
  });

  // Fetch projects for project dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['org-projects', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id && open,
  });

  // Fetch parent tasks for parent task dropdown
  const { data: parentTasks = [] } = useQuery({
    queryKey: ['parent-tasks', profile?.organization_id, task.id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, task_number')
        .eq('organization_id', profile.organization_id)
        .neq('id', task.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id && open,
  });

  // Fetch subtasks
  const { data: subtasks = [] } = useQuery({
    queryKey: ['subtasks', task.id],
    queryFn: async () => {
      // This would need a parent_task_id column - for now return empty
      return [];
    },
    enabled: open,
  });

  useEffect(() => {
    const data = {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      slt_coin_value: task.slt_coin_value,
      start_date: task.start_date || '',
      end_date: task.end_date || '',
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours || 0,
      actual_hours: task.actual_hours || 0,
      progress_percentage: task.progress_percentage || 0,
      project_id: task.project_id || '',
    };
    setFormData(data);
    originalDataRef.current = data;
  }, [task]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, { text: newChecklistItem.trim(), completed: false }]);
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (index: number) => {
    const updated = [...checklistItems];
    updated[index].completed = !updated[index].completed;
    setChecklistItems(updated);
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const validation = validateTaskData({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      slt_coin_value: formData.slt_coin_value
    });

    const errors = [...validation.errors];

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.push('End date must be after start date');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Log activity before updating
    if (originalDataRef.current) {
      try {
        await logTaskEdit(task.id, originalDataRef.current, formData);
      } catch (err) {
        console.error('Failed to log activity:', err);
      }
    }

    onUpdateTask(task.id, {
      ...formData,
      title: validation.sanitizedData.title || formData.title,
      description: validation.sanitizedData.description || formData.description,
    });
    
    setOpen(false);
    setValidationErrors([]);
  };

  const statusOptions = [
    { value: 'assigned', label: 'Assigned', color: 'bg-blue-500' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'verified', label: 'Verified', color: 'bg-emerald-500' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Task
            {task.task_number && <Badge variant="outline">{task.task_number}</Badge>}
          </DialogTitle>
          <DialogDescription>
            Update all task details including project, status, assignee, timeline, and tracking.
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
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="basic" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-7 shrink-0">
              <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
              <TabsTrigger value="assignment" className="text-xs">Assign</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
              <TabsTrigger value="effort" className="text-xs">Effort</TabsTrigger>
              <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
              <TabsTrigger value="subtasks" className="text-xs">Subtasks</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Activity
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the task in detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project" className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Project
                    </Label>
                    <Select
                      value={formData.project_id || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, project_id: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${option.color}`} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Section */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tags className="h-4 w-4" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Assignment Tab */}
              <TabsContent value="assignment" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_to" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assignee
                  </Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <span>{member.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Coin Reward
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.slt_coin_value}
                    onChange={(e) => setFormData({ ...formData, slt_coin_value: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Coins awarded upon task verification
                  </p>
                </div>

                {/* Watchers Section */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Watchers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Additional team members who will be notified of updates
                  </p>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Add watchers..." />
                    </SelectTrigger>
                    <SelectContent>
                      {members.filter(m => m.id !== formData.assigned_to).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Assignee Display */}
                {task.assigned_profile && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Current Assignee</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {task.assigned_profile.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{task.assigned_profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">{task.assigned_profile.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Due Date
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Parent Task */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ListTree className="h-4 w-4" />
                    Parent Task
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent task (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Parent</SelectItem>
                      {parentTasks.map((pt) => (
                        <SelectItem key={pt.id} value={pt.id}>
                          {pt.task_number ? `${pt.task_number} - ` : ''}{pt.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Convert this task into a subtask of another task
                  </p>
                </div>

                {/* Duration Display */}
                {formData.start_date && formData.end_date && (
                  <Card>
                    <CardContent className="py-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                        <p className="text-sm text-muted-foreground">Duration</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Effort Tab */}
              <TabsContent value="effort" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimated Hours
                    </Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actual_hours">Actual Hours</Label>
                    <Input
                      id="actual_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.actual_hours}
                      onChange={(e) => setFormData({ ...formData, actual_hours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Progress</Label>
                    <Badge variant="outline">{formData.progress_percentage}%</Badge>
                  </div>
                  <Slider
                    value={[formData.progress_percentage]}
                    onValueChange={(value) => setFormData({ ...formData, progress_percentage: value[0] })}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Effort Summary */}
                {formData.estimated_hours > 0 && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Effort Tracking</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold">{formData.estimated_hours}h</p>
                          <p className="text-xs text-muted-foreground">Estimated</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{formData.actual_hours}h</p>
                          <p className="text-xs text-muted-foreground">Actual</p>
                        </div>
                        <div>
                          <p className={`text-lg font-semibold ${formData.actual_hours > formData.estimated_hours ? 'text-destructive' : 'text-green-600'}`}>
                            {(formData.estimated_hours - formData.actual_hours).toFixed(1)}h
                          </p>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Content Tab - Attachments & Checklists */}
              <TabsContent value="content" className="space-y-4 mt-4">
                {/* Attachments */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop files here or click to upload
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Checklist
                  </Label>
                  <div className="space-y-2">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleChecklistItem(index)}
                        />
                        <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChecklistItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add checklist item..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddChecklistItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Subtasks Tab */}
              <TabsContent value="subtasks" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ListTree className="h-4 w-4" />
                    Subtasks
                  </Label>
                  {subtasks.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <ListTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No subtasks for this task</p>
                        <Button type="button" variant="outline" size="sm" className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subtask
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {subtasks.map((subtask: any) => (
                        <div key={subtask.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Checkbox checked={subtask.status === 'completed'} />
                          <span className="flex-1 text-sm">{subtask.title}</span>
                          <Badge variant="outline">{subtask.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Recent changes to this task</span>
                  </div>
                  <ActivityLogViewer 
                    activities={activities} 
                    isLoading={activitiesLoading}
                    maxHeight="300px"
                    emptyMessage="No activity recorded for this task yet"
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4 shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
