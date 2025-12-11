import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pin, X, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PinnedMessage {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string;
  pinned_at: string;
  pinned_by: string;
  created_at: string;
}

interface MessagePinningProps {
  channelId: string;
  pinnedMessages: PinnedMessage[];
  onPinMessage: (messageId: string) => void;
  onUnpinMessage: (messageId: string) => void;
  onJumpToMessage: (messageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  canPin?: boolean;
  className?: string;
}

export default function MessagePinning({
  channelId,
  pinnedMessages,
  onPinMessage,
  onUnpinMessage,
  onJumpToMessage,
  isOpen,
  onClose,
  canPin = true,
  className
}: MessagePinningProps) {
  if (!isOpen) return null;

  return (
    <Card className={cn("w-80 max-h-96 flex flex-col shadow-lg", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Pin className="h-4 w-4 text-amber-500" />
          Pinned Messages
          <Badge variant="secondary" className="ml-1">
            {pinnedMessages.length}
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        {pinnedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Pin className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No pinned messages</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pin important messages to find them easily
            </p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {pinnedMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                  onClick={() => onJumpToMessage(message.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium truncate">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                    {canPin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnpinMessage(message.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Pin button component for individual messages
interface PinButtonProps {
  messageId: string;
  isPinned: boolean;
  onPin: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
  canPin?: boolean;
  className?: string;
}

export function PinButton({
  messageId,
  isPinned,
  onPin,
  onUnpin,
  canPin = true,
  className
}: PinButtonProps) {
  if (!canPin) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => isPinned ? onUnpin(messageId) : onPin(messageId)}
      className={cn(
        "h-6 w-6 p-0 transition-colors",
        isPinned ? "text-amber-500" : "text-muted-foreground hover:text-amber-500",
        className
      )}
      title={isPinned ? "Unpin message" : "Pin message"}
    >
      <Pin className={cn("h-3 w-3", isPinned && "fill-current")} />
    </Button>
  );
}
