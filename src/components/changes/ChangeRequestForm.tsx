import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChangeRequests, CreateChangeRequestData } from '@/hooks/useChangeRequests';
import { useProjects } from '@/hooks/useProjects';
import { Plus, FileEdit, AlertTriangle } from 'lucide-react';

interface ChangeRequestFormProps {
  projectId?: string;
  onSuccess?: () => void;
}

export function ChangeRequestForm({ projectId, onSuccess }: ChangeRequestFormProps) {
  const [open, setOpen] = useState(false);
  const { createChangeRequest, isCreating } = useChangeRequests();
  const { projects } = useProjects();
  
  const [formData, setFormData] = useState<CreateChangeRequestData>({
    project_id: projectId || '',
    title: '',
    description: '',
    reason: '',
    priority: 'medium',
    status: 'draft',
  });

  const handleSubmit = (asDraft: boolean) => {
    if (!formData.project_id || !formData.title || !formData.reason) return;
    
    createChangeRequest(
      { ...formData, status: asDraft ? 'draft' : 'submitted' },
      {
        onSuccess: () => {
          setFormData({
            project_id: projectId || '',
            title: '',
            description: '',
            reason: '',
            priority: 'medium',
            status: 'draft',
          });
          setOpen(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Change Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Submit Change Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!projectId && (
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of the change"
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                setFormData(prev => ({ ...prev, priority: value }))
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

          <div className="space-y-2">
            <Label>Reason for Change *</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Why is this change needed? What problem does it solve?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the proposed change..."
              rows={4}
            />
          </div>

          <Card className="border-warning/50 bg-warning/10">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                Impact Analysis Required
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm text-muted-foreground">
                After submission, an admin will analyze the schedule, budget, and resource impact before approval.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isCreating || !formData.title || !formData.reason || !formData.project_id}
              className="flex-1"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isCreating || !formData.title || !formData.reason || !formData.project_id}
              className="flex-1"
            >
              Submit for Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
