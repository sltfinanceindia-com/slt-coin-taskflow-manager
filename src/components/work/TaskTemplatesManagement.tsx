import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBox, Plus, Copy, Edit, Trash2, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_hours: number;
  priority: string;
  checklist: string[];
  tags: string[];
  created_at: string;
}

export function TaskTemplatesManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    estimated_hours: 4,
    priority: 'medium',
    checklist: '',
    tags: ''
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['task-templates'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'Code Review',
          description: 'Standard code review process for pull requests',
          category: 'development',
          estimated_hours: 2,
          priority: 'high',
          checklist: ['Review code changes', 'Check for security issues', 'Test functionality', 'Provide feedback'],
          tags: ['review', 'development'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Bug Fix',
          description: 'Template for bug fixing tasks',
          category: 'development',
          estimated_hours: 4,
          priority: 'high',
          checklist: ['Reproduce bug', 'Identify root cause', 'Implement fix', 'Write tests', 'Update documentation'],
          tags: ['bug', 'fix', 'development'],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Weekly Report',
          description: 'Weekly status report preparation',
          category: 'reporting',
          estimated_hours: 1,
          priority: 'medium',
          checklist: ['Gather metrics', 'Summarize progress', 'Identify blockers', 'Plan next week'],
          tags: ['report', 'weekly'],
          created_at: new Date().toISOString()
        }
      ] as TaskTemplate[];
    }
  });

  const handleSubmit = () => {
    toast.success('Task template created successfully');
    setIsDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      category: 'general',
      estimated_hours: 4,
      priority: 'medium',
      checklist: '',
      tags: ''
    });
  };

  const handleUseTemplate = (template: TaskTemplate) => {
    toast.success(`Creating task from "${template.name}" template`);
  };

  const handleDelete = (id: string) => {
    toast.success('Template deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['task-templates'] });
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  const categories = ['general', 'development', 'design', 'marketing', 'reporting', 'operations'];
  const priorities = ['low', 'medium', 'high'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileBox className="h-6 w-6" />
            Task Templates
          </h2>
          <p className="text-muted-foreground">Reusable task templates for common work items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Code Review"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this task template..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Checklist Items (one per line)</Label>
                <Textarea
                  value={formData.checklist}
                  onChange={(e) => setFormData({ ...formData, checklist: e.target.value })}
                  placeholder="Enter checklist items..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., review, development"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">Create Template</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileBox className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{templates?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Est. Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {templates?.length ? (templates.reduce((a, b) => a + b.estimated_hours, 0) / templates.length).toFixed(1) : 0}h
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {new Set(templates?.map(t => t.category)).size || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Checklist Items</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : templates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No task templates found
                  </TableCell>
                </TableRow>
              ) : (
                templates?.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{template.category}</TableCell>
                    <TableCell>{template.estimated_hours}h</TableCell>
                    <TableCell>{getPriorityBadge(template.priority)}</TableCell>
                    <TableCell>{template.checklist.length} items</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
                          <Copy className="h-4 w-4 mr-1" />
                          Use
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
