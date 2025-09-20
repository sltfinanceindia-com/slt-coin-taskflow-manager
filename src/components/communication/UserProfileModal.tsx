import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Mail, 
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Star,
  Shield,
  Users,
  Activity,
  Briefcase,
  Building,
  Globe,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Circle,
  Zap,
  Award,
  TrendingUp,
  TrendingDown,
  FileText,
  Image,
  Link2,
  Share2,
  Download,
  Upload,
  Edit3,
  Settings,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Heart,
  HeartOff,
  Bookmark,
  BookmarkOff,
  Flag,
  Archive,
  Trash2,
  RefreshCw,
  Send,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  Info,
  HelpCircle,
  Target,
  Lightbulb,
  Brain,
  Sparkles,
  Crown,
  Verified,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Tablet,
  Headphones,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PlayCircle,
  PauseCircle,
  BarChart3,
  PieChart,
  LineChart,
  Calendar as CalendarDays,
  Timer,
  Stopwatch,
  AlarmClock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isThisWeek, isThisYear, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ExtendedUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  email?: string;
  department?: string;
  bio?: string;
  user_id: string;
  location?: string;
  timezone?: string;
  phone?: string;
  manager?: string;
  join_date?: string;
  birth_date?: string;
  skills?: string[];
  certifications?: { name: string; issuer: string; date: string; url?: string }[];
  languages?: { name: string; level: 'native' | 'fluent' | 'intermediate' | 'basic' }[];
  social_links?: { platform: string; url: string; username?: string }[];
  projects?: { 
    id: string; 
    name: string; 
    status: string; 
    role: string; 
    progress: number;
    start_date?: string;
    end_date?: string;
    team_size?: number;
  }[];
  stats?: {
    tasks_completed: number;
    hours_logged: number;
    projects_active: number;
    team_rating: number;
    response_time: number;
    collaboration_score: number;
    code_reviews: number;
    mentees: number;
  };
  preferences?: {
    working_hours: { start: string; end: string };
    availability: string[];
    communication_style: 'direct' | 'collaborative' | 'analytical' | 'expressive';
    notification_settings: Record<string, boolean>;
  };
  achievements?: {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'milestone' | 'skill' | 'leadership' | 'innovation';
    badge_url?: string;
  }[];
  activity?: {
    recent_activity: { type: string; description: string; timestamp: string }[];
    work_pattern: { day: string; hours: number }[];
    productivity_trend: number;
  };
  relationships?: {
    direct_reports: string[];
    peers: string[];
    mentors: string[];
    mentees: string[];
  };
  security?: {
    last_login: string;
    security_level: 'basic' | 'enhanced' | 'admin';
    two_factor_enabled: boolean;
    device_count: number;
  };
}

interface UserProfileModalProps {
  user: ExtendedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onStartMessage?: () => void;
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
  onAddToFavorites?: (userId: string) => void;
  onRemoveFromFavorites?: (userId: string) => void;
  onScheduleMeeting?: (userId: string, date?: Date) => void;
  onViewFullProfile?: (userId: string) => void;
  onEditProfile?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onExportData?: (userId: string) => void;
  onShareProfile?: (userId: string) => void;
  currentUserId?: string;
  permissions?: {
    canEdit: boolean;
    canViewSensitive: boolean;
    canManage: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  enableAnalytics?: boolean;
  enableCollaboration?: boolean;
  enablePrivacyControls?: boolean;
}

const skillCategories = {
  'Technical': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL'],
  'Design': ['UI/UX', 'Figma', 'Photoshop', 'Sketch', 'Adobe XD'],
  'Management': ['Project Management', 'Agile', 'Scrum', 'Team Leadership'],
  'Communication': ['Presentation', 'Writing', 'Public Speaking', 'Negotiation']
};

const socialPlatforms = {
  linkedin: { name: 'LinkedIn', color: 'text-blue-600', icon: '💼' },
  github: { name: 'GitHub', color: 'text-gray-900', icon: '🐱' },
  twitter: { name: 'Twitter', color: 'text-blue-400', icon: '🐦' },
  dribbble: { name: 'Dribbble', color: 'text-pink-500', icon: '🏀' },
  behance: { name: 'Behance', color: 'text-blue-500', icon: '🎨' }
};

export function UserProfileModal({ 
  user, 
  isOpen, 
  onClose, 
  onStartMessage, 
  onStartCall, 
  onStartVideoCall,
  onAddToFavorites,
  onRemoveFromFavorites,
  onScheduleMeeting,
  onViewFullProfile,
  onEditProfile,
  onBlock,
  onReport,
  onExportData,
  onShareProfile,
  currentUserId,
  permissions = { canEdit: false, canViewSensitive: false, canManage: false },
  theme = 'light',
  size = 'lg',
  enableAnalytics = true,
  enableCollaboration = true,
  enablePrivacyControls = true
}: UserProfileModalProps) {
  const { getUserPresence, getStatusText, getStatusBadgeColor } = usePresence();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['contact']));
  const [viewMode, setViewMode] = useState<'card' | 'detailed' | 'compact'>('detailed');

  const { toast } = useToast();

  const presence = useMemo(() => {
    return user ? getUserPresence(user.user_id) : null;
  }, [user, getUserPresence]);

  const statusColor = presence ? getStatusBadgeColor(presence) : 'bg-gray-400';
  const statusText = presence ? getStatusText(presence) : 'Unknown';
  const isCurrentUser = currentUserId === user?.user_id;

  // Enhanced presence and availability calculation
  const availabilityInfo = useMemo(() => {
    if (!user?.preferences?.working_hours || !user.timezone) return null;

    try {
      const now = new Date();
      const userTime = new Date(now.toLocaleString("en-US", { timeZone: user.timezone }));
      const currentHour = userTime.getHours();
      const { start, end } = user.preferences.working_hours;
      
      const startHour = parseInt(start.split(':')[0]);
      const endHour = parseInt(end.split(':')[0]);
      
      const isWorkingHours = currentHour >= startHour && currentHour <= endHour;
      const nextAvailable = isWorkingHours ? null : 
        currentHour < startHour ? 
          `in ${startHour - currentHour} hours` : 
          `tomorrow at ${start}`;

      return {
        isWorkingHours,
        nextAvailable,
        localTime: userTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: user.timezone 
        })
      };
    } catch {
      return null;
    }
  }, [user?.timezone, user?.preferences?.working_hours]);

  // Enhanced skill categorization
  const categorizedSkills = useMemo(() => {
    if (!user?.skills) return {};
    
    const categorized: Record<string, string[]> = {};
    const uncategorized: string[] = [];

    user.skills.forEach(skill => {
      let found = false;
      for (const [category, categorySkills] of Object.entries(skillCategories)) {
        if (categorySkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || 
                                     skill.toLowerCase().includes(s.toLowerCase()))) {
          if (!categorized[category]) categorized[category] = [];
          categorized[category].push(skill);
          found = true;
          break;
        }
      }
      if (!found) uncategorized.push(skill);
    });

    if (uncategorized.length > 0) {
      categorized['Other'] = uncategorized;
    }

    return categorized;
  }, [user?.skills]);

  const handleCopyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  }, [toast]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const handleScheduleMeeting = useCallback((date: Date) => {
    onScheduleMeeting?.(user?.user_id || '', date);
    setShowScheduler(false);
    toast({
      title: "Meeting Scheduled",
      description: `Meeting with ${user?.full_name} scheduled for ${format(date, 'PPP')}`,
    });
  }, [user, onScheduleMeeting, toast]);

  const getPresenceIcon = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy':
      case 'do not disturb':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'away':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in a meeting':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'focusing':
        return <Brain className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  const renderContactSection = () => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => toggleSection('contact')}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Contact Information
          </CardTitle>
          {expandedSections.has('contact') ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </div>
      </CardHeader>
      
      {expandedSections.has('contact') && (
        <CardContent className="space-y-3">
          {user?.email && (
            <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg transition-colors hover:from-blue-100 hover:to-blue-150/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-900">Email</div>
                  <div className="text-sm text-blue-700">{user.email}</div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopyToClipboard(user.email!, 'Email')}
                      className="h-8 w-8 p-0 hover:bg-blue-200/50"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy email</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="h-8 w-8 p-0 hover:bg-blue-200/50"
                    >
                      <a href={`mailto:${user.email}`}>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send email</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {user?.phone && (
            <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg transition-colors hover:from-green-100 hover:to-green-150/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-900">Phone</div>
                  <div className="text-sm text-green-700">{user.phone}</div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopyToClipboard(user.phone!, 'Phone')}
                      className="h-8 w-8 p-0 hover:bg-green-200/50"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy phone</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="h-8 w-8 p-0 hover:bg-green-200/50"
                    >
                      <a href={`tel:${user.phone}`}>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Call phone</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {user?.location && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg">
              <div className="p-2 bg-purple-500 rounded-lg">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-900">Location</div>
                <div className="text-sm text-purple-700">{user.location}</div>
              </div>
            </div>
          )}

          {availabilityInfo && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-orange-900">Local Time</div>
                <div className="text-sm text-orange-700 flex items-center gap-2">
                  {availabilityInfo.localTime}
                  <Badge 
                    variant={availabilityInfo.isWorkingHours ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {availabilityInfo.isWorkingHours ? 'Working hours' : 'Off hours'}
                  </Badge>
                </div>
                {!availabilityInfo.isWorkingHours && availabilityInfo.nextAvailable && (
                  <div className="text-xs text-orange-600 mt-1">
                    Available {availabilityInfo.nextAvailable}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

  const renderSkillsSection = () => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => toggleSection('skills')}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4" />
            Skills & Expertise
          </CardTitle>
          {expandedSections.has('skills') ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </div>
      </CardHeader>
      
      {expandedSections.has('skills') && (
        <CardContent className="space-y-4">
          {Object.entries(categorizedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          {user?.languages && user.languages.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Languages
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {user.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">{lang.name}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {lang.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

  const renderStatsSection = () => {
    if (!user?.stats) return null;

    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50">
              <div className="text-2xl font-bold text-blue-700">{user.stats.tasks_completed}</div>
              <div className="text-xs text-blue-600/80 font-medium">Tasks Completed</div>
              <div className="text-xs text-blue-500 mt-1">This month</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/50">
              <div className="text-2xl font-bold text-green-700">{user.stats.hours_logged}h</div>
              <div className="text-xs text-green-600/80 font-medium">Hours Logged</div>
              <div className="text-xs text-green-500 mt-1">This week</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50">
              <div className="text-2xl font-bold text-purple-700">{user.stats.projects_active}</div>
              <div className="text-xs text-purple-600/80 font-medium">Active Projects</div>
              <div className="text-xs text-purple-500 mt-1">Currently</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200/50">
              <div className="text-2xl font-bold text-orange-700">{user.stats.team_rating}/5</div>
              <div className="text-xs text-orange-600/80 font-medium">Team Rating</div>
              <div className="text-xs text-orange-500 mt-1">Average</div>
            </div>
          </div>

          {enableAnalytics && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Response Time</span>
                  <span className="font-medium">{user.stats.response_time || 0}h</span>
                </div>
                <Progress value={(24 - (user.stats.response_time || 0)) / 24 * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Collaboration</span>
                  <span className="font-medium">{user.stats.collaboration_score || 0}%</span>
                </div>
                <Progress value={user.stats.collaboration_score || 0} className="h-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProjectsSection = () => (
    <div className="space-y-4">
      {user?.projects && user.projects.length > 0 ? (
        user.projects.map((project) => (
          <Card key={project.id} className="transition-all duration-200 hover:shadow-md hover:border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-base">{project.name}</h4>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 
                               project.status === 'completed' ? 'secondary' : 'outline'}
                      className="text-xs capitalize"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{project.role}</span>
                    </div>
                    {project.team_size && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{project.team_size} members</span>
                      </div>
                    )}
                    {project.start_date && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{format(new Date(project.start_date), 'MMM yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              
              {project.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No Projects</h3>
            <p className="text-sm text-muted-foreground text-center">
              This user hasn't been assigned to any projects yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderActivitySection = () => (
    <div className="space-y-4">
      {enableAnalytics && user?.activity ? (
        <>
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.activity.recent_activity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="text-sm">{activity.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Work Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Work Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.activity.work_pattern.map((day, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{day.day}</span>
                      <span>{day.hours}h</span>
                    </div>
                    <Progress value={(day.hours / 8) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Activity Tracking</h3>
            <p className="text-sm text-muted-foreground text-center">
              Activity data is not available or you don't have permission to view it
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (!user) return null;

  const dialogSizes = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl'
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn(dialogSizes[size], "max-h-[90vh] p-0 overflow-hidden")}>
          <DialogHeader className="sr-only">
            <DialogTitle>{user.full_name} Profile</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            {/* Enhanced Profile Header */}
            <div className="relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
              
              <div className="relative px-6 py-6">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl transition-transform hover:scale-105">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                        {user.full_name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Enhanced Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-3 border-background shadow-lg flex items-center justify-center",
                        statusColor
                      )}>
                        {getPresenceIcon(statusText)}
                      </div>
                    </div>

                    {/* Verification Badge */}
                    {user.security?.security_level === 'admin' && (
                      <div className="absolute -top-2 -left-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Verified className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl font-bold text-foreground truncate">
                            {user.full_name}
                          </h2>
                          {isFavorited && (
                            <Heart className="h-5 w-5 text-red-500 fill-current" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge variant="secondary" className="font-medium text-sm">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                          {user.department && (
                            <Badge variant="outline" className="text-xs">
                              <Building className="h-3 w-3 mr-1" />
                              {user.department}
                            </Badge>
                          )}
                          {user.security?.security_level === 'admin' && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          {getPresenceIcon(statusText)}
                          <span className="text-sm font-medium capitalize">{statusText}</span>
                          {presence?.last_seen && statusText !== 'online' && (
                            <span className="text-xs text-muted-foreground">
                              • Last seen {formatDistanceToNow(new Date(presence.last_seen), { addSuffix: true })}
                            </span>
                          )}
                        </div>

                        {/* Enhanced Bio */}
                        {user.bio && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {user.bio}
                          </p>
                        )}
                      </div>
                      
                      {/* More Actions */}
                      <Popover open={showMoreActions} onOpenChange={setShowMoreActions}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-1" align="end">
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-8"
                              onClick={() => onShareProfile?.(user.user_id)}
                            >
                              <Share2 className="h-3 w-3 mr-2" />
                              Share Profile
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-8"
                              onClick={() => onExportData?.(user.user_id)}
                            >
                              <Download className="h-3 w-3 mr-2" />
                              Export Data
                            </Button>
                            
                            {permissions.canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start h-8"
                                onClick={() => onEditProfile?.(user.user_id)}
                              >
                                <Edit3 className="h-3 w-3 mr-2" />
                                Edit Profile
                              </Button>
                            )}
                            
                            <Separator />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-8 text-orange-600"
                              onClick={() => onReport?.(user.user_id)}
                            >
                              <Flag className="h-3 w-3 mr-2" />
                              Report User
                            </Button>
                            
                            {permissions.canManage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start h-8 text-red-600"
                                onClick={() => onBlock?.(user.user_id)}
                              >
                                <Lock className="h-3 w-3 mr-2" />
                                Block User
                              </Button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Quick Actions */}
                {!isCurrentUser && (
                  <div className="flex gap-2 mt-6">
                    <Button onClick={onStartMessage} className="flex-1 h-10">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    
                    <Button variant="outline" onClick={onStartCall} className="h-10">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    
                    <Button variant="outline" onClick={onStartVideoCall} className="h-10">
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                    
                    <Popover open={showScheduler} onOpenChange={setShowScheduler}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) handleScheduleMeeting(date);
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (isFavorited) {
                          onRemoveFromFavorites?.(user.user_id);
                        } else {
                          onAddToFavorites?.(user.user_id);
                        }
                        setIsFavorited(!isFavorited);
                      }}
                      className="h-10"
                    >
                      {isFavorited ? (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      ) : (
                        <HeartOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Enhanced Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-6 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-background">
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="data-[state=active]:bg-background">
                      Projects
                    </TabsTrigger>
                    {enableCollaboration && (
                      <TabsTrigger value="collaboration" className="data-[state=active]:bg-background">
                        Team
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 px-6">
                <TabsContent value="overview" className="mt-0 space-y-6 pb-6">
                  {renderContactSection()}
                  {renderSkillsSection()}
                  {renderStatsSection()}
                  
                  {/* Achievements */}
                  {user.achievements && user.achievements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Award className="h-4 w-4" />
                          Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {user.achievements.slice(0, 4).map((achievement) => (
                            <div key={achievement.id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200/50">
                              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shrink-0">
                                <Award className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-yellow-900">{achievement.title}</h4>
                                <p className="text-xs text-yellow-700 mt-1">{achievement.description}</p>
                                <p className="text-xs text-yellow-600 mt-1">
                                  {format(new Date(achievement.date), 'MMM yyyy')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Social Links */}
                  {user.social_links && user.social_links.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Link2 className="h-4 w-4" />
                          Social Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {user.social_links.map((link, index) => {
                            const platform = socialPlatforms[link.platform as keyof typeof socialPlatforms];
                            return (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-auto p-3 justify-start"
                              >
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  <span className="text-base mr-2">{platform?.icon || '🔗'}</span>
                                  <div className="text-left">
                                    <div className="text-sm font-medium">{platform?.name || link.platform}</div>
                                    {link.username && (
                                      <div className="text-xs text-muted-foreground">@{link.username}</div>
                                    )}
                                  </div>
                                </a>
                              </Button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-0 pb-6">
                  {renderActivitySection()}
                </TabsContent>

                <TabsContent value="projects" className="mt-0 pb-6">
                  {renderProjectsSection()}
                </TabsContent>

                <TabsContent value="collaboration" className="mt-0 pb-6">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">Team Collaboration</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Team collaboration features coming soon
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Enhanced Footer */}
            <div className="border-t bg-gradient-to-r from-muted/30 to-muted/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewFullProfile?.(user.user_id)}
                    className="h-8"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Full Profile
                  </Button>
                  
                  {enablePrivacyControls && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPrivacySettings(true)}
                      className="h-8"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Privacy
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {user.join_date && (
                    <span>Joined {formatDistanceToNow(new Date(user.join_date), { addSuffix: true })}</span>
                  )}
                  {user.security?.last_login && (
                    <span>Last active {formatDistanceToNow(new Date(user.security.last_login), { addSuffix: true })}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Dialog */}
      <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show contact information</label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show activity status</label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Allow direct messages</label>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPrivacySettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowPrivacySettings(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
