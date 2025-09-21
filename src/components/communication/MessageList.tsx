import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  MoreHorizontal, 
  Reply, 
  Heart, 
  Pin, 
  Copy,
  Trash2,
  Edit3,
  CheckCheck,
  Check,
  Clock,
  Send,
  AlertCircle,
  Search,
  Calendar,
  User,
  Globe,
  Lock,
  Hash,
  Star,
  Bookmark,
  Share2,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Zap,
  Flag,
  Shield,
  Crown,
  Activity,
  MousePointer,
  Image,
  File,
  Video,
  Mic,
  Paperclip,
  Link,
  Code,
  Quote,
  Smile,
  AtSign,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Users,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Archive,
  Loader2,
  Sparkles,
  Bot,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus,
  Plus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow, isThisWeek, isThisYear } from 'date-fns';

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
  };
}

interface MessageThread {
  id: string;
  replyCount: number;
  lastReplyAt?: string;
  participants: string[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  sender_name?: string;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  is_pinned?: boolean;
  is_starred?: boolean;
  is_urgent?: boolean;
  is_private?: boolean;
  is_ai_generated?: boolean;
  reactions?: Reaction[];
  attachments?: Attachment[];
  reply_to?: string;
  thread?: MessageThread;
  message_type?: 'text' | 'system' | 'file' | 'call' | 'meeting' | 'poll' | 'reminder';
  delivery_status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  read_by?: { user_id: string; read_at: string }[];
  mentions?: string[];
  tags?: string[];
  scheduled_at?: string;
  expires_at?: string;
  sender_profile?: {
    id?: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
    status?: 'online' | 'away' | 'busy' | 'offline';
    title?: string;
    department?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  typingUsers?: { user_id: string; user_name: string; avatar?: string }[];
  onLoadMore?: () => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  onFlag?: (messageId: string) => void;
  onCopy?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
  onOpenThread?: (messageId: string) => void;
  onMentionClick?: (userId: string) => void;
  onLinkClick?: (url: string) => void;
  onImagePreview?: (imageUrl: string) => void;
  enableVirtualization?: boolean;
  showReadReceipts?: boolean;
  showTypingIndicator?: boolean;
  allowMessageActions?: boolean;
  compactMode?: boolean;
  searchQuery?: string;
  highlightedMessageId?: string;
  className?: string;
}

export function MessageList({ 
  messages, 
  currentUserId,
  isLoading = false,
  hasMore = false,
  typingUsers = [],
  onLoadMore,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onPin,
  onStar,
  onFlag,
  onCopy,
  onShare,
  onOpenThread,
  onMentionClick,
  onLinkClick,
  onImagePreview,
  enableVirtualization = true,
  showReadReceipts = true,
  showTypingIndicator = true,
  allowMessageActions = true,
  compactMode = false,
  searchQuery = '',
  highlightedMessageId,
  className
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'normal' | 'compact' | 'detailed'>('normal');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'files' | 'links' | 'mentions'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'sender' | 'reactions'>('time');

  // Enhanced auto-scroll with user control
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_id === currentUserId) {
        scrollToBottom();
      }
    }
  }, [messages, currentUserId, scrollToBottom]);

  // Scroll position monitoring
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom);

      // Load more messages when scrolled to top
      if (scrollTop < 100 && hasMore && onLoadMore && !isLoading) {
        onLoadMore();
      }
    }
  }, [hasMore, onLoadMore, isLoading]);

  // Enhanced search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = messages
        .filter(message => 
          message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          message.sender_profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(message => message.id);
      setSearchResults(results);
      setCurrentSearchIndex(0);
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(0);
    }
  }, [searchQuery, messages]);

  // Group messages by date for enhanced organization
  const messagesByDate = useMemo(() => {
    let filteredMessages = messages;

    // Apply filters
    if (filterType !== 'all') {
      filteredMessages = messages.filter(message => {
        switch (filterType) {
          case 'images':
            return message.attachments?.some(att => att.type === 'image');
          case 'files':
            return message.attachments?.some(att => att.type === 'document');
          case 'links':
            return message.attachments?.some(att => att.type === 'link') || 
                   message.content.includes('http');
          case 'mentions':
            return message.mentions?.includes(currentUserId || '');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sortBy !== 'time') {
      filteredMessages = [...filteredMessages].sort((a, b) => {
        switch (sortBy) {
          case 'sender':
            return (a.sender_profile?.full_name || '').localeCompare(b.sender_profile?.full_name || '');
          case 'reactions':
            const aReactionCount = a.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
            const bReactionCount = b.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
            return bReactionCount - aReactionCount;
          default:
            return 0;
        }
      });
    }

    const grouped: { [date: string]: Message[] } = {};
    filteredMessages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(message);
    });
    return grouped;
  }, [messages, filterType, sortBy, currentUserId]);

  // Enhanced date formatting
  const formatDateSeparator = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE'); // Day name
    } else if (isThisYear(date)) {
      return format(date, 'MMMM d'); // Month and day
    } else {
      return format(date, 'MMMM d, yyyy'); // Full date
    }
  }, []);

  // Enhanced time formatting
  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'HH:mm');
  }, []);

  // Message grouping logic
  const shouldShowAvatar = useCallback((message: Message, index: number, dayMessages: Message[]) => {
    if (isOwnMessage(message)) return false;
    if (compactMode) return false;
    return index === 0 || 
           dayMessages[index - 1].sender_id !== message.sender_id ||
           new Date(message.created_at).getTime() - new Date(dayMessages[index - 1].created_at).getTime() > 300000;
  }, [compactMode]);

  const shouldShowTimestamp = useCallback((message: Message, index: number, dayMessages: Message[]) => {
    const nextMessage = dayMessages[index + 1];
    return !nextMessage || 
           nextMessage.sender_id !== message.sender_id ||
           new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime() > 300000;
  }, []);

  const shouldShowSenderName = useCallback((message: Message, index: number, dayMessages: Message[]) => {
    if (isOwnMessage(message) || compactMode) return false;
    return shouldShowAvatar(message, index, dayMessages);
  }, [compactMode, shouldShowAvatar]);

  const getSenderName = useCallback((message: Message) => {
    if (message.sender_profile?.full_name) {
      return message.sender_profile.full_name;
    }
    if (message.sender_name) {
      return message.sender_name;
    }
    return 'Unknown User';
  }, []);

  const isOwnMessage = useCallback((message: Message) => {
    return message.sender_id === currentUserId;
  }, [currentUserId]);

  // Enhanced delivery status
  const getDeliveryStatusIcon = useCallback((message: Message) => {
    if (!isOwnMessage(message)) return null;
    
    switch (message.delivery_status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  }, [isOwnMessage]);

  // Enhanced message content rendering
  const renderMessageContent = useCallback((message: Message) => {
    if (message.deleted_at) {
      return (
        <div className="italic text-muted-foreground text-sm flex items-center gap-2">
          <Trash2 className="h-3 w-3" />
          This message was deleted
        </div>
      );
    }

    if (message.message_type === 'system') {
      return (
        <div className="text-center bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 inline-block mr-2" />
          {message.content}
        </div>
      );
    }

    let content = message.content;
    
    // Highlight search results
    if (searchQuery && content.toLowerCase().includes(searchQuery.toLowerCase())) {
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      content = content.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    }

    return (
      <div className="space-y-2">
        {/* Message indicators */}
        <div className="flex items-center gap-1 mb-2">
          {message.is_urgent && (
            <Badge variant="destructive" className="text-xs h-4 px-1">
              <Zap className="h-2 w-2 mr-1" />
              Urgent
            </Badge>
          )}
          {message.is_private && (
            <Badge variant="secondary" className="text-xs h-4 px-1">
              <Lock className="h-2 w-2 mr-1" />
              Private
            </Badge>
          )}
          {message.is_ai_generated && (
            <Badge variant="secondary" className="text-xs h-4 px-1 bg-purple-100 text-purple-700">
              <Bot className="h-2 w-2 mr-1" />
              AI
            </Badge>
          )}
          {message.scheduled_at && new Date(message.scheduled_at) > new Date() && (
            <Badge variant="outline" className="text-xs h-4 px-1">
              <Calendar className="h-2 w-2 mr-1" />
              Scheduled
            </Badge>
          )}
        </div>

        {/* Reply context */}
        {message.reply_to && (
          <div className="text-xs text-muted-foreground mb-2 pl-3 border-l-2 border-muted-foreground/30 bg-muted/20 rounded-r p-2">
            <div className="flex items-center gap-1 mb-1">
              <Reply className="h-3 w-3" />
              <span>Replying to message</span>
            </div>
            <div className="truncate opacity-80">
              {/* Find and display the replied message content */}
              {messages.find(m => m.id === message.reply_to)?.content || 'Original message'}
            </div>
          </div>
        )}

        {/* Main content */}
        <div 
          className="text-sm whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mt-3">
            {message.attachments.map((attachment) => (
              <div key={attachment.id}>
                {attachment.type === 'image' && (
                  <div 
                    className="relative rounded-lg overflow-hidden cursor-pointer max-w-xs hover:opacity-90 transition-opacity"
                    onClick={() => onImagePreview?.(attachment.url)}
                  >
                    <img 
                      src={attachment.thumbnail || attachment.url} 
                      alt={attachment.name}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
                    </div>
                  </div>
                )}
                
                {attachment.type === 'video' && (
                  <div className="relative rounded-lg overflow-hidden max-w-xs">
                    <video controls className="w-full">
                      <source src={attachment.url} />
                    </video>
                  </div>
                )}

                {attachment.type === 'document' && (
                  <Card className="max-w-xs hover:bg-accent/50 transition-colors">
                    <CardContent className="p-3 flex items-center gap-3">
                      <File className="h-8 w-8 text-blue-500" />
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
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edited indicator */}
        {message.edited_at && (
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Edit3 className="h-3 w-3" />
            <span>Edited {formatDistanceToNow(new Date(message.edited_at))} ago</span>
          </div>
        )}

        {/* Expiration warning */}
        {message.expires_at && new Date(message.expires_at) > new Date() && (
          <div className="text-xs text-orange-600 mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>
              Expires in {formatDistanceToNow(new Date(message.expires_at))}
            </span>
          </div>
        )}
      </div>
    );
  }, [searchQuery, messages, onImagePreview]);

  // Enhanced message actions
  const renderMessageActions = useCallback((message: Message) => {
    if (!allowMessageActions) return null;

    const isOwn = isOwnMessage(message);
    
    return (
      <div className={cn(
        "absolute top-0 opacity-0 group-hover/message:opacity-100 transition-all duration-200 flex items-center gap-1 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg px-1 py-1 z-10",
        isOwn ? "-left-20" : "-right-20"
      )}>
        <TooltipProvider>
          {/* Quick reactions */}
          <div className="flex items-center gap-0.5 pr-1 border-r">
            {['👍', '❤️', '😊', '🎉'].map((emoji) => (
              <Tooltip key={emoji}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReact?.(message.id, emoji)}
                    className="h-6 w-6 p-0 text-xs hover:bg-accent"
                  >
                    {emoji}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>React with {emoji}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Action buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(message.id)}
                className="h-6 w-6 p-0"
              >
                <Reply className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>

          {message.thread && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenThread?.(message.id)}
                  className="h-6 w-6 p-0 relative"
                >
                  <MessageCircle className="h-3 w-3" />
                  {message.thread.replyCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 text-[8px]">
                      {message.thread.replyCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>View thread ({message.thread.replyCount} replies)</TooltipContent>
            </Tooltip>
          )}

          {/* More actions */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="center">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy?.(message.id)}
                  className="w-full justify-start gap-2 h-8"
                >
                  <Copy className="h-3 w-3" />
                  Copy text
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStar?.(message.id)}
                  className="w-full justify-start gap-2 h-8"
                >
                  <Star className={cn("h-3 w-3", message.is_starred && "fill-current text-yellow-500")} />
                  {message.is_starred ? 'Unstar' : 'Star'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPin?.(message.id)}
                  className="w-full justify-start gap-2 h-8"
                >
                  <Pin className={cn("h-3 w-3", message.is_pinned && "fill-current text-blue-500")} />
                  {message.is_pinned ? 'Unpin' : 'Pin'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShare?.(message.id)}
                  className="w-full justify-start gap-2 h-8"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </Button>

                <Separator />

                {isOwn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(message.id)}
                    className="w-full justify-start gap-2 h-8"
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFlag?.(message.id)}
                  className="w-full justify-start gap-2 h-8 text-orange-600 hover:text-orange-600"
                >
                  <Flag className="h-3 w-3" />
                  Report
                </Button>

                {(isOwn || currentUserId === 'admin') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(message.id)}
                    className="w-full justify-start gap-2 h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </TooltipProvider>
      </div>
    );
  }, [allowMessageActions, isOwnMessage, currentUserId, onReact, onReply, onOpenThread, onCopy, onStar, onPin, onShare, onEdit, onFlag, onDelete]);

  // Enhanced reactions rendering
  const renderReactions = useCallback((reactions: Reaction[]) => {
    if (!reactions || reactions.length === 0) return null;

    return (
      <div className="flex gap-1 mt-2 flex-wrap">
        {reactions.map((reaction, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReact?.(reaction.emoji, reaction.emoji)}
                className={cn(
                  "h-6 px-2 text-xs transition-all duration-200 hover:scale-105",
                  reaction.userReacted ? "bg-primary/10 border-primary/20" : "hover:bg-accent"
                )}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                {reaction.users.slice(0, 3).join(', ')}
                {reaction.users.length > 3 && ` and ${reaction.users.length - 3} more`}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }, [onReact]);

  // Enhanced read receipts
  const renderReadReceipts = useCallback((message: Message) => {
    if (!showReadReceipts || !message.read_by || message.read_by.length === 0) return null;

    const readByOthers = message.read_by.filter(r => r.user_id !== currentUserId);
    if (readByOthers.length === 0) return null;

    return (
      <div className="flex items-center gap-1 mt-1">
        <div className="flex -space-x-1">
          {readByOthers.slice(0, 3).map((readBy) => (
            <Avatar key={readBy.user_id} className="h-3 w-3 border border-background">
              <AvatarImage src={messages.find(m => m.sender_id === readBy.user_id)?.sender_profile?.avatar_url} />
              <AvatarFallback className="text-[8px]">
                {messages.find(m => m.sender_id === readBy.user_id)?.sender_profile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {readByOthers.length === 1 ? 'Seen' : `Seen by ${readByOthers.length}`}
        </span>
      </div>
    );
  }, [showReadReceipts, currentUserId, messages]);

  // Typing indicator component
  const TypingIndicator = useCallback(() => {
    if (!showTypingIndicator || typingUsers.length === 0) return null;

    return (
      <div className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground">
        <div className="flex -space-x-1">
          {typingUsers.slice(0, 3).map((user) => (
            <Avatar key={user.user_id} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs">
                {user.user_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>
            {typingUsers.length === 1 
              ? `${typingUsers[0].user_name} is typing...`
              : `${typingUsers.length} people are typing...`
            }
          </span>
        </div>
      </div>
    );
  }, [showTypingIndicator, typingUsers]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">Start the conversation!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex-1 relative", className)}>
        {/* Toolbar */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'normal' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('normal')}
                  className="h-7 px-2 text-xs"
                >
                  Normal
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="h-7 px-2 text-xs"
                >
                  Compact
                </Button>
                <Button
                  variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('detailed')}
                  className="h-7 px-2 text-xs"
                >
                  Detailed
                </Button>
              </div>

              <Separator orientation="vertical" className="h-4" />

              {/* Filter and sort */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Show messages with:</div>
                    {['all', 'images', 'files', 'links', 'mentions'].map((filter) => (
                      <Button
                        key={filter}
                        variant={filterType === filter ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterType(filter as any)}
                        className="w-full justify-start text-xs h-7"
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              {/* Search navigation */}
              {searchResults.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{currentSearchIndex + 1} of {searchResults.length}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {selectedMessages.size > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {selectedMessages.size} selected
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea 
          ref={messagesContainerRef}
          className="flex-1"
          onScrollCapture={handleScroll}
        >
          <div className="px-6 py-4">
            {/* Loading indicator at top */}
            {isLoading && hasMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {Object.entries(messagesByDate).map(([dateString, dayMessages]) => (
              <div key={dateString} className="space-y-1">
                {/* Enhanced Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <Card className="bg-muted/30 border-none shadow-sm">
                    <CardContent className="px-4 py-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatDateSeparator(dateString)}
                      </span>
                    </CardContent>
                  </Card>
                </div>

                {/* Messages for this date */}
                <div className="space-y-1">
                  {dayMessages.map((message, index) => {
                    const isOwn = isOwnMessage(message);
                    const showAvatar = shouldShowAvatar(message, index, dayMessages);
                    const showSenderName = shouldShowSenderName(message, index, dayMessages);
                    const showTimestamp = shouldShowTimestamp(message, index, dayMessages);
                    const isHighlighted = message.id === highlightedMessageId;
                    const isSearchResult = searchResults.includes(message.id);
                    
                    return (
                      <div 
                        key={message.id} 
                        className={cn(
                          "group/message flex gap-3 transition-all duration-200 rounded-lg px-4 py-2",
                          "hover:bg-muted/30",
                          isOwn && "flex-row-reverse",
                          compactMode && "py-1",
                          isHighlighted && "bg-primary/10 border-l-2 border-primary",
                          isSearchResult && "bg-yellow-50 dark:bg-yellow-950/20"
                        )}
                      >
                        {/* Avatar */}
                        {!isOwn && (
                          <div className="flex flex-col items-center shrink-0">
                            <Avatar className={cn(
                              "transition-opacity duration-200",
                              compactMode ? "h-6 w-6" : "h-10 w-10",
                              !showAvatar && "opacity-0"
                            )}>
                              <AvatarImage src={message.sender_profile?.avatar_url} />
                              <AvatarFallback className={cn(
                                "bg-primary/10 text-primary font-medium",
                                compactMode ? "text-xs" : "text-sm"
                              )}>
                                {getSenderName(message).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Online status indicator */}
                            {showAvatar && message.sender_profile?.status === 'online' && (
                              <div className="w-2 h-2 bg-green-500 rounded-full -mt-2 border border-background" />
                            )}
                          </div>
                        )}

                        {/* Message Content Container */}
                        <div className={cn(
                          "flex-1 min-w-0 space-y-1",
                          isOwn && "flex flex-col items-end"
                        )}>
                          {/* Sender info */}
                          {showSenderName && !isOwn && (
                            <div className="flex items-center gap-3 mb-1">
                              <span className={cn(
                                "font-semibold text-foreground",
                                compactMode ? "text-xs" : "text-sm"
                              )}>
                                {getSenderName(message)}
                              </span>
                              
                              {message.sender_profile?.role && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                  {message.sender_profile.role}
                                </Badge>
                              )}
                              
                              {message.sender_profile?.title && (
                                <span className="text-xs text-muted-foreground">
                                  {message.sender_profile.title}
                                </span>
                              )}
                              
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                          )}

                          {/* Message bubble */}
                          <div className={cn(
                            "relative group/bubble",
                            isOwn && "flex justify-end"
                          )}>
                            <div
                              className={cn(
                                "inline-block px-4 py-3 rounded-2xl max-w-[70%] break-words shadow-sm transition-all duration-200 relative",
                                isOwn 
                                  ? "bg-primary text-primary-foreground rounded-br-md" 
                                  : "bg-muted/80 text-foreground rounded-bl-md",
                                compactMode && "px-3 py-2 text-sm",
                                message.is_pinned && "ring-2 ring-yellow-400/50",
                                message.delivery_status === 'failed' && "ring-2 ring-red-400/50"
                              )}
                            >
                              {/* Message indicators */}
                              <div className="flex items-center gap-1 mb-1">
                                {message.is_pinned && (
                                  <Pin className="h-3 w-3 text-yellow-600" />
                                )}
                                {message.is_starred && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                )}
                                {message.is_urgent && (
                                  <Zap className="h-3 w-3 text-orange-500" />
                                )}
                              </div>

                              {renderMessageContent(message)}
                            </div>

                            {renderMessageActions(message)}
                          </div>

                          {/* Reactions */}
                          {message.reactions && renderReactions(message.reactions)}

                          {/* Thread preview */}
                          {message.thread && message.thread.replyCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOpenThread?.(message.id)}
                              className={cn(
                                "text-xs text-primary hover:text-primary mt-1 h-6 px-2",
                                isOwn && "self-end"
                              )}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {message.thread.replyCount} replies
                            </Button>
                          )}

                          {/* Timestamp and status */}
                          {(showTimestamp || isOwn) && (
                            <div className={cn(
                              "flex items-center gap-2 mt-1",
                              isOwn ? "justify-end" : "justify-start"
                            )}>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.created_at)}
                              </span>
                              
                              {isOwn && getDeliveryStatusIcon(message)}
                              
                              {message.edited_at && (
                                <span className="text-xs text-muted-foreground opacity-60">
                                  (edited)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Read receipts */}
                          {isOwn && renderReadReceipts(message)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            <TypingIndicator />

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <Button
            onClick={() => scrollToBottom()}
            className="absolute bottom-6 right-6 rounded-full h-10 w-10 p-0 shadow-lg z-10 animate-in slide-in-from-bottom-2"
            size="sm"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
