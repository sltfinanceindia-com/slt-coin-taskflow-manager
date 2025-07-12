import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KanbanBoard } from '@/components/KanbanBoard';
import { KanbanAnalytics } from '@/components/KanbanAnalytics';

export function EnhancedKanbanDashboard() {
  const { tasks, updateTaskStatus, verifyTask, updateTask, isUpdating } = useTasks();
  const { profile } = useAuth();
  const [kanbanMetrics, setKanbanMetrics] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter tasks based on user role
  const myTasks = tasks.filter(task => 
    profile?.role === 'admin' ? true : task.assigned_to === profile?.id
  );

  // Load advanced metrics
  useEffect(() => {
    loadKanbanMetrics();
  }, []);

  const loadKanbanMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Load Kanban metrics from database function
      const { data: metricsData, error } = await supabase
        .rpc('calculate_kanban_metrics');

      if (error) {
        console.error('Error loading kanban metrics:', error);
      } else {
        setKanbanMetrics(metricsData);
      }

      // Load AI insights
      const { data: insightsData } = await supabase.functions.invoke('generate-kanban-insights', {
        body: { user_id: profile?.id, tasks: myTasks }
      });

      if (insightsData?.insights) {
        setInsights(insightsData.insights);
      }

    } catch (error) {
      console.error('Error loading kanban data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced performance calculations
  const performanceMetrics = {
    totalTasks: myTasks.length,
    completedTasks: myTasks.filter(t => t.status === 'verified').length,
    inProgressTasks: myTasks.filter(t => t.status === 'in_progress').length,
    completionRate: myTasks.length > 0 ? 
      (myTasks.filter(t => t.status === 'verified').length / myTasks.length) * 100 : 0,
    avgCycleTime: kanbanMetrics ? 
      kanbanMetrics.filter(m => m.metric_name === 'avg_cycle_time')[0]?.metric_value || 0 : 0,
    throughput: kanbanMetrics ? 
      kanbanMetrics.filter(m => m.metric_name === 'daily_throughput').length : 0,
    wipCount: kanbanMetrics ? 
      kanbanMetrics.filter(m => m.metric_name === 'wip_count')[0]?.metric_value || 0 : 0,
  };

  // WIP limit recommendations using Little's Law
  const recommendedWipLimit = Math.max(2, Math.floor(performanceMetrics.throughput * 3));
  const isWipExceeded = performanceMetrics.wipCount > recommendedWipLimit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Enhanced Kanban Dashboard
          </h1>
          <p className="text-muted-foreground">
            Advanced task management with AI-powered analytics and optimization
          </p>
        </div>
        <Button onClick={loadKanbanMetrics} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold">{performanceMetrics.completionRate.toFixed(1)}%</p>
                <Progress value={performanceMetrics.completionRate} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Avg Cycle Time</p>
                <p className="text-2xl font-bold">{performanceMetrics.avgCycleTime.toFixed(1)}d</p>
                <p className="text-xs text-muted-foreground">
                  {performanceMetrics.avgCycleTime < 5 ? 'Excellent' : 
                   performanceMetrics.avgCycleTime < 10 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">WIP Limit</p>
                <p className="text-2xl font-bold flex items-center">
                  {performanceMetrics.wipCount}
                  {isWipExceeded && (
                    <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended: {recommendedWipLimit}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Throughput</p>
                <p className="text-2xl font-bold">{performanceMetrics.throughput}</p>
                <p className="text-xs text-muted-foreground">Tasks/week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="p-3 bg-white rounded-md border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">{insight.message}</p>
                      {insight.action && (
                        <p className="text-xs text-blue-700 mt-1">
                          💡 {insight.action}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard */}
      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Advanced Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <KanbanBoard
            tasks={myTasks}
            onUpdateStatus={updateTaskStatus}
            onVerifyTask={verifyTask}
            onUpdateTask={updateTask}
            isUpdating={isUpdating}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <KanbanAnalytics tasks={myTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}