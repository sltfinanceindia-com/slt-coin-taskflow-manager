import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, FileText, Loader2, Check, Trash2 } from 'lucide-react';

interface SubtaskTemplateItem {
  title: string;
  estimated_hours?: number;
  relative_due_days?: number;
}

interface SubtaskTemplate {
  id: string;
  name: string;
  subtasks: SubtaskTemplateItem[];
  created_by: string;
  organization_id: string;
}

interface SubtaskTemplatesProps {
  parentTaskId: string;
  projectId: string;
  onTemplateApplied?: () => void;
}

// Predefined templates
const PREDEFINED_TEMPLATES: Omit<SubtaskTemplate, 'id' | 'created_by' | 'organization_id'>[] = [
  {
    name: 'Development Sprint',
    subtasks: [
      { title: 'Requirements Review', estimated_hours: 2 },
      { title: 'Design & Architecture', estimated_hours: 4 },
      { title: 'Implementation', estimated_hours: 8 },
      { title: 'Code Review', estimated_hours: 2 },
      { title: 'Testing', estimated_hours: 4 },
      { title: 'Documentation', estimated_hours: 2 },
    ],
  },
  {
    name: 'Bug Fix',
    subtasks: [
      { title: 'Reproduce Issue', estimated_hours: 1 },
      { title: 'Root Cause Analysis', estimated_hours: 2 },
      { title: 'Implement Fix', estimated_hours: 4 },
      { title: 'Test Fix', estimated_hours: 2 },
      { title: 'Deploy', estimated_hours: 1 },
    ],
  },
  {
    name: 'Feature Launch',
    subtasks: [
      { title: 'Feature Development Complete', estimated_hours: 0 },
      { title: 'QA Testing', estimated_hours: 8 },
      { title: 'User Acceptance Testing', estimated_hours: 4 },
      { title: 'Documentation Update', estimated_hours: 2 },
      { title: 'Training Materials', estimated_hours: 4 },
      { title: 'Deployment', estimated_hours: 2 },
      { title: 'Announcement', estimated_hours: 1 },
    ],
  },
  {
    name: 'Research Task',
    subtasks: [
      { title: 'Define Research Scope', estimated_hours: 2 },
      { title: 'Gather Information', estimated_hours: 4 },
      { title: 'Analyze Findings', estimated_hours: 4 },
      { title: 'Create Report', estimated_hours: 3 },
      { title: 'Present Recommendations', estimated_hours: 1 },
    ],
  },
];

export function SubtaskTemplates({ parentTaskId, projectId, onTemplateApplied }: SubtaskTemplatesProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PREDEFINED_TEMPLATES[0] | null>(null);
  const [customSubtasks, setCustomSubtasks] = useState<SubtaskTemplateItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Apply template mutation
  const applyTemplateMutation = useMutation({
    mutationFn: async (subtasks: SubtaskTemplateItem[]) => {
      const subtasksToCreate = subtasks.map((subtask) => ({
        title: subtask.title,
        project_id: projectId,
        parent_task_id: parentTaskId,
        assigned_to: profile?.id,
        created_by: profile?.id!,
        organization_id: profile?.organization_id,
        status: 'assigned' as const,
        priority: 'medium' as const,
        estimated_hours: subtask.estimated_hours || null,
      }));

      const { error } = await supabase
        .from('tasks')
        .insert(subtasksToCreate);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', parentTaskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Template applied successfully');
      setIsOpen(false);
      setSelectedTemplate(null);
      setCustomSubtasks([]);
      onTemplateApplied?.();
    },
    onError: (error) => {
      toast.error('Failed to apply template: ' + error.message);
    },
  });

  const handleApplyTemplate = () => {
    const subtasks = selectedTemplate 
      ? [...selectedTemplate.subtasks, ...customSubtasks]
      : customSubtasks;
    
    if (subtasks.length === 0) {
      toast.error('Please select a template or add custom subtasks');
      return;
    }
    
    applyTemplateMutation.mutate(subtasks);
  };

  const addCustomSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setCustomSubtasks(prev => [...prev, { title: newSubtaskTitle.trim() }]);
    setNewSubtaskTitle('');
  };

  const removeCustomSubtask = (index: number) => {
    setCustomSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Apply Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply Subtask Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select a Template</Label>
            <div className="grid grid-cols-2 gap-3">
              {PREDEFINED_TEMPLATES.map((template, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedTemplate?.name === template.name ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedTemplate(
                    selectedTemplate?.name === template.name ? null : template
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      {selectedTemplate?.name === template.name && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {template.subtasks.length} subtasks
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Template Preview */}
          {selectedTemplate && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Template Subtasks</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-muted/50 rounded-lg">
                {selectedTemplate.subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{subtask.title}</span>
                    {subtask.estimated_hours && (
                      <Badge variant="outline" className="text-xs">
                        {subtask.estimated_hours}h
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Subtasks */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Add Custom Subtasks</Label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Enter subtask title"
                onKeyDown={(e) => e.key === 'Enter' && addCustomSubtask()}
              />
              <Button type="button" onClick={addCustomSubtask} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {customSubtasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                {customSubtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{subtask.title}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => removeCustomSubtask(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplyTemplate}
            disabled={applyTemplateMutation.isPending || (!selectedTemplate && customSubtasks.length === 0)}
          >
            {applyTemplateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Apply Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SubtaskTemplates;
