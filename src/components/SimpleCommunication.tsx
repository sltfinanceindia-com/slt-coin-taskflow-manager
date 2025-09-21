import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
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
  Lock,
  Globe,
  Star,
  Pin,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  Reply,
  Forward,
  Download,
  Upload,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Mic,
  MicOff,
  Camera,
  Smile,
  X,
  Check,
  CheckCheck,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  RefreshCw,
  Archive,
  Flag,
  Share2,
  ExternalLink,
  Calendar,
  Clock,
  User,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  WifiOff,
  Wifi,
  Signal,
  Bluetooth,
  Headphones,
  Speaker
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO, differenceInMinutes } from 'date-fns';

// Enhanced interfaces
interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  sender_role?: string;
  channel_id?: string;
  receiver_id?: string;
  created_at: string;
  updated_at?: string;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system' | 'reaction';
  attachments?: Attachment[];
  metadata?: MessageMetadata;
  thread_id?: string;
  reply_to?: string;
  reactions?: Reaction[];
  is_edited?: boolean;
  is_deleted?: boolean;
  is_pinned?: boolean;
  is_forwarded?: boolean;
  read_by?: string[];
  delivery_status?: 'sent' | 'delivered' | 'read';
  priority?: 'normal' | 'high' | 'urgent';
  expires_at?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
}

interface MessageMetadata {
  location?: { lat: number; lng: number; address: string };
  mentions?: string[];
  links?: string[];
  hashtags?: string[];
  emoji_count?: Record<string, number>;
  translation?: Record<string, string>;
  sentiment?: 'positive' | 'negative' | 'neutral';
  ai_summary?: string;
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct' | 'group';
  is_direct_message?: boolean;
  participant_ids?: string[];
  participant_count?: number;
  unread_count?: number;
  last_message?: Message;
  last_activity?: string;
  created_at: string;
  created_by?: string;
  settings?: ChannelSettings;
  channel_members?: ChannelMember[];
  is_archived?: boolean;
  is_muted?: boolean;
  is_favorite?: boolean;
  category?: string;
  tags?: string[];
}

interface ChannelSettings {
  allow_reactions: boolean;
  allow_threads: boolean;
  allow_file_sharing: boolean;
  allow_voice_messages: boolean;
  message_retention_days?: number;
  auto_delete_messages: boolean;
  require_approval: boolean;
  slow_mode_interval?: number;
}

interface ChannelMember {
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at?: string;
  is_online?: boolean;
  profiles?: TeamMember;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  department?: string;
  title?: string;
  timezone?: string;
  is_online?: boolean;
  last_seen?: string;
  status?: 'available' | 'busy' | 'away' | 'do_not_disturb';
  status_text?: string;
  preferences?: UserPreferences;
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

interface TypingUser {
  user_id: string;
  name: string;
  avatar?: string;
  started_at: Date;
}

interface MessageReply {
  id: string;
  content: string;
  sender_name: string;
  timestamp: string;
}

// Enhanced component
export default function EnhancedCommunication() {
  const { profile } = useAuth();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  
  // UI state
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageReply | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [showThreads, setShowThreads] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  
  // Advanced features state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(true);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'mentions' | 'files' | 'images'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const websocketRef = useRef<WebSocket>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorderRef = useRef<MediaRecorder>();
  
  // WebSocket connection for real-time updates
  useEffect(() => {
    if (profile?.id) {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/chat/${profile.id}`;
      
      const connectWebSocket = () => {
        try {
          websocketRef.current = new WebSocket(wsUrl);
          
          websocketRef.current.onopen = () => {
            setConnectionStatus('connected');
            console.log('WebSocket connected');
          };
          
          websocketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          };
          
          websocketRef.current.onclose = () => {
            setConnectionStatus('disconnected');
            console.log('WebSocket disconnected');
            
            // Attempt to reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
          };
          
          websocketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('disconnected');
          };
        } catch (error) {
          console.error('WebSocket connection error:', error);
          setConnectionStatus('disconnected');
        }
      };
      
      connectWebSocket();
      
      return () => {
        if (websocketRef.current) {
          websocketRef.current.close();
        }
      };
    }
  }, [profile?.id]);

  // Enhanced WebSocket message handler
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => {
          const exists = prev.find(m => m.id === data.message.id);
          if (exists) return prev;
          return [...prev, data.message];
        });
        
        // Update channel's last message
        setChannels(prev => prev.map(ch => 
          ch.id === data.message.channel_id 
            ? { ...ch, last_message: data.message, last_activity: data.message.created_at }
            : ch
        ));
        
        // Show notification if not in current channel
        if (data.message.channel_id !== selectedChannel?.id && data.message.sender_id !== profile?.id) {
          if (showNotifications && 'Notification' in window) {
            new Notification(`${data.message.sender_name}`, {
              body: data.message.content,
              icon: data.message.sender_avatar
            });
          }
          
          toast({
            title: `New message from ${data.message.sender_name}`,
            description: data.message.content,
            action: (
              <Button size="sm" onClick={() => {
                const channel = channels.find(ch => ch.id === data.message.channel_id);
                if (channel) setSelectedChannel(channel);
              }}>
                View
              </Button>
            )
          });
        }
        break;
        
      case 'message_updated':
        setMessages(prev => prev.map(m => 
          m.id === data.message.id ? { ...m, ...data.message } : m
        ));
        break;
        
      case 'message_deleted':
        setMessages(prev => prev.filter(m => m.id !== data.message_id));
        break;
        
      case 'typing_start':
        if (data.user_id !== profile?.id) {
          setTypingUsers(prev => {
            const exists = prev.find(u => u.user_id === data.user_id);
            if (exists) return prev;
            return [...prev, {
              user_id: data.user_id,
              name: data.user_name,
              avatar: data.user_avatar,
              started_at: new Date()
            }];
          });
        }
        break;
        
      case 'typing_stop':
        setTypingUsers(prev => prev.filter(u => u.user_id !== data.user_id));
        break;
        
      case 'user_status_change':
        setTeamMembers(prev => prev.map(member => 
          member.id === data.user_id 
            ? { ...member, is_online: data.is_online, status: data.status }
            : member
        ));
        break;
        
      case 'channel_update':
        setChannels(prev => prev.map(ch => 
          ch.id === data.channel.id ? { ...ch, ...data.channel } : ch
        ));
        break;
    }
  }, [selectedChannel, profile, channels, showNotifications]);

  // Load initial data with enhanced error handling and retry logic
  const loadInitialData = useCallback(async (retryCount = 0) => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      // Load channels with members and last messages
      const { data: channelsData, error: channelsError } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members!inner(
            user_id,
            role,
            joined_at,
            last_read_at,
            profiles!inner(*)
          )
        `)
        .or(`participant_ids.cs.{${profile.id}},created_by.eq.${profile.id}`)
        .order('last_activity', { ascending: false });
      
      if (channelsError) throw channelsError;
      
      // Load team members with online status
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('*, user_status(*)')
        .order('full_name');
      
      if (membersError) throw membersError;
      
      // Process and set data
      const processedChannels = (channelsData || []).map(channel => ({
        ...channel,
        unread_count: calculateUnreadCount(channel),
        is_muted: channel.channel_members?.find(m => m.user_id === profile.id)?.is_muted || false,
        is_favorite: channel.channel_members?.find(m => m.user_id === profile.id)?.is_favorite || false
      }));
      
      setChannels(processedChannels);
      setTeamMembers(membersData || []);
      
      // Auto-select first channel or last active channel
      if (processedChannels.length > 0) {
        const lastActiveChannel = localStorage.getItem('lastActiveChannel');
        const channelToSelect = lastActiveChannel 
          ? processedChannels.find(ch => ch.id === lastActiveChannel) || processedChannels[0]
          : processedChannels[0];
        setSelectedChannel(channelToSelect);
      }
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      
      if (retryCount < 3) {
        setTimeout(() => loadInitialData(retryCount + 1), 2000);
      } else {
        toast({
          title: "Connection Error",
          description: "Unable to load chat data. Please refresh the page.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const calculateUnreadCount = (channel: Channel) => {
    const member = channel.channel_members?.find(m => m.user_id === profile?.id);
    if (!member?.last_read_at) return 0;
    
    // This would typically be calculated on the backend
    return 0;
  };

  // Enhanced message loading with pagination
  const loadMessages = useCallback(async (channelId: string, offset = 0, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          attachments(*),
          reactions(*),
          thread_messages(count),
          reply_to_message:reply_to(id, content, sender_name)
        `)
        .eq('channel_id', channelId)
        .is('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      const processedMessages = (data || []).reverse().map(msg => ({
        ...msg,
        reactions: msg.reactions || [],
        read_by: msg.read_by || [],
        delivery_status: msg.sender_id === profile?.id ? 'read' : 'delivered'
      }));
      
      if (offset === 0) {
        setMessages(processedMessages);
      } else {
        setMessages(prev => [...processedMessages, ...prev]);
      }
      
      // Mark messages as read
      markChannelAsRead(channelId);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error Loading Messages",
        description: "Could not load chat messages. Please try again.",
        variant: "destructive",
      });
    }
  }, [profile?.id]);

  // Enhanced message sending with optimistic updates
  const sendMessage = useCallback(async (content: string, type: Message['message_type'] = 'text', attachments: Attachment[] = []) => {
    if (!content.trim() && attachments.length === 0) return;
    if (!selectedChannel || !profile) return;
    
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      sender_id: profile.id,
      sender_name: profile.full_name,
      sender_avatar: profile.avatar_url,
      sender_role: profile.role,
      channel_id: selectedChannel.id,
      created_at: new Date().toISOString(),
      message_type: type,
      attachments,
      metadata: {},
      reactions: [],
      read_by: [profile.id],
      delivery_status: 'sent',
      reply_to: replyingTo?.id
    };
    
    // Add optimistic message
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setReplyingTo(null);
    
    try {
      const messageData = {
        content: content.trim(),
        sender_id: profile.id,
        sender_name: profile.full_name,
        sender_avatar: profile.avatar_url,
        sender_role: profile.role,
        channel_id: selectedChannel.id,
        message_type: type,
        attachments,
        reply_to: replyingTo?.id,
        metadata: extractMessageMetadata(content)
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real message
      setMessages(prev => prev.map(m => 
        m.id === optimisticMessage.id ? { ...data, delivery_status: 'delivered' } : m
      ));
      
      // Send real-time update
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'new_message',
          message: data,
          channel_id: selectedChannel.id
        }));
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove failed message and show error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      
      toast({
        title: "Message Failed",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedChannel, profile, replyingTo]);

  // Extract metadata from message content
  const extractMessageMetadata = (content: string): MessageMetadata => {
    const metadata: MessageMetadata = {};
    
    // Extract mentions
    const mentions = content.match(/@(\w+)/g);
    if (mentions) {
      metadata.mentions = mentions.map(m => m.substring(1));
    }
    
    // Extract hashtags
    const hashtags = content.match(/#(\w+)/g);
    if (hashtags) {
      metadata.hashtags = hashtags.map(h => h.substring(1));
    }
    
    // Extract links
    const links = content.match(/https?:\/\/[^\s]+/g);
    if (links) {
      metadata.links = links;
    }
    
    return metadata;
  };

  // Enhanced typing indicators
  const handleTypingStart = useCallback(() => {
    if (!selectedChannel || !profile) return;
    
    setIsTyping(true);
    
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'typing_start',
        channel_id: selectedChannel.id,
        user_id: profile.id,
        user_name: profile.full_name,
        user_avatar: profile.avatar_url
      }));
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  }, [selectedChannel, profile]);

  const handleTypingStop = useCallback(() => {
    if (!isTyping) return;
    
    setIsTyping(false);
    
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'typing_stop',
        channel_id: selectedChannel?.id,
        user_id: profile?.id
      }));
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [isTyping, selectedChannel, profile]);

  // Message input handlers
  const handleMessageChange = useCallback((value: string) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      handleTypingStart();
    } else if (!value.trim() && isTyping) {
      handleTypingStop();
    }
  }, [isTyping, handleTypingStart, handleTypingStop]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        sendMessage(newMessage);
      }
    }
  }, [newMessage, sendMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when channel changes
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
      localStorage.setItem('lastActiveChannel', selectedChannel.id);
    }
  }, [selectedChannel, loadMessages]);

  // Clean up typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Initial data load
  useEffect(() => {
    if (profile) {
      loadInitialData();
    }
  }, [profile, loadInitialData]);

  // Mark channel as read
  const markChannelAsRead = async (channelId: string) => {
    if (!profile?.id) return;
    
    try {
      await supabase
        .from('channel_members')
        .update({ last_read_at: new Date().toISOString() })
        .match({ channel_id: channelId, user_id: profile.id });
    } catch (error) {
      console.error('Error marking channel as read:', error);
    }
  };

  // Enhanced channel creation
  const createChannel = async (name: string, type: Channel['type'], description?: string) => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .insert([{
          name,
          type,
          description,
          created_by: profile.id,
          participant_ids: [profile.id],
          settings: {
            allow_reactions: true,
            allow_threads: true,
            allow_file_sharing: true,
            allow_voice_messages: true,
            auto_delete_messages: false,
            require_approval: false
          }
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Add creator as admin
      await supabase
        .from('channel_members')
        .insert([{
          channel_id: data.id,
          user_id: profile.id,
          role: 'admin'
        }]);
      
      // Reload channels
      loadInitialData();
      
      toast({
        title: "Channel Created",
        description: `Channel "${name}" has been created successfully.`,
      });
      
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error Creating Channel",
        description: "Could not create channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Start direct message
  const startDirectMessage = async (memberId: string) => {
    if (!profile) return;

    try {
      // Check if DM channel already exists
      const existingDM = channels.find(ch => 
        ch.is_direct_message && 
        ch.participant_ids?.includes(memberId) &&
        ch.participant_ids?.includes(profile.id) &&
        ch.participant_ids?.length === 2
      );
      
      if (existingDM) {
        setSelectedChannel(existingDM);
        return;
      }
      
      // Create new DM channel
      const member = teamMembers.find(m => m.id === memberId);
      const { data, error } = await supabase
        .from('communication_channels')
        .insert([{
          name: `${profile.full_name}, ${member?.full_name}`,
          type: 'direct',
          is_direct_message: true,
          participant_ids: [profile.id, memberId],
          created_by: profile.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Add members
      await supabase
        .from('channel_members')
        .insert([
          { channel_id: data.id, user_id: profile.id, role: 'member' },
          { channel_id: data.id, user_id: memberId, role: 'member' }
        ]);
      
      // Reload channels and select new DM
      await loadInitialData();
      const newDM = channels.find(ch => ch.id === data.id);
      if (newDM) setSelectedChannel(newDM);
      
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: "Error Starting Chat",
        description: "Could not start direct message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      voiceRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Upload audio file
        const fileName = `voice-${Date.now()}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, audioBlob);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(fileName);
        
        const attachment: Attachment = {
          id: Date.now().toString(),
          name: fileName,
          type: 'audio/webm',
          size: audioBlob.size,
          url: urlData.publicUrl,
          duration: recordingDuration
        };
        
        sendMessage('🎤 Voice message', 'voice', [attachment]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingDuration(0);
      
      // Start recording timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      setTimeout(() => {
        clearInterval(timer);
      }, 60000); // Max 1 minute
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.stop();
      setIsRecordingVoice(false);
      setRecordingDuration(0);
    }
  };

  // File upload handler
  const handleFileUpload = async (files: FileList) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/', 'video/', 'audio/', 'application/', 'text/'];
    
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive",
        });
        continue;
      }
      
      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        toast({
          title: "File Not Supported",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        continue;
      }
      
      try {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(fileName);
        
        const attachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: urlData.publicUrl
        };
        
        // Generate thumbnail for images
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxDim = 200;
            
            let { width, height } = img;
            if (width > height) {
              if (width > maxDim) {
                height = (height * maxDim) / width;
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = (width * maxDim) / height;
                height = maxDim;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            
            attachment.thumbnail = canvas.toDataURL();
            attachment.dimensions = { width: img.width, height: img.height };
          };
          img.src = URL.createObjectURL(file);
        }
        
        sendMessage(`📎 ${file.name}`, file.type.startsWith('image/') ? 'image' : 'file', [attachment]);
        
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload Failed",
          description: `Could not upload ${file.name}. Please try again.`,
          variant: "destructive",
        });
      }
    }
  };

  // Message reactions
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!profile) return;
    
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;
      
      const existingReaction = message.reactions?.find(r => r.emoji === emoji);
      const userReacted = existingReaction?.users.includes(profile.id);
      
      let updatedReactions: Reaction[];
      
      if (userReacted) {
        // Remove reaction
        updatedReactions = message.reactions?.map(r => 
          r.emoji === emoji 
            ? { ...r, users: r.users.filter(u => u !== profile.id), count: r.count - 1 }
            : r
        ).filter(r => r.count > 0) || [];
      } else {
        // Add reaction
        if (existingReaction) {
          updatedReactions = message.reactions?.map(r => 
            r.emoji === emoji 
              ? { ...r, users: [...r.users, profile.id], count: r.count + 1 }
              : r
          ) || [];
        } else {
          updatedReactions = [
            ...(message.reactions || []),
            { emoji, users: [profile.id], count: 1 }
          ];
        }
      }
      
      // Optimistic update
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, reactions: updatedReactions } : m
      ));
      
      // Update database
      await supabase
        .from('messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);
        
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  // Get channel display name
  const getChannelDisplayName = (channel: Channel) => {
    if (channel.is_direct_message) {
      const otherMember = channel.channel_members?.find(
        member => member.user_id !== profile?.id
      );
      return otherMember?.profiles?.full_name || 'Direct Message';
    }
    return channel.name;
  };

  // Get channel display avatar
  const getChannelDisplayAvatar = (channel: Channel) => {
    if (channel.is_direct_message) {
      const otherMember = channel.channel_members?.find(
        member => member.user_id !== profile?.id
      );
      return otherMember?.profiles?.avatar_url;
    }
    return null;
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    const now = new Date();
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd HH:mm');
    }
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
        <div className="flex -space-x-1">
          {typingUsers.slice(0, 3).map((user) => (
            <Avatar key={user.user_id} className="h-5 w-5 border border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {typingUsers.length === 1 
              ? `${typingUsers[0].name} is typing`
              : typingUsers.length === 2
              ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing`
              : `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`
            }
          </span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  };

  // Render message with enhanced features
  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.sender_id === profile?.id;
    const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
    const showName = showAvatar || (index === 0 || differenceInMinutes(parseISO(message.created_at), parseISO(messages[index - 1].created_at)) > 5);

    return (
      <ContextMenu key={message.id}>
        <ContextMenuTrigger>
          <div className={cn(
            "group flex gap-3 py-1 px-4 hover:bg-muted/20 transition-colors",
            isOwn && "justify-end"
          )}>
            {!isOwn && (
              <div className="flex flex-col items-center w-10">
                {showAvatar ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender_avatar} />
                    <AvatarFallback className="text-xs">
                      {message.sender_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity">
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(message.created_at), 'HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className={cn(
              "flex flex-col min-w-0",
              isOwn ? "items-end max-w-[70%]" : "flex-1 max-w-[70%]"
            )}>
              {showName && !isOwn && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{message.sender_name}</span>
                  {message.sender_role && (
                    <Badge variant="outline" className="text-xs">
                      {message.sender_role}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
              )}
              
              {/* Reply indicator */}
              {message.reply_to && (
                <div className="mb-2 p-2 bg-muted/50 rounded border-l-2 border-primary/50 text-sm">
                  <div className="text-xs text-muted-foreground mb-1">
                    Replying to {message.reply_to}
                  </div>
                </div>
              )}
              
              <div className={cn(
                "rounded-2xl px-4 py-2 break-words transition-all",
                isOwn 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted",
                message.is_edited && "opacity-90"
              )}>
                {/* Message content */}
                {message.message_type === 'text' && (
                  <div className="whitespace-pre-wrap">
                    {message.content}
                    {message.is_edited && (
                      <span className="text-xs opacity-70 ml-2">(edited)</span>
                    )}
                  </div>
                )}
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id}>
                        {attachment.type.startsWith('image/') && (
                          <div className="rounded overflow-hidden max-w-sm">
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="w-full h-auto"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        {attachment.type.startsWith('audio/') && (
                          <div className="flex items-center gap-3 p-3 bg-background/10 rounded-lg">
                            <div className="p-2 bg-background/20 rounded-full">
                              <Volume2 className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Voice Message</div>
                              <div className="text-xs opacity-70">
                                {attachment.duration}s
                              </div>
                            </div>
                            <audio controls className="h-8">
                              <source src={attachment.url} type={attachment.type} />
                            </audio>
                          </div>
                        )}
                        
                        {!attachment.type.startsWith('image/') && !attachment.type.startsWith('audio/') && (
                          <div className="flex items-center gap-3 p-3 bg-background/10 rounded-lg">
                            <div className="p-2 bg-background/20 rounded-full">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{attachment.name}</div>
                              <div className="text-xs opacity-70">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                              <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Message status */}
                {isOwn && (
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">
                      {formatMessageTime(message.created_at)}
                    </span>
                    {message.delivery_status === 'sent' && <Check className="h-3 w-3 opacity-70" />}
                    {message.delivery_status === 'delivered' && <CheckCheck className="h-3 w-3 opacity-70" />}
                    {message.delivery_status === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
                  </div>
                )}
              </div>
              
              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.reactions.map((reaction, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-xs hover:bg-accent transition-colors",
                            reaction.users.includes(profile?.id || '') && "bg-primary/10 border-primary/20"
                          )}
                          onClick={() => toggleReaction(message.id, reaction.emoji)}
                        >
                          <span className="mr-1">{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          {reaction.users.slice(0, 5).map((userId, i) => {
                            const user = teamMembers.find(m => m.id === userId);
                            return user?.full_name || 'Unknown User';
                          }).join(', ')}
                          {reaction.users.length > 5 && ` and ${reaction.users.length - 5} others`}
                          {' reacted with '}{reaction.emoji}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
            
            {/* Message actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Smile className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" side="top">
                  <div className="flex gap-1">
                    {['👍', '❤️', '😂', '😮', '😢', '🎉'].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        onClick={() => toggleReaction(message.id, emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setReplyingTo({
                  id: message.id,
                  content: message.content,
                  sender_name: message.sender_name || '',
                  timestamp: message.created_at
                })}
              >
                <Reply className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setReplyingTo({
            id: message.id,
            content: message.content,
            sender_name: message.sender_name || '',
            timestamp: message.created_at
          })}>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </ContextMenuItem>
          
          {isOwn && (
            <>
              <ContextMenuItem onClick={() => setEditingMessage(message.id)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </ContextMenuItem>
              
              <ContextMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ContextMenuItem>
            </>
          )}
          
          <ContextMenuItem>
            <Flag className="h-4 w-4 mr-2" />
            Report
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading communication...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-[600px] bg-background border rounded-lg overflow-hidden relative">
        {/* Connection Status */}
        {connectionStatus !== 'connected' && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant={connectionStatus === 'connecting' ? 'default' : 'destructive'} className="animate-pulse">
              {connectionStatus === 'connecting' ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Connecting...
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-80 border-r bg-card flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Communication</h2>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSearch(!showSearch)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search messages</TooltipContent>
                </Tooltip>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Channel</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Channel name" />
                      <Textarea placeholder="Description (optional)" />
                      <div className="flex gap-2">
                        <Button className="flex-1">Create Public Channel</Button>
                        <Button variant="outline" className="flex-1">Create Private Channel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                {/* Favorites */}
                {channels.filter(ch => ch.is_favorite).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Favorites
                    </h3>
                    <div className="space-y-1">
                      {channels.filter(ch => ch.is_favorite).map((channel) => (
                        <Button
                          key={channel.id}
                          variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                          className="w-full justify-start relative"
                          onClick={() => setSelectedChannel(channel)}
                        >
                          {channel.is_direct_message ? (
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarImage src={getChannelDisplayAvatar(channel)} />
                              <AvatarFallback className="text-xs">
                                {getChannelDisplayName(channel).substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <>
                              {channel.type === 'private' ? (
                                <Lock className="h-4 w-4 mr-2" />
                              ) : (
                                <Hash className="h-4 w-4 mr-2" />
                              )}
                            </>
                          )}
                          
                          <div className="flex-1 text-left">
                            <div className="truncate">{getChannelDisplayName(channel)}</div>
                            {channel.last_message && (
                              <div className="text-xs text-muted-foreground truncate">
                                {channel.last_message.content}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            {channel.last_activity && (
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(channel.last_activity)}
                              </span>
                            )}
                            {channel.unread_count && channel.unread_count > 0 && (
                              <Badge className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                                {channel.unread_count}
                              </Badge>
                            )}
                            {channel.is_muted && (
                              <VolumeX className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public Channels */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Channels
                  </h3>
                  <div className="space-y-1">
                    {channels.filter(ch => !ch.is_direct_message && !ch.is_favorite).map((channel) => (
                      <Button
                        key={channel.id}
                        variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                        className="w-full justify-start relative"
                        onClick={() => setSelectedChannel(channel)}
                      >
                        {channel.type === 'private' ? (
                          <Lock className="h-4 w-4 mr-2" />
                        ) : (
                          <Hash className="h-4 w-4 mr-2" />
                        )}
                        
                        <div className="flex-1 text-left">
                          <div className="truncate">{channel.name}</div>
                          {channel.last_message && (
                            <div className="text-xs text-muted-foreground truncate">
                              {channel.last_message.sender_name}: {channel.last_message.content}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          {channel.last_activity && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(channel.last_activity)}
                            </span>
                          )}
                          {channel.unread_count && channel.unread_count > 0 && (
                            <Badge className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                              {channel.unread_count}
                            </Badge>
                          )}
                          {channel.is_muted && (
                            <VolumeX className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Direct Messages */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Direct Messages
                  </h3>
                  <div className="space-y-1">
                    {channels.filter(ch => ch.is_direct_message && !ch.is_favorite).map((channel) => (
                      <Button
                        key={channel.id}
                        variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                        className="w-full justify-start relative"
                        onClick={() => setSelectedChannel(channel)}
                      >
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage src={getChannelDisplayAvatar(channel)} />
                          <AvatarFallback className="text-xs">
                            {getChannelDisplayName(channel).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 text-left">
                          <div className="truncate">{getChannelDisplayName(channel)}</div>
                          {channel.last_message && (
                            <div className="text-xs text-muted-foreground truncate">
                              {channel.last_message.content}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          {channel.last_activity && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(channel.last_activity)}
                            </span>
                          )}
                          {channel.unread_count && channel.unread_count > 0 && (
                            <Badge className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                              {channel.unread_count}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members
                  </h3>
                  <div className="space-y-1">
                    {teamMembers
                      .filter(member => member.id !== profile?.id)
                      .sort((a, b) => {
                        if (a.is_online && !b.is_online) return -1;
                        if (!a.is_online && b.is_online) return 1;
                        return a.full_name.localeCompare(b.full_name);
                      })
                      .map((member) => (
                        <Button
                          key={member.id}
                          variant="ghost"
                          className="w-full justify-start relative"
                          onClick={() => startDirectMessage(member.id)}
                        >
                          <div className="relative">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {member.full_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                              member.is_online ? "bg-green-500" : "bg-gray-400"
                            )} />
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="truncate">{member.full_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {member.is_online ? (
                                <span className="text-green-600">Online</span>
                              ) : member.last_seen ? (
                                `Last seen ${formatDistanceToNow(parseISO(member.last_seen), { addSuffix: true })}`
                              ) : (
                                'Offline'
                              )}
                            </div>
                          </div>
                          
                          {member.status && member.status !== 'available' && (
                            <div className="flex items-center">
                              {member.status === 'busy' && <Circle className="h-2 w-2 fill-red-500 text-red-500" />}
                              {member.status === 'away' && <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />}
                              {member.status === 'do_not_disturb' && <Circle className="h-2 w-2 fill-red-600 text-red-600" />}
                            </div>
                          )}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
          <SheetContent side="left" className="w-80 p-0">
            {/* Same content as desktop sidebar but condensed */}
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Communication</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Simplified mobile layout */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Channels</h3>
                      <div className="space-y-1">
                        {channels.filter(ch => !ch.is_direct_message).map((channel) => (
                          <Button
                            key={channel.id}
                            variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedChannel(channel);
                              setShowSidebar(false);
                            }}
                          >
                            <Hash className="h-4 w-4 mr-2" />
                            {channel.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">People</h3>
                      <div className="space-y-1">
                        {teamMembers.filter(member => member.id !== profile?.id).map((member) => (
                          <Button
                            key={member.id}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              startDirectMessage(member.id);
                              setShowSidebar(false);
                            }}
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {member.full_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {member.full_name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Enhanced Chat Header */}
              <header className="p-4 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden"
                      onClick={() => setShowSidebar(true)}
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-3">
                      {selectedChannel.is_direct_message ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getChannelDisplayAvatar(selectedChannel)} />
                          <AvatarFallback>
                            {getChannelDisplayName(selectedChannel).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : selectedChannel.type === 'private' ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Hash className="h-5 w-5 text-muted-foreground" />
                      )}
                      
                      <div>
                        <h1 className="font-semibold text-lg">{getChannelDisplayName(selectedChannel)}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {selectedChannel.is_direct_message ? (
                            <>
                              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                              Online
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3" />
                              {selectedChannel.participant_count || selectedChannel.participant_ids?.length || 0} members
                            </>
                          )}
                          {selectedChannel.description && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-xs">{selectedChannel.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Start voice call</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Start video call</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowChannelInfo(true)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Channel info</TooltipContent>
                    </Tooltip>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56" align="end">
                        <div className="space-y-1">
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Add to favorites
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Archive className="h-4 w-4 mr-2" />
                            Archive channel
                          </Button>
                          <Separator />
                          <Button variant="ghost" className="w-full justify-start text-destructive" size="sm">
                            <Flag className="h-4 w-4 mr-2" />
                            Report channel
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </header>

              {/* Messages Area */}
              <main className="flex-1 relative">
                <ScrollArea className="h-full">
                  <div className="min-h-full flex flex-col">
                    {messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center max-w-md">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
                          <p className="text-muted-foreground">
                            This is the beginning of your conversation
                            {selectedChannel.is_direct_message 
                              ? ` with ${getChannelDisplayName(selectedChannel)}`
                              : ` in #${selectedChannel.name}`
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 py-4">
                        {messages.map((message, index) => renderMessage(message, index))}
                        {renderTypingIndicator()}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </main>

              {/* Message Input Area */}
              <footer className="p-4 border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                {/* Reply indicator */}
                {replyingTo && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-lg border-l-2 border-primary/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">
                          Replying to {replyingTo.sender_name}
                        </div>
                        <div className="text-sm truncate">{replyingTo.content}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                        className="h-6 w-6 p-0 shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Voice recording indicator */}
                {isRecordingVoice && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Recording...</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stopVoiceRecording}
                        className="text-red-600 border-red-200"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop & Send
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  {/* File upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach files</TooltipContent>
                  </Tooltip>
                  
                  {/* Message input */}
                  <div className="flex-1 relative">
                    <Textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => handleMessageChange(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={`Message ${selectedChannel.is_direct_message ? getChannelDisplayName(selectedChannel) : `#${selectedChannel.name}`}...`}
                      className="min-h-[44px] max-h-32 resize-none pr-12"
                      rows={1}
                    />
                    
                    {/* Emoji picker */}
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 bottom-2 h-6 w-6 p-0"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" side="top">
                        <div className="p-4">
                          <div className="grid grid-cols-8 gap-2">
                            {[
                              '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
                              '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
                              '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
                              '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
                              '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
                              '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
                              '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
                              '💯', '💥', '💫', '⭐', '🌟', '✨', '⚡', '🔥'
                            ].map((emoji) => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-accent"
                                onClick={() => {
                                  setNewMessage(prev => prev + emoji);
                                  setShowEmojiPicker(false);
                                }}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Voice recording */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onMouseDown={startVoiceRecording}
                        className="shrink-0"
                        disabled={isRecordingVoice}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Hold to record voice message</TooltipContent>
                  </Tooltip>
                  
                  {/* Send button */}
                  <Button 
                    onClick={() => sendMessage(newMessage)}
                    disabled={!newMessage.trim() && !isRecordingVoice}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Input hints */}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>**bold** • *italic* • `code`</span>
                    <span>@mention • #channel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {newMessage.length > 0 && (
                      <span className={newMessage.length > 1000 ? 'text-destructive' : ''}>
                        {newMessage.length}/1000
                      </span>
                    )}
                    <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘ ↵</kbd>
                    <span>to send</span>
                  </div>
                </div>
              </footer>
            </>
          ) : (
            // No channel selected
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden mb-6"
                  onClick={() => setShowSidebar(true)}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Open Channels
                </Button>
                
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-12 w-12 text-muted-foreground" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">Welcome to Communication</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a channel or start a direct message to begin chatting with your team
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Channel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create a new channel</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input placeholder="Channel name" />
                        <Textarea placeholder="Description (optional)" />
                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Globe className="h-4 w-4 mr-2" />
                            Public
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Lock className="h-4 w-4 mr-2" />
                            Private
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" onClick={() => setShowSidebar(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Browse People
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Channel Info Sheet */}
        <Sheet open={showChannelInfo} onOpenChange={setShowChannelInfo}>
          <SheetContent className="w-96">
            {selectedChannel && (
              <div className="space-y-6 py-6">
                <div className="text-center">
                  {selectedChannel.is_direct_message ? (
                    <Avatar className="h-16 w-16 mx-auto mb-4">
                      <AvatarImage src={getChannelDisplayAvatar(selectedChannel)} />
                      <AvatarFallback className="text-lg">
                        {getChannelDisplayName(selectedChannel).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {selectedChannel.type === 'private' ? (
                        <Lock className="h-8 w-8 text-primary" />
                      ) : (
                        <Hash className="h-8 w-8 text-primary" />
                      )}
                    </div>
                  )}
                  
                  <h2 className="text-xl font-semibold mb-2">
                    {getChannelDisplayName(selectedChannel)}
                  </h2>
                  
                  {selectedChannel.description && (
                    <p className="text-muted-foreground">{selectedChannel.description}</p>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Notifications</span>
                    <Switch defaultChecked={!selectedChannel.is_muted} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pin to favorites</span>
                    <Switch defaultChecked={selectedChannel.is_favorite} />
                  </div>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Search in channel
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share channel link
                  </Button>
                  
                  {selectedChannel.is_direct_message ? (
                    <Button variant="outline" className="w-full justify-start text-destructive">
                      <Flag className="h-4 w-4 mr-2" />
                      Report user
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full justify-start">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive channel
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Leave channel
                      </Button>
                    </>
                  )}
                </div>
                
                {selectedChannel.channel_members && selectedChannel.channel_members.length > 0 && (
                  <>
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">
                        Members ({selectedChannel.channel_members.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedChannel.channel_members.map((member) => (
                          <div key={member.user_id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.profiles?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {member.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {member.profiles?.full_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.role}
                              </div>
                            </div>
                            {member.role === 'admin' && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
