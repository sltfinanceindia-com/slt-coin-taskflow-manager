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
  Stopwatch,
  PlayCircle,
  PauseCircle,
  Square,
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
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  Bluetooth,
  Headphones,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Cpu,
  HardDrive,
  MemoryStick,
  Database,
  Server,
  Cloud,
  CloudOff,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  CreditCard,
  Banknote,
  Wallet,
  ShoppingCart,
  ShoppingBag,
  Package,
  Truck,
  Plane,
  Car,
  Bike,
  Home,
  Building,
  Factory,
  Store,
  MapPin as LocationIcon,
  Navigation,
  Compass,
  Map,
  Route,
  TrendingUpIcon,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Sparkles,
  Magic,
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
  Chrome,
  Firefox,
  Safari,
  Edge,
  Opera,
  Windows,
  Apple,
  Linux,
  Android,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Twitch,
  Discord,
  Slack,
  Zoom,
  Skype,
  WhatsApp,
  Telegram,
  Messenger,
  WeChat
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { KanbanBoard } from '@/components/KanbanBoard';
import { KanbanAnalytics } from '@/components/KanbanAnalytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, isWithinInterval, parseISO, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'verified' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  category?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  value?: number;
  dependencies?: string[];
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  comments?: number;
  attachments?: number;
}

interface KanbanMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionRate: number;
  avgCycleTime: number;
  avgLeadTime: number;
  throughput: number;
  wipCount: number;
  burndownRate: number;
  velocityTrend: number[];
  flowEfficiency: number;
  defectRate: number;
  reworkRate: number;
  customerSatisfaction: number;
}

interface AIInsight {
  id: string;
  type: 'optimization' | 'prediction' | 'bottleneck' | 'recommendation' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action?: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface DashboardFilters {
  dateRange: { from: Date | null; to: Date | null };
  assignees: string[];
  statuses: string[];
  priorities: string[];
  categories: string[];
  tags: string[];
  searchQuery: string;
}

interface DashboardSettings {
  theme: 'light' | 'dark' | 'system';
  viewMode: 'comfortable' | 'compact' | 'dense';
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: boolean;
  showCompletedTasks: boolean;
  enableAnimations: boolean;
  defaultLayout: 'kanban' | 'list' | 'calendar' | 'timeline';
}

const defaultFilters: DashboardFilters = {
  dateRange: { from: null, to: null },
  assignees: [],
  statuses: [],
  priorities: [],
  categories: [],
  tags: [],
  searchQuery: ''
};

const defaultSettings: DashboardSettings = {
  theme: 'system',
  viewMode: 'comfortable',
  autoRefresh: true,
  refreshInterval: 30,
  notifications: true,
  showCompletedTasks: true,
  enableAnimations: true,
  defaultLayout: 'kanban'
};

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-500', icon: Circle },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: PlayCircle },
  review: { label: 'Review', color: 'bg-yellow-500', icon: Eye },
  verified: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  blocked: { label: 'Blocked', color: 'bg-red-500', icon: AlertTriangle }
};

const priorityConfig = {
  low: { label: 'Low', color: 'text-gray-500', bg: 'bg-gray-50' },
  medium: { label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-50' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-50' },
  urgent: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-50' }
};

export function EnhancedKanbanDashboard() {
  const { tasks, updateTaskStatus, verifyTask, updateTask, isUpdating } = useTasks();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [kanbanMetrics, setKanbanMetrics] = useState<KanbanMetrics | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'kanban' | 'analytics' | 'reports' | 'settings'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('week');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const webSocketRef = useRef<WebSocket>();
  
  // Enhanced task filtering
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => 
      profile?.role === 'admin' ? true : task.assigned_to === profile?.id
    );

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.assignees.length > 0) {
      filtered = filtered.filter(task => 
        task.assigned_to && filters.assignees.includes(task.assigned_to)
      );
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(task => filters.statuses.includes(task.status));
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter(task => filters.priorities.includes(task.priority));
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(task => 
        task.category && filters.categories.includes(task.category)
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(task => 
        task.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(task => {
        const taskDate = parseISO(task.created_at);
        const from = filters.dateRange.from || new Date(0);
        const to = filters.dateRange.to || new Date();
        return isWithinInterval(taskDate, { start: from, end: to });
      });
    }

    return filtered;
  }, [tasks, filters, profile]);

  // Enhanced metrics calculation
  const calculatedMetrics = useMemo((): KanbanMetrics => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'verified').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = filteredTasks.filter(t => t.status === 'blocked').length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate cycle time
    const completedWithDates = filteredTasks
      .filter(t => t.status === 'verified' && t.created_at && t.updated_at)
      .map(t => differenceInDays(parseISO(t.updated_at), parseISO(t.created_at)));
    
    const avgCycleTime = completedWithDates.length > 0 
      ? completedWithDates.reduce((sum, days) => sum + days, 0) / completedWithDates.length 
      : 0;

    // Calculate throughput (tasks completed in current week)
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const thisWeekCompleted = filteredTasks.filter(t => 
      t.status === 'verified' && 
      isWithinInterval(parseISO(t.updated_at), { start: weekStart, end: weekEnd })
    ).length;

    // Calculate flow efficiency
    const wipTasks = filteredTasks.filter(t => 
      ['in_progress', 'review'].includes(t.status)
    ).length;

    const flowEfficiency = wipTasks > 0 ? (inProgressTasks / wipTasks) * 100 : 100;

    // Mock additional metrics (would be calculated from real data)
    const velocityTrend = Array.from({ length: 7 }, (_, i) => Math.floor(Math.random() * 10) + 5);
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionRate,
      avgCycleTime,
      avgLeadTime: avgCycleTime + 2, // Simplified calculation
      throughput: thisWeekCompleted,
      wipCount: wipTasks,
      burndownRate: completionRate > 50 ? 1.2 : 0.8,
      velocityTrend,
      flowEfficiency,
      defectRate: Math.random() * 5, // Mock data
      reworkRate: Math.random() * 10, // Mock data
      customerSatisfaction: 85 + Math.random() * 10 // Mock data
    };
  }, [filteredTasks]);

  // Load enhanced analytics
  const loadKanbanMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Enhanced database query for metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('calculate_enhanced_kanban_metrics', {
          user_id: profile?.id,
          date_from: filters.dateRange.from?.toISOString(),
          date_to: filters.dateRange.to?.toISOString()
        });

      if (metricsError) {
        console.error('Error loading kanban metrics:', metricsError);
      } else if (metricsData) {
        setKanbanMetrics(metricsData);
      }

      // Load AI insights with enhanced prompts
      const { data: insightsData, error: insightsError } = await supabase.functions.invoke('generate-enhanced-kanban-insights', {
        body: { 
          user_id: profile?.id, 
          tasks: filteredTasks,
          metrics: calculatedMetrics,
          timeframe: selectedTimeframe,
          filters: filters
        }
      });

      if (insightsError) {
        console.error('Error loading insights:', insightsError);
      } else if (insightsData?.insights) {
        setInsights(insightsData.insights.map((insight: any, index: number) => ({
          ...insight,
          id: `insight-${index}`,
          timestamp: new Date()
        })));
      }

      // Load notifications
      const { data: notificationsData } = await supabase
        .from('kanban_notifications')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsData) {
        setNotifications(notificationsData);
      }

      toast({
        title: "Data Refreshed",
        description: "Dashboard has been updated with the latest data",
      });

    } catch (error) {
      console.error('Error loading kanban data:', error);
      toast({
        title: "Error Loading Data",
        description: "Could not refresh dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile, filteredTasks, calculatedMetrics, selectedTimeframe, filters, toast]);

  // Real-time updates with WebSocket
  useEffect(() => {
    if (settings.autoRefresh && profile?.id) {
      // WebSocket connection for real-time updates
      const wsUrl = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/kanban/${profile.id}`;
      webSocketRef.current = new WebSocket(wsUrl);
      
      webSocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setRealTimeData(data);
        
        if (data.type === 'task_update' || data.type === 'metric_update') {
          loadKanbanMetrics();
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [settings.autoRefresh, profile, loadKanbanMetrics]);

  // Auto-refresh interval
  useEffect(() => {
    if (settings.autoRefresh && settings.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        loadKanbanMetrics();
      }, settings.refreshInterval * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [settings.autoRefresh, settings.refreshInterval, loadKanbanMetrics]);

  // Initial load
  useEffect(() => {
    loadKanbanMetrics();
  }, [loadKanbanMetrics]);

  const renderMetricsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
      {/* Completion Rate */}
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/50",
        "hover:from-green-100 hover:to-emerald-200"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <Badge variant="outline" className="text-xs bg-green-50">
              {calculatedMetrics.completionRate > 75 ? 'Excellent' : 
               calculatedMetrics.completionRate > 50 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-green-700">
                {calculatedMetrics.completionRate.toFixed(1)}%
              </span>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.2%
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-700">Completion Rate</span>
                <span className="font-medium">{calculatedMetrics.completedTasks}/{calculatedMetrics.totalTasks}</span>
              </div>
              <Progress 
                value={calculatedMetrics.completionRate} 
                className="h-2 bg-green-100" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cycle Time */}
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200/50",
        "hover:from-blue-100 hover:to-cyan-200"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-full bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <Badge variant="outline" className="text-xs bg-blue-50">
              {calculatedMetrics.avgCycleTime < 5 ? 'Fast' : 
               calculatedMetrics.avgCycleTime < 10 ? 'Average' : 'Slow'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-blue-700">
                {calculatedMetrics.avgCycleTime.toFixed(1)}
              </span>
              <span className="text-sm text-blue-600">days</span>
            </div>
            <div className="text-xs text-blue-600">
              Avg Cycle Time
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WIP Count */}
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        calculatedMetrics.wipCount > (calculatedMetrics.throughput * 3) 
          ? "bg-gradient-to-br from-red-50 to-rose-100 border-red-200/50"
          : "bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200/50"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={cn(
              "p-2 rounded-full",
              calculatedMetrics.wipCount > (calculatedMetrics.throughput * 3) 
                ? "bg-red-500/20" : "bg-purple-500/20"
            )}>
              <Activity className={cn(
                "h-5 w-5",
                calculatedMetrics.wipCount > (calculatedMetrics.throughput * 3) 
                  ? "text-red-600" : "text-purple-600"
              )} />
            </div>
            {calculatedMetrics.wipCount > (calculatedMetrics.throughput * 3) && (
              <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className={cn(
                "text-2xl font-bold",
                calculatedMetrics.wipCount > (calculatedMetrics.throughput * 3) 
                  ? "text-red-700" : "text-purple-700"
              )}>
                {calculatedMetrics.wipCount}
              </span>
              <span className="text-sm text-purple-600">tasks</span>
            </div>
            <div className="text-xs">
              Work in Progress
              <div className="text-xs text-muted-foreground mt-1">
                Limit: {Math.max(3, calculatedMetrics.throughput * 3)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Throughput */}
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-full bg-orange-500/20">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <Badge variant="outline" className="text-xs bg-orange-50">
              This Week
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-orange-700">
                {calculatedMetrics.throughput}
              </span>
              <div className="flex items-center text-xs text-orange-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </div>
            </div>
            <div className="text-xs text-orange-600">
              Completed Tasks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Efficiency */}
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-full bg-teal-500/20">
              <Zap className="h-5 w-5 text-teal-600" />
            </div>
            <Badge variant="outline" className="text-xs bg-teal-50">
              {calculatedMetrics.flowEfficiency > 80 ? 'Optimal' : 
               calculatedMetrics.flowEfficiency > 60 ? 'Good' : 'Poor'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-teal-700">
                {calculatedMetrics.flowEfficiency.toFixed(0)}%
              </span>
            </div>
            <div className="text-xs text-teal-600">
              Flow Efficiency
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Satisfaction */}
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-full bg-pink-500/20">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <Badge variant="outline" className="text-xs bg-pink-50">
              {calculatedMetrics.customerSatisfaction > 90 ? 'Excellent' : 
               calculatedMetrics.customerSatisfaction > 75 ? 'Good' : 'Fair'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-pink-700">
                {calculatedMetrics.customerSatisfaction.toFixed(0)}%
              </span>
              <div className="flex items-center text-xs text-pink-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3%
              </div>
            </div>
            <div className="text-xs text-pink-600">
              Satisfaction
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsPanel = () => (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-blue-800 flex items-center">
            <div className="p-1.5 rounded-lg bg-blue-100 mr-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            AI-Powered Insights
            <Badge variant="outline" className="ml-2 text-xs">
              {insights.length} insights
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedInsights(new Set())}
              className="text-xs h-7"
            >
              Collapse All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedInsights(new Set(insights.map(i => i.id)))}
              className="text-xs h-7"
            >
              Expand All
            </Button>
          </div>
        </div>
        <CardDescription className="text-blue-700/80">
          Real-time analysis of your workflow with actionable recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <p className="text-blue-700 font-medium">Analyzing your workflow...</p>
            <p className="text-blue-600 text-sm mt-1">AI insights will appear here once sufficient data is available</p>
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
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      insight.priority === 'critical' && "bg-red-100",
                      insight.priority === 'high' && "bg-orange-100",
                      insight.priority === 'medium' && "bg-yellow-100",
                      insight.priority === 'low' && "bg-green-100"
                    )}>
                      {insight.type === 'optimization' && <Zap className="h-4 w-4" />}
                      {insight.type === 'prediction' && <TrendingUp className="h-4 w-4" />}
                      {insight.type === 'bottleneck' && <AlertTriangle className="h-4 w-4" />}
                      {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4" />}
                      {insight.type === 'alert' && <Bell className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs px-2 py-1",
                              insight.priority === 'critical' && "bg-red-100 text-red-700 border-red-200",
                              insight.priority === 'high' && "bg-orange-100 text-orange-700 border-orange-200",
                              insight.priority === 'medium' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                              insight.priority === 'low' && "bg-green-100 text-green-700 border-green-200"
                            )}
                          >
                            {insight.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {expandedInsights.has(insight.id) ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {insight.message}
                      </p>
                      
                      {expandedInsights.has(insight.id) && (
                        <div className="mt-3 space-y-3">
                          {insight.action && (
                            <div className="p-3 bg-background/50 rounded-lg border">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-foreground mb-1">
                                    Recommended Action:
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {insight.action}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-xs text-muted-foreground">
                              Impact: <span className="capitalize font-medium">{insight.impact}</span>
                              {' • '}
                              Generated: {format(insight.timestamp, 'HH:mm')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                <Bookmark className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {insights.length > 5 && (
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="h-3 w-3 mr-2" />
                View {insights.length - 5} More Insights
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderFiltersPanel = () => (
    <Dialog open={showFilters} onOpenChange={setShowFilters}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Tasks</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or tags..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.from || undefined,
                    to: filters.dateRange.to || undefined
                  }}
                  onSelect={(range) => {
                    setFilters(prev => ({
                      ...prev,
                      dateRange: {
                        from: range?.from || null,
                        to: range?.to || null
                      }
                    }));
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusConfig).map(([status, config]) => (
                <div key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`status-${status}`}
                    checked={filters.statuses.includes(status)}
                    onChange={(e) => {
                      const newStatuses = e.target.checked
                        ? [...filters.statuses, status]
                        : filters.statuses.filter(s => s !== status);
                      setFilters(prev => ({ ...prev, statuses: newStatuses }));
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`status-${status}`} className="text-sm flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", config.color)} />
                    {config.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(priorityConfig).map(([priority, config]) => (
                <div key={priority} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`priority-${priority}`}
                    checked={filters.priorities.includes(priority)}
                    onChange={(e) => {
                      const newPriorities = e.target.checked
                        ? [...filters.priorities, priority]
                        : filters.priorities.filter(p => p !== priority);
                      setFilters(prev => ({ ...prev, priorities: newPriorities }));
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`priority-${priority}`} className={cn("text-sm", config.color)}>
                    {config.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setFilters(defaultFilters)}
          >
            Clear All
          </Button>
          <Button onClick={() => setShowFilters(false)}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen transition-all duration-300",
        "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
        "dark:from-slate-900 dark:via-slate-800 dark:to-slate-700",
        isFullscreen && "fixed inset-0 z-50"
      )}>
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Enhanced Kanban Dashboard
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Advanced workflow analytics with AI-powered insights
                {realTimeData && (
                  <Badge variant="outline" className="text-xs animate-pulse">
                    Live
                  </Badge>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick filters */}
              <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.statuses.length + filters.priorities.length + filters.assignees.length > 0) && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {filters.statuses.length + filters.priorities.length + filters.assignees.length}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button 
                onClick={loadKanbanMetrics} 
                disabled={isLoading}
                className="relative"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                {isLoading ? 'Updating...' : 'Refresh'}
                {settings.autoRefresh && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </Button>
            </div>
          </div>

          {/* Metrics Overview */}
          {renderMetricsCards()}

          {/* AI Insights */}
          {insights.length > 0 && renderInsightsPanel()}

          {/* Main Dashboard Tabs */}
          <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2 text-xs sm:text-sm">
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs sm:text-sm">
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 text-xs sm:text-sm">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Workflow Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(statusConfig).map(([status, config]) => {
                        const count = filteredTasks.filter(t => t.status === status).length;
                        const percentage = filteredTasks.length > 0 ? (count / filteredTasks.length) * 100 : 0;
                        
                        return (
                          <div key={status} className="text-center space-y-2">
                            <div className={cn("w-12 h-12 mx-auto rounded-full flex items-center justify-center", config.color.replace('bg-', 'bg-') + '/20')}>
                              <config.icon className={cn("h-5 w-5", config.color.replace('bg-', 'text-'))} />
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{count}</div>
                              <div className="text-xs text-muted-foreground">{config.label}</div>
                              <div className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {filteredTasks
                          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                          .slice(0, 10)
                          .map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className={cn("w-2 h-2 rounded-full", statusConfig[task.status].color)} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(parseISO(task.updated_at), { addSuffix: true })}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {statusConfig[task.status].label}
                              </Badge>
                            </div>
                          ))
                        }
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="kanban" className="space-y-4">
              <div className="overflow-x-auto">
                <KanbanBoard
                  tasks={filteredTasks}
                  onUpdateStatus={updateTaskStatus}
                  onVerifyTask={verifyTask}
                  onUpdateTask={updateTask}
                  isUpdating={isUpdating}
                />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="overflow-x-auto">
                <KanbanAnalytics 
                  tasks={filteredTasks} 
                  metrics={calculatedMetrics}
                  insights={insights}
                />
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports & Exports</CardTitle>
                  <CardDescription>
                    Generate comprehensive reports and export your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Download className="h-6 w-6" />
                      <span className="font-medium">Export Tasks</span>
                      <span className="text-xs text-muted-foreground">CSV, Excel, PDF</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <BarChart className="h-6 w-6" />
                      <span className="font-medium">Metrics Report</span>
                      <span className="text-xs text-muted-foreground">Performance analysis</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Users className="h-6 w-6" />
                      <span className="font-medium">Team Report</span>
                      <span className="text-xs text-muted-foreground">Individual performance</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>
                    Customize your dashboard experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Auto Refresh</label>
                        <Switch 
                          checked={settings.autoRefresh}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, autoRefresh: checked }))
                          }
                        />
                      </div>
                      
                      {settings.autoRefresh && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Refresh Interval: {settings.refreshInterval}s
                          </label>
                          <Slider
                            value={[settings.refreshInterval]}
                            onValueChange={(value) => 
                              setSettings(prev => ({ ...prev, refreshInterval: value[0] }))
                            }
                            max={300}
                            min={10}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Notifications</label>
                        <Switch 
                          checked={settings.notifications}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, notifications: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Show Completed Tasks</label>
                        <Switch 
                          checked={settings.showCompletedTasks}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, showCompletedTasks: checked }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">View Mode</label>
                        <Select 
                          value={settings.viewMode} 
                          onValueChange={(value: any) => 
                            setSettings(prev => ({ ...prev, viewMode: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="dense">Dense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Default Layout</label>
                        <Select 
                          value={settings.defaultLayout} 
                          onValueChange={(value: any) => 
                            setSettings(prev => ({ ...prev, defaultLayout: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kanban">Kanban Board</SelectItem>
                            <SelectItem value="list">List View</SelectItem>
                            <SelectItem value="calendar">Calendar</SelectItem>
                            <SelectItem value="timeline">Timeline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Enable Animations</label>
                        <Switch 
                          checked={settings.enableAnimations}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, enableAnimations: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Filters Dialog */}
        {renderFiltersPanel()}
      </div>
    </TooltipProvider>
  );
}
