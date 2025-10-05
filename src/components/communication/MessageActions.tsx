import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Reply, 
  Forward, 
  Copy, 
  Trash2, 
  Pin, 
  MoreHorizontal,
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  AlertCircle,
  CheckCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageActionsProps {
  messageId: string;
  messageContent: string;
  isOwn: boolean;
  onReply?: () => void;
  onForward?: () => void;
  onDelete?: (forEveryone: boolean) => void;
  onReact?: (emoji: string) => void;
  className?: string;
}

const quickReactions = [
  { emoji: '👍', label: 'Thumbs up', icon: ThumbsUp },
  { emoji: '❤️', label: 'Heart', icon: Heart },
  { emoji: '😂', label: 'Laugh', icon: Laugh },
  { emoji: '😮', label: 'Surprised', icon: AlertCircle },
  { emoji: '😢', label: 'Sad', icon: Frown },
  { emoji: '🙏', label: 'Thank you', icon: CheckCheck },
];

export default function MessageActions({
  messageId,
  messageContent,
  isOwn,
  onReply,
  onForward,
  onDelete,
  onReact,
  className
}: MessageActionsProps) {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    toast.success('Message copied to clipboard');
  };

  const handleDelete = (forEveryone: boolean) => {
    if (onDelete) {
      onDelete(forEveryone);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
      className
    )}>
      {/* Quick Reactions */}
      {quickReactions.slice(0, 4).map((reaction) => (
        <Button
          key={reaction.emoji}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-muted"
          onClick={() => onReact?.(reaction.emoji)}
          title={reaction.label}
        >
          <span className="text-sm">{reaction.emoji}</span>
        </Button>
      ))}

      {/* Reply Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={onReply}
        title="Reply"
      >
        <Reply className="h-3.5 w-3.5" />
      </Button>

      {/* More Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onReply}>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onForward}>
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pin className="h-4 w-4 mr-2" />
            Pin message
          </DropdownMenuItem>
          
          {/* More Reactions Submenu */}
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            React
          </div>
          <div className="grid grid-cols-3 gap-1 p-2">
            {quickReactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-full"
                onClick={() => onReact?.(reaction.emoji)}
              >
                {reaction.emoji}
              </Button>
            ))}
          </div>
          
          <DropdownMenuSeparator />
          {isOwn && (
            <>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDelete(false)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete for me
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete for everyone
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
