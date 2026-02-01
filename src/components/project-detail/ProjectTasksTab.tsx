/**
 * Project Tasks Tab
 * Task list with filters, kanban view option
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckSquare, Plus, Search, List, Kanban } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface ProjectTasksTabProps {
  projectId: string;
}

const statusColors: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filteredTasks = tasks.filter((task: any) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('kanban')}
          >
            <Kanban className="h-4 w-4" />
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {task.task_number && (
                        <span className="text-xs font-mono text-muted-foreground">
                          {task.task_number}
                        </span>
                      )}
                      <span className="font-medium truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      {task.assigned_profile && (
                        <span>{task.assigned_profile.full_name}</span>
                      )}
                      {task.end_date && (
                        <>
                          <span>•</span>
                          <span>Due {format(parseISO(task.end_date), 'MMM dd')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[task.status] || ''}>
                      {task.status?.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
