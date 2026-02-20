import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/types/task';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTasks } from '@/hooks/useTasks';
import { KanbanFilters } from '@/components/KanbanFilters';
import { KanbanAnalytics } from '@/components/KanbanAnalytics';
import { KanbanTableView } from '@/components/KanbanTableView';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePersistedKanbanFilters } from '@/hooks/usePersistedKanbanFilters';
import { 
  BarChart3, Filter, LayoutGrid, Table, AlertCircle, 
  UserPlus, CheckCircle, Clock, XCircle, Inbox, Play, Archive
} from 'lucide-react';

interface TabBasedKanbanProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status'], submissionNotes?: string) => void;
  onVerifyTask: (taskId: string, approve: boolean, feedback?: string, coinValue?: number) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  isUpdating?: boolean;
}

interface KanbanFiltersState {
  priority: string[];
  assignedTo: string[];
  dateRange: { start: Date | null; end: Date | null };
  projects: string[];
}

type StatusTab = 'current' | 'assigned' | 'in_progress' | 'completed' | 'verified' | 'rejected';

const statusTabs: { id: StatusTab; title: string; icon: React.ElementType; color: string }[] = [
  { id: 'current', title: 'Current', icon: Inbox, color: 'bg-indigo-500' },
  { id: 'assigned', title: 'Assigned', icon: UserPlus, color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', icon: Play, color: 'bg-yellow-500' },
  { id: 'completed', title: 'Completed', icon: Clock, color: 'bg-purple-500' },
  { id: 'verified', title: 'Verified', icon: CheckCircle, color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', icon: XCircle, color: 'bg-red-500' },
];

export function TabBasedKanban({ 
  tasks, 
  onUpdateStatus, 
  onVerifyTask, 
  onUpdateTask, 
  isUpdating 
}: TabBasedKanbanProps) {
  const { profile } = useAuth();
  const { isAdmin, isManager, isTeamLead } = useUserRole();
  const { updateTask } = useTasks();
  const [activeTab, setActiveTab] = useState<StatusTab>('assigned');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { filters, setFilters } = usePersistedKanbanFilters('tab-kanban');

  // Filter tasks based on user role
  const visibleTasks = useMemo(() => {
    if (isAdmin) return tasks;
    if (isManager || isTeamLead) {
      // Team leads and managers see their team's tasks
      return tasks.filter(task => 
        task.assigned_to === profile?.id || 
        task.created_by === profile?.id ||
        !task.assigned_to // Unassigned tasks
      );
    }
    // Employees see only their tasks plus unassigned (current) tasks
    return tasks.filter(task => 
      task.assigned_to === profile?.id || !task.assigned_to
    );
  }, [tasks, isAdmin, isManager, isTeamLead, profile?.id]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return visibleTasks.filter(task => {
      // Filter out archived tasks unless toggle is on
      if (!showArchived && task.is_archived) return false;
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
  }, [visibleTasks, filters, showArchived]);

  // Get tasks for each status tab
  const getTasksForTab = useCallback((tab: StatusTab) => {
    if (tab === 'current') {
      // Current = unassigned tasks available for pickup
      return filteredTasks.filter(task => !task.assigned_to && task.status === 'assigned');
    }
    return filteredTasks.filter(task => task.status === tab && task.assigned_to);
  }, [filteredTasks]);

  // Count tasks for each tab
  const getTabCount = useCallback((tab: StatusTab) => {
    return getTasksForTab(tab).length;
  }, [getTasksForTab]);

  // Handle "Assign to me" action
  const handleAssignToMe = async (taskId: string) => {
    if (!profile?.id) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: profile.id })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state via the passed callback
      if (onUpdateTask) {
        onUpdateTask(taskId, { assigned_to: profile.id });
      }

      toast({
        title: "Task Assigned",
        description: "The task has been assigned to you.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign task",
        variant: "destructive",
      });
    }
  };

  // Handle archive/unarchive
  const handleArchiveTask = async (taskId: string, archive: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_archived: archive } as any)
        .eq('id', taskId);
      if (error) throw error;
      if (onUpdateTask) {
        onUpdateTask(taskId, { is_archived: archive } as any);
      }
      toast({
        title: archive ? "Task Archived" : "Task Unarchived",
        description: archive ? "Task moved to archive." : "Task restored from archive.",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Handle admin override
  const handleAdminOverride = async (task: Task, newStatus?: Task['status']) => {
    if (!isAdmin) return;
    
    const statusOptions: Task['status'][] = ['assigned', 'in_progress', 'completed', 'verified', 'rejected'];
    const currentIndex = statusOptions.indexOf(task.status);
    const nextStatus = newStatus || statusOptions[(currentIndex + 1) % statusOptions.length];
    
    onUpdateStatus(task.id, nextStatus);
    
    toast({
      title: 'Status Override',
      description: `Task status has been overridden to ${nextStatus.replace('_', ' ')}.`,
    });
  };

  const currentTabTasks = getTasksForTab(activeTab);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="bg-card rounded-lg border p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Task Management Board</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Select a status tab to view and manage tasks
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'cards' | 'table')}>
                <TabsList className="h-8">
                  <TabsTrigger value="cards" className="gap-1.5 text-xs h-7 px-2">
                    <LayoutGrid className="h-3 w-3" />
                    Cards
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-1.5 text-xs h-7 px-2">
                    <Table className="h-3 w-3" />
                    Table
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5 text-xs h-8"
              >
                <Filter className="h-3 w-3" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="gap-1.5 text-xs h-8"
              >
                <BarChart3 className="h-3 w-3" />
                Analytics
              </Button>
              <Button
                variant={showArchived ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="gap-1.5 text-xs h-8"
              >
                <Archive className="h-3 w-3" />
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>
            </div>
          </div>
        </div>

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

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusTab)} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-muted/50">
            {statusTabs.map((tab) => {
              const count = getTabCount(tab.id);
              const Icon = tab.icon;
              // Abbreviated titles for mobile
              const mobileTitle = tab.id === 'in_progress' ? 'Progress' : 
                                  tab.id === 'completed' ? 'Done' : 
                                  tab.id === 'verified' ? 'Verified' : 
                                  tab.id === 'rejected' ? 'Reject' : 
                                  tab.title;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-2 whitespace-nowrap data-[state=active]:bg-background min-w-0"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{mobileTitle}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-[10px] px-1.5 min-w-[20px] justify-center flex-shrink-0 ${
                      activeTab === tab.id ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          {statusTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              {viewMode === 'table' ? (
                <KanbanTableView 
                  tasks={getTasksForTab(tab.id)}
                  onUpdateStatus={onUpdateStatus}
                  onVerifyTask={onVerifyTask}
                />
              ) : (
                <div className="space-y-3">
                  {getTasksForTab(tab.id).length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                        <h3 className="font-medium text-lg mb-1">No tasks in {tab.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tab.id === 'current' 
                            ? 'There are no unassigned tasks available to pick up.'
                            : `Tasks with "${tab.title}" status will appear here.`
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-350px)]">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {getTasksForTab(tab.id).map((task) => (
                          <div key={task.id} className="relative">
                            <TaskCard
                              task={task}
                              onUpdateStatus={onUpdateStatus}
                              onVerifyTask={onVerifyTask}
                              onUpdateTask={onUpdateTask}
                              isUpdating={isUpdating}
                              onAdminOverride={handleAdminOverride}
                            />
                            <div className="absolute bottom-2 right-2 flex gap-1.5">
                              {/* Archive/Unarchive button */}
                              {(tab.id === 'verified' || tab.id === 'rejected' || task.is_archived) && (
                                <Button
                                  size="sm"
                                  variant={task.is_archived ? "default" : "outline"}
                                  className="gap-1 text-xs"
                                  onClick={() => handleArchiveTask(task.id, !task.is_archived)}
                                >
                                  <Archive className="h-3 w-3" />
                                  {task.is_archived ? 'Unarchive' : 'Archive'}
                                </Button>
                              )}
                              {/* Assign to me button for Current tab */}
                              {tab.id === 'current' && (
                                <Button
                                  size="sm"
                                  className="gap-1.5"
                                  onClick={() => handleAssignToMe(task.id)}
                                >
                                  <UserPlus className="h-3 w-3" />
                                  Assign to me
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
