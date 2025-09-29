import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Smile, Plus } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface ReactionManagerProps {
  messageId: string;
  reactions: Reaction[];
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  className?: string;
}

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'];

export default function ReactionManager({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  className
}: ReactionManagerProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    
    if (existingReaction?.hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  const handleEmojiSelect = (emojiData: any) => {
    onAddReaction(messageId, emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleQuickReaction = (emoji: string) => {
    handleReactionClick(emoji);
    setShowQuickReactions(false);
  };

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {/* Existing Reactions */}
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.hasReacted ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-6 px-2 py-0 text-xs gap-1",
            reaction.hasReacted && "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
          )}
          onClick={() => handleReactionClick(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}

      {/* Quick Reactions Popover */}
      <Popover open={showQuickReactions} onOpenChange={setShowQuickReactions}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top">
          <div className="flex items-center gap-1">
            {quickReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:scale-110 transition-transform"
                onClick={() => handleQuickReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {/* Custom Emoji Picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0" side="top">
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  width={300}
                  height={400}
                />
              </PopoverContent>
            </Popover>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
