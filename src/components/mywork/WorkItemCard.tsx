/**
 * Work Item Card
 * Displays a single work item (task, request, ticket, approval, meeting)
 */

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WorkItem, WorkItemType } from '@/hooks/useMyWork';
import { 
  CheckSquare, 
  Inbox, 
  Ticket, 
  Clock, 
  Calendar,
  AlertTriangle,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkItemCardProps {
  item: WorkItem;
  isSelected: boolean;
  onSelect: () => void;
  onActionComplete: () => void;
}

const typeConfig: Record<WorkItemType, { 
  icon: typeof CheckSquare; 
  label: string; 
  color: string;
}> = {
  task: { icon: CheckSquare, label: 'Task', color: 'bg-blue-500' },
  request: { icon: Inbox, label: 'Request', color: 'bg-purple-500' },
  ticket: { icon: Ticket, label: 'Ticket', color: 'bg-orange-500' },
  approval: { icon: Clock, label: 'Approval', color: 'bg-yellow-500' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'bg-green-500' },
};

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  critical: { label: 'Critical', variant: 'destructive' },
  urgent: { label: 'Urgent', variant: 'destructive' },
  high: { label: 'High', variant: 'default' },
  medium: { label: 'Medium', variant: 'secondary' },
  low: { label: 'Low', variant: 'outline' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  blocked: { label: 'Blocked', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  scheduled: { label: 'Scheduled', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
};

export function WorkItemCard({ item, isSelected, onSelect }: WorkItemCardProps) {
  const config = typeConfig[item.type];
  const Icon = config.icon;
  const priority = item.priority ? priorityConfig[item.priority] : null;
  const status = statusConfig[item.status] || { label: item.status, className: 'bg-gray-100 text-gray-800' };

  return (
    <div 
      className={cn(
        "flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer",
        isSelected && "bg-accent"
      )}
      onClick={onSelect}
    >
      {/* Type Icon */}
      <div className={cn("rounded-lg p-2 flex-shrink-0", config.color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h4 className="font-medium text-sm leading-tight line-clamp-1">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.description}
              </p>
            )}
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform",
            isSelected && "rotate-90"
          )} />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="text-xs font-normal">
            {config.label}
          </Badge>
          
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", status.className)}>
            {status.label}
          </span>

          {priority && (
            <Badge variant={priority.variant} className="text-xs">
              {priority.label}
            </Badge>
          )}

          {item.project && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <FolderOpen className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{item.project.name}</span>
            </div>
          )}
        </div>

        {/* Due date and warnings */}
        <div className="flex items-center gap-3 text-xs">
          {item.dueDate && (
            <div className={cn(
              "flex items-center gap-1",
              item.isOverdue && "text-destructive",
              item.isToday && !item.isOverdue && "text-orange-600 dark:text-orange-400",
              !item.isOverdue && !item.isToday && "text-muted-foreground"
            )}>
              <Calendar className="h-3 w-3" />
              <span>
                {item.isOverdue ? 'Overdue: ' : item.isToday ? 'Today: ' : ''}
                {format(new Date(item.dueDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {item.isBlocked && (
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-3 w-3" />
              <span>Blocked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
