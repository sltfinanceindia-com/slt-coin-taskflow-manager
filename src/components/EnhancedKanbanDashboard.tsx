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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Header - Responsive flex layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enhanced Kanban Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Advanced task management with AI-powered analytics and optimization
            </p>
          </div>
          <Button 
            onClick={loadKanbanMetrics} 
            disabled={isLoading}
            className="w-full sm:w-auto shrink-0"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Analytics</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </div>

        {/* Performance Overview - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                    Completion Rate
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {performanceMetrics.completionRate.toFixed(1)}%
                  </p>
                  <Progress 
                    value={performanceMetrics.completionRate} 
                    className="mt-2 h-1.5 sm:h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                    Avg Cycle Time
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {performanceMetrics.avgCycleTime.toFixed(1)}d
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {performanceMetrics.avgCycleTime < 5 ? 'Excellent' : 
                     performanceMetrics.avgCycleTime < 10 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                    WIP Limit
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    {performanceMetrics.wipCount}
                    {isWipExceeded && (
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 ml-1 shrink-0" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Recommended: {recommendedWipLimit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                    Throughput
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {performanceMetrics.throughput}
                  </p>
                  <p className="text-xs text-muted-foreground">Tasks/week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights - Responsive design */}
        {insights.length > 0 && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-sm sm:text-base font-medium text-blue-800 dark:text-blue-200 flex items-center">
                <Zap className="h-4 w-4 mr-2 shrink-0" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                      <Badge variant="outline" className="text-xs w-fit shrink-0">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 break-words">
                          {insight.message}
                        </p>
                        {insight.action && (
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 break-words">
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

        {/* Main Dashboard - Responsive tabs */}
        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1">
            <TabsTrigger value="kanban" className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm">
              <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Kanban Board</span>
              <span className="sm:hidden">Board</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Advanced Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="space-y-4 mt-4">
            <div className="overflow-x-auto">
              <KanbanBoard
                tasks={myTasks}
                onUpdateStatus={updateTaskStatus}
                onVerifyTask={verifyTask}
                onUpdateTask={updateTask}
                isUpdating={isUpdating}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-4">
            <div className="overflow-x-auto">
              <KanbanAnalytics tasks={myTasks} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
