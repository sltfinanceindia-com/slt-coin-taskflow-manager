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
          padding: 2rem;
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
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .workfront-insight-card {
          background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
          border: 1px solid #e2e8f0;
          border-left: 4px solid #667eea;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }
        .workfront-insight-card:hover {
          border-left-color: #764ba2;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        .workfront-button:hover {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }
        .workfront-button:disabled {
          opacity: 0.6;
          transform: none;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }
      `}</style>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Enhanced Header with Workfront styling */}
        <div className="workfront-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Enhanced Kanban Dashboard
              </h1>
              <p className="text-sm sm:text-base opacity-90 font-medium">
                Advanced task management with AI-powered analytics and optimization
              </p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span>Total Tasks: {performanceMetrics.totalTasks}</span>
                <span>•</span>
                <span>Completed: {performanceMetrics.completedTasks}</span>
                <span>•</span>
                <span>In Progress: {performanceMetrics.inProgressTasks}</span>
              </div>
            </div>
            <Button 
              onClick={loadKanbanMetrics} 
              disabled={isLoading}
              className="workfront-button w-full sm:w-auto shrink-0"
              size="lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Analytics</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Performance Overview with Workfront styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="workfront-metric-icon">
                  <Target className="h-6 w-6" />
                </div>
                <Badge className="workfront-badge">
                  Primary
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Completion Rate
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {performanceMetrics.completionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="workfront-progress-bar rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${performanceMetrics.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {performanceMetrics.completionRate >= 80 ? '🎯 Excellent Progress' : 
                   performanceMetrics.completionRate >= 60 ? '📈 Good Progress' : '⚡ Needs Focus'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="workfront-metric-icon">
                  <Clock className="h-6 w-6" />
                </div>
                <Badge className="workfront-badge">
                  Time
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Avg Cycle Time
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {performanceMetrics.avgCycleTime.toFixed(1)}d
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    performanceMetrics.avgCycleTime < 5 ? 'bg-green-500' : 
                    performanceMetrics.avgCycleTime < 10 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {performanceMetrics.avgCycleTime < 5 ? '🚀 Excellent Speed' : 
                     performanceMetrics.avgCycleTime < 10 ? '⚡ Good Pace' : '🔄 Needs Improvement'}
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
                <Badge className={`${isWipExceeded ? 'bg-red-500' : 'workfront-badge'}`}>
                  {isWipExceeded ? 'Alert' : 'Normal'}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    WIP Limit
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {performanceMetrics.wipCount}
                    </p>
                    {isWipExceeded && (
                      <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                    )}
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Recommended: <span className="font-bold text-gray-900 dark:text-white">{recommendedWipLimit}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="workfront-metric-icon">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <Badge className="workfront-badge">
                  Output
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Throughput
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {performanceMetrics.throughput}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Tasks per week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced AI Insights with Workfront styling */}
        {insights.length > 0 && (
          <Card className="border-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 shadow-xl">
            <CardHeader className="pb-4 border-b border-blue-200 dark:border-blue-800">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <div className="workfront-metric-icon mr-3">
                  <Zap className="h-5 w-5" />
                </div>
                AI-Powered Insights & Recommendations
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 font-medium">
                Smart analytics to optimize your workflow performance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="workfront-insight-card">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <Badge className="workfront-badge w-fit shrink-0">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                          {insight.message}
                        </p>
                        {insight.action && (
                          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 flex items-start">
                              <span className="text-base mr-2">💡</span>
                              <span>{insight.action}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Main Dashboard with Workfront styling */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Tabs defaultValue="kanban" className="space-y-0">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-auto p-1 bg-transparent gap-2">
                <TabsTrigger value="kanban" className="workfront-tab flex items-center gap-2 py-3 px-6">
                  <ArrowUpDown className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">Kanban Board</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="workfront-tab flex items-center gap-2 py-3 px-6">
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">Advanced Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="kanban" className="space-y-0 mt-0 p-6">
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
            
            <TabsContent value="analytics" className="space-y-0 mt-0 p-6">
              <div className="overflow-x-auto">
                <KanbanAnalytics tasks={myTasks} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
