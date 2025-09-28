import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Mic,
  Send,
  MoreHorizontal,
  Circle,
  Reply,
  Heart,
  ThumbsUp,
  Laugh,
  ArrowLeft
} from 'lucide-react';
import UserProfileModal from './UserProfileModal';
import MessageStateIndicator from './MessageStateIndicator';
import TypingIndicator from './TypingIndicator';
import EmojiPicker from './EmojiPicker';
import AttachmentUpload from './AttachmentUpload';
import VoiceRecorder from './VoiceRecorder';
import { usePresence } from '@/hooks/usePresence';
import { useMessageStates } from '@/hooks/useMessageStates';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { Channel, Message, TeamMember } from '@/hooks/useCommunication';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

interface EnhancedMessageAreaProps {
  channel: Channel;
  messages: Message[];
  teamMembers: TeamMember[];
  currentUser: any;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onStartCall?: (callType: 'voice' | 'video') => void;
  onShowDetails?: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}

const reactions = [
  { emoji: '❤️', icon: Heart },
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '😄', icon: Laugh },
  { emoji: '😮', icon: Circle },
];

export default function EnhancedMessageArea({
  channel,
  messages,
  teamMembers,
  currentUser,
  isLoading,
  onSendMessage,
  onStartCall,
  onShowDetails,
  onBack,
  isMobile = false
}: EnhancedMessageAreaProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [messageReactions, setMessageReactions] = useState<{[key: string]: string[]}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getUserPresence, getStatusText, getStatusIcon } = usePresence();
  const { markAsRead } = useMessageStates();
  const { uploadFile } = useFileUpload();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChannelUser = (): TeamMember | null => {
    if (!channel.is_direct_message || !channel.participant_ids) return null;
    const otherUserId = channel.participant_ids.find(id => id !== currentUser?.id);
    return teamMembers.find(member => member.id === otherUserId) || null;
  };

  const channelUser = getChannelUser();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    onSendMessage(messageInput.trim());
    setMessageInput('');
    inputRef.current?.focus();
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleFileUploaded = (attachment: any) => {
    // Handle file upload - could send as message or add to current message
    console.log('File uploaded:', attachment);
  };

  const handleVoiceRecorded = (audioBlob: Blob) => {
    // Handle voice message - could convert to file and upload
    console.log('Voice recorded:', audioBlob);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji]
    }));
    // TODO: Save reaction to database
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      let key;
      
      if (isToday(date)) {
        key = 'Today';
      } else if (isYesterday(date)) {
        key = 'Yesterday';
      } else {
        key = format(date, 'MMMM d, yyyy');
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(message);
    });
    
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const renderMessage = (message: Message, isOwn: boolean) => {
    return (
      <div key={message.id} className={cn(
        "flex gap-3 group hover:bg-muted/30 p-2 -mx-2 rounded-lg transition-colors",
        isOwn && "flex-row-reverse"
      )}>
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={isOwn ? currentUser?.avatar_url : channelUser?.avatar_url} />
          <AvatarFallback className="text-xs">
            {getInitials(message.sender_name || 'Unknown')}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className={cn("flex-1 min-w-0", isOwn && "flex flex-col items-end")}>
          {/* Message Header */}
          <div className={cn("flex items-center gap-2 mb-1", isOwn && "flex-row-reverse")}>
            <span className="font-medium text-sm">
              {isOwn ? 'You' : message.sender_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(message.created_at)}
            </span>
            {message.is_edited && (
              <Badge variant="outline" className="text-xs px-1">edited</Badge>
            )}
          </div>

          {/* Message Body */}
          <div className={cn(
            "bg-card border rounded-lg px-3 py-2 max-w-md break-words",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <p className="text-sm leading-relaxed">{message.content}</p>
            
            {/* Message Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex items-center gap-1">
              {reactions.map((reaction) => (
                <Button
                  key={reaction.emoji}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleReaction(message.id, reaction.emoji)}
                >
                  <span className="text-xs">{reaction.emoji}</span>
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Reply className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>

            {/* Message Reactions Display */}
            {messageReactions[message.id] && messageReactions[message.id].length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {Array.from(new Set(messageReactions[message.id])).map((emoji, index) => {
                  const count = messageReactions[message.id].filter(r => r === emoji).length;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 py-0 text-xs"
                      onClick={() => handleReaction(message.id, emoji)}
                    >
                      {emoji} {count > 1 && count}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

            {/* Message State Indicator */}
            {isOwn && (
              <div className="flex items-center gap-1 mt-1">
                <MessageStateIndicator 
                  state={message.is_read ? 'read' : 'delivered'} 
                />
                <span className="text-xs text-muted-foreground">
                  {message.is_read ? 'Read' : 'Delivered'}
                </span>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Channel Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            {isMobile && onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {/* Channel Avatar/Info */}
            {channel.is_direct_message && channelUser ? (
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={channelUser.avatar_url} />
                    <AvatarFallback>
                      {getInitials(channelUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 text-sm">
                    {getStatusIcon(getUserPresence(channelUser.id))}
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold">{channelUser.full_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {getStatusText(getUserPresence(channelUser.id))}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {channel.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold">{channel.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {channel.member_count} members
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {channel.is_direct_message && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStartCall?.('voice')}
                  className="hover-scale"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStartCall?.('video')}
                  className="hover-scale"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowDetails}
              className="hover-scale"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                {channel.is_direct_message ? (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={channelUser?.avatar_url} />
                    <AvatarFallback>
                      {channelUser ? getInitials(channelUser.full_name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {channel.name.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {channel.is_direct_message && channelUser 
                  ? `This is the beginning of your conversation with ${channelUser.full_name}`
                  : `Welcome to #${channel.name}`
                }
              </h3>
              <p className="text-muted-foreground">
                {channel.is_direct_message 
                  ? 'Send a message to start the conversation'
                  : channel.description || 'This is the start of this channel'
                }
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-2">
                {/* Date Separator */}
                <div className="flex items-center gap-4 my-6">
                  <Separator className="flex-1" />
                  <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded">
                    {date}
                  </span>
                  <Separator className="flex-1" />
                </div>

                {/* Messages for this date */}
                <div className="space-y-2">
                  {dateMessages.map((message) => 
                    renderMessage(message, message.sender_id === currentUser?.id)
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          <TypingIndicator 
            typingUsers={[]} 
            className="mb-4"
          />
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder={`Message ${channel.is_direct_message && channelUser ? channelUser.full_name : `#${channel.name}`}`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  onEmojiSelect={handleEmojiSelect}
                />
              </div>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </Button>
                <AttachmentUpload
                  isOpen={showAttachmentUpload}
                  onClose={() => setShowAttachmentUpload(false)}
                  onFileUploaded={handleFileUploaded}
                  messageId={`temp-${Date.now()}`}
                />
              </div>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                >
                  <Mic className="h-4 w-4 text-muted-foreground" />
                </Button>
                <VoiceRecorder
                  isOpen={showVoiceRecorder}
                  onClose={() => setShowVoiceRecorder(false)}
                  onVoiceRecorded={handleVoiceRecorded}
                />
              </div>
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="hover-scale"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={channelUser}
        onStartCall={(callType) => {
          onStartCall?.(callType);
          setShowProfileModal(false);
        }}
        onSendMessage={() => {
          setShowProfileModal(false);
          inputRef.current?.focus();
        }}
      />
    </div>
  );
}