import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  Image,
  Video,
  File,
  X,
  AtSign,
  Hash,
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  Quote,
  List,
  ListOrdered,
  Zap
} from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showFormatting?: boolean;
  showAttachments?: boolean;
  showEmoji?: boolean;
  showMentions?: boolean;
  mentions?: Array<{ id: string; name: string; avatar?: string }>;
  channels?: Array<{ id: string; name: string }>;
  maxLength?: number;
}

interface Attachment {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  preview?: string;
}

interface MentionSuggestion {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'channel';
}

export default function MessageInput({
  onSendMessage,
  placeholder = "Type your message...",
  disabled = false,
  className,
  showFormatting = true,
  showAttachments = true,
  showEmoji = true,
  showMentions = true,
  mentions = [],
  channels = [],
  maxLength = 2000
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isComposing, setIsComposing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setMessage(value);
    setCursorPosition(cursorPos);
    adjustTextareaHeight();

    // Check for mentions
    if (showMentions) {
      const beforeCursor = value.substring(0, cursorPos);
      const mentionMatch = beforeCursor.match(/@(\w*)$/);
      const channelMatch = beforeCursor.match(/#(\w*)$/);
      
      if (mentionMatch || channelMatch) {
        const query = (mentionMatch?.[1] || channelMatch?.[1] || '').toLowerCase();
        setMentionQuery(query);
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
        setMentionQuery('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || attachments.length > 0) {
      const files = attachments.map(att => att.file);
      onSendMessage(message.trim(), files);
      setMessage('');
      setAttachments([]);
      adjustTextareaHeight();
      setShowEmojiPicker(false);
      textareaRef.current?.focus();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const type = getFileType(file.type);
      const attachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type
      };

      // Generate preview for images
      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => 
            prev.map(att => 
              att.id === attachment.id 
                ? { ...att, preview: e.target?.result as string }
                : att
            )
          );
        };
        reader.readAsDataURL(file);
      }

      setAttachments(prev => [...prev, attachment]);
    });

    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const getFileType = (mimeType: string): Attachment['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAttachmentIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = Object.assign(audioBlob, { name: `voice-message-${Date.now()}.wav` }) as File;
        
        const attachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          file: audioFile,
          type: 'audio'
        };

        setAttachments(prev => [...prev, attachment]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording saved');
    }
  };

  // Emoji handling
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newMessage = message.substring(0, start) + emojiData.emoji + message.substring(end);
      setMessage(newMessage);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Mention handling
  const insertMention = (mention: MentionSuggestion) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const beforeCursor = message.substring(0, cursorPosition);
      const afterCursor = message.substring(cursorPosition);
      
      const mentionMatch = beforeCursor.match(/@(\w*)$/);
      const channelMatch = beforeCursor.match(/#(\w*)$/);
      
      if (mentionMatch || channelMatch) {
        const matchLength = (mentionMatch?.[0] || channelMatch?.[0] || '').length;
        const prefix = mention.type === 'user' ? '@' : '#';
        const newText = beforeCursor.substring(0, beforeCursor.length - matchLength) + 
                       prefix + mention.name + ' ' + afterCursor;
        
        setMessage(newText);
        setShowMentionSuggestions(false);
        setMentionQuery('');
        
        // Focus and set cursor position
        setTimeout(() => {
          const newCursorPos = beforeCursor.length - matchLength + prefix.length + mention.name.length + 1;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }, 0);
      }
    }
  };

  // Text formatting
  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = message.substring(start, end);
    
    let formattedText = selectedText;
    let wrapper = '';
    
    switch (format) {
      case 'bold':
        wrapper = '**';
        break;
      case 'italic':
        wrapper = '_';
        break;
      case 'code':
        wrapper = '`';
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
    }
    
    if (wrapper) {
      formattedText = `${wrapper}${selectedText}${wrapper}`;
    }
    
    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    // Set cursor position
    setTimeout(() => {
      const newStart = start + formattedText.length;
      textarea.setSelectionRange(newStart, newStart);
      textarea.focus();
    }, 0);
  };

  // Filter mention suggestions
  const filteredMentions = showMentionSuggestions ? [
    ...mentions
      .filter(m => m.name.toLowerCase().includes(mentionQuery))
      .map(m => ({ ...m, type: 'user' as const })),
    ...channels
      .filter(c => c.name.toLowerCase().includes(mentionQuery))
      .map(c => ({ ...c, type: 'channel' as const }))
  ].slice(0, 5) : [];

  return (
    <Card className={cn("p-4", className)}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map(attachment => (
              <div key={attachment.id} className="relative group">
                {attachment.type === 'image' && attachment.preview ? (
                  <div className="relative">
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-muted p-2 rounded-lg pr-8">
                    {getAttachmentIcon(attachment.type)}
                    <div className="text-sm">
                      <p className="font-medium truncate max-w-32">{attachment.file.name}</p>
                      <p className="text-muted-foreground">{formatFileSize(attachment.file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mention Suggestions */}
      {showMentionSuggestions && filteredMentions.length > 0 && (
        <div className="mb-2">
          <div className="border rounded-lg bg-background shadow-lg max-h-32 overflow-y-auto">
            {filteredMentions.map(mention => (
              <Button
                key={`${mention.type}-${mention.id}`}
                variant="ghost"
                className="w-full justify-start h-auto p-2"
                onClick={() => insertMention(mention)}
              >
                <div className="flex items-center gap-2">
                  {mention.type === 'user' ? (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                      {mention.name.charAt(0)}
                    </div>
                  ) : (
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">{mention.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {mention.type}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Formatting Toolbar */}
      {showFormatting && (
        <div className="mb-2 flex items-center gap-1 p-2 bg-muted rounded-lg">
          <Button variant="ghost" size="sm" onClick={() => formatText('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('code')}>
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('link')}>
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('quote')}>
            <Quote className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="w-full min-h-10 max-h-32 p-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            style={{ height: 'auto' }}
          />
          
          {/* Character Count */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {showAttachments && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={isRecording ? 'text-red-500' : ''}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          {showEmoji && (
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" disabled={disabled}>
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-full p-0 border-0">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                />
              </PopoverContent>
            </Popover>
          )}

          <Button variant="ghost" size="sm" disabled={disabled}>
            <Zap className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}