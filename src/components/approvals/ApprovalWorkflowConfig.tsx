import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useApprovals, ApprovalWorkflow, WorkflowStep } from '@/hooks/useApprovals';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Plus, 
  Trash2, 
  Save, 
  GitBranch,
  User,
  Edit,
  X
} from 'lucide-react';

export const ApprovalWorkflowConfig: React.FC = () => {
  const { workflows, isLoading, createWorkflow, updateWorkflow, deleteWorkflow } = useApprovals();
  const { employees } = useEmployeeDirectory();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entity_type: 'project' as string,
    steps: [] as WorkflowStep[],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      entity_type: 'project',
      steps: [],
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const startEdit = (workflow: ApprovalWorkflow) => {
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      entity_type: workflow.entity_type,
      steps: workflow.steps || [],
    });
    setEditingId(workflow.id);
    setIsCreating(true);
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          step_number: formData.steps.length + 1,
          approver_id: '',
          approval_type: 'any',
        },
      ],
    });
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index: number) => {
    const newSteps = formData.steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step_number: i + 1 }));
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    
    if (editingId) {
      await updateWorkflow.mutateAsync({
        id: editingId,
        ...formData,
      });
    } else {
      await createWorkflow.mutateAsync(formData);
    }
    
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Approval Workflows</h2>
          <p className="text-muted-foreground">
            Configure multi-step approval processes
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{editingId ? 'Edit Workflow' : 'Create Workflow'}</CardTitle>
                <CardDescription>
                  Define approval steps and assignees
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  placeholder="e.g., Project Approval"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select 
                  value={formData.entity_type} 
                  onValueChange={(v) => setFormData({ ...formData, entity_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="request">Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this workflow..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Approval Steps ({formData.steps.length})</h4>
                <Button size="sm" variant="outline" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>

              {formData.steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No steps yet. Add approval steps.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.steps.map((step, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <Badge variant="outline" className="shrink-0">
                            Step {index + 1}
                          </Badge>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs">Approver</Label>
                              <Select
                                value={step.approver_id || ''}
                                onValueChange={(v) => updateStep(index, 'approver_id', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select approver" />
                                </SelectTrigger>
                                <SelectContent>
                                  {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                      <div className="flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        {emp.full_name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Approval Type</Label>
                              <Select
                                value={step.approval_type}
                                onValueChange={(v) => updateStep(index, 'approval_type', v as 'any' | 'all')}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="any">Any One</SelectItem>
                                  <SelectItem value="all">All Required</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.name.trim() || createWorkflow.isPending || updateWorkflow.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update' : 'Create'} Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Workflows */}
      {workflows.length === 0 && !isCreating ? (
        <EmptyState
          icon={GitBranch}
          title="No workflows"
          description="Create approval workflows to manage multi-step approvals."
        />
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{workflow.name}</h4>
                      <Badge variant="outline">{workflow.entity_type}</Badge>
                      {workflow.is_active && (
                        <Badge className="bg-green-500/20 text-green-600">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workflow.description || 'No description'}
                    </p>
                    <p className="text-sm">
                      {workflow.steps?.length || 0} approval steps
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(workflow)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteWorkflow.mutate(workflow.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
