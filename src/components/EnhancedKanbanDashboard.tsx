import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Clock, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  RefreshCw,
  Filter,
  Search,
  Calendar as CalendarIcon,
  Users,
  User,
  Settings,
  Download,
  Upload,
  Share2,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Grid3X3,
  List,
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Globe,
  MapPin,
  Timer,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  FastForward,
  Rewind,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  Check,
  Info,
  HelpCircle,
  Star,
  Heart,
  Bookmark,
  Flag,
  Tag,
  MessageSquare,
  Phone,
  Mail,
  Link2,
  ExternalLink,
  Copy,
  Edit3,
  Trash2,
  Archive,
  Move,
  MoreHorizontal,
  MoreVertical,
  DollarSign,
  Percent,
  Hash,
  AtSign,
  FileText,
  Image,
  Video,
  Mic,
  Camera,
  Paperclip,
  Send,
  Reply,
  Forward,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Headphones,
  Speaker,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Watch,
  Tv,
  Radio,
  Bluetooth,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  BatteryLow,
  Plug,
  Power,
  PowerOff,
  Cpu,
  HardDrive,
  Database,
  Server,
  Cloud,
  CloudOff,
  CloudDownload,
  CloudUpload,
  FolderOpen,
  Folder,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FilePlus,
  FileMinus,
  FileEdit,
  FileCheck,
  FileX,
  Package,
  ShoppingCart,
  CreditCard,
  Banknote,
  PiggyBank,
  Trophy,
  Medal,
  Crown,
  Gem,
  Sparkles,
  Wand2,
  Palette,
  Brush,
  Pen,
  Pencil,
  Eraser,
  Scissors,
  Ruler,
  MousePointer,
  Move3D,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Focus,
  Crop,
  Layers,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Terminal,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Figma,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Twitch,
  Lightbulb,
  Brain,
  Circle
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { KanbanBoard } from '@/components/KanbanBoard';
import { KanbanAnalytics } from '@/components/KanbanAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface KanbanMetrics {
  tasksInProgress: number;
  completedToday: number;
  averageCycleTime: number;
  throughput: number;
  efficiency: number;
  burndownRate: number;
  wipLimit: number;
  flowRatio: number;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'workflow' | 'bottleneck' | 'optimization';
  impact: number;
  timestamp: Date;
  actionable: boolean;
  recommendation?: string;
}

export function EnhancedKanbanDashboard() {
  const { user, profile } = useAuth();
  const { tasks } = useTasks();
  
  const [selectedTab, setSelectedTab] = useState('board');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<KanbanMetrics>({
    tasksInProgress: 0,
    completedToday: 0,
    averageCycleTime: 0,
    throughput: 0,
    efficiency: 0,
    burndownRate: 0,
    wipLimit: 5,
    flowRatio: 0
  });
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Compute basic metrics from tasks
  const computedMetrics = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return metrics;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const completedTodayCount = tasks.filter(task => {
      const completedDate = new Date(task.updated_at);
      return task.status === 'completed' && completedDate >= today;
    }).length;

    return {
      ...metrics,
      tasksInProgress: inProgress,
      completedToday: completedTodayCount,
      throughput: completedTodayCount,
      efficiency: tasks.length > 0 ? (completedTodayCount / tasks.length) * 100 : 0
    };
  }, [tasks, metrics]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Auto refresh will be handled by the tasks hook
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Generate AI insights
  const generateInsights = useCallback(async () => {
    if (!tasks || tasks.length === 0) return;

    setIsLoadingInsights(true);
    
    try {
      // Simulate AI analysis - in real app, this would call an AI service
      const sampleInsights: AIInsight[] = [
        {
          id: '1',
          title: 'High WIP Detected',
          description: 'Current work-in-progress limit exceeded. Consider implementing stricter WIP limits.',
          priority: 'high',
          category: 'workflow',
          impact: 85,
          timestamp: new Date(),
          actionable: true,
          recommendation: 'Reduce WIP limit to 3 tasks per person'
        },
        {
          id: '2',
          title: 'Bottleneck in Review Stage',
          description: 'Tasks are accumulating in the review stage, indicating a potential bottleneck.',
          priority: 'medium',
          category: 'bottleneck',
          impact: 70,
          timestamp: new Date(),
          actionable: true,
          recommendation: 'Add additional reviewers or streamline review process'
        }
      ];

      setInsights(sampleInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [tasks]);

  // Generate insights when tasks change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      generateInsights();
    }
  }, [tasks, generateInsights]);

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50"
      )}>
        <div className="container mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Enhanced Kanban Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Advanced project management with AI-powered insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">In Progress</p>
                    <p className="text-2xl font-bold">{computedMetrics.tasksInProgress}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Completed Today</p>
                    <p className="text-2xl font-bold">{computedMetrics.completedToday}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Efficiency</p>
                    <p className="text-2xl font-bold">{computedMetrics.efficiency.toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Throughput</p>
                    <p className="text-2xl font-bold">{computedMetrics.throughput}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Brain className="h-5 w-5" />
                  AI-Powered Insights
                  <Badge variant="secondary" className="ml-2 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    {insights.length} Active
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateInsights}
                  disabled={isLoadingInsights}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoadingInsights && "animate-spin")} />
                </Button>
              </div>
              <CardDescription className="text-blue-700/80 dark:text-blue-300/80">
                Real-time analysis of your workflow with actionable recommendations
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              {insights.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-blue-700 dark:text-blue-300 font-medium">Analyzing your workflow...</p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">AI insights will appear here once sufficient data is available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.slice(0, 5).map((insight) => (
                    <Card 
                      key={insight.id} 
                      className={cn(
                        "transition-all duration-200 hover:shadow-md cursor-pointer",
                        insight.priority === 'critical' && "border-red-300 bg-red-50/50",
                        insight.priority === 'high' && "border-orange-300 bg-orange-50/50",
                        insight.priority === 'medium' && "border-yellow-300 bg-yellow-50/50",
                        insight.priority === 'low' && "border-green-300 bg-green-50/50"
                      )}
                      onClick={() => {
                        const newExpanded = new Set(expandedInsights);
                        if (newExpanded.has(insight.id)) {
                          newExpanded.delete(insight.id);
                        } else {
                          newExpanded.add(insight.id);
                        }
                        setExpandedInsights(newExpanded);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              <h4 className="font-semibold text-sm">{insight.title}</h4>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  insight.priority === 'critical' && "border-red-500 text-red-700",
                                  insight.priority === 'high' && "border-orange-500 text-orange-700",
                                  insight.priority === 'medium' && "border-yellow-500 text-yellow-700",
                                  insight.priority === 'low' && "border-green-500 text-green-700"
                                )}
                              >
                                {insight.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                            {expandedInsights.has(insight.id) && insight.recommendation && (
                              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mt-3">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Recommendation</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">{insight.recommendation}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Impact</div>
                              <div className="text-sm font-semibold">{insight.impact}%</div>
                            </div>
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform",
                              expandedInsights.has(insight.id) && "transform rotate-180"
                            )} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="board">Kanban Board</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="space-y-4">
              <KanbanBoard 
                tasks={tasks || []}
                onUpdateStatus={() => {}}
                onVerifyTask={() => {}}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <KanbanAnalytics 
                tasks={tasks || []}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>
                    Configure your kanban dashboard preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Real-time Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Enable live updates for task changes
                      </div>
                    </div>
                    <Switch 
                      checked={realTimeUpdates} 
                      onCheckedChange={setRealTimeUpdates}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto Refresh</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically refresh data every {refreshInterval} seconds
                      </div>
                    </div>
                    <Switch 
                      checked={autoRefresh} 
                      onCheckedChange={setAutoRefresh}
                    />
                  </div>

                  {autoRefresh && (
                    <div className="space-y-2">
                      <div className="font-medium">Refresh Interval (seconds)</div>
                      <Slider
                        value={[refreshInterval]}
                        onValueChange={(value) => setRefreshInterval(value[0])}
                        min={10}
                        max={300}
                        step={10}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground">
                        Current: {refreshInterval} seconds
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Advanced Analytics</div>
                      <div className="text-sm text-muted-foreground">
                        Show detailed performance metrics and insights
                      </div>
                    </div>
                    <Switch 
                      checked={showAdvancedAnalytics} 
                      onCheckedChange={setShowAdvancedAnalytics}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}