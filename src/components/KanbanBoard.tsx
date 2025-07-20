import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Zap, Filter } from 'lucide-react';
import { KanbanAnalytics } from '@/components/KanbanAnalytics';
import { KanbanFilters } from '@/components/KanbanFilters';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
      assigned: 'bg-blue-50 border-blue-200',
      in_progress: 'bg-yellow-50 border-yellow-200',
      completed: 'bg-purple-50 border-purple-200',
      verified: 'bg-green-50 border-green-200',
      rejected: 'bg-red-50 border-red-200',
    };
    return colors[columnId as keyof typeof colors] || 'bg-gray-50 border-gray-200';
  };

  const getColumnHeaderColor = (columnId: string) => {
    const colors = {
      assigned: 'text-blue-700 bg-blue-100',
      in_progress: 'text-yellow-700 bg-yellow-100',
      completed: 'text-purple-700 bg-purple-100',
      verified: 'text-green-700 bg-green-100',
      rejected: 'text-red-700 bg-red-100',
    };
    return colors[columnId as keyof typeof colors] || 'text-gray-700 bg-gray-100';
  };

  const getTaskCountForColumn = (status: Task['status']) => {
    return filteredTasks.filter(task => task.status === status).length;
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Task Kanban Board</h2>
          <p className="text-sm text-gray-600">Drag and drop tasks to update their status</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="text-xs"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateOptimizationSuggestions}
            className="text-xs"
          >
            <Zap className="h-4 w-4 mr-1" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Optimization suggestions */}
      {optimizationSuggestions.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-4 w-4 text-orange-600 mr-2" />
            <h3 className="text-sm font-medium text-orange-800">Optimization Suggestions</h3>
          </div>
          <ul className="space-y-1 text-sm text-orange-700">
            {optimizationSuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <KanbanFilters filters={filters} onFiltersChange={setFilters} tasks={tasks} />
      )}

      {/* Analytics panel */}
      {showAnalytics && (
        <div className="animate-fade-in">
          <KanbanAnalytics tasks={filteredTasks} />
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col min-h-0">
              {/* Column Header */}
              <div className={`p-3 rounded-t-lg border-b ${getColumnHeaderColor(column.id)}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    {column.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs font-medium">
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
                      flex-1 min-h-[400px] p-3 border-2 border-dashed rounded-b-lg transition-colors
                      ${getColumnColor(column.id)}
                      ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : ''}
                    `}
                  >
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
                                  transition-transform duration-200
                                  ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''}
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
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
