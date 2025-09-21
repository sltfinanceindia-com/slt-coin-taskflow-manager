import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Reply, 
  Heart, 
  ThumbsUp,
  Pin,
  Forward,
  Edit,
  Trash,
  MessageSquare,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import type { Channel, Message } from '@/hooks/useCommunication';
import TypingIndicator from './TypingIndicator';

interface MessageAreaProps {
  channel: Channel;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  currentUser: any;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  currentUser: any;
}

function MessageBubble({ message, isOwn, showAvatar, showTimestamp, currentUser }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div 
      className={cn(
        "group flex gap-3 px-4 py-2 hover:bg-muted/30 transition-colors",
        isOwn && "flex-row-reverse"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender_id === currentUser?.id ? currentUser?.avatar_url : undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(message.sender_name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 min-w-0", isOwn && "text-right")}>
        {/* Sender info */}
        {showAvatar && (
          <div className={cn("flex items-center gap-2 mb-1", isOwn && "justify-end")}>
            <span className="text-sm font-semibold text-foreground">
              {message.sender_name || 'Unknown User'}
            </span>
            {message.sender_role && (
              <Badge variant="secondary" className="text-xs">
                {message.sender_role}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          "inline-block max-w-[70%] rounded-lg px-3 py-2 text-sm",
          isOwn 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted text-foreground"
        )}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Message metadata */}
          <div className={cn(
            "flex items-center gap-1 mt-1 text-xs",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {message.is_edited && (
              <span>(edited)</span>
            )}
            {!showAvatar && (
              <span>{formatTime(message.created_at)}</span>
            )}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1">
                {message.reactions.map((reaction: any, index: number) => (
                  <span key={index} className="bg-background/20 rounded px-1">
                    {reaction.emoji} {reaction.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Thread indicator */}
        {message.thread_count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "mt-1 text-xs h-6",
              isOwn ? "ml-auto" : "mr-auto"
            )}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {message.thread_count} replies
          </Button>
        )}
      </div>

      {/* Message Actions */}
      {showActions && (
        <div className={cn(
          "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isOwn && "order-first"
        )}>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Heart className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Reply className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MessageArea({ 
  channel, 
  messages, 
  isLoading, 
  onSendMessage, 
  currentUser 
}: MessageAreaProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newMessage]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage);
    setNewMessage('');
    setIsComposing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const shouldShowAvatar = (message: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return prevMessage.sender_id !== message.sender_id || 
           new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000; // 5 minutes
  };

  const shouldShowTimestamp = (message: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 900000; // 15 minutes
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Channel Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">{channel.name}</h2>
            {channel.description && (
              <p className="text-sm text-muted-foreground">{channel.description}</p>
            )}
          </div>
          {channel.is_direct_message && (
            <Badge variant="outline">Direct Message</Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground text-sm">
                  Start the conversation! Send a message to {channel.name}.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUser?.id}
                showAvatar={shouldShowAvatar(message, index)}
                showTimestamp={shouldShowTimestamp(message, index)}
                currentUser={currentUser}
              />
            ))}
            
            {/* Typing indicator */}
            <TypingIndicator 
              typingUsers={[]} 
              className="px-4 py-2"
            />
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-3">
          <Button variant="ghost" size="sm" className="mb-2">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setIsComposing(e.target.value.length > 0);
              }}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${channel.name}...`}
              className="min-h-[40px] max-h-32 resize-none pr-20"
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="h-6 w-6 p-0"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {isComposing && (
          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        )}
      </div>
    </div>
  );
}