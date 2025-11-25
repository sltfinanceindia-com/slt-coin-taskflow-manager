import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Zap, Filter, LayoutGrid, Table, Plus, Inbox } from 'lucide-react';
import { KanbanAnalytics } from '@/components/KanbanAnalytics';
import { KanbanFilters } from '@/components/KanbanFilters';
import { KanbanTableView } from '@/components/KanbanTableView';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status'], submissionNotes?: string) => void;
  onVerifyTask: (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  isUpdating?: boolean;
}

interface KanbanFilters {
  priority: string[];
  assignedTo: string[];
  dateRange: { start: Date | null; end: Date | null };
  projects: string[];
}

const columns = [
  { id: 'assigned', title: 'Assigned', status: 'assigned' as const },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
  { id: 'completed', title: 'Completed', status: 'completed' as const },
  { id: 'verified', title: 'Verified', status: 'verified' as const },
  { id: 'rejected', title: 'Rejected', status: 'rejected' as const },
];

export function KanbanBoard({ 
  tasks, 
  onUpdateStatus, 
  onVerifyTask, 
  onUpdateTask, 
  isUpdating 
}: KanbanBoardProps) {
  const { profile } = useAuth();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<KanbanFilters>({
    priority: [],
    assignedTo: [],
    dateRange: { start: null, end: null },
    projects: [],
  });
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);

  // Advanced filtering logic
  const filteredTasks = tasks.filter(task => {
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority || '')) {
      return false;
    }
    if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(task.assigned_to || '')) {
      return false;
    }
    if (filters.projects.length > 0 && !filters.projects.includes(task.project_id || '')) {
      return false;
    }
    if (filters.dateRange.start && new Date(task.created_at) < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && new Date(task.created_at) > filters.dateRange.end) {
      return false;
    }
    return true;
  });

  // AI-powered optimization suggestions
  const generateOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    // Analyze bottlenecks
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');
    
    if (inProgressTasks.length > completedTasks.length * 1.5) {
      suggestions.push('🔄 High work-in-progress detected. Consider implementing WIP limits.');
    }
    
    // Analyze assignment distribution
    const assignmentCounts = filteredTasks.reduce((acc, task) => {
      const assignee = task.assigned_to || 'unassigned';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxAssignments = Math.max(...Object.values(assignmentCounts));
    const minAssignments = Math.min(...Object.values(assignmentCounts));
    
    if (maxAssignments > minAssignments * 2) {
      suggestions.push('⚖️ Uneven task distribution detected. Consider rebalancing workload.');
    }
    
    // Analyze priority distribution
    const urgentTasks = filteredTasks.filter(t => t.priority === 'urgent');
    if (urgentTasks.length > filteredTasks.length * 0.3) {
      suggestions.push('🚨 Too many urgent tasks. Review prioritization strategy.');
    }
    
    setOptimizationSuggestions(suggestions);
  }, [filteredTasks]);

  useEffect(() => {
    generateOptimizationSuggestions();
  }, [filteredTasks.length]);

  // Enhanced drag and drop with validation
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as Task['status'];
    
    // Business logic validation
    if (!validateStatusTransition(task.status, newStatus)) {
      toast({
        title: 'Invalid Status Change',
        description: 'This status transition is not allowed.',
        variant: 'destructive',
      });
      return;
    }

    // Permission validation
    if (!canUserUpdateStatus(task, newStatus)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to make this change.',
        variant: 'destructive',
      });
      return;
    }

    // Log the status change for analytics
    await logStatusChange(task.id, task.status, newStatus);
    
    onUpdateStatus(draggableId, newStatus);
  };

  const validateStatusTransition = (currentStatus: Task['status'], newStatus: Task['status']): boolean => {
    const validTransitions: Record<Task['status'], Task['status'][]> = {
      assigned: ['in_progress'],
      in_progress: ['completed'],
      completed: ['verified', 'rejected'],
      verified: [],
      rejected: ['in_progress'],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const canUserUpdateStatus = (task: Task, newStatus: Task['status']): boolean => {
    // Admins can change any status and override any intern updates
    if (profile?.role === 'admin') return true;
    
    // Interns can only update their own tasks to specific statuses
    if (task.assigned_to === profile?.id) {
      return ['in_progress', 'completed'].includes(newStatus);
    }
    
    return false;
  };

  // Admin override function - allows admins to force status changes
  const handleAdminOverride = async (task: Task, newStatus?: Task['status']) => {
    if (profile?.role !== 'admin') return;
    
    // If no specific status provided, cycle through available statuses
    const statusOptions: Task['status'][] = ['assigned', 'in_progress', 'completed', 'verified', 'rejected'];
    const currentIndex = statusOptions.indexOf(task.status);
    const nextStatus = newStatus || statusOptions[(currentIndex + 1) % statusOptions.length];
    
    await logStatusChange(task.id, task.status, nextStatus);
    onUpdateStatus(task.id, nextStatus);
    
    toast({
      title: 'Status Override',
      description: `Task status has been overridden to ${nextStatus.replace('_', ' ')}.`,
    });
  };

  const logStatusChange = async (taskId: string, fromStatus: Task['status'], toStatus: Task['status']) => {
    try {
      await supabase.functions.invoke('log-kanban-event', {
        body: {
          event_type: 'status_change',
          task_id: taskId,
          from_status: fromStatus,
          to_status: toStatus,
          user_id: profile?.id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to log status change:', error);
    }
  };

  const getColumnColor = (columnId: string) => {
    const colors = {
      assigned: 'border-blue-200 bg-blue-50/20',
      in_progress: 'border-yellow-200 bg-yellow-50/20',
      completed: 'border-purple-200 bg-purple-50/20',
      verified: 'border-green-200 bg-green-50/20',
      rejected: 'border-red-200 bg-red-50/20',
    };
    return colors[columnId as keyof typeof colors] || 'border-border bg-muted/10';
  };

  const getColumnHeaderColor = (columnId: string) => {
    const colors = {
      assigned: 'text-blue-700 bg-blue-100/60',
      in_progress: 'text-yellow-700 bg-yellow-100/60',
      completed: 'text-purple-700 bg-purple-100/60',
      verified: 'text-green-700 bg-green-100/60',
      rejected: 'text-red-700 bg-red-100/60',
    };
    return colors[columnId as keyof typeof colors] || 'text-foreground bg-muted/60';
  };

  const getTaskCountForColumn = (status: Task['status']) => {
    return filteredTasks.filter(task => task.status === status).length;
  };

  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

  return (
    <div className="min-h-screen bg-background">
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="bg-card rounded-lg border p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Task Management Board</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Drag and drop tasks to update their status</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'board' | 'table')}>
                <TabsList>
                  <TabsTrigger value="board" className="gap-2">
                    <LayoutGrid className="h-3 w-3" />
                    Board
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-2">
                    <Table className="h-3 w-3" />
                    Table
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 text-xs"
              >
                <Filter className="h-3 w-3" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="gap-2 text-xs"
              >
                <BarChart3 className="h-3 w-3" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Optimization suggestions */}
        {optimizationSuggestions.length > 0 && (
          <div className="bg-card border rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Optimization Suggestions</h3>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {optimizationSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Filters panel */}
        {showFilters && (
          <div className="animate-fade-in">
            <KanbanFilters filters={filters} onFiltersChange={setFilters} tasks={tasks} />
          </div>
        )}

        {/* Analytics panel */}
        {showAnalytics && (
          <div className="animate-fade-in">
            <KanbanAnalytics tasks={filteredTasks} />
          </div>
        )}

        {/* Kanban Board or Table View */}
        {viewMode === 'table' ? (
          <KanbanTableView 
            tasks={filteredTasks}
            onUpdateStatus={onUpdateStatus}
            onVerifyTask={onVerifyTask}
          />
        ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col min-h-0">
                {/* Column Header */}
                <div className={`p-2 sm:p-3 rounded-t-lg border-b ${getColumnHeaderColor(column.id)} shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wide truncate">
                      {column.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs font-medium ml-2 flex-shrink-0">
                      {getTaskCountForColumn(column.status)}
                    </Badge>
                  </div>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        flex-1 min-h-[300px] sm:min-h-[400px] p-2 border-2 border-dashed rounded-b-lg transition-all duration-200
                        ${getColumnColor(column.id)}
                        ${snapshot.isDraggingOver ? 'border-primary bg-primary/5 scale-[1.01]' : ''}
                      `}
                    >
                      <div className="space-y-2">
                        {filteredTasks
                          .filter(task => task.status === column.status)
                          .map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`
                                    transition-all duration-200 cursor-grab active:cursor-grabbing
                                    ${snapshot.isDragging ? 'rotate-1 scale-105 shadow-lg z-50' : 'hover:shadow-md'}
                                  `}
                                >
                                  <TaskCard
                                    task={task}
                                    onUpdateStatus={onUpdateStatus}
                                    onVerifyTask={onVerifyTask}
                                    onUpdateTask={onUpdateTask}
                                    isUpdating={isUpdating}
                                    onAdminOverride={handleAdminOverride}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        
                        {/* Empty state for columns with no tasks */}
                        {filteredTasks.filter(task => task.status === column.status).length === 0 && (
                          <div className="py-8">
                            <EmptyState
                              icon={Inbox}
                              title="No tasks"
                              description={`No ${column.title.toLowerCase()} tasks yet`}
                              className="py-4"
                            />
                          </div>
                        )}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
        )}
      </div>
    </div>
  );
}
