import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Clock, Briefcase, FolderOpen } from 'lucide-react';

interface TimesheetEntryFormData {
  work_date: string;
  regular_hours: number;
  overtime_hours: number;
  project_id: string | null;
  task_id: string | null;
  is_billable: boolean;
  billing_rate: number | null;
  hours_type: 'regular' | 'overtime' | 'training' | 'admin' | 'pto';
  description: string;
  client_name: string;
  cost_center: string;
}

interface EnhancedTimesheetEntryProps {
  initialData?: Partial<TimesheetEntryFormData>;
  onSubmit: (data: TimesheetEntryFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EnhancedTimesheetEntry({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: EnhancedTimesheetEntryProps) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<TimesheetEntryFormData>({
    work_date: initialData?.work_date || new Date().toISOString().split('T')[0],
    regular_hours: initialData?.regular_hours || 8,
    overtime_hours: initialData?.overtime_hours || 0,
    project_id: initialData?.project_id || null,
    task_id: initialData?.task_id || null,
    is_billable: initialData?.is_billable ?? true,
    billing_rate: initialData?.billing_rate || null,
    hours_type: initialData?.hours_type || 'regular',
    description: initialData?.description || '',
    client_name: initialData?.client_name || '',
    cost_center: initialData?.cost_center || '',
  });

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ['timesheet-projects', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', profile?.organization_id)
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch tasks for selected project
  const { data: tasks } = useQuery({
    queryKey: ['timesheet-tasks', formData.project_id],
    queryFn: async () => {
      if (!formData.project_id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, task_number')
        .eq('project_id', formData.project_id)
        .in('status', ['assigned', 'in_progress'])
        .order('title');
      if (error) throw error;
      return data;
    },
    enabled: !!formData.project_id,
  });

  const hoursTypes = [
    { value: 'regular', label: 'Regular Work' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'training', label: 'Training/LMS' },
    { value: 'admin', label: 'Admin/Meetings' },
    { value: 'pto', label: 'PTO/Leave' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const estimatedRevenue = formData.is_billable && formData.billing_rate
    ? (formData.regular_hours + formData.overtime_hours) * formData.billing_rate
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date and Hours Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Work Date *</Label>
          <Input
            type="date"
            value={formData.work_date}
            onChange={(e) => setFormData(prev => ({ ...prev, work_date: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Hours Type *</Label>
          <Select
            value={formData.hours_type}
            onValueChange={(value: TimesheetEntryFormData['hours_type']) => 
              setFormData(prev => ({ ...prev, hours_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hoursTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Regular Hours *
          </Label>
          <Input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={formData.regular_hours}
            onChange={(e) => setFormData(prev => ({ ...prev, regular_hours: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            Overtime Hours
          </Label>
          <Input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={formData.overtime_hours}
            onChange={(e) => setFormData(prev => ({ ...prev, overtime_hours: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      {/* Project and Task */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Project
          </Label>
          <Select
            value={formData.project_id || 'none'}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              project_id: value === 'none' ? null : value,
              task_id: null // Reset task when project changes
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Project</SelectItem>
              {projects?.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Task
          </Label>
          <Select
            value={formData.task_id || 'none'}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              task_id: value === 'none' ? null : value 
            }))}
            disabled={!formData.project_id}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.project_id ? "Select task" : "Select project first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Task</SelectItem>
              {tasks?.map(task => (
                <SelectItem key={task.id} value={task.id}>
                  {task.task_number ? `${task.task_number}: ` : ''}{task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Billing Section */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="billable" className="cursor-pointer">Billable Hours</Label>
            <Switch
              id="billable"
              checked={formData.is_billable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_billable: checked }))}
            />
          </div>

          {formData.is_billable && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Billing Rate ($/hr)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.billing_rate || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    billing_rate: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <Label>Cost Center</Label>
                <Input
                  value={formData.cost_center}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_center: e.target.value }))}
                  placeholder="Cost center code"
                />
              </div>
            </div>
          )}

          {estimatedRevenue > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Estimated Revenue</p>
              <p className="text-xl font-bold text-green-600">${estimatedRevenue.toFixed(2)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <div className="space-y-2">
        <Label>Work Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the work performed..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
}
