import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  GitBranch, 
  Calendar, 
  ArrowRight, 
  Link2, 
  Unlink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  assigned_to: string | null;
  project_id: string | null;
  is_critical: boolean;
  assignee?: { full_name: string };
  project?: { name: string };
}

interface Dependency {
  id: string;
  predecessor_id: string;
  successor_id: string;
  dependency_type: string;
  lag_days: number;
}

interface GanttChartProps {
  projectId?: string;
}

export function GanttChart({ projectId }: GanttChartProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [viewStart, setViewStart] = useState(startOfMonth(new Date()));
  const [dayWidth, setDayWidth] = useState(30);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['gantt-tasks', projectId, profile?.organization_id],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assigned_to_fkey(full_name),
          project:projects(name)
        `)
        .eq('organization_id', profile?.organization_id)
        .not('start_date', 'is', null);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query.order('start_date');
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch dependencies
  const { data: dependencies } = useQuery({
    queryKey: ['task-dependencies', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('organization_id', profile?.organization_id);
      if (error) throw error;
      return data as Dependency[];
    },
    enabled: !!profile?.organization_id
  });

  // Create dependency
  const createDependency = useMutation({
    mutationFn: async ({ predecessorId, successorId }: { predecessorId: string; successorId: string }) => {
      const { error } = await supabase
        .from('task_dependencies')
        .insert({
          predecessor_id: predecessorId,
          successor_id: successorId,
          organization_id: profile?.organization_id,
          dependency_type: 'finish_to_start',
          lag_days: 0
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      setLinkingFrom(null);
      toast.success('Dependency created');
    },
    onError: () => toast.error('Failed to create dependency')
  });

  // Delete dependency
  const deleteDependency = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      toast.success('Dependency removed');
    }
  });

  // Calculate view range
  const viewEnd = addDays(viewStart, Math.ceil(800 / dayWidth));
  const days = eachDayOfInterval({ start: viewStart, end: viewEnd });

  // Get task bar position and width
  const getTaskBar = (task: Task) => {
    const start = task.planned_start_date || task.start_date;
    const end = task.planned_end_date || task.end_date;
    
    if (!start) return null;

    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : addDays(startDate, 1);
    
    const left = differenceInDays(startDate, viewStart) * dayWidth;
    const width = Math.max(differenceInDays(endDate, startDate) + 1, 1) * dayWidth;

    return { left, width, startDate, endDate };
  };

  // Get status color
  const getStatusColor = (status: string, isCritical: boolean) => {
    if (isCritical) return 'bg-red-500';
    const colors: Record<string, string> = {
      pending: 'bg-gray-400',
      assigned: 'bg-blue-400',
      in_progress: 'bg-amber-400',
      completed: 'bg-green-400',
      verified: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  // Handle task click for linking
  const handleTaskClick = (task: Task) => {
    if (linkingFrom) {
      if (linkingFrom !== task.id) {
        createDependency.mutate({ predecessorId: linkingFrom, successorId: task.id });
      } else {
        setLinkingFrom(null);
      }
    } else {
      setSelectedTask(task);
    }
  };

  // Get dependencies for a task
  const getTaskDependencies = (taskId: string) => {
    return dependencies?.filter(d => d.successor_id === taskId || d.predecessor_id === taskId) || [];
  };

  const navigate = (direction: 'prev' | 'next') => {
    const days = Math.ceil(800 / dayWidth);
    setViewStart(addDays(viewStart, direction === 'next' ? days : -days));
  };

  if (isLoading) {
    return (
      <Card className="card-gradient">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading Gantt chart...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(viewStart, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDayWidth(Math.max(15, dayWidth - 5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDayWidth(Math.min(50, dayWidth + 5))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant={linkingFrom ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLinkingFrom(linkingFrom ? null : 'waiting')}
          >
            <Link2 className="h-4 w-4 mr-1" />
            {linkingFrom ? 'Cancel Link' : 'Link Tasks'}
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Critical Path</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-400" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-400" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowRight className="h-3 w-3" />
          <span>Dependency</span>
        </div>
      </div>

      {linkingFrom && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
          <p className="font-medium">Link Mode Active</p>
          <p className="text-muted-foreground">
            {linkingFrom === 'waiting' 
              ? 'Click a task to start, then click another task to create a dependency'
              : 'Now click the successor task to complete the link'
            }
          </p>
        </div>
      )}

      {/* Gantt Chart */}
      <Card className="card-gradient overflow-hidden">
        <div className="flex overflow-x-auto">
          {/* Task list */}
          <div className="w-40 sm:w-64 shrink-0 border-r border-border">
            <div className="h-12 border-b border-border bg-muted/50 px-4 flex items-center font-medium">
              Task Name
            </div>
            <div className="divide-y divide-border">
              {tasks?.map((task) => (
                <TooltipProvider key={task.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "h-10 px-4 flex items-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors",
                          linkingFrom === task.id && "bg-primary/10",
                          task.is_critical && "border-l-2 border-l-red-500"
                        )}
                        onClick={() => {
                          if (linkingFrom === 'waiting') {
                            setLinkingFrom(task.id);
                          } else {
                            handleTaskClick(task);
                          }
                        }}
                      >
                        <span className="truncate text-sm">{task.title}</span>
                        {task.is_critical && (
                          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="space-y-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.assignee?.full_name || 'Unassigned'}
                        </p>
                        <p className="text-xs">
                          {task.start_date && format(parseISO(task.start_date), 'MMM d')} - 
                          {task.end_date && format(parseISO(task.end_date), 'MMM d')}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <ScrollArea className="flex-1">
            <div style={{ width: days.length * dayWidth }}>
              {/* Date header */}
              <div className="h-12 border-b border-border bg-muted/50 flex">
                {days.map((day, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "shrink-0 border-r border-border flex flex-col items-center justify-center text-xs",
                      isWeekend(day) && "bg-muted/80"
                    )}
                    style={{ width: dayWidth }}
                  >
                    <span className="text-muted-foreground">{format(day, 'EEE')}</span>
                    <span className="font-medium">{format(day, 'd')}</span>
                  </div>
                ))}
              </div>

              {/* Task bars */}
              <div className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {days.map((day, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "shrink-0 border-r border-border/50",
                        isWeekend(day) && "bg-muted/30",
                        isSameDay(day, new Date()) && "bg-primary/5"
                      )}
                      style={{ width: dayWidth }}
                    />
                  ))}
                </div>

                {/* Today line */}
                {days.some(d => isSameDay(d, new Date())) && (
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ 
                      left: differenceInDays(new Date(), viewStart) * dayWidth + dayWidth / 2 
                    }}
                  />
                )}

                {/* Task bars */}
                {tasks?.map((task) => {
                  const bar = getTaskBar(task);
                  if (!bar) return null;

                  return (
                    <div 
                      key={task.id}
                      className="h-10 flex items-center relative"
                    >
                      <div
                        className={cn(
                          "absolute h-6 rounded cursor-pointer transition-all hover:opacity-80",
                          getStatusColor(task.status, task.is_critical),
                          linkingFrom === task.id && "ring-2 ring-primary ring-offset-2"
                        )}
                        style={{ 
                          left: Math.max(0, bar.left), 
                          width: bar.width,
                          opacity: bar.left < 0 ? 0.5 : 1
                        }}
                        onClick={() => {
                          if (linkingFrom && linkingFrom !== 'waiting' && linkingFrom !== task.id) {
                            createDependency.mutate({ predecessorId: linkingFrom, successorId: task.id });
                          } else if (linkingFrom === 'waiting') {
                            setLinkingFrom(task.id);
                          }
                        }}
                      >
                        <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium truncate">
                          {dayWidth > 25 && task.title}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Dependency arrows */}
                <svg className="absolute inset-0 pointer-events-none overflow-visible">
                  {dependencies?.map((dep) => {
                    const predecessor = tasks?.find(t => t.id === dep.predecessor_id);
                    const successor = tasks?.find(t => t.id === dep.successor_id);
                    
                    if (!predecessor || !successor) return null;

                    const predBar = getTaskBar(predecessor);
                    const succBar = getTaskBar(successor);
                    
                    if (!predBar || !succBar) return null;

                    const predIndex = tasks?.findIndex(t => t.id === dep.predecessor_id) || 0;
                    const succIndex = tasks?.findIndex(t => t.id === dep.successor_id) || 0;

                    const startX = predBar.left + predBar.width;
                    const startY = predIndex * 40 + 20;
                    const endX = succBar.left;
                    const endY = succIndex * 40 + 20;

                    const midX = startX + (endX - startX) / 2;

                    return (
                      <g key={dep.id}>
                        <path
                          d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-muted-foreground"
                          markerEnd="url(#arrowhead)"
                        />
                      </g>
                    );
                  })}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="currentColor"
                        className="text-muted-foreground"
                      />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge>{selectedTask.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <Badge variant="outline">{selectedTask.priority}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Assignee</p>
                  <p>{selectedTask.assignee?.full_name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Project</p>
                  <p>{selectedTask.project?.name || 'No project'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p>{selectedTask.start_date ? format(parseISO(selectedTask.start_date), 'MMM d, yyyy') : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p>{selectedTask.end_date ? format(parseISO(selectedTask.end_date), 'MMM d, yyyy') : '-'}</p>
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <h4 className="font-medium mb-2">Dependencies</h4>
                {getTaskDependencies(selectedTask.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No dependencies</p>
                ) : (
                  <div className="space-y-2">
                    {getTaskDependencies(selectedTask.id).map((dep) => {
                      const isSuccessor = dep.successor_id === selectedTask.id;
                      const relatedTask = tasks?.find(t => 
                        t.id === (isSuccessor ? dep.predecessor_id : dep.successor_id)
                      );
                      
                      return (
                        <div key={dep.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                          <div className="flex items-center gap-2 text-sm">
                            <GitBranch className="h-4 w-4" />
                            <span>{isSuccessor ? 'Blocked by' : 'Blocks'}: </span>
                            <span className="font-medium">{relatedTask?.title}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteDependency.mutate(dep.id)}
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setLinkingFrom(selectedTask.id);
                  setSelectedTask(null);
                }}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Create Dependency
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
