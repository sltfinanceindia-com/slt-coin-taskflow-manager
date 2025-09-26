import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  X,
  Send,
  Smile,
  Paperclip,
  MoreHorizontal,
  Reply,
  MessageSquare,
  Users
} from 'lucide-react';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import type { Message, TeamMember } from '@/hooks/useCommunication';

interface ThreadMessage extends Message {
  replies?: ThreadMessage[];
  reply_count?: number;
  parent_id?: string;
}

interface ThreadedConversationProps {
  isOpen: boolean;
  onClose: () => void;
  parentMessage: ThreadMessage | null;
  threadMessages: ThreadMessage[];
  currentUser: any;
  teamMembers: TeamMember[];
  onSendReply: (content: string, parentId: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export default function ThreadedConversation({
  isOpen,
  onClose,
  parentMessage,
  threadMessages,
  currentUser,
  teamMembers,
  onSendReply,
  onLoadMore,
  isLoading = false
}: ThreadedConversationProps) {
  const [replyInput, setReplyInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSendReply = () => {
    if (!replyInput.trim() || !parentMessage) return;
    
    onSendReply(replyInput.trim(), parentMessage.id);
    setReplyInput('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const renderMessage = (message: ThreadMessage, isParent = false) => {
    const isOwn = message.sender_id === currentUser?.id;
    
    return (
      <div key={message.id} className={cn(
        "flex gap-3 group hover:bg-muted/30 p-3 -mx-3 rounded-lg transition-colors",
        isParent && "border-l-4 border-primary pl-6 bg-muted/20"
      )}>
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={isOwn ? currentUser?.avatar_url : undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(message.sender_name || 'Unknown')}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Message Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {isOwn ? 'You' : message.sender_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(message.created_at)}
            </span>
            {message.is_edited && (
              <Badge variant="outline" className="text-xs px-1">edited</Badge>
            )}
            {isParent && (
              <Badge variant="secondary" className="text-xs px-1">
                Original Message
              </Badge>
            )}
          </div>

          {/* Message Body */}
          <div className="bg-card border rounded-lg px-3 py-2 max-w-md">
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
            
            {/* Message Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="h-3 w-3" />
              </Button>
              {!isParent && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Reply className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Reply Count for Parent Message */}
          {isParent && threadMessages.length > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen || !parentMessage) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg z-40 flex flex-col">
      {/* Thread Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Thread</h3>
            <Badge variant="secondary" className="text-xs">
              {threadMessages.length + 1} {threadMessages.length === 0 ? 'message' : 'messages'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thread Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Parent Message */}
          {renderMessage(parentMessage, true)}

          {/* Thread Replies */}
          {threadMessages.length > 0 && (
            <div className="border-l-2 border-muted pl-4 space-y-4">
              {threadMessages.map((message) => renderMessage(message))}
            </div>
          )}

          {/* Loading More */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )}

          {/* Load More Button */}
          {onLoadMore && threadMessages.length > 0 && (
            <div className="text-center py-2">
              <Button variant="outline" size="sm" onClick={onLoadMore}>
                Load more replies
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Reply to thread..."
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleSendReply}
            disabled={!replyInput.trim()}
            className="hover-scale"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Thread Context */}
        <div className="mt-2 text-xs text-muted-foreground">
          <span>Replying to </span>
          <span className="font-medium">{parentMessage.sender_name}</span>
          <span> in thread</span>
        </div>
      </div>
    </div>
  );
}