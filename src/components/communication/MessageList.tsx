import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  sender_name?: string;
  created_at: string;
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
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-4 py-4">
        {messages.map((message, index) => {
          const isOwn = isOwnMessage(message);
          const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
          
          return (
            <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
              {!isOwn && (
                <Avatar className={`h-8 w-8 ${showAvatar ? '' : 'invisible'}`}>
                  <AvatarImage src={message.sender_profile?.avatar_url} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {getSenderName(message).charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                {showAvatar && !isOwn && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {getSenderName(message)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                )}
                
                <div className={`
                  inline-block px-3 py-2 rounded-lg max-w-full break-words
                  ${isOwn 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                  }
                `}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {isOwn && (
                    <div className="text-xs opacity-70 mt-1">
                      {formatTime(message.created_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}