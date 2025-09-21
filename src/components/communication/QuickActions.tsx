import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Reply,
  Forward,
  Edit3,
  Trash2,
  Pin,
  Star,
  Copy,
  Download,
  Share,
  MessageSquare,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  MoreHorizontal,
  Flag,
  Volume2,
  VolumeX
} from 'lucide-react';

interface QuickActionsProps {
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onStar?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onReact?: (emoji: string) => void;
  onThread?: () => void;
  onFlag?: () => void;
  isPinned?: boolean;
  isStarred?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
  showInline?: boolean;
}

const reactionEmojis = [
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '😂', icon: Laugh, label: 'Laugh' },
  { emoji: '😮', icon: MessageSquare, label: 'Wow' },
  { emoji: '😢', icon: Frown, label: 'Sad' },
  { emoji: '😡', icon: Angry, label: 'Angry' }
];

export default function QuickActions({
  onReply,
  onEdit,
  onDelete,
  onPin,
  onStar,
  onForward,
  onCopy,
  onReact,
  onThread,
  onFlag,
  isPinned = false,
  isStarred = false,
  canEdit = false,
  canDelete = false,
  className,
  showInline = false
}: QuickActionsProps) {
  const [showReactions, setShowReactions] = useState(false);

  const handleKeyboardShortcut = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'r':
          e.preventDefault();
          onReply?.();
          break;
        case 'e':
          e.preventDefault();
          if (canEdit) onEdit?.();
          break;
        case 'c':
          e.preventDefault();
          onCopy?.();
          break;
        case 'f':
          e.preventDefault();
          onForward?.();
          break;
        case 's':
          e.preventDefault();
          onStar?.();
          break;
      }
    }
  }, [onReply, onEdit, onCopy, onForward, onStar, canEdit]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  if (showInline) {
    return (
      <div className={cn("flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-lg border border-border shadow-sm p-1", className)}>
        {/* Quick Reactions */}
        <div className="flex items-center gap-0.5">
          {reactionEmojis.slice(0, 3).map(({ emoji, icon: Icon, label }) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover-scale"
              onClick={() => onReact?.(emoji)}
              title={label}
            >
              <span className="text-sm">{emoji}</span>
            </Button>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Primary Actions */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover-scale"
          onClick={onReply}
          title="Reply (Ctrl+R)"
        >
          <Reply className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover-scale"
          onClick={onThread}
          title="Start thread"
        >
          <MessageSquare className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover-scale"
          onClick={onForward}
          title="Forward (Ctrl+F)"
        >
          <Forward className="h-3 w-3" />
        </Button>

        {/* More Actions Menu */}
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover-scale"
              title="More actions"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem onClick={onCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy message
              <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
            </ContextMenuItem>
            
            <ContextMenuItem onClick={onStar}>
              <Star className={cn("h-4 w-4 mr-2", isStarred && "fill-yellow-400 text-yellow-400")} />
              {isStarred ? 'Remove star' : 'Star message'}
              <ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuItem onClick={onPin}>
              <Pin className={cn("h-4 w-4 mr-2", isPinned && "fill-primary text-primary")} />
              {isPinned ? 'Unpin message' : 'Pin message'}
            </ContextMenuItem>

            <ContextMenuSeparator />

            {canEdit && (
              <ContextMenuItem onClick={onEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit message
                <ContextMenuShortcut>Ctrl+E</ContextMenuShortcut>
              </ContextMenuItem>
            )}

            <ContextMenuItem onClick={onFlag}>
              <Flag className="h-4 w-4 mr-2" />
              Report message
            </ContextMenuItem>

            {canDelete && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete message
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </div>
    );
  }

  // Hover/Context Menu Version
  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>
        {/* This wraps the message content */}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* Reactions */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Quick reactions</div>
          <div className="flex gap-1">
            {reactionEmojis.map(({ emoji, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover-scale"
                onClick={() => onReact?.(emoji)}
                title={label}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        </div>

        <ContextMenuSeparator />

        {/* Primary Actions */}
        <ContextMenuItem onClick={onReply}>
          <Reply className="h-4 w-4 mr-2" />
          Reply
          <ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={onThread}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Start thread
        </ContextMenuItem>

        <ContextMenuItem onClick={onForward}>
          <Forward className="h-4 w-4 mr-2" />
          Forward
          <ContextMenuShortcut>Ctrl+F</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Secondary Actions */}
        <ContextMenuItem onClick={onCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy message
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={onStar}>
          <Star className={cn("h-4 w-4 mr-2", isStarred && "fill-yellow-400 text-yellow-400")} />
          {isStarred ? 'Remove star' : 'Star message'}
          <ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={onPin}>
          <Pin className={cn("h-4 w-4 mr-2", isPinned && "fill-primary text-primary")} />
          {isPinned ? 'Unpin from channel' : 'Pin to channel'}
        </ContextMenuItem>

        <ContextMenuSeparator />

        {canEdit && (
          <ContextMenuItem onClick={onEdit}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit message
            <ContextMenuShortcut>Ctrl+E</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={onFlag}>
          <Flag className="h-4 w-4 mr-2" />
          Report message
        </ContextMenuItem>

        {canDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Keyboard shortcuts help component
export function KeyboardShortcuts() {
  const shortcuts = [
    { key: 'Ctrl+R', action: 'Reply to message' },
    { key: 'Ctrl+E', action: 'Edit message' },
    { key: 'Ctrl+C', action: 'Copy message' },
    { key: 'Ctrl+F', action: 'Forward message' },
    { key: 'Ctrl+S', action: 'Star message' },
    { key: 'Ctrl+K', action: 'Quick switcher' },
    { key: 'Ctrl+/', action: 'Search' },
    { key: 'Esc', action: 'Close dialogs' },
    { key: '/', action: 'Slash commands' },
    { key: '@', action: 'Mention user' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-md">
      <h3 className="font-semibold">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map(({ key, action }) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span>{action}</span>
            <Badge variant="outline" className="text-xs font-mono">
              {key}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}