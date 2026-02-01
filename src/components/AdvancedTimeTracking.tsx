import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Activity, 
  Camera, 
  Clock, 
  Eye, 
  Pause, 
  Play,
  AlertTriangle,
  TrendingUp,
  MousePointer,
  Keyboard,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SimpleLineChart, SimpleBarChart } from '@/components/SimpleChart';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { format, subHours, subDays } from 'date-fns';

interface AdvancedTimeTrackingProps {
  userId?: string;
}

export function AdvancedTimeTracking({ userId }: AdvancedTimeTrackingProps) {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [isTracking, setIsTracking] = useState(true);
  const { sessionLogs, getUserSessionStats } = useSessionLogs();

  const targetUserId = userId || profile?.id;
  const canViewTracking = isAdmin || userId === profile?.id;

  // Fetch real activity logs from database
  const { data: activityLogs, isLoading: loadingActivity } = useQuery({
    queryKey: ['activity-logs', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const yesterday = subDays(new Date(), 1);
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('timestamp', yesterday.toISOString())
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!targetUserId && canViewTracking,
  });

  // Fetch time logs for the day
  const { data: timeLogs, isLoading: loadingTimeLogs } = useQuery({
    queryKey: ['time-logs-today', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('date_logged', today);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!targetUserId && canViewTracking,
  });

  const sessionStats = getUserSessionStats();

  // Calculate current session stats from real data
  const currentSession = useMemo(() => {
    const totalActiveHours = timeLogs?.reduce((sum, log) => sum + Number(log.hours_worked || 0), 0) || 0;
    const activityCount = activityLogs?.length || 0;
    
    // Calculate focus score based on activity density
    const focusScore = activityCount > 0 ? Math.min(100, Math.max(60, 100 - (activityCount / 10))) : 85;
    
    return {
      startTime: new Date(),
      totalActiveTime: totalActiveHours,
      totalIdleTime: Math.max(0, sessionStats.todayHours - totalActiveHours),
      focusScore,
    };
  }, [timeLogs, activityLogs, sessionStats]);

  // Generate hourly data from real activity logs
  const hourlyData = useMemo(() => {
    const hours = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hourStart = subHours(now, i);
      const hourEnd = subHours(now, i - 1);
      const hourStr = format(hourStart, 'HH:00');
      
      const hourActivities = activityLogs?.filter(a => {
        const activityTime = new Date(a.timestamp);
        return activityTime >= hourStart && activityTime < hourEnd;
      }) || [];
      
      const activeMinutes = hourActivities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
      
      hours.push({
        hour: hourStr,
        activeTime: Math.round(activeMinutes / 6) / 10, // Convert to hours
        activities: hourActivities.length,
        productivity: hourActivities.length > 0 ? Math.min(100, 60 + hourActivities.length * 5) : 0,
      });
    }
    
    return hours;
  }, [activityLogs]);

  // Get activity type breakdown
  const activityTypeBreakdown = useMemo(() => {
    if (!activityLogs?.length) return [];
    
    const types: Record<string, number> = {};
    activityLogs.forEach(log => {
      const type = log.activity_type || 'other';
      types[type] = (types[type] || 0) + (log.duration_minutes || 1);
    });
    
    return Object.entries(types)
      .map(([type, duration]) => ({
        app: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        duration: Math.round(duration / 6) / 10 // Convert to hours
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  }, [activityLogs]);

  if (!canViewTracking) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Access denied. Advanced tracking is only available to admins.</p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = loadingActivity || loadingTimeLogs;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Advanced Time Tracking</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Real-time activity monitoring from database</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Badge variant={isTracking ? "default" : "secondary"} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isTracking ? 'Active' : 'Paused'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTracking(!isTracking)}
            className="h-9 text-xs sm:text-sm min-h-[36px]"
          >
            {isTracking ? <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" /> : <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />}
            {isTracking ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Real-time Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-blue-100">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Active Time</p>
                    <p className="text-lg sm:text-xl font-bold">{currentSession.totalActiveTime.toFixed(1)}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-green-100">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Focus Score</p>
                    <p className="text-lg sm:text-xl font-bold">{Math.round(currentSession.focusScore)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-purple-100">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Activities</p>
                    <p className="text-lg sm:text-xl font-bold">{activityLogs?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-orange-100">
                    <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Sessions</p>
                    <p className="text-lg sm:text-xl font-bold">{sessionStats.totalSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="activity" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-3">
                <TabsTrigger value="activity" className="text-xs sm:text-sm whitespace-nowrap">Activity</TabsTrigger>
                <TabsTrigger value="productivity" className="text-xs sm:text-sm whitespace-nowrap">Productivity</TabsTrigger>
                <TabsTrigger value="breakdown" className="text-xs sm:text-sm whitespace-nowrap">Breakdown</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    24-Hour Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleLineChart 
                    data={hourlyData}
                    dataKey="activeTime"
                    xAxisKey="hour"
                    height={400}
                    color="#3b82f6"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="productivity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Productivity</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(currentSession.focusScore)}%
                      </span>
                    </div>
                    <Progress value={currentSession.focusScore} className="h-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {currentSession.totalActiveTime.toFixed(1)}h
                        </p>
                        <p className="text-sm text-muted-foreground">Active Work</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                          {currentSession.totalIdleTime.toFixed(1)}h
                        </p>
                        <p className="text-sm text-muted-foreground">Idle Time</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {sessionStats.todayHours}h
                        </p>
                        <p className="text-sm text-muted-foreground">Total Screen Time</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityTypeBreakdown.length > 0 ? (
                    <SimpleBarChart 
                      data={activityTypeBreakdown}
                      dataKey="duration"
                      xAxisKey="app"
                      height={400}
                      color="#8884d8"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      No activity data recorded yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}