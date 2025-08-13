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
  Keyboard,
  BarChart3,
  Zap,
  Shield
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <style jsx>{`
          .workfront-access-denied {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
          }
        `}</style>
        
        <div className="container mx-auto p-6 max-w-2xl">
          <Card className="workfront-access-denied border-0 overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="workfront-metric-icon mx-auto mb-6">
                <Shield className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Access Restricted
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Advanced tracking is only available to administrators and account owners.
              </p>
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contact your administrator for access permissions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .workfront-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .workfront-card {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .workfront-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-2px);
        }
        .workfront-card-dark {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid #475569;
        }
        .workfront-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .workfront-metric-icon {
          background: linear-gradient(135deg, #667eea 20%, #764ba2 80%);
          color: white;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .workfront-progress-bar {
          height: 8px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
        }
        .workfront-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        .workfront-badge-secondary {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          color: white;
          border: none;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .workfront-tab {
          background: transparent;
          border: 2px solid #e2e8f0;
          color: #64748b;
          font-weight: 600;
          transition: all 0.3s ease;
          border-radius: 8px;
          padding: 12px 24px;
        }
        .workfront-tab:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }
        .workfront-tab[data-state="active"] {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .workfront-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        .workfront-button:hover {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }
        .workfront-button-outline {
          background: transparent;
          border: 2px solid #667eea;
          color: #667eea;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .workfront-button-outline:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .metric-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pulse-dot {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .screenshot-placeholder {
          background: linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%);
          border: 2px dashed #cbd5e1;
          transition: all 0.3s ease;
        }
        .screenshot-placeholder:hover {
          border-color: #667eea;
          background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
        }
      `}</style>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Enhanced Header with Workfront styling */}
        <div className="workfront-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Advanced Time Tracking
              </h1>
              <p className="text-sm sm:text-base opacity-90 font-medium">
                Real-time system activity monitoring and productivity analytics
              </p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span className="flex items-center">
                  <Monitor className="h-4 w-4 mr-1" />
                  System Monitoring
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Live Analytics
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure Tracking
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Badge 
                className={`${isTracking ? 'workfront-badge' : 'workfront-badge-secondary'} flex items-center gap-2`}
              >
                <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-white pulse-dot' : 'bg-gray-300'}`} />
                {isTracking ? 'Active Tracking' : 'Tracking Paused'}
              </Badge>
              
              <div className="flex items-center gap-3">
                <Button
                  className="workfront-button-outline"
                  size="sm"
                  onClick={() => setIsTracking(!isTracking)}
                >
                  {isTracking ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isTracking ? 'Pause' : 'Resume'}
                </Button>
                <Button className="workfront-button" size="sm" onClick={takeScreenshot}>
                  <Camera className="h-4 w-4 mr-2" />
                  Screenshot
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Real-time Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="workfront-metric-icon">
                  <Clock className="h-6 w-6" />
                </div>
                <Badge className="workfront-badge text-xs">
                  Time
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Active Time
                  </p>
                  <p className="text-3xl font-bold metric-number mt-1">
                    {currentSession.totalActiveTime.toFixed(1)}h
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    ⏱️ Session Duration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="workfront-metric-icon">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <Badge className="workfront-badge text-xs">
                  Score
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Focus Score
                  </p>
                  <p className="text-3xl font-bold metric-number mt-1">
                    {Math.round(currentSession.focusScore)}%
                  </p>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="workfront-progress-bar rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${currentSession.focusScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="workfront-metric-icon">
                  <Keyboard className="h-6 w-6" />
                </div>
                <Badge className="workfront-badge text-xs">
                  Input
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Keystrokes
                  </p>
                  <p className="text-3xl font-bold metric-number mt-1">
                    {activityData.reduce((sum, a) => sum + a.keystrokes, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    ⌨️ Typing Activity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="workfront-metric-icon">
                  <MousePointer className="h-6 w-6" />
                </div>
                <Badge className="workfront-badge text-xs">
                  Clicks
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Mouse Clicks
                  </p>
                  <p className="text-3xl font-bold metric-number mt-1">
                    {activityData.reduce((sum, a) => sum + a.mouseClicks, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    🖱️ Mouse Activity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Detailed Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Tabs defaultValue="activity" className="space-y-0">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-transparent gap-2">
                <TabsTrigger value="activity" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <Activity className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Activity Timeline</span>
                  <span className="font-semibold sm:hidden">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="productivity" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Productivity</span>
                  <span className="font-semibold sm:hidden">Metrics</span>
                </TabsTrigger>
                <TabsTrigger value="applications" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Applications</span>
                  <span className="font-semibold sm:hidden">Apps</span>
                </TabsTrigger>
                <TabsTrigger value="screenshots" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <Camera className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Screenshots</span>
                  <span className="font-semibold sm:hidden">Shots</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="activity" className="space-y-0 mt-0 p-6">
              <Card className="workfront-card dark:workfront-card-dark border-0">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <div className="workfront-metric-icon mr-3">
                      <Activity className="h-5 w-5" />
                    </div>
                    24-Hour Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <SimpleLineChart 
                    data={hourlyData}
                    dataKey="activeTime"
                    xAxisKey="hour"
                    height={400}
                    color="#667eea"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="productivity" className="space-y-0 mt-0 p-6">
              <Card className="workfront-card dark:workfront-card-dark border-0">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <div className="workfront-metric-icon mr-3">
                      <Zap className="h-5 w-5" />
                    </div>
                    Productivity Metrics & Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        Overall Productivity Score
                      </span>
                      <span className="text-lg font-bold metric-number">
                        {Math.round(currentSession.focusScore)}%
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="workfront-progress-bar rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${currentSession.focusScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="workfront-metric-icon mx-auto mb-3 !bg-gradient-to-br !from-green-500 !to-emerald-600">
                          <Clock className="h-6 w-6" />
                        </div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {currentSession.totalActiveTime.toFixed(1)}h
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                          Active Work Time
                        </p>
                      </div>
                      
                      <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <div className="workfront-metric-icon mx-auto mb-3 !bg-gradient-to-br !from-yellow-500 !to-amber-600">
                          <Pause className="h-6 w-6" />
                        </div>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                          {currentSession.totalIdleTime.toFixed(1)}h
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold mt-1">
                          Idle Time
                        </p>
                      </div>
                      
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="workfront-metric-icon mx-auto mb-3">
                          <Monitor className="h-6 w-6" />
                        </div>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {activityData.length}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">
                          App Switches
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-0 mt-0 p-6">
              <Card className="workfront-card dark:workfront-card-dark border-0">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <div className="workfront-metric-icon mr-3">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    Application Usage Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <SimpleBarChart 
                    data={appUsageData}
                    dataKey="duration"
                    xAxisKey="app"
                    height={400}
                    color="#764ba2"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="screenshots" className="space-y-0 mt-0 p-6">
              <Card className="workfront-card dark:workfront-card-dark border-0">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <div className="workfront-metric-icon mr-3">
                      <Camera className="h-5 w-5" />
                    </div>
                    Recent Screenshots & Activity Captures
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activityData.slice(-8).map((activity, index) => (
                      <div key={index} className="space-y-3">
                        <div className="aspect-video screenshot-placeholder rounded-xl flex items-center justify-center">
                          <Eye className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {activity.activeApp}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge className="workfront-badge !text-[10px] !px-2 !py-1">
                              {Math.round(activity.duration / 60)}m
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="flex items-center text-gray-500">
                              <Keyboard className="h-3 w-3 mr-1" />
                              {activity.keystrokes}
                            </div>
                            <div className="flex items-center text-gray-500">
                              <MousePointer className="h-3 w-3 mr-1" />
                              {activity.mouseClicks}
                            </div>
                          </div>
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
