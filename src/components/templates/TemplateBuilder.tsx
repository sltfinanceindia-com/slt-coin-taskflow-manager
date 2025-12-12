import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTemplates } from '@/hooks/useTemplates';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileBox, 
  ListTodo,
  GripVertical
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  estimated_hours: number;
}

export const TemplateBuilder: React.FC = () => {
  const { createProjectTemplate, createTaskTemplate } = useTemplates();
  const [activeTab, setActiveTab] = useState('project');
  
  // Project template state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectCategory, setProjectCategory] = useState('general');
  const [projectTasks, setProjectTasks] = useState<TaskItem[]>([]);

  // Task template state
  const [taskTemplateName, setTaskTemplateName] = useState('');
  const [taskTemplateDescription, setTaskTemplateDescription] = useState('');
  const [taskTemplateCategory, setTaskTemplateCategory] = useState('general');
  const [templateTasks, setTemplateTasks] = useState<TaskItem[]>([]);

  const addTask = (isProject: boolean) => {
    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      priority: 'medium',
      estimated_hours: 1,
    };
    
    if (isProject) {
      setProjectTasks([...projectTasks, newTask]);
    } else {
      setTemplateTasks([...templateTasks, newTask]);
    }
  };

  const updateTask = (isProject: boolean, id: string, field: keyof TaskItem, value: any) => {
    const setter = isProject ? setProjectTasks : setTemplateTasks;
    const tasks = isProject ? projectTasks : templateTasks;
    
    setter(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const removeTask = (isProject: boolean, id: string) => {
    const setter = isProject ? setProjectTasks : setTemplateTasks;
    const tasks = isProject ? projectTasks : templateTasks;
    setter(tasks.filter(task => task.id !== id));
  };

  const handleSaveProjectTemplate = async () => {
    if (!projectName.trim()) return;
    
    await createProjectTemplate.mutateAsync({
      name: projectName,
      description: projectDescription,
      category: projectCategory,
      default_tasks: projectTasks.map(t => ({
        title: t.title,
        description: t.description,
        priority: t.priority,
        estimated_hours: t.estimated_hours,
      })),
    });
    
    // Reset form
    setProjectName('');
    setProjectDescription('');
    setProjectCategory('general');
    setProjectTasks([]);
  };

  const handleSaveTaskTemplate = async () => {
    if (!taskTemplateName.trim()) return;
    
    await createTaskTemplate.mutateAsync({
      name: taskTemplateName,
      description: taskTemplateDescription,
      category: taskTemplateCategory,
      tasks: templateTasks.map(t => ({
        title: t.title,
        description: t.description,
        priority: t.priority,
        estimated_hours: t.estimated_hours,
      })),
    });
    
    // Reset form
    setTaskTemplateName('');
    setTaskTemplateDescription('');
    setTaskTemplateCategory('general');
    setTemplateTasks([]);
  };

  const TaskEditor = ({ tasks, isProject }: { tasks: TaskItem[]; isProject: boolean }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Tasks ({tasks.length})</h4>
        <Button size="sm" variant="outline" onClick={() => addTask(isProject)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No tasks yet. Add tasks to your template.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <Card key={task.id} className="relative">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="shrink-0">
                        Task {index + 1}
                      </Badge>
                      <Input
                        placeholder="Task title..."
                        value={task.title}
                        onChange={(e) => updateTask(isProject, task.id, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTask(isProject, task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Task description..."
                      value={task.description}
                      onChange={(e) => updateTask(isProject, task.id, 'description', e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Priority</Label>
                        <Select
                          value={task.priority}
                          onValueChange={(v) => updateTask(isProject, task.id, 'priority', v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Est. Hours</Label>
                        <Input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={task.estimated_hours}
                          onChange={(e) => updateTask(isProject, task.id, 'estimated_hours', parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Template Builder</h2>
        <p className="text-muted-foreground">
          Create reusable templates for projects and tasks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="project" className="gap-2">
            <FileBox className="h-4 w-4" />
            Project Template
          </TabsTrigger>
          <TabsTrigger value="task" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Task Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="project" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Project Template</CardTitle>
              <CardDescription>
                Define a reusable project structure with predefined tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Marketing Campaign"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={projectCategory} onValueChange={setProjectCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this template is for..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <TaskEditor tasks={projectTasks} isProject={true} />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProjectTemplate}
                  disabled={!projectName.trim() || createProjectTemplate.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createProjectTemplate.isPending ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="task" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Task Template</CardTitle>
              <CardDescription>
                Create a bundle of tasks that can be added to any project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Sprint Planning Tasks"
                    value={taskTemplateName}
                    onChange={(e) => setTaskTemplateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={taskTemplateCategory} onValueChange={setTaskTemplateCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="deployment">Deployment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe this task bundle..."
                  value={taskTemplateDescription}
                  onChange={(e) => setTaskTemplateDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <TaskEditor tasks={templateTasks} isProject={false} />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveTaskTemplate}
                  disabled={!taskTemplateName.trim() || createTaskTemplate.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createTaskTemplate.isPending ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
