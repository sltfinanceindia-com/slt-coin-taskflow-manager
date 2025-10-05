import React from 'react';
import { Button } from '@/components/ui/button';
import { X, File, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageReplyPreviewProps {
  replyTo: {
    id: string;
    content: string;
    sender_name: string;
    attachments?: any[];
  } | null;
  onCancel: () => void;
  className?: string;
}

export default function MessageReplyPreview({
  replyTo,
  onCancel,
  className
}: MessageReplyPreviewProps) {
  if (!replyTo) return null;

  const hasAttachment = replyTo.attachments && replyTo.attachments.length > 0;
  const firstAttachment = hasAttachment ? replyTo.attachments[0] : null;

  return (
    <div className={cn(
      "border-l-4 border-primary bg-muted/50 p-3 rounded-r-lg mb-2",
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary mb-1">
            Replying to {replyTo.sender_name}
          </p>
          
          {hasAttachment ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {firstAttachment.type === 'image' ? (
                <Image className="h-4 w-4" />
              ) : (
                <File className="h-4 w-4" />
              )}
              <span className="truncate">
                {firstAttachment.name || 'Attachment'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground truncate max-w-md">
              {replyTo.content}
            </p>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-6 w-6 p-0 flex-shrink-0 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
