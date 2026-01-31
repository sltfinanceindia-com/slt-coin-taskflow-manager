/**
 * Work Item Filters
 * Filter bar for My Work Center
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MyWorkFilters, WorkItemType } from '@/hooks/useMyWork';
import { 
  X,
  Filter,
  Clock,
  Calendar,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

interface WorkItemFiltersProps {
  filters: MyWorkFilters;
  onChange: (filters: Partial<MyWorkFilters>) => void;
  onClear: () => void;
  summary: {
    overdue: number;
    today: number;
    thisWeek: number;
    blocked: number;
  };
}

export function WorkItemFilters({ filters, onChange, onClear, summary }: WorkItemFiltersProps) {
  const hasFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof MyWorkFilters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
  });

  const periodButtons = [
    { id: 'overdue' as const, label: 'Overdue', icon: AlertTriangle, count: summary.overdue, color: 'text-destructive' },
    { id: 'today' as const, label: 'Today', icon: Calendar, count: summary.today, color: 'text-primary' },
    { id: 'this_week' as const, label: 'This Week', icon: Clock, count: summary.thisWeek, color: 'text-blue-600' },
  ];

  const priorityOptions = ['critical', 'urgent', 'high', 'medium', 'low'];

  const handlePriorityToggle = (priority: string) => {
    const current = filters.priority || [];
    if (current.includes(priority)) {
      onChange({ priority: current.filter(p => p !== priority) });
    } else {
      onChange({ priority: [...current, priority] });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
      <Filter className="h-4 w-4 text-muted-foreground" />
      
      {/* Period Filters */}
      <div className="flex items-center gap-1 border-r pr-3 mr-1">
        {periodButtons.map(({ id, label, icon: Icon, count, color }) => (
          <Button
            key={id}
            variant={filters.period === id ? 'default' : 'ghost'}
            size="sm"
            className="h-8 gap-1"
            onClick={() => onChange({ period: filters.period === id ? undefined : id })}
          >
            <Icon className={`h-3 w-3 ${filters.period !== id ? color : ''}`} />
            {label}
            {count > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                {count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Blocked Filter */}
      <Button
        variant={filters.showBlocked ? 'default' : 'ghost'}
        size="sm"
        className="h-8 gap-1"
        onClick={() => onChange({ showBlocked: !filters.showBlocked })}
      >
        <AlertCircle className={`h-3 w-3 ${!filters.showBlocked ? 'text-orange-600' : ''}`} />
        Blocked
        {summary.blocked > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
            {summary.blocked}
          </Badge>
        )}
      </Button>

      {/* Priority Filters */}
      <div className="flex items-center gap-1 border-l pl-3">
        <span className="text-xs text-muted-foreground mr-1">Priority:</span>
        {priorityOptions.map(priority => (
          <Button
            key={priority}
            variant={filters.priority?.includes(priority) ? 'default' : 'ghost'}
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => handlePriorityToggle(priority)}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Button>
        ))}
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 ml-auto text-muted-foreground"
          onClick={onClear}
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
