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
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md border border-border shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
            <p className="text-muted-foreground leading-relaxed">
              Advanced tracking is only available to administrators and account owners.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-border pb-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-semibold text-foreground tracking-tight">
                Advanced Time Tracking
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Real-time system activity monitoring and productivity insights
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge 
                variant={isTracking ? "default" : "secondary"} 
                className="flex items-center gap-2 px-3 py-2 font-medium"
              >
                <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isTracking ? 'Active Tracking' : 'Tracking Paused'}
              </Badge>
              
              <Button
                variant="outline"
                size="default"
                onClick={() => setIsTracking(!isTracking)}
                className="h-10 px-4 font-medium"
              >
                {isTracking ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Tracking
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Tracking
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="default" 
                onClick={takeScreenshot}
                className="h-10 px-4 font-medium"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Screenshot
              </Button>
            </div>
          </div>

          {/* Real-time Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Active Time
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {currentSession.totalActiveTime.toFixed(1)}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Focus Score
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(currentSession.focusScore)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <Keyboard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Keystrokes
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {activityData.reduce((sum, a) => sum + a.keystrokes, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                    <MousePointer className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Mouse Clicks
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {activityData.reduce((sum, a) => sum + a.mouseClicks, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="activity" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-12 p-1 rounded-lg">
              <TabsTrigger 
                value="activity" 
                className="h-10 px-4 font-medium text-sm transition-all duration-200"
              >
                Activity Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="productivity" 
                className="h-10 px-4 font-medium text-sm transition-all duration-200"
              >
                Productivity
              </TabsTrigger>
              <TabsTrigger 
                value="applications" 
                className="h-10 px-4 font-medium text-sm transition-all duration-200"
              >
                Applications
              </TabsTrigger>
              <TabsTrigger 
                value="screenshots" 
                className="h-10 px-4 font-medium text-sm transition-all duration-200"
              >
                Screenshots
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-8">
              <Card className="border border-border shadow-sm">
                <CardHeader className="px-6 py-6 border-b border-border">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    24-Hour Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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

            <TabsContent value="productivity" className="mt-8">
              <Card className="border border-border shadow-sm">
                <CardHeader className="px-6 py-6 border-b border-border">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Productivity Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-foreground">
                        Overall Productivity Score
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {Math.round(currentSession.focusScore)}%
                      </span>
                    </div>
                    <Progress 
                      value={currentSession.focusScore} 
                      className="h-3 w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-muted/50 rounded-lg border border-border">
                      <p className="text-3xl font-bold text-green-600 mb-2">
                        {currentSession.totalActiveTime.toFixed(1)}h
                      </p>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Active Work Time
                      </p>
                    </div>
                    <div className="text-center p-6 bg-muted/50 rounded-lg border border-border">
                      <p className="text-3xl font-bold text-yellow-600 mb-2">
                        {currentSession.totalIdleTime.toFixed(1)}h
                      </p>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Idle Time
                      </p>
                    </div>
                    <div className="text-center p-6 bg-muted/50 rounded-lg border border-border">
                      <p className="text-3xl font-bold text-blue-600 mb-2">
                        {activityData.length}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        App Switches
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="mt-8">
              <Card className="border border-border shadow-sm">
                <CardHeader className="px-6 py-6 border-b border-border">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Application Usage Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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

            <TabsContent value="screenshots" className="mt-8">
              <Card className="border border-border shadow-sm">
                <CardHeader className="px-6 py-6 border-b border-border">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                    <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                      <Camera className="h-4 w-4 text-green-600" />
                    </div>
                    Recent Screenshots
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activityData.slice(-8).map((activity, index) => (
                      <div key={index} className="space-y-3">
                        <div className="aspect-video bg-muted/50 rounded-lg border border-border flex items-center justify-center hover:bg-muted/70 transition-colors duration-200">
                          <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.activeApp}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
      </div>
    </div>
  );
}
