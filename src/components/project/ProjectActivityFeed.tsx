import { useProjectActivity } from '@/hooks/useProjectActivity';
import { Clock, CheckCircle, Play, FileText, User, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ProjectActivityFeedProps {
  projectId: string;
}

export function ProjectActivityFeed({ projectId }: ProjectActivityFeedProps) {
  const { data: activities, isLoading, error } = useProjectActivity(projectId);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'task_start':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'task_update':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    const userName = activity.user_profile?.full_name || 'Someone';
    const taskTitle = activity.task?.title || 'a task';
    
    switch (activity.activity_type) {
      case 'task_complete':
        return `${userName} completed "${taskTitle}"`;
      case 'task_start':
        return `${userName} started working on "${taskTitle}"`;
      case 'task_update':
        return `${userName} updated "${taskTitle}"`;
      case 'focus_start':
        return `${userName} is focusing on "${taskTitle}"`;
      default:
        return `${userName} performed an action on "${taskTitle}"`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Failed to load activity</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium mb-1">No activity yet</h3>
        <p className="text-sm text-muted-foreground">
          Activity will appear here as team members work on tasks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {getActivityIcon(activity.activity_type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{getActivityMessage(activity)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
