import React, { useState, useEffect } from 'react';
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
  Keyboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SimpleLineChart, SimpleBarChart } from '@/components/SimpleChart';

interface SystemActivity {
  timestamp: string;
  activeApp: string;
  duration: number;
  keystrokes: number;
  mouseClicks: number;
  screenshot?: string;
}

interface AdvancedTimeTrackingProps {
  userId?: string;
}

export function AdvancedTimeTracking({ userId }: AdvancedTimeTrackingProps) {
  const { profile } = useAuth();
  const [isTracking, setIsTracking] = useState(true);
  const [activityData, setActivityData] = useState<SystemActivity[]>([]);
  const [currentSession, setCurrentSession] = useState({
    startTime: new Date(),
    totalActiveTime: 0,
    totalIdleTime: 0,
    focusScore: 85,
  });

  const isAdmin = profile?.role === 'admin';
  const canViewTracking = isAdmin || userId === profile?.id;

  useEffect(() => {
    if (!canViewTracking) return;

    // Simulate real-time activity tracking
    const trackActivity = () => {
      const apps = [
        'Google Chrome', 'Visual Studio Code', 'Microsoft Teams', 
        'Slack', 'Figma', 'Notion', 'Adobe XD', 'Terminal'
      ];
      
      const newActivity: SystemActivity = {
        timestamp: new Date().toISOString(),
        activeApp: apps[Math.floor(Math.random() * apps.length)],
        duration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
        keystrokes: Math.floor(Math.random() * 200) + 50,
        mouseClicks: Math.floor(Math.random() * 50) + 10,
        screenshot: `screenshot_${Date.now()}.jpg`,
      };

      setActivityData(prev => [...prev.slice(-20), newActivity]);
      
      // Update session data
      setCurrentSession(prev => ({
        ...prev,
        totalActiveTime: prev.totalActiveTime + (newActivity.duration / 60),
        focusScore: Math.max(60, Math.min(100, prev.focusScore + (Math.random() * 10 - 5))),
      }));
    };

    const interval = setInterval(trackActivity, 5000); // Track every 5 seconds
    return () => clearInterval(interval);
  }, [canViewTracking]);

  // Generate productivity data for charts
  const generateHourlyData = () => {
    const hours = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const activity = activityData.filter(a => {
        const activityHour = new Date(a.timestamp).getHours();
        return activityHour === hour.getHours();
      });
      
      hours.push({
        hour: hour.getHours().toString().padStart(2, '0') + ':00',
        activeTime: activity.reduce((sum, a) => sum + a.duration, 0) / 60,
        keystrokes: activity.reduce((sum, a) => sum + a.keystrokes, 0),
        mouseClicks: activity.reduce((sum, a) => sum + a.mouseClicks, 0),
        productivity: Math.random() * 40 + 60, // 60-100%
      });
    }
    
    return hours;
  };

  const hourlyData = generateHourlyData();

  // Application usage analysis
  const getAppUsage = () => {
    const appUsage = activityData.reduce((acc, activity) => {
      acc[activity.activeApp] = (acc[activity.activeApp] || 0) + activity.duration;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(appUsage)
      .map(([app, duration]) => ({ app, duration: duration / 60 }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  };

  const appUsageData = getAppUsage();

  const takeScreenshot = () => {
    // Simulate taking a screenshot
    const screenshot = `Manual_Screenshot_${new Date().toLocaleTimeString()}.jpg`;
    console.log('Screenshot taken:', screenshot);
  };

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Advanced Time Tracking</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Real-time system activity monitoring</p>
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
          <Button variant="outline" size="sm" onClick={takeScreenshot} className="h-9 text-xs sm:text-sm min-h-[36px]">
            <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            <span className="hidden xs:inline">Screenshot</span>
          </Button>
        </div>
      </div>

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
                <Keyboard className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Keystrokes</p>
                <p className="text-lg sm:text-xl font-bold">
                  {activityData.reduce((sum, a) => sum + a.keystrokes, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-orange-100">
                <MousePointer className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Mouse Clicks</p>
                <p className="text-lg sm:text-xl font-bold">
                  {activityData.reduce((sum, a) => sum + a.mouseClicks, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="activity" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4">
            <TabsTrigger value="activity" className="text-xs sm:text-sm whitespace-nowrap">Activity</TabsTrigger>
            <TabsTrigger value="productivity" className="text-xs sm:text-sm whitespace-nowrap">Productivity</TabsTrigger>
            <TabsTrigger value="applications" className="text-xs sm:text-sm whitespace-nowrap">Apps</TabsTrigger>
            <TabsTrigger value="screenshots" className="text-xs sm:text-sm whitespace-nowrap">Screenshots</TabsTrigger>
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
                      {activityData.length}
                    </p>
                    <p className="text-sm text-muted-foreground">App Switches</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart 
                data={appUsageData}
                dataKey="duration"
                xAxisKey="app"
                height={400}
                color="#8884d8"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenshots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Recent Screenshots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activityData.slice(-8).map((activity, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-medium truncate">{activity.activeApp}</p>
                      <p className="text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}