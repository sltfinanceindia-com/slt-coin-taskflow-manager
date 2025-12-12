import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTemplates } from '@/hooks/useTemplates';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  FileBox, 
  ListTodo, 
  Plus, 
  Search, 
  Play,
  Trash2,
  Edit
} from 'lucide-react';

export const TemplateLibrary: React.FC = () => {
  const { 
    projectTemplates, 
    taskTemplates, 
    isLoading, 
    applyProjectTemplate,
    deleteProjectTemplate,
    deleteTaskTemplate 
  } = useTemplates();
  const { isAdmin } = useUserRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [projectName, setProjectName] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const filteredProjectTemplates = projectTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTaskTemplates = taskTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !projectName.trim()) return;
    
    setIsApplying(true);
    try {
      await applyProjectTemplate(selectedTemplate.id, projectName);
      setApplyDialogOpen(false);
      setProjectName('');
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Template Library</h2>
          <p className="text-muted-foreground">
            Create projects quickly from pre-built templates
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <FileBox className="h-4 w-4" />
            Project Templates
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Task Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {filteredProjectTemplates.length === 0 ? (
            <EmptyState
              icon={FileBox}
              title="No project templates"
              description="Create a template to quickly start new projects with predefined tasks and settings."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjectTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{template.default_tasks?.length || 0} tasks</span>
                      <span>{template.default_roles?.length || 0} roles</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setApplyDialogOpen(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Use Template
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProjectTemplate.mutate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {filteredTaskTemplates.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No task templates"
              description="Create reusable task bundles to add to projects quickly."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTaskTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{template.tasks?.length || 0} tasks</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Project
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTaskTemplate.mutate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project from Template</DialogTitle>
            <DialogDescription>
              This will create a new project using "{selectedTemplate?.name}" template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                placeholder="Enter project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            {selectedTemplate && (
              <div className="text-sm text-muted-foreground">
                This template includes {selectedTemplate.default_tasks?.length || 0} tasks
                and {selectedTemplate.default_roles?.length || 0} roles.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyTemplate} 
              disabled={!projectName.trim() || isApplying}
            >
              {isApplying ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
