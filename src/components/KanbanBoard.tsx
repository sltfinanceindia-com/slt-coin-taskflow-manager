import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Zap, Filter, LayoutGrid, Table, AlertCircle, X } from 'lucide-react';
import { KanbanAnalytics } from '@/components/KanbanAnalytics';
import { KanbanFilters } from '@/components/KanbanFilters';
import { KanbanTableView } from '@/components/KanbanTableView';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/useUserRole';

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
  const { isAdmin } = useUserRole();
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
    // Admins can change any status and override any employee updates
    if (isAdmin) return true;
    
    // Employees can only update their own tasks to specific statuses
    if (task.assigned_to === profile?.id) {
      return ['in_progress', 'completed'].includes(newStatus);
    }
    
    return false;
  };

  // Admin override function - allows admins to force status changes
  const handleAdminOverride = async (task: Task, newStatus?: Task['status']) => {
    if (!isAdmin) return;
    
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
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">Optimization Suggestions</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {optimizationSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOptimizationSuggestions([])}
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
          {/* Mobile scroll hint */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2 sm:hidden">
            <span>← Swipe to see more columns →</span>
          </div>
          <div className="overflow-x-auto pb-4 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 min-w-max sm:min-w-0">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col min-h-[350px] sm:min-h-[500px] lg:min-h-[600px] w-[280px] sm:w-auto flex-shrink-0 snap-start">
                {/* Column Header */}
                <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg bg-gray-100 dark:bg-gray-800 border-b-2 ${column.id === 'assigned' ? 'border-blue-500' : column.id === 'in_progress' ? 'border-yellow-500' : column.id === 'completed' ? 'border-purple-500' : column.id === 'verified' ? 'border-emerald-500' : 'border-red-500'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-gray-900 dark:text-gray-50">
                      {column.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 ml-2 flex-shrink-0 bg-gray-200 dark:bg-gray-700">
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
                        flex-1 min-h-0 max-h-[calc(100vh-300px)] overflow-y-auto p-3 border-2 border-dashed rounded-b-lg transition-all duration-200
                        ${snapshot.isDraggingOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}
                      `}
                    >
                      {filteredTasks.filter(task => task.status === column.status).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-8 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                          <AlertCircle className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-3" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No tasks in {column.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Drag tasks here to update status</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
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
                                    style={{
                                      ...provided.draggableProps.style,
                                      borderLeft: `4px solid ${task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f59e0b' : task.priority === 'medium' ? '#3b82f6' : '#6b7280'}`,
                                    }}
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
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
            </div>
          </div>
        </DragDropContext>
        )}
      </div>
    </div>
  );
}
