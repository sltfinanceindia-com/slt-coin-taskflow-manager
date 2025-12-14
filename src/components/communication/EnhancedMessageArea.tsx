import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { 
  Info,
  ArrowLeft,
  Download,
  File as FileIcon,
  ChevronLeft,
  Smile,
  Reply,
  Forward,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import UserProfileModal from './UserProfileModal';
import { EnhancedMessageStatus, MessageTicks } from './EnhancedMessageStatus';
import { EnhancedPresenceStatus, PresenceBadge } from './EnhancedPresenceStatus';
import LastSeenDisplay from './LastSeenDisplay';
import TypingIndicator from './TypingIndicator';
import MessageActions from './MessageActions';
import EnhancedMessageInput from './EnhancedMessageInput';
import ForwardMessageDialog from './ForwardMessageDialog';
import AttachmentPreview from './AttachmentPreview';
import MessageReplyPreview from './MessageReplyPreview';
import { usePresence } from '@/hooks/usePresence';
import { useMessageStates } from '@/hooks/useMessageStates';
import { useAuth } from '@/hooks/useAuth';
import type { Channel, Message, TeamMember } from '@/hooks/useCommunication';
import { format, isToday, isYesterday } from 'date-fns';

interface EnhancedMessageAreaProps {
  channel: Channel;
  messages: Message[];
  teamMembers: TeamMember[];
  currentUser: any;
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<string | void>;
  onStartCall?: (callType: 'voice' | 'video') => void;
  onShowDetails?: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}


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
  const { profile } = useAuth();

  // State management
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [messageReactions, setMessageReactions] = useState<{[key: string]: any[]}>({});
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { presenceList, getStatusText, getStatusIcon } = usePresence();
  const { markAsRead } = useMessageStates();
  
  // Track online users
  const onlineUsers = useMemo(() => {
    return new Set(
      presenceList
        .filter(p => p.status === 'online' || p.status === 'active')
        .map(p => p.user_id)
    );
  }, [presenceList]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when channel changes
  useEffect(() => {
    if (messages.length > 0 && channel) {
      const unreadMessages = messages.filter(m => 
        !m.is_read && m.sender_id !== currentUser?.id
      );
      unreadMessages.forEach(message => {
        markAsRead(message.id);
      });
    }
  }, [messages, channel, currentUser?.id, markAsRead]);

  /**
   * Get the other user in a direct message channel
   */
  const getChannelUser = (): TeamMember | null => {
    if (!channel.is_direct_message || !channel.participant_ids) return null;
    const otherUserId = channel.participant_ids.find(id => id !== currentUser?.id);
    return teamMembers.find(member => member.id === otherUserId) || null;
  };

  const channelUser = getChannelUser();

  /**
   * Get initials from a name for avatar fallback
   */
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  /**
   * Send a message
   */
  const handleSendMessage = async (content: string, attachments?: File[], messageId?: string): Promise<string | void> => {
    if (replyToMessage) {
      // TODO: Handle reply logic with backend
      console.log('Replying to message:', replyToMessage.id);
    }
    
    const newMessageId = await onSendMessage(content);
    setReplyToMessage(null);
    return newMessageId;
  };

  /**
   * Handle message reaction
   */
  const handleReaction = (messageId: string, emoji: string) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji]
    }));
    toast.success('Reaction added');
    // TODO: Save reaction to database
  };

  /**
   * Handle message reply
   */
  const handleReply = (message: Message) => {
    setReplyToMessage(message);
  };

  /**
   * Handle message forward
   */
  const handleForward = (message: Message) => {
    setForwardMessage(message);
    setShowForwardDialog(true);
  };

  /**
   * Handle message delete
   */
  const handleDelete = async (messageId: string) => {
    // TODO: Implement delete logic
    toast.success('Message deleted');
  };

  /**
   * Handle forward to targets
   */
  const handleForwardToTargets = async (targetIds: string[]) => {
    // TODO: Implement forward logic
    console.log('Forwarding to:', targetIds);
  };


  /**
   * Format message timestamp
   */
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

  /**
   * Group messages by date
   */
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

  /**
   * Render individual message
   */
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
            "bg-card border rounded-lg px-3 py-2 max-w-md break-words relative",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            
            {/* File Attachments Display */}
            {(message as any).file_attachments && (message as any).file_attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {(message as any).file_attachments.map((attachment: any) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-background/10 rounded border">
                    <FileIcon className="h-4 w-4" />
                    <span className="text-xs flex-1 truncate">{attachment.file_name}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0"
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.storage
                            .from('attachments')
                            .download(attachment.storage_path);
                          
                          if (error) throw error;
                          
                          const url = URL.createObjectURL(data);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = attachment.file_name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Download error:', error);
                        }
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Message Actions */}
            <MessageActions
              messageId={message.id}
              messageContent={message.content}
              isOwn={isOwn}
              onReply={() => handleReply(message)}
              onForward={() => handleForward(message)}
              onDelete={() => handleDelete(message.id)}
              onReact={(emoji) => handleReaction(message.id, emoji)}
              className="mt-2"
            />

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

          {/* Message State Indicator - Enhanced with ticks */}
          {isOwn && (
            <div className="flex items-center gap-1.5 mt-1">
              <EnhancedMessageStatus 
                state={message.is_read ? 'read' : 'delivered'} 
                timestamp={message.created_at}
                readAt={message.is_read ? message.created_at : undefined}
                showTooltip={true}
                size="sm"
              />
              <span className="text-[10px] text-muted-foreground">
                {message.is_read ? 'Read' : 'Delivered'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div 
        className="border-b border-border px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 flex items-center justify-between sticky top-0 bg-card z-10 shadow-sm shrink-0"
        style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
          {isMobile && onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 min-h-[44px] min-w-[44px]" aria-label="Go back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-border">
                <AvatarImage src={channelUser?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                  {getInitials(
                    channel.is_direct_message
                      ? (getChannelUser()?.full_name || 'Unknown')
                      : channel.name
                  )}
                </AvatarFallback>
              </Avatar>
              {/* Presence badge on avatar */}
              {channel.is_direct_message && channelUser && (
                <PresenceBadge 
                  status={onlineUsers.has(channelUser.id) ? 'online' : 'offline'} 
                  size="md"
                  className="-bottom-0.5 -right-0.5"
                />
              )}
            </div>
            
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {channel.is_direct_message ? getChannelUser()?.full_name : channel.name}
              </h3>
              {channel.is_direct_message && channelUser && (
                <LastSeenDisplay
                  isOnline={onlineUsers.has(channelUser.id)}
                  lastSeen={presenceList.find(p => p.user_id === channelUser.id)?.last_seen}
                  statusMessage={presenceList.find(p => p.user_id === channelUser.id)?.status_message}
                  variant="compact"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[44px] min-w-[44px]" onClick={() => setShowProfileModal(true)} aria-label="Channel info">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                {channel.is_direct_message ? (
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={channelUser?.avatar_url} />
                    <AvatarFallback className="text-sm sm:text-base">
                      {channelUser ? getInitials(channelUser.full_name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-muted-foreground">
                    {channel.name.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {channel.is_direct_message && channelUser 
                  ? `This is the beginning of your conversation with ${channelUser.full_name}`
                  : `Welcome to #${channel.name}`
                }
              </h3>
              <p className="text-sm text-muted-foreground px-4">
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
                <div className="flex items-center gap-3 sm:gap-4 my-4 sm:my-6">
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
      <div 
        className="p-3 md:p-4 border-t border-border bg-card/50 backdrop-blur-sm shrink-0"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <EnhancedMessageInput
          onSendMessage={handleSendMessage}
          placeholder={`Message ${channel.is_direct_message && channelUser ? channelUser.full_name : `#${channel.name}`}`}
          disabled={isLoading}
          replyTo={replyToMessage ? {
            id: replyToMessage.id,
            content: replyToMessage.content,
            sender_name: replyToMessage.sender_name || 'Unknown',
            attachments: replyToMessage.attachments || []
          } : undefined}
          onCancelReply={() => setReplyToMessage(null)}
        />
      </div>

      {/* User Profile Modal */}
      {showProfileModal && channelUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={channelUser}
          onSendMessage={() => {
            setShowProfileModal(false);
          }}
        />
      )}

      {/* Forward Message Dialog */}
      <ForwardMessageDialog
        open={showForwardDialog}
        onOpenChange={setShowForwardDialog}
        message={forwardMessage}
        targets={teamMembers.map(m => ({ 
          id: m.id, 
          name: m.full_name, 
          avatar_url: m.avatar_url, 
          type: 'user' as const 
        }))}
        onForward={handleForwardToTargets}
      />
    </div>
  );
}
