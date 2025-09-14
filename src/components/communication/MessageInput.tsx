import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Star,
  Image,
  File,
  Mic,
  Video,
  Calendar,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileAttach?: (file: File) => void;
  mentions?: { id: string; name: string; avatar?: string }[];
  disabled?: boolean;
  placeholder?: string;
  replyTo?: { id: string; content: string; sender: string };
  onCancelReply?: () => void;
  typing?: boolean;
  onTypingChange?: (typing: boolean) => void;
}

export function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  onFileAttach, 
  mentions = [],
  disabled = false,
  placeholder = "Type a message... Use @ to mention, # for channels",
  replyTo,
  onCancelReply,
  typing = false,
  onTypingChange
}: MessageInputProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!typing && onTypingChange) {
      onTypingChange(true);
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingChange) {
        onTypingChange(false);
      }
    }, 1000);
  }, [typing, onTypingChange]);

  const handleEmojiClick = (emojiData: any) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + emojiData.emoji + value.substring(end);
      onChange(newValue);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
        textarea.focus();
      }, 0);
    }
    setShowEmoji(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      if (onFileAttach) {
        onFileAttach(file);
      }
      setAttachedFiles(prev => [...prev, file]);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAttachments(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleTyping();

    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
    
    if (e.key === '@' || e.key === '#') {
      setShowMentions(true);
    }
    
    if (e.key === 'Escape') {
      setShowMentions(false);
      setShowEmoji(false);
      setShowFormatting(false);
      setShowAttachments(false);
      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  const handleSend = () => {
    if (value.trim() || attachedFiles.length > 0) {
      onSend();
      setAttachedFiles([]);
      setIsPinned(false);
      setIsStarred(false);
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        const boldText = selectedText || 'bold text';
        newText = value.substring(0, start) + `**${boldText}**` + value.substring(end);
        cursorOffset = selectedText ? start + boldText.length + 4 : start + 2;
        break;
      case 'italic':
        const italicText = selectedText || 'italic text';
        newText = value.substring(0, start) + `*${italicText}*` + value.substring(end);
        cursorOffset = selectedText ? start + italicText.length + 2 : start + 1;
        break;
      case 'list':
        const listText = selectedText || 'list item';
        newText = value.substring(0, start) + `\n• ${listText}` + value.substring(end);
        cursorOffset = start + listText.length + 3;
        break;
      case 'link':
        const linkText = selectedText || 'link text';
        newText = value.substring(0, start) + `[${linkText}](url)` + value.substring(end);
        cursorOffset = selectedText ? start + linkText.length + 3 : start + linkText.length + 3;
        break;
    }
    
    onChange(newText);
    setShowFormatting(false);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.setSelectionRange(cursorOffset, cursorOffset);
      textarea.focus();
    }, 0);
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const selectMention = (mention: { id: string; name: string }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const newValue = 
        value.substring(0, lastAtIndex) + 
        `@${mention.name} ` + 
        value.substring(cursorPos);
      onChange(newValue);
      
      // Set cursor after mention
      const newCursorPos = lastAtIndex + mention.name.length + 2;
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
    
    setShowMentions(false);
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur-sm">
      {/* Reply Banner */}
      {replyTo && (
        <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1">
              Replying to {replyTo.sender}
            </div>
            <div className="text-sm truncate bg-background/50 px-2 py-1 rounded border-l-2 border-primary">
              {replyTo.content}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="ml-2 h-6 w-6 p-0"
            
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Attached Files */}
      {attachedFiles.length > 0 && (
        <div className="px-4 py-2 bg-muted/30 border-b">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border">
                <File className="h-3 w-3" />
                <span className="text-xs font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachedFile(index)}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 mb-3 pb-2 border-b">
          <Popover open={showFormatting} onOpenChange={setShowFormatting}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Bold className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" side="top" align="start">
              <div className="flex gap-0.5">
                <Button variant="ghost" size="sm" onClick={() => insertFormatting('bold')}>
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => insertFormatting('italic')}>
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => insertFormatting('list')}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => insertFormatting('link')}>
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-4" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPinned(!isPinned)}
            className={cn("transition-colors", isPinned && "text-blue-600 bg-blue-50")}
            
          >
            <Pin className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsStarred(!isStarred)}
            className={cn("transition-colors", isStarred && "text-yellow-600 bg-yellow-50")}
            
          >
            <Star className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          <Badge variant="outline" className="text-xs font-normal">
            {value.length}/4000
          </Badge>
        </div>

        {/* Input Area */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-[120px] resize-none pr-20 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
              disabled={disabled}
            />

            {/* Mentions Dropdown */}
            {showMentions && mentions.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-1">People</div>
                  {mentions.map((mention) => (
                    <button
                      key={mention.id}
                      className="w-full text-left px-3 py-2 hover:bg-accent rounded-md flex items-center gap-3 transition-colors"
                      onClick={() => selectMention(mention)}
                    >
                      <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">{mention.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm">{mention.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Controls */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx"
                multiple
                onChange={handleFileUpload}
              />

              <Popover open={showAttachments} onOpenChange={setShowAttachments}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" side="top" align="end">
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="justify-start gap-2"
                    >
                      <File className="h-4 w-4" />
                      Upload file
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start gap-2">
                      <Image className="h-4 w-4" />
                      Upload image
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule meeting
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={showEmoji} onOpenChange={setShowEmoji}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" side="top" align="end">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSend} 
            disabled={(!value.trim() && attachedFiles.length === 0) || disabled}
            className="h-11 w-11 rounded-full p-0 shrink-0"
            
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-2 min-h-[20px]">
          <div className="flex items-center gap-2">
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
          
          <div className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
