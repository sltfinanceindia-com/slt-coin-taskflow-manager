import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare,
  Reply,
  Forward,
  Copy,
  Trash2,
  Edit,
  Pin,
  Heart,
  Smile,
  Download,
  Eye,
  EyeOff,
  Star,
  Archive,
  Flag,
  Share2,
  Calendar,
  Clock,
  CheckCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice' | 'video';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isEdited?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  threadReplies?: number;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onOpenThread?: (messageId: string) => void;
  className?: string;
}

export default function MessageList({
  messages,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  onStar,
  onForward,
  onOpenThread,
  className
}: MessageListProps) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
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
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const handleReaction = (messageId: string, emoji: string) => {
    onReaction?.(messageId, emoji);
    setShowReactions(null);
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = message.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
      date: new Date(date),
      messages: msgs
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {messageGroups.map(({ date, messages: groupMessages }) => (
              <div key={date.toISOString()}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <Badge variant="secondary" className="text-xs">
                    {formatDate(date)}
                  </Badge>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {groupMessages.map((message, index) => {
                    const isCurrentUser = message.sender.id === currentUserId;
                    const showAvatar = index === 0 || 
                      groupMessages[index - 1].sender.id !== message.sender.id;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 group",
                          isCurrentUser && "flex-row-reverse"
                        )}
                      >
                        {/* Avatar */}
                        <div className={cn("flex-shrink-0", !showAvatar && "invisible")}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.avatar} />
                            <AvatarFallback>
                              {message.sender.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Message Content */}
                        <div className={cn("flex-1 max-w-xs sm:max-w-md", isCurrentUser && "text-right")}>
                          {/* Sender Name */}
                          {showAvatar && !isCurrentUser && (
                            <div className="text-xs text-muted-foreground mb-1">
                              {message.sender.name}
                            </div>
                          )}

                          {/* Reply Context */}
                          {message.replyTo && (
                            <div className="text-xs text-muted-foreground mb-2 p-2 border-l-2 border-muted bg-muted/50 rounded">
                              <div className="font-medium">{message.replyTo.sender}</div>
                              <div className="truncate">{message.replyTo.content}</div>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={cn(
                              "relative p-3 rounded-lg shadow-sm",
                              isCurrentUser 
                                ? "bg-primary text-primary-foreground ml-auto" 
                                : "bg-muted",
                              message.isPinned && "ring-2 ring-yellow-500/50"
                            )}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setSelectedMessage(selectedMessage === message.id ? null : message.id);
                            }}
                          >
                            {/* Pinned Indicator */}
                            {message.isPinned && (
                              <Pin className="absolute -top-2 -right-2 h-4 w-4 text-yellow-500 bg-background rounded-full p-1" />
                            )}

                            {/* Message Content */}
                            <div className="text-sm">
                              {message.content}
                              {message.isEdited && (
                                <span className="text-xs opacity-70 ml-2">(edited)</span>
                              )}
                            </div>

                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map(attachment => (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center gap-2 p-2 bg-background/10 rounded"
                                  >
                                    <div className="flex-1 text-xs">
                                      <div className="font-medium">{attachment.name}</div>
                                      <div className="opacity-70">
                                        {(attachment.size / 1024).toFixed(1)} KB
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {message.reactions.map((reaction, idx) => (
                                  <Button
                                    key={idx}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleReaction(message.id, reaction.emoji)}
                                  >
                                    {reaction.emoji} {reaction.count}
                                  </Button>
                                ))}
                              </div>
                            )}

                            {/* Message Metadata */}
                            <div className={cn(
                              "flex items-center gap-1 mt-1 text-xs opacity-70",
                              isCurrentUser ? "justify-start" : "justify-end"
                            )}>
                              <span>{formatTime(message.timestamp)}</span>
                              {isCurrentUser && getStatusIcon(message.status)}
                              {message.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                              {message.threadReplies && message.threadReplies > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 px-1 text-xs"
                                  onClick={() => onOpenThread?.(message.id)}
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  {message.threadReplies}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className={cn(
                            "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                            isCurrentUser ? "justify-end" : "justify-start"
                          )}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                            >
                              <Smile className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onReply?.(message.id)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            {isCurrentUser && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => onEdit?.(message.id)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleCopyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Reaction Picker */}
                          {showReactions === message.id && (
                            <div className="flex gap-1 mt-2 p-2 bg-background border rounded-lg shadow-lg">
                              {commonEmojis.map(emoji => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleReaction(message.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}