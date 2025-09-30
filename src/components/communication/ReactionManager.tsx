import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'] as const;

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface Props {
  messageId: string;
  reactions: Reaction[];
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  className?: string;
}

export default function ReactionManager({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  className
}: Props) {
  const [open, setOpen] = useState(false);

  /* ---------- helpers ---------- */
  const toggleReaction = useCallback(
    (emoji: string) => {
      const exists = reactions.find(r => r.emoji === emoji)?.hasReacted;
      exists ? onRemoveReaction(messageId, emoji) : onAddReaction(messageId, emoji);
    },
    [reactions, messageId, onAddReaction, onRemoveReaction]
  );

  const handleEmojiSelect = (emojiData: any /* EmojiClickData */) => {
    // emojiData.emoji carries the actual character [web:51]
    toggleReaction(emojiData.emoji);
    setOpen(false);
  };

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {/* existing reactions */}
      {reactions.map(r => (
        <Button
          key={r.emoji}
          variant={r.hasReacted ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'h-6 px-2 py-0 text-xs gap-1',
            r.hasReacted && 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
          )}
          onClick={() => toggleReaction(r.emoji)}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </Button>
      ))}

      {/* single popover for quick + full picker  ─ avoids nested-popover bug [web:56] */}
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Add reaction"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>

        <PopoverContent side="top" className="p-2 w-auto">
          {/* quick reactions row */}
          <div className="flex items-center gap-1 mb-1">
            {QUICK_REACTIONS.map(e => (
              <Button
                key={e}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:scale-110 transition-transform"
                onClick={() => {
                  toggleReaction(e);
                  setOpen(false);
                }}
              >
                {e}
              </Button>
            ))}
          </div>

          <div className="border-t my-1" />

          {/* full emoji picker */}
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            width={300}
            height={400}
            skinTonesDisabled
            searchDisabled
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
