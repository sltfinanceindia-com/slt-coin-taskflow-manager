import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

// --------------- Types ---------------
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

// --------------- Constants ---------------
// Move columns out of the component for better readability
const COLUMNS = [
  { id: 'assigned', title: 'Assigned', status: 'assigned' as const },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
  { id: 'completed', title: 'Completed', status: 'completed' as const },
  { id: 'verified', title: 'Verified', status: 'verified' as const },
  { id: 'rejected', title: 'Rejected', status: 'rejected' as const },
] as const;

// --------------- Color Mappings ---------------
// Extracted for reusability and consistency
const COLUMN_COLORS = {
  assigned: { bg: 'bg-blue-50/20', border: 'border-blue-200', text: 'text-blue-700', headerBg: 'bg-blue-100/60' },
  in_progress: { bg: 'bg-yellow-50/20', border: 'border-yellow-200', text: 'text-yellow-700', headerBg: 'bg-yellow-100/60' },
  completed: { bg: 'bg-purple-50/20', border: 'border-purple-200', text: 'text-purple-700', headerBg: 'bg-purple-100/60' },
  verified: { bg: 'bg-green-50/20', border: 'border-green-200', text: 'text-green-700', headerBg: 'bg-green-100/60' },
  rejected: { bg: 'bg-red-50/20', border: 'border-red-200', text: 'text-red-700', headerBg: 'bg-red-100/60' },
} as const;

// --------------- KanbanBoard Component ---------------
export function KanbanBoard({ 
  tasks, 
  onUpdateStatus, 
  onVerifyTask, 
  onUpdateTask, 
  isUpdating 
}: KanbanBoardProps) {
  const { profile } = useAuth();
  // State
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<KanbanFilters>({
    priority: [],
    assignedTo: [],
    dateRange: { start: null, end: null },
    projects: [],
  });
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);

  // --------------- Filtering Logic ---------------
  const filteredTasks = tasks.filter(task => {
    if (filters.priority.length > 0 && task.priority && !filters.priority.includes(task.priority)) return false;
    if (filters.assignedTo.length > 0 && task.assigned_to && !filters.assignedTo.includes(task.assigned_to)) return false;
    if (filters.projects.length > 0 && task.project_id && !filters.projects.includes(task.project_id)) return false;
    if (filters.dateRange.start && new Date(task.created_at) < filters.dateRange.start) return false;
    if (filters.dateRange.end && new Date(task.created_at) > filters.dateRange.end) return false;
    return true;
  });

  // --------------- Optimization Suggestions ---------------
  const generateOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');
    
    // Bottleneck analysis
    if (inProgressTasks.length > completedTasks.length * 1.5) {
      suggestions.push('🔄 High work-in-progress detected. Consider implementing WIP limits.');
    }
    
    // Assignment balancing
    const assignmentCounts = filteredTasks.reduce((acc, task) => {
      const assignee = task.assigned_to ?? 'unassigned';
      acc[assignee] = (acc[assignee] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const maxAssignments = Math.max(...Object.values(assignmentCounts));
    const minAssignments = Math.min(...Object.values(assignmentCounts));
    if (maxAssignments > minAssignments * 2 && minAssignments > 0) {
      suggestions.push('⚖️ Uneven task distribution detected. Rebalance workload.');
    }
    
    // Priority health check
    const urgentTasks = filteredTasks.filter(t => t.priority === 'urgent');
    if (urgentTasks.length > filteredTasks.length * 0.3) {
      suggestions.push('🚨 Too many urgent tasks. Review prioritization strategy.');
    }
    
    setOptimizationSuggestions(suggestions);
  }, [filteredTasks]);

  useEffect(() => {
    generateOptimizationSuggestions();
  }, [filteredTasks.length]);

  // --------------- Drag & Drop Logic ---------------
  const validateStatusTransition = (
    currentStatus: Task['status'], 
    newStatus: Task['status']
  ): boolean => {
    const TRANSITION_RULES: Record<string, Task['status'][]> = {
      assigned: ['in_progress'],
      in_progress: ['completed'],
      completed: ['verified', 'rejected'],
      verified: [],
      rejected: ['in_progress'],
    };
    return TRANSITION_RULES[currentStatus]?.includes(newStatus) ?? false;
  };

  const canUserUpdateStatus = (task: Task, newStatus: Task['status']): boolean => {
    // Admins can change any status
    if (profile?.role === 'admin') return true;
    // Users can progress their own tasks
    if (task.assigned_to === profile?.id) {
      return ['in_progress', 'completed'].includes(newStatus);
    }
    return false;
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as Task['status'];

    if (!validateStatusTransition(task.status, newStatus)) {
      toast({
        title: 'Invalid Status Change',
        description: 'This status transition is not allowed.',
        variant: 'destructive',
      });
      return;
    }

    if (!canUserUpdateStatus(task, newStatus)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to make this change.',
        variant: 'destructive',
      });
      return;
    }

    // Log event for analytics/audit
    await logStatusChange(task.id, task.status, newStatus);
    // Trigger status update
    onUpdateStatus(draggableId, newStatus);
  };

  // --------------- Admin Override ---------------
  const handleAdminOverride = async (task: Task, newStatus?: Task['status']) => {
    if (profile?.role !== 'admin') return;
    const statusOptions = ['assigned', 'in_progress', 'completed', 'verified', 'rejected'] as const;
    const currentIndex = statusOptions.indexOf(task.status);
    const nextStatus = newStatus ?? statusOptions[(currentIndex + 1) % statusOptions.length];
    await logStatusChange(task.id, task.status, nextStatus);
    onUpdateStatus(task.id, nextStatus);
    toast({
      title: 'Status Override',
      description: `Task status set to ${nextStatus.replace('_', ' ')}.`,
    });
  };

  // --------------- Analytics Logging ---------------
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

  // --------------- Helper Functions ---------------
  const getTaskCountForColumn = (status: Task['status']) =>
    filteredTasks.filter(task => task.status === status).length;

  // --------------- Markup ---------------
  return (
    <div className="min-h-screen bg-background">
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Task Management Board</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Drag and drop tasks to update their status
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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

        {/* Optimization Suggestions */}
        {optimizationSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border rounded-lg p-3 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Optimization Suggestions</h3>
            </div>
            <ul className="space-y-2 pl-5 text-xs text-muted-foreground list-disc">
              {optimizationSuggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ x: 8 }}
                  animate={{ x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {suggestion}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <KanbanFilters filters={filters} onFiltersChange={setFilters} tasks={tasks} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <KanbanAnalytics tasks={filteredTasks} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
            {COLUMNS.map(column => {
              const columnColor = COLUMN_COLORS[column.id] ?? {
                bg: 'bg-muted/10',
                border: 'border-border',
                text: 'text-foreground',
                headerBg: 'bg-muted/60'
              };
              const columnTasks = filteredTasks.filter(task => task.status === column.status);
              return (
                <div key={column.id} className="flex flex-col min-h-0">
                  {/* Column Header */}
                  <div
                    className={`p-2 sm:p-3 rounded-t-lg border-b ${columnColor.headerBg} ${columnColor.text} shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wide truncate">
                        {column.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs font-medium ml-2 flex-shrink-0">
                        {columnTasks.length}
                      </Badge>
                    </div>
                  </div>
                  {/* Column Body */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          flex-1 min-h-[300px] sm:min-h-[400px] p-2 border-2 border-dashed rounded-b-lg transition-all duration-200
                          ${columnColor.bg}
                          ${columnColor.border}
                          ${snapshot.isDraggingOver ? 'scale-[1.01] shadow-primary/10' : ''}
                        `}
                      >
                        <div className="space-y-2 h-full overflow-y-auto">
                          {columnTasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`
                                    transition-all duration-200 cursor-grab active:cursor-grabbing
                                    ${snapshot.isDragging ? 'shadow-xl z-50' : ''}
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
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
