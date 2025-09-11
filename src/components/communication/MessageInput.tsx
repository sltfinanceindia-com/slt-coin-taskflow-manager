import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Smile, 
  AtSign,
  Bold,
  Italic,
  List,
  Link,
  Pin,
  Star
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileAttach?: (file: File) => void;
  mentions?: { id: string; name: string }[];
  disabled?: boolean;
}

export function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  onFileAttach, 
  mentions = [],
  disabled = false 
}: MessageInputProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmojiClick = (emojiData: any) => {
    onChange(value + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileAttach) {
      onFileAttach(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }

    // Show mentions on @
    if (e.key === '@') {
      setShowMentions(true);
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = '';
    switch (format) {
      case 'bold':
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        break;
      case 'italic':
        newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
        break;
      case 'list':
        newText = value.substring(0, start) + `\n• ${selectedText}` + value.substring(end);
        break;
      case 'link':
        newText = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end);
        break;
    }
    
    onChange(newText);
    setShowFormatting(false);
  };

  return (
    <div className="border-t bg-background p-4">
      {/* Rich Text Toolbar */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
        <Popover open={showFormatting} onOpenChange={setShowFormatting}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => insertFormatting('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => insertFormatting('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => insertFormatting('list')}
                title="List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => insertFormatting('link')}
                title="Link"
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPinned(!isPinned)}
          className={isPinned ? 'text-blue-600' : ''}
          title="Pin message"
        >
          <Pin className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsStarred(!isStarred)}
          className={isStarred ? 'text-yellow-600' : ''}
          title="Star message"
        >
          <Star className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Badge variant="secondary" className="text-xs">
          {value.length}/4000
        </Badge>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message... Use @ to mention, # for channels"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[44px] max-h-[120px] resize-none pr-32"
            disabled={disabled}
          />
          
          {/* Mentions Dropdown */}
          {showMentions && mentions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-md shadow-md max-h-32 overflow-y-auto z-50">
              {mentions.map((mention) => (
                <button
                  key={mention.id}
                  className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2"
                  onClick={() => {
                    onChange(value + mention.name + ' ');
                    setShowMentions(false);
                  }}
                >
                  <AtSign className="h-3 w-3" />
                  {mention.name}
                </button>
              ))}
            </div>
          )}

          {/* Right side controls */}
          <div className="absolute right-2 bottom-2 flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Popover open={showEmoji} onOpenChange={setShowEmoji}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" title="Add emoji">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="top">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button 
          onClick={onSend} 
          disabled={!value.trim() || disabled}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Priority and Status Indicators */}
      <div className="flex items-center gap-2 mt-2">
        {isPinned && (
          <Badge variant="secondary" className="text-xs">
            <Pin className="h-3 w-3 mr-1" />
            Will be pinned
          </Badge>
        )}
        {isStarred && (
          <Badge variant="secondary" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Important
          </Badge>
        )}
      </div>
    </div>
  );
}