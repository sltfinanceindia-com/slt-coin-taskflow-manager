/**
 * Activity Feed
 * Generic activity stream for any entity
 */

import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntityComments } from '@/hooks/useEntityComments';
import { cn } from '@/lib/utils';
import {
  Activity,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  FileText,
  Edit,
} from 'lucide-react';

interface ActivityFeedProps {
  entityType: string;
  entityId: string;
  title?: string;
  className?: string;
  maxHeight?: string;
}

interface ActivityItem {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'update' | 'decision';
  content: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const activityIcons: Record<string, typeof Activity> = {
  comment: MessageSquare,
  status_change: CheckCircle,
  assignment: User,
  update: Edit,
  decision: AlertCircle,
};

const activityColors: Record<string, string> = {
  comment: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  status_change: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  assignment: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  update: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  decision: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
};

export function ActivityFeed({ 
  entityType, 
  entityId, 
  title = 'Activity',
  className,
  maxHeight = '400px',
}: ActivityFeedProps) {
  const { comments, isLoading } = useEntityComments(entityType as any, entityId);

  // Transform comments into activity items
  const activities: ActivityItem[] = (comments || []).map(comment => ({
    id: comment.id,
    type: comment.is_decision ? 'decision' : 'comment',
    content: comment.content,
    user: comment.user,
    timestamp: comment.created_at,
    metadata: {
      mentions: comment.mentions,
      attachments: comment.attachments,
    },
  }));

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activities.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          {activities.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2 text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-0">
                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.type] || Activity;
                  const colorClass = activityColors[activity.type] || 'bg-muted text-muted-foreground';

                  return (
                    <div 
                      key={activity.id}
                      className="relative flex gap-3 p-4 hover:bg-accent/50 transition-colors"
                    >
                      {/* Icon */}
                      <div className={cn(
                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                        colorClass
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-medium text-sm">
                              {activity.user?.full_name || 'Unknown'}
                            </span>
                            {activity.type === 'decision' && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Decision
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                          {activity.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
