import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Reply, 
  MoreVertical,
  Pin,
  Star,
  Share,
  Flag,
  Edit3,
  Trash2,
  Heart,
  ThumbsUp,
  Smile,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Users,
  Eye,
  X,
  Plus,
  Minus,
  Send,
  Paperclip,
  Image,
  FileText,
  Video,
  Link2,
  Mic,
  Camera,
  Code,
  Hash,
  AtSign,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  Activity,
  BarChart3,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Archive,
  Bookmark,
  Tag,
  MapPin,
  Globe,
  Shield,
  Crown,
  Award,
  Target,
  Lightbulb,
  Brain,
  Sparkles,
  Settings,
  HelpCircle,
  MessageCircle,
  UserPlus,
  UserMinus,
  Volume2,
  VolumeX,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  FastForward,
  Rewind,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday, differenceInHours, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  userReacted?: boolean;
}

interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
  thumbnail?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    description?: string;
  };
}

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    department?: string;
    status?: 'online' | 'away' | 'busy' | 'offline';
  };
  timestamp: string;
  reactions?: Reaction[];
  attachments?: Attachment[];
  mentions?: string[];
  isEdited?: boolean;
  editedAt?: string;
  readBy?: { userId: string; readAt: string }[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  priority?: 'normal' | 'high' | 'urgent';
  tags?: string[];
}

interface ThreadMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    department?: string;
    status?: 'online' | 'away' | 'busy' | 'offline';
  };
  timestamp: string;
  reactions?: Reaction[];
  attachments?: Attachment[];
  mentions?: string[];
  replies?: Reply[];
  isPinned?: boolean;
  isStarred?: boolean;
  isBookmarked?: boolean;
  isEdited?: boolean;
  editedAt?: string;
  views?: number;
  readBy?: { userId: string; readAt: string }[];
  priority?: 'normal' | 'high' | 'urgent';
  sentiment?: 'positive' | 'negative' | 'neutral';
  tags?: string[];
  category?: string;
  threadStats?: {
    totalReplies: number;
    uniqueParticipants: number;
    lastActivity: string;
    avgResponseTime: number;
  };
}

interface ThreadedConversationProps {
  messages: ThreadMessage[];
  currentUserId?: string;
  availableUsers?: { id: string; name: string; avatar?: string }[];
  onReply?: (messageId: string, content: string, attachments?: File[]) => void;
  onReplyToReply?: (messageId: string, replyId: string, content: string) => void;
  onReact?: (messageId: string, emoji: string, isReply?: boolean, replyId?: string) => void;
  onPin?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  onBookmark?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string, isReply?: boolean, replyId?: string) => void;
  onDelete?: (messageId: string, isReply?: boolean, replyId?: string) => void;
  onShare?: (messageId: string) => void;
  onFlag?: (messageId: string, reason: string) => void;
  onTag?: (messageId: string, tags: string[]) => void;
  onMention?: (userId: string) => void;
  onFileUpload?: (files: File[]) => Promise<Attachment[]>;
  onVoiceRecord?: (audioBlob: Blob) => Promise<Attachment>;
  onMarkAsRead?: (messageId: string) => void;
  onStartThread?: (messageId: string) => void;
  enableRichText?: boolean;
  enableVoiceMessages?: boolean;
  enableFileSharing?: boolean;
  enableReactions?: boolean;
  enableThreading?: boolean;
  enableMentions?: boolean;
  enableSearch?: boolean;
  enableAnalytics?: boolean;
  maxDepth?: number;
  sortBy?: 'newest' | 'oldest' | 'priority' | 'engagement';
  filterBy?: 'all' | 'unread' | 'mentions' | 'starred' | 'bookmarked';
  isLoading?: boolean;
  className?: string;
}

interface ThreadStats {
  totalMessages: number;
  totalReplies: number;
  uniqueParticipants: number;
  avgResponseTime: number;
  engagementRate: number;
  topEmoji: string;
  peakActivity: string;
}

const commonReactions = [
  { emoji: '👍', label: 'Like', category: 'approval' },
  { emoji: '❤️', label: 'Love', category: 'emotion' },
  { emoji: '😂', label: 'Laugh', category: 'humor' },
  { emoji: '😮', label: 'Wow', category: 'surprise' },
  { emoji: '😢', label: 'Sad', category: 'emotion' },
  { emoji: '🎉', label: 'Celebrate', category: 'celebration' },
  { emoji: '🤔', label: 'Think', category: 'contemplation' },
  { emoji: '💯', label: 'Perfect', category: 'approval' },
  { emoji: '🔥', label: 'Fire', category: 'excitement' },
  { emoji: '⚡', label: 'Fast', category: 'speed' },
  { emoji: '🎯', label: 'Target', category: 'accuracy' },
  { emoji: '💡', label: 'Idea', category: 'insight' }
];

const flagReasons = [
  'Inappropriate content',
  'Spam or misleading',
  'Harassment',
  'Copyright violation',
  'Off-topic',
  'Technical issue',
  'Other'
];

export function ThreadedConversation({ 
  messages, 
  currentUserId,
  availableUsers = [],
  onReply,
  onReplyToReply,
  onReact, 
  onPin, 
  onStar,
  onBookmark,
  onEdit, 
  onDelete,
  onShare,
  onFlag,
  onTag,
  onMention,
  onFileUpload,
  onVoiceRecord,
  onMarkAsRead,
  onStartThread,
  enableRichText = true,
  enableVoiceMessages = true,
  enableFileSharing = true,
  enableReactions = true,
  enableThreading = true,
  enableMentions = true,
  enableSearch = false,
  enableAnalytics = false,
  maxDepth = 5,
  sortBy = 'newest',
  filterBy = 'all',
  isLoading = false,
  className
}: ThreadedConversationProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{ messageId: string; replyId?: string; authorName?: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ messageId: string; replyId?: string } | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'normal' | 'compact' | 'detailed'>('normal');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagDialog, setShowTagDialog] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagDialog, setShowFlagDialog] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder>();
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Enhanced thread statistics
  const threadStats = useMemo((): ThreadStats => {
    const totalMessages = messages.length;
    const totalReplies = messages.reduce((sum, msg) => sum + (msg.replies?.length || 0), 0);
    const allParticipants = new Set<string>();
    const allReactions: string[] = [];
    const responseTimes: number[] = [];

    messages.forEach(message => {
      allParticipants.add(message.author.id);
      message.reactions?.forEach(reaction => {
        for (let i = 0; i < reaction.count; i++) {
          allReactions.push(reaction.emoji);
        }
      });

      message.replies?.forEach(reply => {
        allParticipants.add(reply.author.id);
        const messageTime = new Date(message.timestamp).getTime();
        const replyTime = new Date(reply.timestamp).getTime();
        const responseTime = replyTime - messageTime;
        if (responseTime > 0) {
          responseTimes.push(responseTime);
        }

        reply.reactions?.forEach(reaction => {
          for (let i = 0; i < reaction.count; i++) {
            allReactions.push(reaction.emoji);
          }
        });
      });
    });

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const topEmoji = allReactions.length > 0 
      ? allReactions.reduce((acc, emoji) => {
          acc[emoji] = (acc[emoji] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {};

    const mostUsedEmoji = Object.entries(topEmoji).sort((a, b) => b[1] - a[1])[0]?.[0] || '👍';

    return {
      totalMessages,
      totalReplies,
      uniqueParticipants: allParticipants.size,
      avgResponseTime: Math.round(avgResponseTime / 60000), // Convert to minutes
      engagementRate: totalReplies > 0 ? (totalReplies / totalMessages) * 100 : 0,
      topEmoji: mostUsedEmoji,
      peakActivity: 'Morning' // This would be calculated from actual data
    };
  }, [messages]);

  // Enhanced filtering and sorting
  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages.filter(message => {
      if (searchQuery) {
        const matchesContent = message.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAuthor = message.author.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesReplies = message.replies?.some(reply => 
          reply.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reply.author.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (!matchesContent && !matchesAuthor && !matchesReplies) return false;
      }

      switch (filterBy) {
        case 'unread':
          return !message.readBy?.some(read => read.userId === currentUserId);
        case 'mentions':
          return message.mentions?.includes(currentUserId || '');
        case 'starred':
          return message.isStarred;
        case 'bookmarked':
          return message.isBookmarked;
        default:
          return true;
      }
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'priority':
          const priorityOrder = { urgent: 3, high: 2, normal: 1 };
          return (priorityOrder[b.priority || 'normal'] || 1) - (priorityOrder[a.priority || 'normal'] || 1);
        case 'engagement':
          const aEngagement = (a.reactions?.reduce((sum, r) => sum + r.count, 0) || 0) + (a.replies?.length || 0);
          const bEngagement = (b.reactions?.reduce((sum, r) => sum + r.count, 0) || 0) + (b.replies?.length || 0);
          return bEngagement - aEngagement;
        default: // newest
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    return filtered;
  }, [messages, searchQuery, filterBy, sortBy, currentUserId]);

  // Auto-expand threads with recent activity
  useEffect(() => {
    const recentlyActiveThreads = messages
      .filter(message => {
        const lastActivity = message.replies?.length > 0 
          ? Math.max(...message.replies.map(r => new Date(r.timestamp).getTime()))
          : new Date(message.timestamp).getTime();
        return Date.now() - lastActivity < 24 * 60 * 60 * 1000; // Last 24 hours
      })
      .map(message => message.id);

    setExpandedThreads(prev => new Set([...Array.from(prev), ...recentlyActiveThreads]));
  }, [messages]);

  // Focus management
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  // Voice recording functionality
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        if (onVoiceRecord) {
          const attachment = await onVoiceRecord(audioBlob);
          // Handle voice message attachment
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      clearInterval(recordingTimerRef.current);
      setRecordingDuration(0);
    }
  };

  const toggleThread = useCallback((messageId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedThreads(newExpanded);
  }, [expandedThreads]);

  const handleReply = useCallback(async (messageId: string, replyId?: string) => {
    if (!replyContent.trim()) return;

    let attachments: Attachment[] = [];
    if (selectedFiles.length > 0 && onFileUpload) {
      try {
        attachments = await onFileUpload(selectedFiles);
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Could not upload files",
          variant: "destructive"
        });
        return;
      }
    }

    if (replyId && onReplyToReply) {
      onReplyToReply(messageId, replyId, replyContent);
    } else if (onReply) {
      onReply(messageId, replyContent, selectedFiles);
    }

    setReplyContent('');
    setReplyingTo(null);
    setSelectedFiles([]);
    
    toast({
      title: "Reply sent",
      description: "Your reply has been posted successfully",
    });
  }, [replyContent, selectedFiles, onFileUpload, onReplyToReply, onReply, toast]);

  const handleEdit = useCallback((messageId: string, replyId?: string) => {
    if (!editContent.trim() || !onEdit) return;

    onEdit(messageId, editContent, !!replyId, replyId);
    setEditingMessage(null);
    setEditContent('');
    
    toast({
      title: "Message updated",
      description: "Your changes have been saved",
    });
  }, [editContent, onEdit, toast]);

  const startEdit = useCallback((messageId: string, currentContent: string, replyId?: string) => {
    setEditingMessage({ messageId, replyId });
    setEditContent(currentContent);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
    setEditContent('');
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleMentionInput = useCallback((text: string) => {
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery('');
    }
  }, []);

  const insertMention = useCallback((user: { id: string; name: string }) => {
    const currentText = replyContent;
    const mentionIndex = currentText.lastIndexOf('@' + mentionQuery);
    const newText = 
      currentText.substring(0, mentionIndex) + 
      `@${user.name} ` + 
      currentText.substring(mentionIndex + mentionQuery.length + 1);
    
    setReplyContent(newText);
    setShowMentionSuggestions(false);
    setMentionQuery('');
    textareaRef.current?.focus();
  }, [replyContent, mentionQuery]);

  const getPriorityColor = useCallback((priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-orange-50/20';
      case 'urgent': return 'border-l-red-500 bg-gradient-to-r from-red-50/50 to-red-50/20';
      default: return 'border-l-blue-500/30';
    }
  }, []);

  const getPriorityBadge = useCallback((priority?: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="secondary" className="text-orange-700 bg-orange-100 border-orange-200">
            <Zap className="h-3 w-3 mr-1" />
            High Priority
          </Badge>
        );
      case 'urgent':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" />
            Urgent
          </Badge>
        );
      default:
        return null;
    }
  }, []);

  const getSentimentColor = useCallback((sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-foreground';
    }
  }, []);

  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = differenceInHours(now, date);
    const diffInMinutes = differenceInMinutes(now, date);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
    return format(date, 'MMM d, HH:mm');
  }, []);

  const renderAttachment = useCallback((attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="relative rounded-lg overflow-hidden max-w-xs cursor-pointer group">
            <img 
              src={attachment.thumbnail || attachment.url} 
              alt={attachment.name}
              className="w-full h-auto transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="relative rounded-lg overflow-hidden max-w-xs">
            <video controls className="w-full">
              <source src={attachment.url} />
            </video>
          </div>
        );
      case 'audio':
        return (
          <Card className="w-80 p-3 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0">
                <PlayCircle className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <div className="text-sm font-medium">{attachment.name}</div>
                <div className="text-xs text-muted-foreground">
                  {attachment.metadata?.duration ? `${Math.floor(attachment.metadata.duration / 60)}:${(attachment.metadata.duration % 60).toString().padStart(2, '0')}` : 'Audio message'}
                </div>
                <Progress value={0} className="h-1 mt-1" />
              </div>
            </div>
          </Card>
        );
      case 'document':
        return (
          <Card className="max-w-xs hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{attachment.name}</div>
                {attachment.size && (
                  <div className="text-xs text-muted-foreground">
                    {(attachment.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      case 'link':
        return (
          <Card className="max-w-sm hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Link2 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{attachment.name}</div>
                  {attachment.metadata?.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {attachment.metadata.description}
                    </div>
                  )}
                  <div className="text-xs text-blue-500 truncate mt-1">
                    {attachment.url}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  }, []);

  const renderReactions = useCallback((reactions: Reaction[], messageId: string, isReply = false, replyId?: string) => {
    if (!reactions || reactions.length === 0 || !enableReactions) return null;

    return (
      <div className="flex gap-1 flex-wrap mt-2">
        {reactions.map((reaction, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs transition-all duration-200 hover:scale-105",
                  reaction.userReacted ? "bg-blue-50 border-blue-200 text-blue-700" : "hover:bg-accent"
                )}
                onClick={() => onReact?.(messageId, reaction.emoji, isReply, replyId)}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                {reaction.users.slice(0, 3).join(', ')}
                {reaction.users.length > 3 && ` and ${reaction.users.length - 3} more`}
                {' reacted with ' + reaction.emoji}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {/* Add reaction button */}
        <Popover open={showEmojiPicker === messageId} onOpenChange={(open) => setShowEmojiPicker(open ? messageId : null)}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" side="top">
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">Quick reactions</div>
              <div className="grid grid-cols-6 gap-2">
                {commonReactions.map((reaction) => (
                  <Tooltip key={reaction.emoji}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent transition-colors"
                        onClick={() => {
                          onReact?.(messageId, reaction.emoji, isReply, replyId);
                          setShowEmojiPicker(null);
                        }}
                      >
                        <span className="text-base">{reaction.emoji}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{reaction.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }, [enableReactions, onReact, showEmojiPicker]);

  const renderMessageActions = useCallback((message: ThreadMessage, isReply = false, reply?: Reply) => {
    if (!allowMessageActions) return null;

    const targetMessage = reply || message;
    const isOwn = targetMessage.author.id === currentUserId;

    return (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 mt-2">
        {/* Quick reaction */}
        <Popover open={showEmojiPicker === targetMessage.id} onOpenChange={(open) => setShowEmojiPicker(open ? targetMessage.id : null)}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Smile className="h-3 w-3 mr-1" />
              React
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              {commonReactions.slice(0, 6).map((reaction) => (
                <Button
                  key={reaction.emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-accent"
                  onClick={() => {
                    onReact?.(message.id, reaction.emoji, isReply, reply?.id);
                    setShowEmojiPicker(null);
                  }}
                >
                  {reaction.emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Separator orientation="vertical" className="h-4" />
        
        {/* Reply */}
        {enableThreading && !isReply && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setReplyingTo({ 
              messageId: message.id, 
              authorName: message.author.name 
            })}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}

        {isReply && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setReplyingTo({ 
              messageId: message.id, 
              replyId: reply?.id,
              authorName: reply?.author.name 
            })}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}
        
        {/* Pin/Star */}
        {!isReply && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs",
                message.isPinned && "text-blue-600 bg-blue-50"
              )}
              onClick={() => onPin?.(message.id)}
            >
              <Pin className="h-3 w-3 mr-1" />
              {message.isPinned ? 'Unpin' : 'Pin'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs",
                message.isStarred && "text-yellow-600 bg-yellow-50"
              )}
              onClick={() => onStar?.(message.id)}
            >
              <Star className="h-3 w-3 mr-1" />
              {message.isStarred ? 'Unstar' : 'Star'}
            </Button>
          </>
        )}
        
        {/* More actions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" side="top" align="end">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={() => onShare?.(message.id)}
              >
                <Share className="h-3 w-3 mr-2" />
                Share
              </Button>
              
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start h-8",
                    message.isBookmarked && "text-blue-600"
                  )}
                  onClick={() => onBookmark?.(message.id)}
                >
                  <Bookmark className="h-3 w-3 mr-2" />
                  {message.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={() => setShowTagDialog(message.id)}
              >
                <Tag className="h-3 w-3 mr-2" />
                Add tags
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={() => {
                  navigator.clipboard.writeText(targetMessage.content);
                  toast({ title: "Copied to clipboard" });
                }}
              >
                <Copy className="h-3 w-3 mr-2" />
                Copy text
              </Button>
              
              {isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8"
                  onClick={() => startEdit(message.id, targetMessage.content, reply?.id)}
                >
                  <Edit3 className="h-3 w-3 mr-2" />
                  Edit
                </Button>
              )}
              
              <Separator />
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                onClick={() => setShowFlagDialog(message.id)}
              >
                <Flag className="h-3 w-3 mr-2" />
                Report
              </Button>
              
              {(isOwn || currentUserId === 'admin') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete?.(message.id, isReply, reply?.id)}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }, [currentUserId, enableThreading, onPin, onStar, onBookmark, onShare, onDelete, startEdit, toast, showEmojiPicker, onReact]);

  const renderReplyInput = useCallback(() => {
    if (!replyingTo) return null;

    const filteredUsers = enableMentions ? availableUsers.filter(user => 
      user.name.toLowerCase().includes(mentionQuery.toLowerCase())
    ) : [];

    return (
      <Card className="mt-4 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Reply className="h-3 w-3" />
              Replying to {replyingTo.authorName}
              {replyingTo.replyId && <span>in thread</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyingTo(null);
                setReplyContent('');
                setSelectedFiles([]);
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Rich text editor */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder={`Reply to ${replyingTo.authorName}... Use @ to mention someone`}
              value={replyContent}
              onChange={(e) => {
                setReplyContent(e.target.value);
                if (enableMentions) {
                  handleMentionInput(e.target.value);
                }
              }}
              className="min-h-[80px] resize-none pr-12 bg-background/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleReply(replyingTo.messageId, replyingTo.replyId);
                }
              }}
            />

            {/* Mention suggestions */}
            {showMentionSuggestions && filteredUsers.length > 0 && (
              <Card className="absolute bottom-full left-0 right-0 mb-2 shadow-lg z-10">
                <CardContent className="p-2 max-h-32 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => insertMention(user)}
                    >
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Voice recording button */}
            {enableVoiceMessages && (
              <div className="absolute right-2 bottom-2">
                {isRecordingVoice ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopVoiceRecording}
                    className="h-8 px-2 text-xs bg-red-50 border-red-200 text-red-600"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    {formatDuration(recordingDuration)}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startVoiceRecording}
                    className="h-8 w-8 p-0"
                  >
                    <Mic className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* File attachments */}
          {enableFileSharing && (
            <div className="space-y-2">
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded text-xs">
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-24">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedFile(index)}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
            </div>
          )}

          {/* Reply actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {enableFileSharing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-2 text-xs"
                >
                  <Paperclip className="h-3 w-3 mr-1" />
                  Attach
                </Button>
              )}

              {enableRichText && (
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <bold className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <i className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Code className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground hidden sm:block">
                {process.platform === 'darwin' ? '⌘' : 'Ctrl'}+Enter to send
              </div>
              <Button 
                size="sm" 
                onClick={() => handleReply(replyingTo.messageId, replyingTo.replyId)}
                disabled={!replyContent.trim() && selectedFiles.length === 0}
                className="h-8 px-3"
              >
                <Send className="h-3 w-3 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [replyingTo, replyContent, selectedFiles, enableMentions, enableVoiceMessages, enableFileSharing, enableRichText, showMentionSuggestions, availableUsers, mentionQuery, isRecordingVoice, recordingDuration, handleReply, handleMentionInput, insertMention, removeSelectedFile, startVoiceRecording, stopVoiceRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div>
            <p className="font-medium">Loading conversation...</p>
            <p className="text-sm text-muted-foreground">Fetching threaded messages</p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredAndSortedMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {searchQuery ? 'No messages found' : 'No messages yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? `No messages match "${searchQuery}". Try adjusting your search.`
                : 'Start a conversation to see threaded messages here'
              }
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
              className="mt-4"
            >
              Clear search
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Enhanced Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-lg">
                Conversation ({filteredAndSortedMessages.length})
              </h2>
              
              {enableAnalytics && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {threadStats.uniqueParticipants}
                  </div>
                  <div className="flex items-center gap-1">
                    <Reply className="h-3 w-3" />
                    {threadStats.totalReplies}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {Math.round(threadStats.engagementRate)}%
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              {enableSearch && (
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-3 h-8 w-48 text-xs"
                  />
                </div>
              )}

              {/* View mode */}
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter */}
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="mentions">Mentions</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                  <SelectItem value="bookmarked">Bookmarked</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {filteredAndSortedMessages.map((message) => (
              <div key={message.id} className="group relative">
                {/* Main Message */}
                <Card className={cn(
                  "transition-all duration-200 border-l-4",
                  "hover:shadow-lg hover:shadow-primary/5",
                  message.isPinned && "bg-gradient-to-r from-blue-50/50 to-blue-50/20 border-blue-200 shadow-sm",
                  message.isStarred && "bg-gradient-to-r from-yellow-50/50 to-yellow-50/20",
                  getPriorityColor(message.priority),
                  viewMode === 'compact' && "shadow-none hover:shadow-md",
                  !message.readBy?.some(read => read.userId === currentUserId) && "ring-1 ring-primary/20"
                )}>
                  <CardContent className={cn("p-5", viewMode === 'compact' && "p-3")}>
                    <div className="flex gap-4">
                      {/* Avatar with status */}
                      <div className="relative">
                        <Avatar className={cn(
                          "ring-2 ring-background shadow-sm transition-all duration-200 group-hover:ring-primary/20",
                          viewMode === 'compact' ? "h-8 w-8" : "h-10 w-10"
                        )}>
                          <AvatarImage src={message.author.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {message.author.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Online status */}
                        {message.author.status === 'online' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Enhanced Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={cn(
                              "font-semibold",
                              getSentimentColor(message.sentiment),
                              viewMode === 'compact' ? "text-sm" : "text-base"
                            )}>
                              {message.author.name}
                            </span>
                            
                            {message.author.role && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {message.author.role}
                              </Badge>
                            )}
                            
                            {message.author.department && viewMode === 'detailed' && (
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                {message.author.department}
                              </Badge>
                            )}
                            
                            {getPriorityBadge(message.priority)}
                            
                            {message.tags && message.tags.length > 0 && (
                              <div className="flex gap-1">
                                {message.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                    #{tag}
                                  </Badge>
                                ))}
                                {message.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    +{message.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(message.timestamp)}</span>
                              {message.isEdited && (
                                <span className="text-orange-600">(edited)</span>
                              )}
                            </div>
                            
                            {/* Status indicators */}
                            <div className="flex items-center gap-1">
                              {message.isPinned && (
                                <Pin className="h-4 w-4 text-blue-600" />
                              )}
                              {message.isStarred && (
                                <Star className="h-4 w-4 text-yellow-600 fill-current" />
                              )}
                              {message.isBookmarked && (
                                <Bookmark className="h-4 w-4 text-purple-600" />
                              )}
                              {message.views && message.views > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Eye className="h-3 w-3" />
                                  {message.views}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Content */}
                        {editingMessage?.messageId === message.id && !editingMessage.replyId ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[80px] resize-none"
                              placeholder="Edit your message..."
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleEdit(message.id)}
                                disabled={!editContent.trim()}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className={cn(
                              "prose prose-sm max-w-none",
                              viewMode === 'compact' && "text-sm leading-relaxed"
                            )}>
                              <p className="whitespace-pre-wrap text-foreground">
                                {message.content}
                              </p>
                            </div>
                            
                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="space-y-2 mt-3">
                                {message.attachments.map((attachment) => (
                                  <div key={attachment.id}>
                                    {renderAttachment(attachment)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Enhanced Reactions */}
                        {renderReactions(message.reactions || [], message.id)}
                        
                        {/* Read receipts */}
                        {viewMode === 'detailed' && message.readBy && message.readBy.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex -space-x-1">
                              {message.readBy.slice(0, 3).map((read) => (
                                <Avatar key={read.userId} className="h-4 w-4 border border-background">
                                  <AvatarFallback className="text-xs">
                                    {availableUsers.find(u => u.id === read.userId)?.name.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Read by {message.readBy.length} {message.readBy.length === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        {renderMessageActions(message)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Thread Replies */}
                {enableThreading && message.replies && message.replies.length > 0 && (
                  <div className="ml-14 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleThread(message.id)}
                      className={cn(
                        "text-sm hover:bg-primary/5 transition-colors mb-3",
                        expandedThreads.has(message.id) ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {expandedThreads.has(message.id) ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                      {message.threadStats && (
                        <span className="text-muted-foreground ml-2">
                          • {message.threadStats.uniqueParticipants} participants
                        </span>
                      )}
                    </Button>
                    
                    {expandedThreads.has(message.id) && (
                      <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                        {message.replies.map((reply) => (
                          <Card key={reply.id} className="group/reply transition-all duration-200 hover:shadow-md hover:shadow-primary/5">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <Avatar className="h-8 w-8 ring-1 ring-primary/10">
                                  <AvatarImage src={reply.author.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-xs font-semibold">
                                    {reply.author.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-sm">{reply.author.name}</span>
                                    {reply.author.role && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                                        {reply.author.role}
                                      </Badge>
                                    )}
                                    {getPriorityBadge(reply.priority)}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{formatTimestamp(reply.timestamp)}</span>
                                      {reply.isEdited && <span>(edited)</span>}
                                    </div>
                                  </div>
                                  
                                  {/* Reply Content */}
                                  {editingMessage?.messageId === message.id && editingMessage.replyId === reply.id ? (
                                    <div className="space-y-3">
                                      <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="min-h-[60px] resize-none text-sm"
                                        placeholder="Edit your reply..."
                                      />
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleEdit(message.id, reply.id)}
                                          disabled={!editContent.trim()}
                                        >
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Save
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={cancelEdit}
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="text-sm leading-relaxed">
                                        {reply.content}
                                      </div>
                                      
                                      {/* Reply Attachments */}
                                      {reply.attachments && reply.attachments.length > 0 && (
                                        <div className="space-y-2">
                                          {reply.attachments.map((attachment) => (
                                            <div key={attachment.id}>
                                              {renderAttachment(attachment)}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Reply Reactions */}
                                  {renderReactions(reply.reactions || [], message.id, true, reply.id)}

                                  {/* Reply Actions */}
                                  {renderMessageActions(message, true, reply)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Reply Input */}
        {renderReplyInput()}

        {/* Flag Dialog */}
        <Dialog open={showFlagDialog !== null} onOpenChange={() => setShowFlagDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for reporting</label>
                <Select value={flagReason} onValueChange={setFlagReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {flagReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFlagDialog(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (showFlagDialog && flagReason) {
                      onFlag?.(showFlagDialog, flagReason);
                      setShowFlagDialog(null);
                      setFlagReason('');
                    }
                  }}
                  disabled={!flagReason}
                >
                  Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tag Dialog */}
        <Dialog open={showTagDialog !== null} onOpenChange={() => setShowTagDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tags</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  placeholder="important, follow-up, project-alpha"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowTagDialog(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (showTagDialog && tagInput.trim()) {
                      const tags = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
                      onTag?.(showTagDialog, tags);
                      setShowTagDialog(null);
                      setTagInput('');
                    }
                  }}
                  disabled={!tagInput.trim()}
                >
                  Add Tags
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
