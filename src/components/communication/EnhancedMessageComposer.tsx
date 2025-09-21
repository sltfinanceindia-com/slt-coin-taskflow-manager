import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Bold, 
  Italic, 
  Underline,
  Code,
  List,
  ListOrdered,
  Quote,
  Link,
  AtSign,
  Hash,
  Slash,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';

interface EnhancedMessageComposerProps {
  onSendMessage: (content: string, attachments?: File[], mentions?: string[]) => Promise<void>;
  placeholder?: string;
  channel?: any;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  className?: string;
}

interface SlashCommand {
  command: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export default function EnhancedMessageComposer({
  onSendMessage,
  placeholder = "Type a message...",
  channel,
  onTypingStart,
  onTypingStop,
  disabled = false,
  className
}: EnhancedMessageComposerProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slashCommands: SlashCommand[] = [
    {
      command: '/giphy',
      description: 'Search for GIFs',
      icon: <ImageIcon className="h-4 w-4" />,
      action: () => console.log('Giphy search')
    },
    {
      command: '/poll',
      description: 'Create a poll',
      icon: <List className="h-4 w-4" />,
      action: () => console.log('Create poll')
    },
    {
      command: '/meeting',
      description: 'Schedule a meeting',
      icon: <Video className="h-4 w-4" />,
      action: () => console.log('Schedule meeting')
    },
    {
      command: '/remind',
      description: 'Set a reminder',
      icon: <Quote className="h-4 w-4" />,
      action: () => console.log('Set reminder')
    }
  ];

  const mentionUsers: MentionUser[] = [
    { id: '1', name: 'John Doe', avatar: '', role: 'admin' },
    { id: '2', name: 'Jane Smith', avatar: '', role: 'intern' },
    { id: '3', name: 'Mike Johnson', avatar: '', role: 'admin' }
  ];

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Handle typing indicators
  useEffect(() => {
    if (message.length > 0 && onTypingStart) {
      onTypingStart();
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const timeout = setTimeout(() => {
        onTypingStop?.();
      }, 1000);
      
      setTypingTimeout(timeout);
    } else if (message.length === 0 && onTypingStop) {
      onTypingStop();
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [message, onTypingStart, onTypingStop, typingTimeout]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setCursorPosition(e.target.selectionStart);

    // Check for slash commands
    const lastWord = value.slice(0, e.target.selectionStart).split(' ').pop();
    if (lastWord?.startsWith('/')) {
      setShowSlashCommands(true);
    } else {
      setShowSlashCommands(false);
    }

    // Check for mentions
    if (lastWord?.startsWith('@')) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    if (e.key === 'Escape') {
      setShowSlashCommands(false);
      setShowMentions(false);
    }

    // Keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case '`':
          e.preventDefault();
          formatText('code');
          break;
      }
    }
  };

  const formatText = (format: string) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = message.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;
    
    setIsUploading(true);
    try {
      const mentions = extractMentions(message);
      await onSendMessage(message, attachments, mentions);
      setMessage('');
      setAttachments([]);
      onTypingStop?.();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  const insertEmoji = (emoji: any) => {
    const newMessage = message.slice(0, cursorPosition) + emoji.emoji + message.slice(cursorPosition);
    setMessage(newMessage);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (file.type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card 
      className={cn(
        "p-4 bg-card border-border transition-all duration-200",
        dragOver && "border-primary border-2",
        className
      )}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              {getFileIcon(file)}
              <span className="text-sm truncate flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Slash Commands Dropdown */}
      {showSlashCommands && (
        <Card className="mb-2 p-2 max-h-48 overflow-y-auto">
          <div className="space-y-1">
            {slashCommands.map((cmd) => (
              <Button
                key={cmd.command}
                variant="ghost"
                className="w-full justify-start h-auto p-2"
                onClick={cmd.action}
              >
                <div className="flex items-center gap-2">
                  {cmd.icon}
                  <div className="text-left">
                    <div className="font-medium text-sm">{cmd.command}</div>
                    <div className="text-xs text-muted-foreground">{cmd.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Mentions Dropdown */}
      {showMentions && (
        <Card className="mb-2 p-2 max-h-48 overflow-y-auto">
          <div className="space-y-1">
            {mentionUsers.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start h-auto p-2"
                onClick={() => {
                  const newMessage = message.replace(/@\w*$/, `@${user.name} `);
                  setMessage(newMessage);
                  setShowMentions(false);
                  textareaRef.current?.focus();
                }}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium text-sm">{user.name}</div>
                    {user.role && (
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Formatting Toolbar */}
      {showFormatting && (
        <div className="mb-3 flex items-center gap-1 p-2 bg-muted rounded-lg">
          <Button variant="ghost" size="sm" onClick={() => formatText('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('underline')}>
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('code')}>
            <Code className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" onClick={() => formatText('quote')}>
            <Quote className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Link className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[40px] max-h-[200px] resize-none pr-32 bg-background"
          disabled={disabled || isUploading}
        />

        {/* Action Buttons */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowFormatting(!showFormatting)}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0">
              <EmojiPicker onEmojiClick={insertEmoji} />
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={(!message.trim() && attachments.length === 0) || disabled || isUploading}
            className="h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>
          Press <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to send, 
          <kbd className="px-1 py-0.5 bg-muted rounded">Shift+Enter</kbd> for new line
        </span>
        {message.length > 0 && (
          <span>{message.length}/4000</span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </Card>
  );
}