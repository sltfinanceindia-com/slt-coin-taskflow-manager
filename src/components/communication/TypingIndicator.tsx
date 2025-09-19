import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-muted-foreground">
      <div className="flex -space-x-1">
        {users.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="h-5 w-5 border border-background">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      
      <div className="flex items-center space-x-1">
        <span className="text-sm">
          {users.length === 1 
            ? `${users[0].name} is typing`
            : users.length === 2
            ? `${users[0].name} and ${users[1].name} are typing`
            : `${users[0].name} and ${users.length - 1} others are typing`
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
}