import { format } from 'date-fns';
import { Activity, User, Edit, Trash2, MessageSquare, UserPlus, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  action: string;
  user_name?: string;
  title?: string;
  content?: string;
  changes?: Array<{ field: string; old_value: any; new_value: any }>;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ActivityLogViewerProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxHeight?: string;
  emptyMessage?: string;
}

const actionIcons: Record<string, React.ElementType> = {
  created: CheckCircle,
  updated: Edit,
  deleted: Trash2,
  comment_added: MessageSquare,
  assigned: UserPlus,
  status_changed: Activity,
};

const actionColors: Record<string, string> = {
  created: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  updated: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  deleted: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  comment_added: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  assigned: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  status_changed: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
};

export function ActivityLogViewer({ 
  activities, 
  isLoading, 
  maxHeight = '400px',
  emptyMessage = 'No activity recorded yet'
}: ActivityLogViewerProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Activity className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = actionIcons[activity.action] || Activity;
          const colorClasses = actionColors[activity.action] || 'text-gray-600 bg-gray-100';
          
          return (
            <div 
              key={activity.id} 
              className={cn(
                "relative flex gap-3 pb-4",
                index !== activities.length - 1 && "border-b border-border"
              )}
            >
              {/* Icon */}
              <div className={cn("shrink-0 h-8 w-8 rounded-full flex items-center justify-center", colorClasses)}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {activity.user_name || 'Unknown User'}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {activity.action.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>

                {activity.title && (
                  <p className="text-sm font-medium mt-1">{activity.title}</p>
                )}

                {/* Changes list */}
                {activity.changes && activity.changes.length > 0 && (
                  <div className="mt-2 text-xs space-y-1 text-muted-foreground bg-muted/50 rounded-md p-2">
                    {activity.changes.map((change, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="shrink-0">•</span>
                        <span>
                          <strong className="text-foreground">{formatFieldLabel(change.field)}</strong>
                          {change.old_value && change.new_value ? (
                            <>: "{String(change.old_value)}" → "{String(change.new_value)}"</>
                          ) : change.new_value ? (
                            <>: set to "{String(change.new_value)}"</>
                          ) : (
                            <>: cleared</>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activity.content && !activity.changes?.length && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                    {activity.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function formatFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    title: 'Title',
    name: 'Name',
    description: 'Description',
    status: 'Status',
    priority: 'Priority',
    stage: 'Stage',
    assigned_to: 'Assignee',
    start_date: 'Start Date',
    end_date: 'Due Date',
    target_end_date: 'Target End Date',
    estimated_hours: 'Estimated Hours',
    actual_hours: 'Actual Hours',
    progress_percentage: 'Progress',
    slt_coin_value: 'Coin Value',
    health_status: 'Health Status',
    budget: 'Budget',
    sponsor_id: 'Sponsor',
  };

  return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
