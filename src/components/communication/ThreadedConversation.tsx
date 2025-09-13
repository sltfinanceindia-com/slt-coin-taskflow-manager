import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  Clock,
  Users,
  Eye,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Reply {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  timestamp: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
  isEdited?: boolean;
}

interface ThreadMessage {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  timestamp: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
  replies?: Reply[];
  isPinned?: boolean;
  isStarred?: boolean;
  isEdited?: boolean;
  views?: number;
  priority?: 'normal' | 'high' | 'urgent';
}

interface ThreadedConversationProps {
  messages: ThreadMessage[];
  currentUserId?: string;
  onReply?: (messageId: string, content: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
  onFlag?: (messageId: string) => void;
  isLoading?: boolean;
}

export function ThreadedConversation({ 
  messages, 
  currentUserId,
  onReply, 
  onReact, 
  onPin, 
  onStar, 
  onEdit, 
  onDelete,
  onShare,
  onFlag,
  isLoading = false
}: ThreadedConversationProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const toggleThread = (messageId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedThreads(newExpanded);
  };

  const handleReply = (messageId: string) => {
    if (replyContent.trim() && onReply) {
      onReply(messageId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleEdit = (messageId: string) => {
    if (editContent.trim() && onEdit) {
      onEdit(messageId, editContent);
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const startEdit = (messageId: string, currentContent: string) => {
    setEditingMessage(messageId);
    setEditContent(currentContent);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const commonReactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Laugh' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '🎉', label: 'Celebrate' }
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-orange-500 bg-orange-50/50';
      case 'urgent': return 'border-l-red-500 bg-red-50/50';
      default: return '';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high': return <Badge variant="secondary" className="text-orange-600 bg-orange-100">High Priority</Badge>;
      case 'urgent': return <Badge variant="destructive" className="bg-red-100 text-red-700">Urgent</Badge>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start a conversation to see threaded messages here</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="group relative">
            {/* Main Message */}
            <div className={cn(
              "flex gap-4 p-5 rounded-xl border transition-all duration-200",
              "hover:shadow-md hover:bg-muted/30",
              message.isPinned && "bg-blue-50/50 border-blue-200 shadow-sm",
              getPriorityColor(message.priority),
              "border-l-4"
            )}>
              <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                <AvatarImage src={message.author.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {message.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-foreground">{message.author.name}</span>
                  {message.author.role && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {message.author.role}
                    </Badge>
                  )}
                  {getPriorityBadge(message.priority)}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
                    {message.isEdited && <span>(edited)</span>}
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    {message.isPinned && (
                      <Pin className="h-4 w-4 text-blue-600" title="Pinned message" />
                    )}
                    {message.isStarred && (
                      <Star className="h-4 w-4 text-yellow-600 fill-current" title="Starred message" />
                    )}
                    {message.views && message.views > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {message.views}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Content */}
                {editingMessage === message.id ? (
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
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {message.content}
                    </p>
                  </div>
                )}
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {message.reactions.map((reaction, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-accent transition-colors"
                        onClick={() => onReact?.(message.id, reaction.emoji)}
                        title={`${reaction.users.join(', ')} reacted with ${reaction.emoji}`}
                      >
                        <span className="mr-1">{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                  {/* Quick Reactions */}
                  <Popover open={showEmojiPicker === message.id} onOpenChange={(open) => setShowEmojiPicker(open ? message.id : null)}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <Smile className="h-3 w-3 mr-1" />
                        React
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" side="top">
                      <div className="flex gap-1">
                        {commonReactions.map((reaction) => (
                          <Button
                            key={reaction.emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-accent"
                            onClick={() => {
                              onReact?.(message.id, reaction.emoji);
                              setShowEmojiPicker(null);
                            }}
                            title={reaction.label}
                          >
                            {reaction.emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setReplyingTo(message.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8"
                          onClick={() => startEdit(message.id, message.content)}
                        >
                          <Edit3 className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Separator />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          onClick={() => onFlag?.(message.id)}
                        >
                          <Flag className="h-3 w-3 mr-2" />
                          Report
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete?.(message.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            {/* Reply Input */}
            {replyingTo === message.id && (
              <div className="ml-14 mt-3 p-4 bg-muted/20 rounded-lg border border-muted">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Reply className="h-3 w-3" />
                    Replying to {message.author.name}
                  </div>
                  <Textarea
                    ref={textareaRef}
                    placeholder="Type your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey) {
                        handleReply(message.id);
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Press ⌘+Enter to send
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleReply(message.id)}
                        disabled={!replyContent.trim()}
                      >
                        Send Reply
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Thread Replies */}
            {message.replies && message.replies.length > 0 && (
              <div className="ml-14 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleThread(message.id)}
                  className="text-sm text-primary hover:text-primary/80 hover:bg-primary/5 h-8 px-3"
                >
                  {expandedThreads.has(message.id) ? (
                    <ChevronDown className="h-3 w-3 mr-2" />
                  ) : (
                    <ChevronRight className="h-3 w-3 mr-2" />
                  )}
                  <Users className="h-3 w-3 mr-1" />
                  {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
                
                {expandedThreads.has(message.id) && (
                  <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
                    {message.replies.map((reply) => (
                      <div key={reply.id} className="group/reply flex gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={reply.author.avatar} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
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
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}</span>
                              {reply.isEdited && <span>(edited)</span>}
                            </div>
                          </div>
                          
                          <div className="text-sm leading-relaxed">
                            {reply.content}
                          </div>
                          
                          {reply.reactions && reply.reactions.length > 0 && (
                            <div className="flex gap-1">
                              {reply.reactions.map((reaction, index) => (
                                <span key={index} className="inline-flex items-center gap-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.count}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Reply Actions */}
                          <div className="opacity-0 group-hover/reply:opacity-100 transition-opacity flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <Heart className="h-3 w-3 mr-1" />
                              Like
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
