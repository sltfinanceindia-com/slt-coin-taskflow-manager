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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, Phone, Video, Users, Plus, Search, Settings, Menu, MessageSquare, Hash, Smile, Paperclip,
  PhoneCall, PhoneOff, Mic, MicOff, VideoOff, Monitor, Circle, Clock, Star, Pin,
  UserPlus, Globe, Lock, Info, Bell, BellOff, Archive, Trash2, Edit3, MoreHorizontal,
  MoreVertical, Volume2, VolumeX, Headphones, Speaker, Loader2, CheckCircle,
  AlertCircle, XCircle, Wifi, WifiOff, Maximize2, Minimize2, Copy, Reply, Forward,
  Flag, Share2, ExternalLink, Eye, EyeOff, Zap, Activity, TrendingUp, BarChart3,
  Calendar, RefreshCw, X, Check, ChevronDown, ChevronUp, ChevronRight, Filter,
  SortAsc, Crown, Shield, Award, Heart, ThumbsUp, Bookmark, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import { useCommunicationRealtime } from '@/hooks/useCommunicationRealtime';
import EmojiPicker from '@/components/EmojiPicker';
import FileUploadZone from '@/components/FileUploadZone';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO, differenceInMinutes } from 'date-fns';

// Enhanced interfaces
interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  channel_id?: string;
  receiver_id?: string;
  created_at: string;
  updated_at?: string;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system';
  attachments?: any[];
  reactions?: any[];
  is_read: boolean;
  is_pinned?: boolean;
  reply_to?: string;
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
  last_activity?: string;
  created_at: string;
  created_by: string;
  member_count: number;
  is_muted?: boolean;
  is_favorite?: boolean;
}

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  department?: string;
  status: 'available' | 'busy' | 'away' | 'do_not_disturb' | 'offline';
  status_text?: string;
  last_seen?: string;
  is_online: boolean;
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
}

interface CallHistoryItem {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: 'voice' | 'video';
  status: 'completed' | 'missed' | 'declined' | 'busy' | 'no_answer';
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  caller_name?: string;
  receiver_name?: string;
  caller_avatar?: string;
  receiver_avatar?: string;
}

// Status configuration
const statusConfig = {
  available: { label: 'Available', color: 'bg-success', textColor: 'text-success' },
  busy: { label: 'Busy', color: 'bg-destructive', textColor: 'text-destructive' },
  away: { label: 'Away', color: 'bg-warning', textColor: 'text-warning' },
  do_not_disturb: { label: 'Do not disturb', color: 'bg-purple-500', textColor: 'text-purple-600' },
  offline: { label: 'Offline', color: 'bg-muted-foreground', textColor: 'text-muted-foreground' }
};

// State management
type CommunicationState = {
  messages: Message[];
  channels: Channel[];
  selectedChannel: Channel | null;
  teamMembers: TeamMember[];
  callState: CallState;
  callHistory: CallHistoryItem[];
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  isLoading: boolean;
  isMobileView: boolean;
};

type CommunicationAction = 
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CHANNELS'; payload: Channel[] }
  | { type: 'SET_SELECTED_CHANNEL'; payload: Channel | null }
  | { type: 'SET_TEAM_MEMBERS'; payload: TeamMember[] }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; status: TeamMember['status']; isOnline: boolean } }
  | { type: 'SET_CALL_STATE'; payload: Partial<CallState> }
  | { type: 'SET_CALL_HISTORY'; payload: CallHistoryItem[] }
  | { type: 'SET_CONNECTION_STATUS'; payload: CommunicationState['connectionStatus'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MOBILE_VIEW'; payload: boolean };

const communicationReducer = (state: CommunicationState, action: CommunicationAction): CommunicationState => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_CHANNELS':
      return { ...state, channels: action.payload };
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
    case 'SET_CALL_STATE':
      return { ...state, callState: { ...state.callState, ...action.payload } };
    case 'SET_CALL_HISTORY':
      return { ...state, callHistory: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_MOBILE_VIEW':
      return { ...state, isMobileView: action.payload };
    default:
      return state;
  }
};

// Status Selector Component
const StatusSelector: React.FC<{ 
  currentStatus: TeamMember['status']; 
  onStatusChange: (status: TeamMember['status']) => void 
}> = ({ currentStatus, onStatusChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8 px-2">
          <div className={cn("w-2 h-2 rounded-full", statusConfig[currentStatus].color)} />
          <span className="text-xs hidden sm:inline">{statusConfig[currentStatus].label}</span>
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

// Call Interface Component
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!callState.isInCall && !callState.isRinging) return null;

  // Incoming call interface
  if (callState.isIncoming && callState.isRinging) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={callState.callWith?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {callState.callWith?.full_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{callState.callWith?.full_name}</h3>
              <p className="text-muted-foreground">
                Incoming {callState.callType} call...
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16"
                onClick={onDeclineCall}
              >
                <PhoneOff className="h-6 w-6 text-destructive" />
              </Button>
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-success hover:bg-success/90"
                onClick={onAcceptCall}
              >
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active call interface
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={callState.callWith?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {callState.callWith?.full_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{callState.callWith?.full_name}</h3>
            <p className="text-muted-foreground">
              {formatDuration(callState.callDuration)}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="w-1 h-1 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success">Connected</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-3 mb-4">
            <Button
              variant={callState.isMuted ? "default" : "outline"}
              size="icon"
              className="rounded-full"
              onClick={onToggleMute}
            >
              {callState.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            {callState.callType === 'video' && (
              <Button
                variant={callState.isVideoOn ? "outline" : "default"}
                size="icon"
                className="rounded-full"
                onClick={onToggleVideo}
              >
                {callState.isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              variant={callState.isSpeakerOn ? "default" : "outline"}
              size="icon"
              className="rounded-full"
              onClick={onToggleSpeaker}
            >
              {callState.isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <Speaker className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full w-16 h-16"
            onClick={onEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// User Details Dialog
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
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-muted-foreground">Last seen</div>
              <div className="col-span-2">
                {member.is_online ? (
                  <span className="text-success font-medium">Online now</span>
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

// Typing Indicator Component
const TypingIndicator: React.FC<{ typingUsers: { full_name: string; avatar_url?: string }[] }> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex -space-x-1">
        {typingUsers.slice(0, 3).map((user, index) => (
          <Avatar key={index} className="h-4 w-4 border border-background">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-xs">
              {user.full_name.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span>
        {typingUsers.length === 1 
          ? `${typingUsers[0].full_name} is typing...`
          : typingUsers.length === 2
          ? `${typingUsers[0].full_name} and ${typingUsers[1].full_name} are typing...`
          : `${typingUsers[0].full_name} and ${typingUsers.length - 1} others are typing...`
        }
      </span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

// Message Reactions Component
const MessageReactions: React.FC<{ 
  reactions: any[]; 
  onReact: (emoji: string) => void;
  currentUserId?: string;
}> = ({ reactions, onReact, currentUserId }) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction, index) => {
        const hasReacted = currentUserId && reaction.users?.includes(currentUserId);
        return (
          <Button
            key={index}
            variant={hasReacted ? "default" : "outline"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onReact(reaction.emoji)}
          >
            {reaction.emoji} {reaction.count}
          </Button>
        );
      })}
    </div>
  );
};

// Enhanced Message Component with reactions and status
const MessageComponent: React.FC<{
  message: Message;
  showAvatar: boolean;
  isOwn: boolean;
  onReact: (messageId: string, emoji: string) => void;
  messageStatus?: any;
  currentUserId?: string;
}> = ({ message, showAvatar, isOwn, onReact, messageStatus, currentUserId }) => {
  const [showFileUpload, setShowFileUpload] = useState(false);

  return (
    <div className={cn("flex gap-3", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {message.sender_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}
      <div className={cn("max-w-[70%] space-y-1", isOwn && "items-end")}>
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {!isOwn && showAvatar && (
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold">{message.sender_name}</p>
              {message.sender_role && (
                <Badge variant="outline" className="text-xs h-4">
                  {message.sender_role}
                </Badge>
              )}
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className="flex items-center justify-between mt-1">
            <p className={cn(
              "text-xs opacity-70",
              isOwn ? "text-primary-foreground" : "text-muted-foreground"
            )}>
              {format(parseISO(message.created_at), 'HH:mm')}
            </p>
            {isOwn && messageStatus && (
              <div className="text-xs opacity-70">
                {messageStatus.status === 'sending' && <Loader2 className="h-3 w-3 animate-spin inline" />}
                {messageStatus.status === 'sent' && <Check className="h-3 w-3 inline" />}
                {messageStatus.status === 'delivered' && <CheckCircle className="h-3 w-3 inline" />}
                {messageStatus.status === 'read' && <CheckCircle className="h-3 w-3 inline text-blue-500" />}
                {messageStatus.status === 'failed' && <XCircle className="h-3 w-3 inline text-destructive" />}
              </div>
            )}
          </div>
        </div>
        
        {/* Message Reactions */}
        <MessageReactions 
          reactions={message.reactions || []} 
          onReact={(emoji) => onReact(message.id, emoji)}
          currentUserId={currentUserId}
        />
        
        {/* Quick reaction buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-xs hover:bg-accent"
              onClick={() => onReact(message.id, emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Communication Component
const EnhancedSimpleCommunication: React.FC = () => {
  const { profile } = useAuth();
  const { presenceList, setUserStatus, getUserPresence, getStatusBadgeColor, getStatusText } = usePresence();
  const {
    typingUsers,
    messageStatuses,
    callNotifications,
    connectionStatus,
    subscribeToChannelMessages,
    unsubscribeFromChannelMessages,
    broadcastTypingStart,
    broadcastTypingStop,
    broadcastMessageStatus,
    getTypingUsersForChannel,
    getMessageStatus,
    playMessageSound
  } = useCommunicationRealtime();
  
  const initialState: CommunicationState = {
    messages: [],
    channels: [],
    selectedChannel: null,
    teamMembers: [],
    callState: {
      isInCall: false,
      isRinging: false,
      isIncoming: false,
      callType: null,
      isMuted: false,
      isVideoOn: false,
      isSpeakerOn: false,
      callDuration: 0,
      connectionQuality: 'excellent'
    },
    callHistory: [],
    connectionStatus: 'connected',
    isLoading: true,
    isMobileView: false
  };

  const [state, dispatch] = useReducer(communicationReducer, initialState);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [callDurationInterval, setCallDurationInterval] = useState<NodeJS.Timeout | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      dispatch({ type: 'SET_MOBILE_VIEW', payload: window.innerWidth < 768 });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load initial data
  useEffect(() => {
    if (!profile?.id) return;
    
    Promise.all([
      fetchChannels(),
      fetchTeamMembers(),
      fetchCallHistory()
    ]).finally(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
    });
  }, [profile?.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Load messages when channel changes
  useEffect(() => {
    if (state.selectedChannel) {
      fetchMessages(state.selectedChannel.id);
      subscribeToChannelMessages(state.selectedChannel.id);
    }
    
    return () => {
      if (state.selectedChannel) {
        unsubscribeFromChannelMessages(state.selectedChannel.id);
      }
    };
  }, [state.selectedChannel]);

  // Call duration timer
  useEffect(() => {
    if (state.callState.isInCall && !callDurationInterval) {
      const interval = setInterval(() => {
        dispatch({ 
          type: 'SET_CALL_STATE', 
          payload: { callDuration: state.callState.callDuration + 1 } 
        });
      }, 1000);
      setCallDurationInterval(interval);
    } else if (!state.callState.isInCall && callDurationInterval) {
      clearInterval(callDurationInterval);
      setCallDurationInterval(null);
    }

    return () => {
      if (callDurationInterval) {
        clearInterval(callDurationInterval);
      }
    };
  }, [state.callState.isInCall]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members(
            user_id,
            profiles(id, full_name, avatar_url, role)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const channelsWithMembers = data?.map(channel => ({
        ...channel,
        type: channel.type as 'public' | 'private' | 'direct' | 'group',
        unread_count: 0,
        last_activity: channel.updated_at
      } as Channel)) || [];

      dispatch({ type: 'SET_CHANNELS', payload: channelsWithMembers });

      // Auto-select first channel if none selected
      if (!state.selectedChannel && channelsWithMembers.length > 0) {
        dispatch({ type: 'SET_SELECTED_CHANNEL', payload: channelsWithMembers[0] });
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      });
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;

      const membersWithPresence = data?.map(member => {
        const presence = getUserPresence(member.id);
        return {
          ...member,
          status: (presence?.manual_status || presence?.activity_status || 'offline') as TeamMember['status'],
          is_online: presence?.is_online || false,
          last_seen: presence?.last_seen,
          status_text: presence?.status_message
        };
      }) || [];

      dispatch({ type: 'SET_TEAM_MEMBERS', payload: membersWithPresence });
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(full_name, avatar_url, role)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const messagesWithSender = data?.map(message => ({
        ...message,
        message_type: message.message_type as 'text' | 'image' | 'file' | 'voice' | 'video' | 'system',
        sender_name: (message.sender_profile as any)?.full_name || 'Unknown',
        sender_role: (message.sender_profile as any)?.role || 'unknown',
        attachments: message.attachments || [],
        reactions: message.reactions || []
      } as Message)) || [];

      dispatch({ type: 'SET_MESSAGES', payload: messagesWithSender });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchCallHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('call_history')
        .select(`
          *,
          caller_profile:profiles!call_history_caller_id_fkey(full_name, avatar_url),
          receiver_profile:profiles!call_history_receiver_id_fkey(full_name, avatar_url)
        `)
        .or(`caller_id.eq.${profile?.id},receiver_id.eq.${profile?.id}`)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const callHistoryWithNames = data?.map(call => ({
        ...call,
        call_type: call.call_type as 'voice' | 'video',
        status: call.status as 'completed' | 'missed' | 'declined' | 'busy' | 'no_answer',
        caller_name: (call.caller_profile as any)?.full_name || 'Unknown',
        receiver_name: (call.receiver_profile as any)?.full_name || 'Unknown',
        caller_avatar: (call.caller_profile as any)?.avatar_url,
        receiver_avatar: (call.receiver_profile as any)?.avatar_url
      } as CallHistoryItem)) || [];

      dispatch({ type: 'SET_CALL_HISTORY', payload: callHistoryWithNames });
    } catch (error) {
      console.error('Error fetching call history:', error);
    }
  };

  const handleStatusChange = async (status: TeamMember['status']) => {
    try {
      await setUserStatus(status);
      
      dispatch({ 
        type: 'UPDATE_USER_STATUS', 
        payload: { 
          userId: profile?.user_id || '', 
          status, 
          isOnline: true 
        } 
      });

      toast({
        title: "Status Updated",
        description: `Your status has been set to ${statusConfig[status].label}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !state.selectedChannel || !profile?.id) return;

    const tempMessageId = Date.now().toString();
    
    // Add optimistic message
    const optimisticMessage: Message = {
      id: tempMessageId,
      content: messageInput.trim(),
      sender_id: profile.id,
      sender_name: profile.full_name,
      sender_role: profile.role,
      channel_id: state.selectedChannel.id,
      created_at: new Date().toISOString(),
      message_type: 'text',
      is_read: false,
      attachments: [],
      reactions: []
    };

    dispatch({ type: 'ADD_MESSAGE', payload: optimisticMessage });
    broadcastMessageStatus(tempMessageId, 'sending');
    
    const inputValue = messageInput;
    setMessageInput('');

    // Stop typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    broadcastTypingStop(state.selectedChannel.id);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          content: inputValue,
          sender_id: profile.id,
          channel_id: state.selectedChannel.id,
          message_type: 'text',
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update optimistic message with real data
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { 
          id: tempMessageId, 
          updates: { 
            id: data.id,
            created_at: data.created_at
          } 
        } 
      });
      
      broadcastMessageStatus(data.id, 'sent');

    } catch (error) {
      console.error('Error sending message:', error);
      broadcastMessageStatus(tempMessageId, 'failed');
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);
    
    if (!state.selectedChannel) return;

    // Start typing indicator
    broadcastTypingStart(state.selectedChannel.id);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      broadcastTypingStop(state.selectedChannel!.id);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleFileUpload = (files: any[]) => {
    console.log('Files uploaded:', files);
    // TODO: Implement file message sending
  };

  const handleMessageReaction = async (messageId: string, emoji: string) => {
    try {
      // TODO: Implement message reactions in database
      console.log('React to message:', messageId, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleStartCall = async (member: TeamMember, callType: 'voice' | 'video') => {
    if (!profile?.id) return;

    try {
      // Insert call record
      const { error } = await supabase
        .from('call_history')
        .insert([{
          caller_id: profile.id,
          receiver_id: member.id,
          call_type: callType,
          status: 'completed', // For demo purposes
          started_at: new Date().toISOString(),
          ended_at: new Date(Date.now() + 60000).toISOString(), // Demo: 1 minute call
          duration_seconds: 60
        }]);

      if (error) throw error;

      // Update call state
      dispatch({
        type: 'SET_CALL_STATE',
        payload: {
          isInCall: true,
          isRinging: false,
          isIncoming: false,
          callType,
          callWith: member,
          callStartTime: new Date(),
          callDuration: 0
        }
      });

      toast({
        title: "Call Started",
        description: `Starting ${callType} call with ${member.full_name}`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start call",
        variant: "destructive",
      });
    }
  };

  const handleEndCall = async () => {
    dispatch({
      type: 'SET_CALL_STATE',
      payload: {
        isInCall: false,
        isRinging: false,
        isIncoming: false,
        callType: null,
        callWith: undefined,
        callDuration: 0
      }
    });

    // Refresh call history
    await fetchCallHistory();
    
    toast({
      title: "Call Ended",
      description: "Call has been ended",
    });
  };

  const handleToggleMute = () => {
    dispatch({
      type: 'SET_CALL_STATE',
      payload: { isMuted: !state.callState.isMuted }
    });
  };

  const handleToggleVideo = () => {
    dispatch({
      type: 'SET_CALL_STATE',
      payload: { isVideoOn: !state.callState.isVideoOn }
    });
  };

  const handleToggleSpeaker = () => {
    dispatch({
      type: 'SET_CALL_STATE',
      payload: { isSpeakerOn: !state.callState.isSpeakerOn }
    });
  };

  const handleStartDM = async (member: TeamMember) => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        user1_id: profile.id,
        user2_id: member.id
      });

      if (error) throw error;

      // Fetch the created channel
      const { data: channel, error: channelError } = await supabase
        .from('communication_channels')
        .select('*')
        .eq('id', data)
        .single();

      if (channelError) throw channelError;

      const dmChannel = {
        ...channel,
        type: channel.type as 'public' | 'private' | 'direct' | 'group',
        name: member.full_name,
        unread_count: 0,
        last_activity: new Date().toISOString()
      } as Channel;

      dispatch({ type: 'SET_SELECTED_CHANNEL', payload: dmChannel });
      setActiveTab('chats');
    } catch (error) {
      console.error('Error creating DM:', error);
      toast({
        title: "Error",
        description: "Failed to start direct message",
        variant: "destructive",
      });
    }
  };

  // Filter functions
  const filteredChannels = state.channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = state.teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const currentUserStatus = profile?.id ? 
    getUserPresence(profile.id)?.manual_status as TeamMember['status'] || 'available' : 'offline';

  // Get typing users for current channel
  const currentTypingUsers = state.selectedChannel 
    ? getTypingUsersForChannel(state.selectedChannel.id) 
    : [];

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Mobile layout
  if (state.isMobileView) {
    return (
      <TooltipProvider>
        <div className="flex flex-col h-screen bg-background">
          {/* Call Interface Overlay */}
          <CallInterface
            callState={state.callState}
            onEndCall={handleEndCall}
            onToggleMute={handleToggleMute}
            onToggleVideo={handleToggleVideo}
            onToggleSpeaker={handleToggleSpeaker}
          />

          {/* User Details Dialog */}
          <UserDetailsDialog
            member={selectedMember}
            isOpen={isUserDetailsOpen}
            onClose={() => setIsUserDetailsOpen(false)}
            onStartCall={handleStartCall}
            onStartDM={handleStartDM}
          />

          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{profile?.full_name}</p>
                <StatusSelector
                  currentStatus={currentUserStatus}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Communications</h2>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="chats">Chats</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                      <TabsTrigger value="calls">Calls</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chats" className="space-y-2 mt-4">
                      <ScrollArea className="h-[50vh]">
                        {filteredChannels.map((channel) => (
                          <div
                            key={channel.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                              state.selectedChannel?.id === channel.id && "bg-accent"
                            )}
                            onClick={() => dispatch({ type: 'SET_SELECTED_CHANNEL', payload: channel })}
                          >
                            <div className="flex-shrink-0">
                              {channel.is_direct_message ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {channel.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                  <Hash className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">{channel.name}</p>
                                {channel.unread_count > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {channel.unread_count}
                                  </Badge>
                                )}
                              </div>
                              {channel.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {channel.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-2 mt-4">
                      <ScrollArea className="h-[50vh]">
                        {filteredMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => {
                              setSelectedMember(member);
                              setIsUserDetailsOpen(true);
                            }}
                          >
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar_url} />
                                <AvatarFallback>
                                  {member.full_name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-background",
                                statusConfig[member.status].color
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">{member.full_name}</p>
                                <span className={cn("text-xs", statusConfig[member.status].textColor)}>
                                  {statusConfig[member.status].label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="calls" className="space-y-2 mt-4">
                      <ScrollArea className="h-[50vh]">
                        {state.callHistory.map((call) => (
                          <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg">
                            <div className="flex-shrink-0">
                              <Avatar className="h-8 w-8">
                                <AvatarImage 
                                  src={call.caller_id === profile?.id ? call.receiver_avatar : call.caller_avatar} 
                                />
                                <AvatarFallback>
                                  {(call.caller_id === profile?.id ? call.receiver_name : call.caller_name)?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                  {call.caller_id === profile?.id ? call.receiver_name : call.caller_name}
                                </p>
                                <div className="flex items-center gap-1">
                                  {call.call_type === 'video' ? (
                                    <Video className="h-3 w-3 text-muted-foreground" />
                                  ) : (
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatMessageTime(call.started_at)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                  {call.status}
                                </Badge>
                                {call.duration_seconds > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Chat Area */}
          {state.selectedChannel ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {state.selectedChannel.is_direct_message ? (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {state.selectedChannel.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Hash className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{state.selectedChannel.name}</h3>
                    {state.selectedChannel.description && (
                      <p className="text-xs text-muted-foreground">
                        {state.selectedChannel.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 group">
                  {state.messages.map((message, index) => {
                    const showAvatar = index === 0 || 
                      state.messages[index - 1].sender_id !== message.sender_id ||
                      differenceInMinutes(parseISO(message.created_at), parseISO(state.messages[index - 1].created_at)) > 5;

                    return (
                      <MessageComponent
                        key={message.id}
                        message={message}
                        showAvatar={showAvatar}
                        isOwn={message.sender_id === profile?.id}
                        onReact={handleMessageReaction}
                        messageStatus={getMessageStatus(message.id)}
                        currentUserId={profile?.id}
                      />
                    );
                  })}
                  <TypingIndicator typingUsers={currentTypingUsers} />
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t bg-card">
                {showFileUpload && (
                  <div className="p-4 border-b">
                    <FileUploadZone onFilesUploaded={handleFileUpload} />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="resize-none min-h-[40px] max-h-[120px]"
                      rows={1}
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowFileUpload(!showFileUpload)}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} className="h-8 w-8" />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      size="icon"
                      className="flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // Desktop layout
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Call Interface Overlay */}
        <CallInterface
          callState={state.callState}
          onEndCall={handleEndCall}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleSpeaker={handleToggleSpeaker}
        />

        {/* User Details Dialog */}
        <UserDetailsDialog
          member={selectedMember}
          isOpen={isUserDetailsOpen}
          onClose={() => setIsUserDetailsOpen(false)}
          onStartCall={handleStartCall}
          onStartDM={handleStartDM}
        />

        {/* Sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          {/* User Profile Section */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                  getStatusBadgeColor(getUserPresence(profile?.id || ''))
                )} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{profile?.full_name}</p>
                <StatusSelector
                  currentStatus={currentUserStatus}
                  onStatusChange={handleStatusChange}
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="calls">Calls</TabsTrigger>
            </TabsList>

            <TabsContent value="chats" className="flex-1 mt-2">
              <ScrollArea className="h-full px-2">
                <div className="space-y-1">
                  {filteredChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2",
                        state.selectedChannel?.id === channel.id && "bg-accent"
                      )}
                      onClick={() => dispatch({ type: 'SET_SELECTED_CHANNEL', payload: channel })}
                    >
                      <div className="flex-shrink-0">
                        {channel.is_direct_message ? (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {channel.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Hash className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{channel.name}</p>
                          {channel.unread_count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {channel.unread_count}
                            </Badge>
                          )}
                        </div>
                        {channel.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {channel.description}
                          </p>
                        )}
                        {channel.last_activity && (
                          <p className="text-xs text-muted-foreground">
                            {formatMessageTime(channel.last_activity)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="team" className="flex-1 mt-2">
              <ScrollArea className="h-full px-2">
                <div className="space-y-1">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors mx-2"
                      onClick={() => {
                        setSelectedMember(member);
                        setIsUserDetailsOpen(true);
                      }}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                          statusConfig[member.status].color
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{member.full_name}</p>
                          <span className={cn("text-xs", statusConfig[member.status].textColor)}>
                            {statusConfig[member.status].label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                        {member.status_text && (
                          <p className="text-xs text-muted-foreground truncate italic">
                            "{member.status_text}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartCall(member, 'voice');
                              }}
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
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartCall(member, 'video');
                              }}
                              disabled={!member.is_online}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Video call</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="calls" className="flex-1 mt-2">
              <ScrollArea className="h-full px-2">
                <div className="space-y-1">
                  {state.callHistory.map((call) => (
                    <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg mx-2">
                      <div className="flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={call.caller_id === profile?.id ? call.receiver_avatar : call.caller_avatar} 
                          />
                          <AvatarFallback>
                            {(call.caller_id === profile?.id ? call.receiver_name : call.caller_name)?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {call.caller_id === profile?.id ? call.receiver_name : call.caller_name}
                          </p>
                          <div className="flex items-center gap-1">
                            {call.call_type === 'video' ? (
                              <Video className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Phone className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(call.started_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {call.status}
                          </Badge>
                          {call.duration_seconds > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {state.selectedChannel ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {state.selectedChannel.is_direct_message ? (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {state.selectedChannel.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Hash className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{state.selectedChannel.name}</h2>
                    {state.selectedChannel.description && (
                      <p className="text-sm text-muted-foreground">
                        {state.selectedChannel.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start voice call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start video call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Users className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Channel members</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Channel info</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 group">
                  {state.messages.map((message, index) => {
                    const showAvatar = index === 0 || 
                      state.messages[index - 1].sender_id !== message.sender_id ||
                      differenceInMinutes(parseISO(message.created_at), parseISO(state.messages[index - 1].created_at)) > 5;

                    return (
                      <MessageComponent
                        key={message.id}
                        message={message}
                        showAvatar={showAvatar}
                        isOwn={message.sender_id === profile?.id}
                        onReact={handleMessageReaction}
                        messageStatus={getMessageStatus(message.id)}
                        currentUserId={profile?.id}
                      />
                    );
                  })}
                  <TypingIndicator typingUsers={currentTypingUsers} />
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t bg-card">
                {showFileUpload && (
                  <div className="p-4 border-b">
                    <FileUploadZone onFilesUploaded={handleFileUpload} />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex gap-3 items-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex-shrink-0"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Message ${state.selectedChannel.name}...`}
                        value={messageInput}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="resize-none min-h-[44px] max-h-[120px]"
                        rows={1}
                      />
                    </div>
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} className="flex-shrink-0" />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Welcome to Communications</h3>
                  <p className="text-muted-foreground">Select a channel or start a conversation to begin</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedSimpleCommunication;