import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks } from '@/hooks/useTasks';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { 
  CheckCircle, Filter, Search, X, ListFilter, Grid3X3, 
  ArrowUpDown, Users, FolderOpen, Calendar
} from 'lucide-react';
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';

interface TaskFilters {
  search: string;
  status: string;
  priority: string;
  project_id: string;
  assigned_to: string;
  dateFrom: string;
  dateTo: string;
}

interface EnhancedTaskManagerProps {
  initialProjectId?: string;
  onTaskClick?: (taskId: string) => void;
}

export function EnhancedTaskManager({ initialProjectId, onTaskClick }: EnhancedTaskManagerProps) {
  const { tasks, createTask, updateTaskStatus, verifyTask, updateTask, isCreating, isUpdating } = useTasks();
  const { projects } = useEnhancedProjects();
  const { employees } = useEmployeeDirectory();
  
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    project_id: initialProjectId || 'all',
    assigned_to: 'all',
    dateFrom: '',
    dateTo: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.task_number?.toLowerCase().includes(searchLower) ||
        task.assigned_profile?.full_name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) return false;

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;

    // Project filter
    if (filters.project_id !== 'all' && task.project_id !== filters.project_id) return false;

    // Assigned to filter
    if (filters.assigned_to !== 'all' && task.assigned_to !== filters.assigned_to) return false;

    // Date range filter
    if (filters.dateFrom) {
      const taskDate = parseISO(task.end_date);
      if (isBefore(taskDate, startOfDay(parseISO(filters.dateFrom)))) return false;
    }
    if (filters.dateTo) {
      const taskDate = parseISO(task.end_date);
      if (isAfter(taskDate, endOfDay(parseISO(filters.dateTo)))) return false;
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'status':
        const statusOrder = { assigned: 1, in_progress: 2, completed: 3, verified: 4, rejected: 5 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedTasks.length === sortedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(sortedTasks.map(t => t.id));
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      project_id: initialProjectId || 'all',
      assigned_to: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.status !== 'all' || 
    filters.priority !== 'all' || 
    (filters.project_id !== 'all' && filters.project_id !== initialProjectId) ||
    filters.assigned_to !== 'all' ||
    filters.dateFrom ||
    filters.dateTo;

  const statusCounts = {
    all: tasks.length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    verified: tasks.filter(t => t.status === 'verified').length,
    rejected: tasks.filter(t => t.status === 'rejected').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Task Management</h2>
          <p className="text-muted-foreground">
            {filteredTasks.length} of {tasks.length} tasks
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateTaskDialog onCreateTask={createTask} isCreating={isCreating} />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title, description, or assignee..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? <Grid3X3 className="h-4 w-4" /> : <ListFilter className="h-4 w-4" />}
          </Button>
          <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
            <SelectTrigger className="w-32">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                    <SelectItem value="assigned">Assigned ({statusCounts.assigned})</SelectItem>
                    <SelectItem value="in_progress">In Progress ({statusCounts.in_progress})</SelectItem>
                    <SelectItem value="completed">Completed ({statusCounts.completed})</SelectItem>
                    <SelectItem value="verified">Verified ({statusCounts.verified})</SelectItem>
                    <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={filters.priority}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5" />
                  Project
                </label>
                <Select
                  value={filters.project_id}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, project_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Assigned To
                </label>
                <Select
                  value={filters.assigned_to}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, assigned_to: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  From Date
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  To Date
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-end mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTasks([])}>
                Deselect All
              </Button>
              {/* Add bulk action buttons here */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <div key={task.id} className="relative">
              {selectedTasks.length > 0 && (
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => handleSelectTask(task.id)}
                    className="bg-background"
                  />
                </div>
              )}
              <TaskCard
                task={task}
                onUpdateStatus={updateTaskStatus}
                onVerifyTask={verifyTask}
                onUpdateTask={updateTask}
                isUpdating={isUpdating}
              />
            </div>
          ))
        ) : (
          <Card className={viewMode === 'grid' ? 'col-span-full' : ''}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to find more tasks.'
                  : 'Start by creating tasks for your team members.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
