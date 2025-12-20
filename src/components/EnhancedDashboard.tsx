import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Award,
  Calendar,
  BookOpen,
  MessageSquare,
  Video,
  Bell,
  Settings,
  BarChart3,
  FileText,
  Download,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { ProductivityDashboard } from '@/components/ProductivityDashboard';
import { AdvancedTimeTracking } from '@/components/AdvancedTimeTracking';
// Temporarily disabled: import { EnhancedTeamsCommunication } from '@/components/EnhancedTeamsCommunication';
import WorkingCommunication from '@/components/WorkingCommunication';
import { AnalyticsPage } from '@/components/AnalyticsPage';
import { format } from 'date-fns';

interface EnhancedDashboardProps {
  userId?: string;
}

export function EnhancedDashboard({ userId }: EnhancedDashboardProps) {
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { tasks } = useTasks();
  const { timeLogs, getWeeklyHours, getMonthlyHours } = useTimeLogs();

  const targetUserId = userId || profile?.id;
  
  // Calculate user-specific metrics
  const userTasks = tasks.filter(task => 
    isAdmin && userId ? task.assigned_to === userId : task.assigned_to === profile?.id
  );
  
  const completedTasks = userTasks.filter(t => t.status === 'verified').length;
  const pendingTasks = userTasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length;
  const weeklyHours = getWeeklyHours(targetUserId);
  const monthlyHours = getMonthlyHours(targetUserId);

  // Additional productivity features
  const features = [
    {
      id: 'ai-insights',
      title: 'AI Task Insights',
      description: 'Get intelligent recommendations for task prioritization',
      icon: TrendingUp,
      status: 'available',
      action: () => console.log('AI Insights'),
    },
    {
      id: 'auto-reports',
      title: 'Automated Reports',
      description: 'Generate weekly performance reports automatically',
      icon: FileText,
      status: 'available',
      action: () => console.log('Auto Reports'),
    },
    {
      id: 'team-calendar',
      title: 'Team Calendar Integration',
      description: 'Sync tasks with team calendar and deadlines',
      icon: Calendar,
      status: 'available',
      action: () => console.log('Team Calendar'),
    },
    {
      id: 'skill-tracking',
      title: 'Skill Development Tracker',
      description: 'Track learning progress and skill development',
      icon: BookOpen,
      status: 'available',
      action: () => console.log('Skill Tracking'),
    },
    {
      id: 'smart-notifications',
      title: 'Smart Notifications',
      description: 'Intelligent alerts based on your work patterns',
      icon: Bell,
      status: 'available',
      action: () => console.log('Smart Notifications'),
    },
    {
      id: 'workflow-automation',
      title: 'Workflow Automation',
      description: 'Automate repetitive tasks and processes',
      icon: Settings,
      status: 'beta',
      action: () => console.log('Workflow Automation'),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin && userId ? 'Employee Dashboard' : 'Your Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Enhanced productivity tracking and team collaboration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-xs text-muted-foreground">
                  {userTasks.length} total
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Hours</p>
                <p className="text-2xl font-bold">{weeklyHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">
                  Target: 40h
                </p>
                <Progress value={Math.min((weeklyHours / 40) * 100, 100)} className="mt-2 h-1" />
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">{pendingTasks}</p>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Hours</p>
                <p className="text-2xl font-bold">{monthlyHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="productivity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="productivity">📊 Productivity</TabsTrigger>
          <TabsTrigger value="time-tracking">⏱️ Time Tracking</TabsTrigger>
          <TabsTrigger value="communication">💬 Communication</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="features">✨ Features</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-6">
          <ProductivityDashboard userId={targetUserId} />
        </TabsContent>

        <TabsContent value="time-tracking" className="space-y-6">
          <AdvancedTimeTracking userId={targetUserId} />
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <WorkingCommunication />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsPage />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.id} className="hover-scale">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <Badge variant={feature.status === 'beta' ? 'secondary' : 'default'}>
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={feature.action} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Enable Feature
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Tools Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Productivity Tools
              </CardTitle>
              <CardDescription>
                Additional tools to enhance your work experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Global Search</p>
                      <p className="text-sm text-muted-foreground">Search across all tasks and messages</p>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Advanced Filters</p>
                      <p className="text-sm text-muted-foreground">Custom filtering and sorting</p>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Screen Recording</p>
                      <p className="text-sm text-muted-foreground">Record work sessions</p>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">AI Assistant</p>
                      <p className="text-sm text-muted-foreground">Get help with tasks</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}