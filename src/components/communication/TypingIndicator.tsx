import React from 'react';
import type { TeamMember } from '@/hooks/useCommunication';

interface TypingIndicatorProps {
  typingUsers: TeamMember[];
  className?: string;
}

export default function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].full_name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].full_name} and ${typingUsers[1].full_name} are typing...`;
    } else {
      return `${typingUsers[0].full_name} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        <div 
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
          style={{ animationDelay: '0.1s' }} 
        />
        <div 
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
          style={{ animationDelay: '0.2s' }} 
        />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
}