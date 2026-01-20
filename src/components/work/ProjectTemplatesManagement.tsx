import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_duration: number;
  task_count: number;
  milestone_count: number;
  created_by: string;
  created_at: string;
  is_public: boolean;
}

export function ProjectTemplatesManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    estimated_duration: 30,
    is_public: true
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['project-templates'],
    queryFn: async () => {
      // Simulated data
      return [
        {
          id: '1',
          name: 'Web Application Development',
          description: 'Standard template for web app projects with frontend and backend tasks',
          category: 'development',
          estimated_duration: 90,
          task_count: 45,
          milestone_count: 6,
          created_by: profile?.id || '',
          created_at: new Date().toISOString(),
          is_public: true
        },
        {
          id: '2',
          name: 'Marketing Campaign',
          description: 'Template for planning and executing marketing campaigns',
          category: 'marketing',
          estimated_duration: 30,
          task_count: 25,
          milestone_count: 4,
          created_by: profile?.id || '',
          created_at: new Date().toISOString(),
          is_public: true
        },
        {
          id: '3',
          name: 'Employee Onboarding',
          description: 'HR onboarding project template for new hires',
          category: 'hr',
          estimated_duration: 14,
          task_count: 20,
          milestone_count: 3,
          created_by: profile?.id || '',
          created_at: new Date().toISOString(),
          is_public: true
        }
      ] as ProjectTemplate[];
    }
  });

  const handleSubmit = () => {
    toast.success('Project template created successfully');
    setIsDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      category: 'general',
      estimated_duration: 30,
      is_public: true
    });
  };

  const handleClone = (template: ProjectTemplate) => {
    toast.success(`Creating project from "${template.name}" template`);
  };

  const handleDelete = (id: string) => {
    toast.success('Template deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['project-templates'] });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      development: 'bg-blue-100 text-blue-800',
      marketing: 'bg-purple-100 text-purple-800',
      hr: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };

  const categories = ['general', 'development', 'marketing', 'hr', 'operations', 'finance'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
                  <Label>Est. Duration (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
                  />
                </div>
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
              <LayoutTemplate className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{templates?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {templates?.length ? Math.round(templates.reduce((a, b) => a + b.estimated_duration, 0) / templates.length) : 0} days
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
                {templates?.reduce((a, b) => a + b.task_count, 0) || 0}
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
              No project templates found
            </CardContent>
          </Card>
        ) : (
          templates?.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
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
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{template.estimated_duration} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tasks</p>
                    <p className="font-medium">{template.task_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Milestones</p>
                    <p className="font-medium">{template.milestone_count}</p>
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
