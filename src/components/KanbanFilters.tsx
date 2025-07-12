import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Task } from '@/hooks/useTasks';
import { X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface KanbanFiltersProps {
  filters: {
    priority: string[];
    assignedTo: string[];
    dateRange: { start: Date | null; end: Date | null };
    projects: string[];
  };
  onFiltersChange: (filters: any) => void;
  tasks: Task[];
}

export function KanbanFilters({ filters, onFiltersChange, tasks }: KanbanFiltersProps) {
  // Get unique values for filter options
  const uniquePriorities = [...new Set(tasks.map(t => t.priority).filter(Boolean))];
  const uniqueAssignees = [...new Set(tasks.map(t => t.assigned_profile?.full_name).filter(Boolean))];
  const uniqueProjects = [...new Set(tasks.map(t => t.project_id).filter(Boolean))];

  const updateFilter = (filterType: string, value: any) => {
    onFiltersChange({
      ...filters,
      [filterType]: value,
    });
  };

  const toggleArrayFilter = (filterType: 'priority' | 'assignedTo' | 'projects', value: string) => {
    const currentArray = filters[filterType];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(filterType, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priority: [],
      assignedTo: [],
      dateRange: { start: null, end: null },
      projects: [],
    });
  };

  const hasActiveFilters = filters.priority.length > 0 || 
                         filters.assignedTo.length > 0 || 
                         filters.projects.length > 0 ||
                         filters.dateRange.start || 
                         filters.dateRange.end;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="space-y-2">
              {uniquePriorities.map(priority => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={filters.priority.includes(priority)}
                    onCheckedChange={() => toggleArrayFilter('priority', priority)}
                  />
                  <label 
                    htmlFor={`priority-${priority}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {priority}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned To</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {uniqueAssignees.map(assignee => (
                <div key={assignee} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assignee-${assignee}`}
                    checked={filters.assignedTo.includes(assignee || '')}
                    onCheckedChange={() => toggleArrayFilter('assignedTo', assignee || '')}
                  />
                  <label 
                    htmlFor={`assignee-${assignee}`}
                    className="text-sm cursor-pointer"
                  >
                    {assignee}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Project Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Projects</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {uniqueProjects.map(project => (
                <div key={project} className="flex items-center space-x-2">
                  <Checkbox
                    id={`project-${project}`}
                    checked={filters.projects.includes(project || '')}
                    onCheckedChange={() => toggleArrayFilter('projects', project || '')}
                  />
                  <label 
                    htmlFor={`project-${project}`}
                    className="text-sm cursor-pointer"
                  >
                    Project {project?.substring(0, 8)}...
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <DatePickerWithRange
              date={{
                from: filters.dateRange.start || undefined,
                to: filters.dateRange.end || undefined,
              }}
              onDateChange={(range: DateRange | undefined) => {
                updateFilter('dateRange', {
                  start: range?.from || null,
                  end: range?.to || null,
                });
              }}
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Active filters: {filters.priority.length + filters.assignedTo.length + filters.projects.length + 
                               (filters.dateRange.start ? 1 : 0)} applied
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}