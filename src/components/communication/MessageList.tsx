import React, { useRef, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Reply, 
  Heart, 
  Pin, 
  Copy,
  Trash2,
  Edit3,
  CheckCheck,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  sender_name?: string;
  created_at: string;
  edited_at?: string;
  is_pinned?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  reply_to?: string;
  message_type?: 'text' | 'system' | 'file';
  delivery_status?: 'sending' | 'sent' | 'delivered' | 'read';
  sender_profile?: {
    id?: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
}

export function MessageList({ 
  messages, 
  currentUserId,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onPin
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date for date separators
  const messagesByDate = useMemo(() => {
    const grouped: { [date: string]: Message[] } = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(message);
    });
    return grouped;
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const getSenderName = (message: Message) => {
    if (message.sender_profile?.full_name) {
      return message.sender_profile.full_name;
    }
    if (message.sender_name) {
      return message.sender_name;
    }
    return 'Unknown User';
  };

  const isOwnMessage = (message: Message) => {
    return message.sender_id === currentUserId;
  };

  const shouldShowAvatar = (message: Message, index: number, dayMessages: Message[]) => {
    if (isOwnMessage(message)) return false;
    return index === 0 || dayMessages[index - 1].sender_id !== message.sender_id;
  };

  const shouldShowTimestamp = (message: Message, index: number, dayMessages: Message[]) => {
    const nextMessage = dayMessages[index + 1];
    return !nextMessage || 
           nextMessage.sender_id !== message.sender_id ||
           new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime() > 300000; // 5 minutes
  };

  const getDeliveryStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered': case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground px-6">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="px-6 py-4">
        {Object.entries(messagesByDate).map(([dateString, dayMessages]) => (
          <div key={dateString}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-6">
              <div className="bg-muted px-3 py-1 rounded-full">
                <span className="text-xs font-medium text-muted-foreground">
                  {formatDateSeparator(dateString)}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-1">
              {dayMessages.map((message, index) => {
                const isOwn = isOwnMessage(message);
                const showAvatar = shouldShowAvatar(message, index, dayMessages);
                const showTimestamp = shouldShowTimestamp(message, index, dayMessages);
                
                return (
                  <div 
                    key={message.id} 
                    className={cn(
                      "group flex gap-3 hover:bg-muted/30 px-4 py-1 rounded-lg transition-colors",
                      isOwn && "flex-row-reverse"
                    )}
                  >
                    {/* Avatar */}
                    {!isOwn && (
                      <div className="flex flex-col items-center">
                        <Avatar className={cn("h-10 w-10", !showAvatar && "opacity-0")}>
                          <AvatarImage src={message.sender_profile?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getSenderName(message).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={cn("flex-1 min-w-0", isOwn && "flex flex-col items-end")}>
                      {/* Sender name and timestamp (for new message groups) */}
                      {showAvatar && !isOwn && (
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-semibold text-foreground">
                            {getSenderName(message)}
                          </span>
                          {message.sender_profile?.role && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              {message.sender_profile.role}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div className={cn("relative group/message", isOwn && "flex justify-end")}>
                        <div
                          className={cn(
                            "inline-block px-4 py-2.5 rounded-2xl max-w-[70%] break-words shadow-sm transition-all",
                            isOwn 
                              ? "bg-primary text-primary-foreground rounded-br-md" 
                              : "bg-muted/80 text-foreground rounded-bl-md",
                            message.is_pinned && "ring-2 ring-yellow-400/50"
                          )}
                        >
                          {/* Pinned indicator */}
                          {message.is_pinned && (
                            <div className="flex items-center gap-1 mb-1 text-xs text-yellow-600">
                              <Pin className="h-3 w-3" />
                              Pinned
                            </div>
                          )}

                          {/* Reply-to indicator */}
                          {message.reply_to && (
                            <div className="text-xs text-muted-foreground mb-2 pl-2 border-l-2 border-muted-foreground/30">
                              Replying to message
                            </div>
                          )}

                          {/* Message content */}
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>

                          {/* Edited indicator */}
                          {message.edited_at && (
                            <span className="text-xs opacity-60 ml-2">(edited)</span>
                          )}
                        </div>

                        {/* Message actions (appear on hover) */}
                        <div className={cn(
                          "absolute top-0 opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center gap-1 bg-background border rounded-lg shadow-md px-1 py-1",
                          isOwn ? "-left-16" : "-right-16"
                        )}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReact?.(message.id, '👍')}
                            className="h-6 w-6 p-0"
                            title="React"
                          >
                            <Heart className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReply?.(message.id)}
                            className="h-6 w-6 p-0"
                            title="Reply"
                          >
                            <Reply className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            title="More options"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {message.reactions.map((reaction, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => onReact?.(message.id, reaction.emoji)}
                              className="h-6 px-2 text-xs hover:bg-accent"
                            >
                              {reaction.emoji} {reaction.count}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp and delivery status (for message groups or own messages) */}
                      {(showTimestamp || isOwn) && (
                        <div className={cn(
                          "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                          isOwn ? "justify-end" : "justify-start"
                        )}>
                          <span>{formatTime(message.created_at)}</span>
                          {isOwn && getDeliveryStatusIcon(message.delivery_status)}
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
  );
}
