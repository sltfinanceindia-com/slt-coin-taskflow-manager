import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Mail, Building2, Calendar, Coins,
  CheckSquare, FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeDetailViewProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailView({ employeeId, open, onOpenChange }: EmployeeDetailViewProps) {
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch employee details
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ['employee-detail', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          department:departments!profiles_department_id_fkey(id, name, color)
        `)
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId && open,
  });

  // Fetch employee's tasks
  const { data: tasks } = useQuery({
    queryKey: ['employee-tasks', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority, end_date, slt_coin_value')
        .eq('assigned_to', employeeId)
        .order('end_date', { ascending: true })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId && open,
  });

  // Fetch employee's projects via tasks
  const { data: projects } = useQuery({
    queryKey: ['employee-projects', employeeId],
    queryFn: async () => {
      const { data: taskProjects } = await supabase
        .from('tasks')
        .select('project_id, projects!inner(id, name, status, description)')
        .eq('assigned_to', employeeId)
        .not('project_id', 'is', null)
        .limit(20);
      
      const uniqueProjects = new Map();
      taskProjects?.forEach((t: any) => {
        if (t.projects && !uniqueProjects.has(t.projects.id)) {
          uniqueProjects.set(t.projects.id, t.projects);
        }
      });
      return Array.from(uniqueProjects.values());
    },
    enabled: !!employeeId && open,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const taskStats = {
    total: tasks?.length || 0,
    completed: tasks?.filter(t => t.status === 'completed' || t.status === 'verified').length || 0,
  };

  if (employeeLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee?.avatar_url || ''} />
              <AvatarFallback className="text-lg">
                {employee?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {employee?.full_name || 'Unknown Employee'}
                {employee?.employee_id && (
                  <Badge variant="outline">{employee.employee_id}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">
                {employee?.role}
                {employee?.department?.name && ` • ${employee.department.name}`}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks ({taskStats.total})
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects ({projects?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{employee?.email || 'No email'}</span>
                    </div>
                    {employee?.department?.name && (
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" style={{ borderColor: employee.department.color }}>
                          {employee.department.name}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <Coins className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{employee?.total_coins || 0}</p>
                      <p className="text-xs text-muted-foreground">Coins Earned</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <CheckSquare className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{taskStats.completed}</p>
                      <p className="text-xs text-muted-foreground">Tasks Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium">
                        {employee?.created_at 
                          ? format(new Date(employee.created_at), 'MMM yyyy')
                          : 'N/A'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">Joined</p>
                    </CardContent>
                  </Card>
                </div>

                {employee?.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{employee.bio}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <ScrollArea className="h-[400px]">
              {tasks?.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No tasks assigned</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks?.map((task) => (
                    <Card key={task.id} className="hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {task.priority}
                              </Badge>
                              {task.slt_coin_value > 0 && (
                                <Badge variant="secondary">
                                  <Coins className="h-3 w-3 mr-1" />
                                  {task.slt_coin_value}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {task.end_date && (
                            <p className="text-xs text-muted-foreground">
                              Due: {format(new Date(task.end_date), 'MMM d')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            <ScrollArea className="h-[400px]">
              {projects?.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No projects found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects?.map((project: any) => (
                    <Card key={project.id} className="hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{project.name}</p>
                            {project.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
