import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  UserPlus, 
  FileText, 
  CheckCircle, 
  Clock, 
  LogIn, 
  LogOut,
  Settings,
  Coins,
  GraduationCap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogProps {
  organizationId: string;
}

interface ActivityItem {
  id: string;
  activity_type: string;
  timestamp: string;
  user_id: string;
  metadata: Record<string, any> | null;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

export function OrganizationActivityLog({ organizationId }: ActivityLogProps) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['organization-activity', organizationId],
    queryFn: async () => {
      // Fetch activity logs for this organization
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select(`
          id,
          activity_type,
          timestamp,
          user_id,
          metadata
        `)
        .eq('organization_id', organizationId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (activityError) throw activityError;

      // Get unique user IDs
      const userIds = [...new Set(activityData?.map(a => a.user_id) || [])];
      
      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Map profiles to activities
      return (activityData || []).map(activity => ({
        ...activity,
        user_profile: profiles?.find(p => p.id === activity.user_id)
      })) as ActivityItem[];
    },
    enabled: !!organizationId,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4" />;
      case 'logout':
        return <LogOut className="h-4 w-4" />;
      case 'user_created':
      case 'intern_added':
        return <UserPlus className="h-4 w-4" />;
      case 'task_created':
      case 'task_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'training_created':
      case 'training_completed':
        return <GraduationCap className="h-4 w-4" />;
      case 'assessment_completed':
        return <FileText className="h-4 w-4" />;
      case 'coins_awarded':
        return <Coins className="h-4 w-4" />;
      case 'settings_updated':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'logout':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'user_created':
      case 'intern_added':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'task_completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'coins_awarded':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    const userName = activity.user_profile?.full_name || 'Unknown user';
    
    switch (activity.activity_type) {
      case 'login':
        return `${userName} logged in`;
      case 'logout':
        return `${userName} logged out`;
      case 'user_created':
      case 'intern_added':
        return `${userName} was added to the organization`;
      case 'task_created':
        return `${userName} created a new task`;
      case 'task_completed':
        return `${userName} completed a task`;
      case 'training_created':
        return `${userName} created a training module`;
      case 'training_completed':
        return `${userName} completed training`;
      case 'assessment_completed':
        return `${userName} completed an assessment`;
      case 'coins_awarded':
        return `${userName} was awarded coins`;
      case 'settings_updated':
        return `${userName} updated organization settings`;
      default:
        return `${userName} performed an action`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Recent activity in this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Log
        </CardTitle>
        <CardDescription>Recent activity in this organization</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.activity_type)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getActivityDescription(activity)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No activity recorded yet</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}