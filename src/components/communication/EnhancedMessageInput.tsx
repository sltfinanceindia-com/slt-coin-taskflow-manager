import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Smile, Send, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AttachmentPreview from './AttachmentPreview';
import MessageReplyPreview from './MessageReplyPreview';
import { useFileUpload } from '@/hooks/useFileUpload';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'video' | 'document' | 'audio';
  file: File;
  preview?: string;
  uploading?: boolean;
  progress?: number;
}

interface EnhancedMessageInputProps {
  onSendMessage: (content: string, attachments?: File[], messageId?: string) => Promise<string | void>;
  placeholder?: string;
  disabled?: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender_name: string;
    attachments?: any[];
  } | null;
  onCancelReply?: () => void;
  className?: string;
}

export default function EnhancedMessageInput({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  replyTo,
  onCancelReply,
  className
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useFileUpload();

  const handleSendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || isSending) return;
    
    setIsSending(true);
    try {
      // Send message first to get message ID
      const messageId = await onSendMessage(message.trim(), [], undefined);
      
      // Upload attachments if any
      if (attachments.length > 0 && messageId) {
        for (const attachment of attachments) {
          setAttachments(prev => 
            prev.map(att => 
              att.id === attachment.id 
                ? { ...att, uploading: true, progress: 50 }
                : att
            )
          );
          
          await uploadFile(attachment.file, messageId);
          
          setAttachments(prev => 
            prev.map(att => 
              att.id === attachment.id 
                ? { ...att, uploading: false, progress: 100 }
                : att
            )
          );
        }
      }
      
      setMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        toast.error(`File ${file.name} is too large. Maximum size is 20MB.`);
        return;
      }

      const attachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: getFileType(file.type),
        file,
        uploading: false,
        progress: 0
      };

      // Generate preview for images
      if (attachment.type === 'image') {
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

    e.target.value = '';
  };

  const getFileType = (mimeType: string): Attachment['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Reply Preview */}
      {replyTo && onCancelReply && (
        <MessageReplyPreview replyTo={replyTo} onCancel={onCancelReply} />
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <AttachmentPreview
          attachments={attachments}
          onRemove={removeAttachment}
          showRemove={true}
        />
      )}

      {/* Input Area */}
      <div className="flex items-end gap-1.5 sm:gap-2">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        {/* Attach Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
          className="flex-shrink-0 h-10 w-10 min-h-[44px] min-w-[44px]"
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="pr-10 min-h-[44px] text-base"
            aria-label="Message input"
          />
          
          {/* Emoji Picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                disabled={disabled || isSending}
                aria-label="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-full p-0 border-0" 
              side="top"
              align="end"
            >
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                width={320}
                height={350}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={(!message.trim() && attachments.length === 0) || disabled || isSending}
          className="flex-shrink-0 h-10 w-10 min-h-[44px] min-w-[44px] sm:w-auto sm:px-4"
          size="icon"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Send</span>
        </Button>
      </div>

      {/* Helper Text - hidden on mobile */}
      <p className="hidden sm:block text-xs text-muted-foreground px-1">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}
