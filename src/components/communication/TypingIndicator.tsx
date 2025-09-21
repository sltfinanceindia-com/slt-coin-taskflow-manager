import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
  showAvatars?: boolean;
  maxDisplayUsers?: number;
  hideAfterMs?: number;
}

export default function TypingIndicator({
  typingUsers,
  className,
  showAvatars = true,
  maxDisplayUsers = 3,
  hideAfterMs = 10000
}: TypingIndicatorProps) {
  const [visibleUsers, setVisibleUsers] = useState<TypingUser[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typingUsers.length > 0) {
      setVisibleUsers(typingUsers.slice(0, maxDisplayUsers));
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [typingUsers, maxDisplayUsers]);

  useEffect(() => {
    if (isVisible && hideAfterMs) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideAfterMs);

      return () => clearTimeout(timer);
    }
  }, [isVisible, hideAfterMs]);

  const getTypingText = (users: TypingUser[]): string => {
    const displayCount = Math.min(users.length, maxDisplayUsers);
    const remainingCount = users.length - displayCount;

    if (users.length === 0) return '';
    
    if (users.length === 1) {
      return `${users[0].name} is typing...`;
    }
    
    if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing...`;
    }
    
    if (users.length <= maxDisplayUsers) {
      const names = users.slice(0, -1).map(user => user.name).join(', ');
      const lastName = users[users.length - 1].name;
      return `${names}, and ${lastName} are typing...`;
    }
    
    const displayNames = users.slice(0, maxDisplayUsers).map(user => user.name).join(', ');
    return `${displayNames} and ${remainingCount} other${remainingCount > 1 ? 's' : ''} are typing...`;
  };

  if (!isVisible || visibleUsers.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 p-2 text-sm text-muted-foreground", className)}>
      {/* Avatars */}
      {showAvatars && (
        <div className="flex -space-x-1">
          {visibleUsers.map((user) => (
            <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}

      {/* Typing Text */}
      <span className="text-xs">
        {getTypingText(typingUsers)}
      </span>

      {/* Animated Dots */}
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}