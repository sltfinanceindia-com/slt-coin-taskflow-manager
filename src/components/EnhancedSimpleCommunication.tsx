import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Phone, 
  Video, 
  Users, 
  Plus, 
  Search, 
  Settings,
  Menu,
  MessageSquare,
  Hash,
  Smile,
  Paperclip,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Circle,
  Clock,
  Star,
  Pin,
  UserPlus,
  Globe,
  Lock,
  Info,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Edit3,
  MoreHorizontal,
  MoreVertical,
  Download,
  Upload,
  Image as ImageIcon,
  FileText,
  Volume2,
  VolumeX,
  Headphones,
  Speaker,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Wifi,
  WifiOff,
  Maximize2,
  Minimize2,
  Copy,
  Reply,
  Forward,
  Flag,
  Share2,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Calendar,
  RefreshCw,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Filter,
  SortAsc,
  Crown,
  Shield,
  Award,
  Heart,
  ThumbsUp,
  Bookmark
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO, differenceInMinutes, startOfDay } from 'date-fns';

// Enhanced interfaces with proper TypeScript types
interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sender_role: string;
  channel_id: string;
  receiver_id?: string;
  created_at: string;
  updated_at?: string;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system';
  attachments: Attachment[];
  reactions: Reaction[];
  is_read: boolean;
  is_pinned: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  reply_to?: string;
  thread_count?: number;
  mentioned_users?: string[];
  delivery_status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: MessageMetadata;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  created_at: string;
}

interface MessageMetadata {
  mentions?: string[];
  links?: string[];
  location?: { lat: number; lng: number; address: string };
  translation?: Record<string, string>;
  ai_summary?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct' | 'group';
  is_direct_message: boolean;
  participant_ids: string[];
  unread_count: number;
  last_message?: Message;
  last_activity: string;
  created_at: string;
  created_by: string;
  member_count: number;
  is_muted: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  settings: ChannelSettings;
  channel_members: ChannelMember[];
}

interface ChannelSettings {
  allow_reactions: boolean;
  allow_threads: boolean;
  allow_file_sharing: boolean;
  allow_voice_messages: boolean;
  message_retention_days?: number;
  require_approval: boolean;
  slow_mode_seconds?: number;
}

interface ChannelMember {
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at?: string;
  is_online: boolean;
  profiles: TeamMember;
}

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  department?: string;
  title?: string;
  timezone?: string;
  status: 'available' | 'busy' | 'away' | 'do_not_disturb' | 'offline';
  status_text?: string;
  last_seen?: string;
  is_online: boolean;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  sound_enabled: boolean;
  show_read_receipts: boolean;
  auto_download_media: boolean;
  message_preview: boolean;
  typing_indicators: boolean;
}

interface CallState {
  isInCall: boolean;
  isRinging: boolean;
  isIncoming: boolean;
  callType: 'voice' | 'video' | null;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeakerOn: boolean;
  callWith?: TeamMember;
  callStartTime?: Date;
  callDuration: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  participantCount: number;
}

interface CallHistoryItem {
  id: string;
  participant_name: string;
  participant_avatar?: string;
  type: 'voice' | 'video';
  status: 'completed' | 'missed' | 'declined' | 'busy';
  duration?: number;
  timestamp: string;
  is_incoming: boolean;
}

interface TypingUser {
  user_id: string;
  name: string;
  avatar?: string;
  started_at: Date;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  mobile: boolean;
  email: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// Enhanced status configuration
const statusConfig = {
  available: { label: 'Available', color: 'bg-green-500', textColor: 'text-green-600' },
  busy: { label: 'Busy', color: 'bg-red-500', textColor: 'text-red-600' },
  away: { label: 'Away', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  do_not_disturb: { label: 'Do not disturb', color: 'bg-purple-500', textColor: 'text-purple-600' },
  offline: { label: 'Offline', color: 'bg-gray-400', textColor: 'text-gray-500' }
};

// Communication state reducer for better state management
type CommunicationState = {
  messages: Message[];
  channels: Channel[];
  selectedChannel: Channel | null;
  teamMembers: TeamMember[];
  typingUsers: TypingUser[];
  callState: CallState;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  lastActivity: Date;
};

type CommunicationAction = 
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_CHANNELS'; payload: Channel[] }
  | { type: 'UPDATE_CHANNEL'; payload: { id: string; updates: Partial<Channel> } }
  | { type: 'SET_SELECTED_CHANNEL'; payload: Channel | null }
  | { type: 'SET_TEAM_MEMBERS'; payload: TeamMember[] }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; status: TeamMember['status']; isOnline: boolean } }
  | { type: 'SET_TYPING_USERS'; payload: TypingUser[] }
  | { type: 'SET_CALL_STATE'; payload: Partial<CallState> }
  | { type: 'SET_CONNECTION_STATUS'; payload: CommunicationState['connectionStatus'] };

const communicationReducer = (state: CommunicationState, action: CommunicationAction): CommunicationState => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        lastActivity: new Date()
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(m => 
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        )
      };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(m => m.id !== action.payload)
      };
    case 'SET_CHANNELS':
      return { ...state, channels: action.payload };
    case 'UPDATE_CHANNEL':
      return {
        ...state,
        channels: state.channels.map(c => 
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        )
      };
    case 'SET_SELECTED_CHANNEL':
      return { ...state, selectedChannel: action.payload };
    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload };
    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        teamMembers: state.teamMembers.map(m => 
          m.user_id === action.payload.userId 
            ? { ...m, status: action.payload.status, is_online: action.payload.isOnline }
            : m
        )
      };
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload };
    case 'SET_CALL_STATE':
      return { 
        ...state, 
        callState: { ...state.callState, ...action.payload } 
      };
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    default:
      return state;
  }
};

// Enhanced User Status Selector Component
const StatusSelector: React.FC<{ 
  currentStatus: TeamMember['status']; 
  onStatusChange: (status: TeamMember['status']) => void 
}> = ({ currentStatus, onStatusChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-6">
          <div className={cn("w-2 h-2 rounded-full", statusConfig[currentStatus].color)} />
          <span className="text-xs">{statusConfig[currentStatus].label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {Object.entries(statusConfig).map(([status, config]) => (
          <DropdownMenuItem
            key={status}
            onClick={() => onStatusChange(status as TeamMember['status'])}
            className="flex items-center gap-2"
          >
            <div className={cn("w-2 h-2 rounded-full", config.color)} />
            <span>{config.label}</span>
            {status === currentStatus && <Check className="h-3 w-3 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Enhanced Channel Creation Dialog
const CreateChannelDialog: React.FC<{ 
  onCreateChannel: (name: string, description: string, type: 'public' | 'private') => Promise<void>;
  isLoading?: boolean;
}> = ({ onCreateChannel, isLoading = false }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Channel name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Channel name must be at least 2 characters';
    } else if (!/^[a-z0-9-_]+$/i.test(name)) {
      newErrors.name = 'Channel name can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (description.length > 250) {
      newErrors.description = 'Description must be less than 250 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onCreateChannel(name.trim(), description.trim(), type);
      setName('');
      setDescription('');
      setType('public');
      setErrors({});
      setOpen(false);
      
      toast({
        title: "Channel Created",
        description: `Channel "${name}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create new channel</TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
          <DialogDescription>
            Create a new channel to organize conversations with your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name*</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="e.g., general, marketing, dev-team"
              required
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="channel-description">Description</Label>
            <Textarea
              id="channel-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: undefined }));
                }
              }}
              placeholder="What's this channel about? (optional)"
              rows={3}
              disabled={isLoading}
              className={errors.description ? 'border-red-500' : ''}
              maxLength={250}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.description && (
                <span className="text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </span>
              )}
              <span className="ml-auto">{description.length}/250</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Channel Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "relative cursor-pointer rounded-lg border p-4 hover:bg-accent",
                  type === 'public' ? 'border-primary bg-primary/5' : 'border-input'
                )}
                onClick={() => setType('public')}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">Public</p>
                    <p className="text-xs text-muted-foreground">Anyone can join</p>
                  </div>
                </div>
                {type === 'public' && (
                  <div className="absolute right-2 top-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              
              <div
                className={cn(
                  "relative cursor-pointer rounded-lg border p-4 hover:bg-accent",
                  type === 'private' ? 'border-primary bg-primary/5' : 'border-input'
                )}
                onClick={() => setType('private')}
              >
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">Private</p>
                    <p className="text-xs text-muted-foreground">Invite only</p>
                  </div>
                </div>
                {type === 'private' && (
                  <div className="absolute right-2 top-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Channel'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced User Details Dialog
const UserDetailsDialog: React.FC<{
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (member: TeamMember, type: 'voice' | 'video') => void;
  onStartDM: (member: TeamMember) => void;
}> = ({ member, isOpen, onClose, onStartCall, onStartDM }) => {
  if (!member) return null;

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Never';
    const date = parseISO(lastSeen);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback className="text-lg font-semibold">
                  {member.full_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                statusConfig[member.status].color
              )} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{member.full_name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {member.role}
                </Badge>
                <span className={cn("text-xs", statusConfig[member.status].textColor)}>
                  {statusConfig[member.status].label}
                </span>
              </div>
              {member.title && (
                <p className="text-sm text-muted-foreground">{member.title}</p>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-muted-foreground">Email</div>
              <div className="col-span-2 break-all">{member.email}</div>
            </div>
            
            {member.department && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-muted-foreground">Department</div>
                <div className="col-span-2">{member.department}</div>
              </div>
            )}
            
            {member.timezone && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-muted-foreground">Timezone</div>
                <div className="col-span-2">{member.timezone}</div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-muted-foreground">Last seen</div>
              <div className="col-span-2">
                {member.is_online ? (
                  <span className="text-green-600 font-medium">Online now</span>
                ) : (
                  formatLastSeen(member.last_seen)
                )}
              </div>
            </div>
          </div>

          {member.status_text && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {member.status_text}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={() => onStartDM(member)} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onStartCall(member, 'voice')}
                  disabled={!member.is_online}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onStartCall(member, 'video')}
                  disabled={!member.is_online}
                >
                  <Video className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video call</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Call Interface with modern UI
const CallInterface: React.FC<{
  callState: CallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
}> = ({ 
  callState, 
  onEndCall, 
  onToggleMute, 
  onToggleVideo, 
  onToggleSpeaker,
  onAcceptCall,
  onDeclineCall
}) => {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionQualityColor = () => {
    switch (callState.connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!callState.isInCall && !callState.isRinging) return null;

  // Incoming call interface
  if (callState.isIncoming && callState.isRinging) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
        <Car
