import React, { useMemo, useRef, useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar, ChevronLeft, ChevronRight, Flag, AlertTriangle, Diamond } from 'lucide-react';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, parseISO } from 'date-fns';

interface GanttChartViewProps {
  projectId?: string;
}

type ViewMode = 'week' | 'month' | 'quarter';

interface ExtendedTask extends Task {
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  is_milestone?: boolean;
  is_critical?: boolean;
  progress_percentage?: number;
}

export function GanttChartView({ projectId }: GanttChartViewProps) {
  const { tasks, isLoading } = useTasks();
  const { dependencies } = useTaskDependencies(projectId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [startDate, setStartDate] = useState(() => startOfWeek(new Date()));

  const projectTasks = useMemo(() => {
    const filtered = projectId 
      ? tasks.filter(t => t.project_id === projectId)
      : tasks;
    
    return filtered.sort((a, b) => {
      const aStart = (a as ExtendedTask).planned_start_date || a.start_date;
      const bStart = (b as ExtendedTask).planned_start_date || b.start_date;
      return new Date(aStart).getTime() - new Date(bStart).getTime();
    }) as ExtendedTask[];
  }, [tasks, projectId]);

  const dateRange = useMemo(() => {
    const days = viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 90;
    return eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, days - 1),
    });
  }, [startDate, viewMode]);

  const dayWidth = viewMode === 'week' ? 80 : viewMode === 'month' ? 40 : 20;
  const chartWidth = dateRange.length * dayWidth;

  const navigateDates = (direction: 'prev' | 'next') => {
    const days = viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 90;
    setStartDate(prev => addDays(prev, direction === 'next' ? days : -days));
  };

  const getTaskPosition = (task: ExtendedTask) => {
    const taskStart = parseISO(task.planned_start_date || task.start_date);
    const taskEnd = parseISO(task.planned_end_date || task.end_date);
    
    const startOffset = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: Math.max(0, startOffset * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
      isVisible: startOffset + duration > 0 && startOffset < dateRange.length,
    };
  };

  const getStatusColor = (status: string, isCritical?: boolean) => {
    if (isCritical) return 'bg-destructive';
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'assigned':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Gantt Chart
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDates('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => navigateDates('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStartDate(startOfWeek(new Date()))}>
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {projectTasks.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Calendar}
              title="No Tasks"
              description="Create tasks to see them in the Gantt chart"
            />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row">
            {/* Task names column - fixed, hidden on very small screens with toggle */}
            <div className="hidden sm:block w-48 sm:w-64 shrink-0 border-r bg-muted/30">
              {/* Header */}
              <div className="h-14 border-b px-3 sm:px-4 flex items-center font-medium text-sm bg-muted/50">
                Tasks
              </div>
              {/* Task rows */}
              {projectTasks.map((task) => (
                <div
                  key={task.id}
                  className="h-12 border-b px-3 sm:px-4 flex items-center gap-2 hover:bg-accent/5 transition-colors"
                >
                  {task.is_milestone && (
                    <Diamond className="h-3 w-3 text-primary shrink-0" />
                  )}
                  {task.is_critical && (
                    <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs sm:text-sm truncate cursor-default">
                          {task.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(task.planned_start_date || task.start_date), 'MMM d')} - {format(parseISO(task.planned_end_date || task.end_date), 'MMM d')}
                          </p>
                          {task.progress_percentage !== undefined && (
                            <p className="text-xs">Progress: {task.progress_percentage}%</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
            
            {/* Mobile task list - shown only on small screens */}
            <div className="sm:hidden border-b">
              <div className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">{projectTasks.length} tasks</p>
                <div className="flex flex-wrap gap-1">
                  {projectTasks.slice(0, 3).map(task => (
                    <Badge key={task.id} variant="outline" className="text-xs truncate max-w-[120px]">
                      {task.title}
                    </Badge>
                  ))}
                  {projectTasks.length > 3 && (
                    <Badge variant="secondary" className="text-xs">+{projectTasks.length - 3} more</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable chart area */}
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div style={{ width: chartWidth, minWidth: '100%' }}>
                {/* Date header */}
                <div className="h-14 border-b flex bg-muted/50 sticky top-0 z-10">
                  {dateRange.map((date, i) => (
                    <div
                      key={i}
                      style={{ width: dayWidth }}
                      className={`shrink-0 border-r flex flex-col items-center justify-center text-xs ${
                        isToday(date) ? 'bg-primary/10' : ''
                      }`}
                    >
                      <span className="text-muted-foreground">
                        {viewMode === 'quarter' 
                          ? (i % 7 === 0 ? format(date, 'MMM d') : '')
                          : format(date, 'EEE')}
                      </span>
                      <span className={`font-medium ${isToday(date) ? 'text-primary' : ''}`}>
                        {viewMode !== 'quarter' && format(date, 'd')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Task bars */}
                {projectTasks.map((task) => {
                  const { left, width, isVisible } = getTaskPosition(task);
                  
                  return (
                    <div
                      key={task.id}
                      className="h-12 border-b relative"
                      style={{ width: chartWidth }}
                    >
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {dateRange.map((date, i) => (
                          <div
                            key={i}
                            style={{ width: dayWidth }}
                            className={`shrink-0 border-r ${
                              isToday(date) ? 'bg-primary/5' : ''
                            }`}
                          />
                        ))}
                      </div>

                      {/* Task bar */}
                      {isVisible && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-2 h-8 rounded-md cursor-pointer transition-all hover:opacity-80 ${
                                  task.is_milestone 
                                    ? 'w-4 h-4 rotate-45 top-4 bg-primary' 
                                    : getStatusColor(task.status, task.is_critical)
                                }`}
                                style={{
                                  left: task.is_milestone ? left + width / 2 - 8 : left + 2,
                                  width: task.is_milestone ? 16 : width - 4,
                                }}
                              >
                                {!task.is_milestone && (
                                  <>
                                    {/* Progress bar */}
                                    {task.progress_percentage !== undefined && task.progress_percentage > 0 && (
                                      <div
                                        className="absolute inset-y-0 left-0 bg-white/30 rounded-l-md"
                                        style={{ width: `${task.progress_percentage}%` }}
                                      />
                                    )}
                                    {/* Task label */}
                                    <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                                      <span className="text-xs text-white font-medium truncate">
                                        {width > 80 ? task.title : ''}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs capitalize">{task.status.replace('_', ' ')}</p>
                                <p className="text-xs">
                                  {format(parseISO(task.planned_start_date || task.start_date), 'MMM d')} - {format(parseISO(task.planned_end_date || task.end_date), 'MMM d')}
                                </p>
                                {task.is_critical && (
                                  <Badge variant="destructive" className="text-xs">Critical Path</Badge>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Legend - responsive */}
        <div className="p-3 sm:p-4 border-t">
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded bg-blue-500" />
              <span className="hidden xs:inline">In Progress</span>
              <span className="xs:hidden">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded bg-yellow-500" />
              <span className="hidden xs:inline">Assigned</span>
              <span className="xs:hidden">New</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded bg-green-500" />
              <span>Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded bg-destructive" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Diamond className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
              <span>Milestone</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
