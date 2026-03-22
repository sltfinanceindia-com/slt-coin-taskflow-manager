import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBox, Plus, Copy, Edit, Trash2, Clock, Tag } from 'lucide-react';
import { useTaskTemplates, TaskTemplate, TemplateTask } from '@/hooks/useTaskTemplates';
import { useAuth } from '@/hooks/useAuth';

export function TaskTemplatesManagement() {
  const { profile } = useAuth();
  const { 
    templates, 
    isLoading, 
    createTemplate, 
    deleteTemplate, 
    createTasksFromTemplate,
    parseTemplateTasks,
    isCreating,
    isDeleting 
  } = useTaskTemplates();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tasks: '',
  });

  const handleSubmit = async () => {
    try {
      // Parse tasks from textarea (one task per line)
      const taskLines = formData.tasks.split('\n').filter(line => line.trim());
      const tasks: TemplateTask[] = taskLines.map(line => ({
        title: line.trim(),
        priority: 'medium' as const,
      }));

      await createTemplate.mutateAsync({
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        tasks: tasks as any,
        is_active: true,
      });
      
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        category: 'general',
        tasks: '',
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUseTemplate = async (template: TaskTemplate) => {
    try {
      await createTasksFromTemplate.mutateAsync({
        templateId: template.id,
        assigneeId: profile?.id,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const categories = ['general', 'development', 'design', 'marketing', 'reporting', 'operations'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                <Label>Tasks (one per line)</Label>
                <Textarea
                  value={formData.tasks}
                  onChange={(e) => setFormData({ ...formData, tasks: e.target.value })}
                  placeholder="Enter task titles, one per line..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={!formData.name || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Template'}
              </Button>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {templates?.filter(t => t.is_active).length || 0}
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
                <TableHead>Tasks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : templates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No task templates found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                templates?.map((template) => {
                  const tasks = parseTemplateTasks(template);
                  return (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{template.category}</Badge>
                      </TableCell>
                      <TableCell>{tasks.length} tasks</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUseTemplate(template)}
                            disabled={createTasksFromTemplate.isPending}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Use
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8" 
                            onClick={() => handleDelete(template.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
