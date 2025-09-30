import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageReplyProps {
  replyToMessage: {
    id: string;
    content: string;
    sender_name?: string;
  } | null;
  onCancelReply: () => void;
}

export default function MessageReply({ replyToMessage, onCancelReply }: MessageReplyProps) {
  if (!replyToMessage) return null;

  return (
    <div className="border-l-4 border-primary bg-muted/50 p-3 mb-2 rounded-r">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary mb-1">
            Replying to {replyToMessage.sender_name || 'Unknown User'}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {replyToMessage.content}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancelReply}
          className="h-6 w-6 p-0 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
