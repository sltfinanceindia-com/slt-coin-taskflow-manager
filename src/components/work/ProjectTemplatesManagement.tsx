import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Plus, Copy, Edit, Trash2, LayoutTemplate, Clock, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';

export function ProjectTemplatesManagement() {
  const { templates, isLoading, createTemplate, deleteTemplate, isCreating } = useProjectTemplates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    is_active: true
  });

  const handleSubmit = async () => {
    if (!formData.name) return;
    
    await createTemplate({
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      is_active: formData.is_active,
      default_tasks: [],
      default_dependencies: [],
      default_roles: [],
    });
    
    setIsDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      category: 'general',
      is_active: true
    });
  };

  const handleClone = (template: typeof templates[0]) => {
    toast.success(`Creating project from "${template.name}" template`);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      development: 'bg-blue-100 text-blue-800',
      marketing: 'bg-purple-100 text-purple-800',
      hr: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800',
      operations: 'bg-orange-100 text-orange-800',
      finance: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category || 'general'] || colors.general;
  };

  const categories = ['general', 'development', 'marketing', 'hr', 'operations', 'finance'];

  // Helper to count tasks in template
  const getTaskCount = (template: typeof templates[0]) => {
    if (Array.isArray(template.default_tasks)) {
      return template.default_tasks.length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            Project Templates
          </h2>
          <p className="text-muted-foreground">Reusable project templates for quick setup</p>
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
              <DialogTitle>Create Project Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Web Application Development"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this template is for..."
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
              <Button onClick={handleSubmit} className="w-full" disabled={isCreating}>
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
              <LayoutTemplate className="h-5 w-5 text-primary" />
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
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {new Set(templates?.map(t => t.category)).size || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {templates?.reduce((a, b) => a + getTaskCount(b), 0) || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center">Loading templates...</CardContent>
          </Card>
        ) : templates?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No project templates found. Create your first template to get started.
            </CardContent>
          </Card>
        ) : (
          templates?.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge className={getCategoryColor(template.category)}>{template.category || 'general'}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.description && <CardDescription>{template.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tasks</p>
                    <p className="font-medium">{getTaskCount(template)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">{template.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleClone(template)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
