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
  MicOff,
  Send,
  MoreHorizontal,
  Circle,
  Reply,
  Heart,
  ThumbsUp,
  Laugh,
  ArrowLeft,
  PhoneOff,
  VideoOff,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import UserProfileModal from './UserProfileModal';
import MessageStateIndicator from './MessageStateIndicator';
import TypingIndicator from './TypingIndicator';
import EmojiPicker from './EmojiPicker';
import AttachmentUpload from './AttachmentUpload';
import VoiceRecorder from './VoiceRecorder';
import { usePresence } from '@/hooks/usePresence';
import { useMessageStates } from '@/hooks/useMessageStates';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/hooks/useAuth';
import { useWebRTC } from '@/hooks/useWebRTC';
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
  const { profile } = useAuth();
  
  // ✅ WebRTC hook for call functionality
  const {
    callState,
    localStream,
    remoteStreams,
    localVideoRef,
    startVoiceCall,
    startVideoCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    startScreenShare,
    stopScreenShare
  } = useWebRTC();

  // State management
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [messageReactions, setMessageReactions] = useState<{[key: string]: string[]}>({});
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const { getUserPresence, getStatusText, getStatusIcon } = usePresence();
  const { markAsRead } = useMessageStates();
  const { uploadFile } = useFileUpload();

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
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    onSendMessage(messageInput.trim());
    setMessageInput('');
    inputRef.current?.focus();
    setShowEmojiPicker(false);
  };

  /**
   * Handle emoji selection
   */
  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  /**
   * Handle file upload
   */
  const handleFileUploaded = (attachment: any) => {
    console.log('File uploaded:', attachment);
    toast.success('File uploaded successfully');
  };

  /**
   * Handle voice recording
   */
  const handleVoiceRecorded = (audioBlob: Blob) => {
    console.log('Voice recorded:', audioBlob);
    toast.success('Voice message recorded');
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
   * Handle Enter key press in message input
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * ✅ Enhanced call handler with proper validation and error handling
   */
  const handleStartCall = async (callType: 'voice' | 'video') => {
    console.log('=== handleStartCall triggered ===');
    console.log('Call type:', callType);
    console.log('Channel:', channel);
    console.log('Channel User:', channelUser);
    console.log('Current Profile:', profile);

    // Validation checks
    if (!channel) {
      console.error('No channel available');
      toast.error('Cannot start call: No channel selected');
      return;
    }

    if (!channel.is_direct_message) {
      console.error('Not a direct message channel');
      toast.error('Calls are only available in direct messages');
      return;
    }

    if (!channelUser) {
      console.error('No channel user found');
      toast.error('Cannot start call: Recipient not found');
      return;
    }

    if (!profile?.id) {
      console.error('No profile loaded');
      toast.error('Cannot start call: Your profile is not loaded. Please refresh the page.');
      return;
    }

    if (!channelUser.id) {
      console.error('Channel user has no ID');
      toast.error('Cannot start call: Invalid recipient');
      return;
    }

    // Check if already in a call
    if (callState.isActive) {
      toast.warning('You are already in a call');
      return;
    }

    // Check if there's an incoming call
    if (callState.isIncoming) {
      toast.warning('You have an incoming call. Please answer or decline it first.');
      return;
    }

    try {
      setIsInitiatingCall(true);
      console.log('Initiating call...');
      console.log('Caller Profile ID:', profile.id);
      console.log('Recipient Profile ID:', channelUser.id);
      console.log('Recipient Name:', channelUser.full_name);

      // Start the appropriate call type
      if (callType === 'voice') {
        console.log('Starting voice call...');
        await startVoiceCall(channelUser.id, channelUser.full_name);
      } else {
        console.log('Starting video call...');
        await startVideoCall(channelUser.id, channelUser.full_name);
      }

      console.log('Call initiated successfully');
      
      // Call the parent handler if provided
      if (onStartCall) {
        onStartCall(callType);
      }

    } catch (error: any) {
      console.error('=== Call initiation error ===');
      console.error('Error:', error);
      
      let errorMessage = 'Failed to start call';
      
      if (error.message?.includes('permission') || error.message?.includes('denied')) {
        errorMessage = 'Camera/microphone access denied. Please enable permissions in your browser settings.';
      } else if (error.message?.includes('not found') || error.message?.includes('NotFoundError')) {
        errorMessage = 'No camera or microphone found. Please connect devices and try again.';
      } else if (error.message?.includes('busy') || error.message?.includes('NotReadableError')) {
        errorMessage = 'Camera/microphone is busy. Close other apps and try again.';
      } else if (error.message?.includes('profile not loaded')) {
        errorMessage = 'Your profile is not loaded. Please refresh the page.';
      } else if (error.message?.includes('authentication') || error.message?.includes('mismatch')) {
        errorMessage = 'Authentication error. Please log out and log back in.';
      } else if (error.message?.includes('security') || error.message?.includes('RLS')) {
        errorMessage = 'Database security error. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsInitiatingCall(false);
    }
  };

  /**
   * Handle incoming call answer
   */
  const handleAnswerCall = async () => {
    try {
      console.log('Answering incoming call...');
      await answerCall();
      toast.success('Call connected');
    } catch (error: any) {
      console.error('Error answering call:', error);
      toast.error(`Failed to answer: ${error.message}`);
    }
  };

  /**
   * Handle call decline
   */
  const handleDeclineCall = async () => {
    try {
      console.log('Declining call...');
      await declineCall();
      toast.info('Call declined');
    } catch (error: any) {
      console.error('Error declining call:', error);
      toast.error('Error declining call');
    }
  };

  /**
   * Handle end call
   */
  const handleEndCall = async () => {
    try {
      console.log('Ending call...');
      await endCall();
    } catch (error: any) {
      console.error('Error ending call:', error);
      toast.error('Error ending call');
    }
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
            "bg-card border rounded-lg px-3 py-2 max-w-md break-words",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            
            {/* Message Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex items-center gap-1">
              {reactions.map((reaction) => (
                <Button
                  key={reaction.emoji}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleReaction(message.id, reaction.emoji)}
                  title={`React with ${reaction.emoji}`}
                >
                  <span className="text-xs">{reaction.emoji}</span>
                </Button>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                title="Reply"
              >
                <Reply className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                title="More options"
              >
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
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Back Button */}
            {isMobile && onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {/* Channel Avatar/Info */}
            {channel.is_direct_message && channelUser ? (
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors flex-1 min-w-0"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="relative flex-shrink-0">
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
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{channelUser.full_name}</h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {getStatusText(getUserPresence(channelUser.id))}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">
                    {channel.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{channel.name}</h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {channel.member_count} members
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {channel.is_direct_message && !callState.isActive && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartCall('voice')}
                  disabled={isInitiatingCall || !channelUser}
                  className="hover-scale"
                  title="Start voice call"
                >
                  {isInitiatingCall ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      {!isMobile && <span className="ml-2">Call</span>}
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartCall('video')}
                  disabled={isInitiatingCall || !channelUser}
                  className="hover-scale"
                  title="Start video call"
                >
                  {isInitiatingCall ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      {!isMobile && <span className="ml-2">Video</span>}
                    </>
                  )}
                </Button>
              </>
            )}
            {callState.isActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndCall}
                className="hover-scale"
                title="End call"
              >
                <PhoneOff className="h-4 w-4" />
                {!isMobile && <span className="ml-2">End Call</span>}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowDetails}
              className="hover-scale"
              title="Show details"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Call Indicator */}
        {callState.isActive && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Badge variant="default" className="animate-pulse">
              <Circle className="h-2 w-2 mr-1 fill-current" />
              Call in progress
            </Badge>
            {callState.isMuted && (
              <Badge variant="secondary">
                <MicOff className="h-3 w-3 mr-1" />
                Muted
              </Badge>
            )}
            {!callState.isVideoEnabled && callState.callType === 'video' && (
              <Badge variant="secondary">
                <VideoOff className="h-3 w-3 mr-1" />
                Camera off
              </Badge>
            )}
          </div>
        )}
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
              className="pr-32"
              disabled={callState.isActive}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Emoji Picker */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={callState.isActive}
                  title="Add emoji"
                >
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
                {showEmojiPicker && (
                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onEmojiSelect={handleEmojiSelect}
                  />
                )}
              </div>
              
              {/* Attachment Upload */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
                  disabled={callState.isActive}
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </Button>
                {showAttachmentUpload && (
                  <AttachmentUpload
                    isOpen={showAttachmentUpload}
                    onClose={() => setShowAttachmentUpload(false)}
                    onFileUploaded={handleFileUploaded}
                    messageId={`temp-${Date.now()}`}
                  />
                )}
              </div>
              
              {/* Voice Recorder */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  disabled={callState.isActive}
                  title="Record voice message"
                >
                  <Mic className="h-4 w-4 text-muted-foreground" />
                </Button>
                {showVoiceRecorder && (
                  <VoiceRecorder
                    isOpen={showVoiceRecorder}
                    onClose={() => setShowVoiceRecorder(false)}
                    onVoiceRecorded={handleVoiceRecorded}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Send Button */}
          <Button 
            size="sm" 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || callState.isActive}
            className="hover-scale"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Call in progress warning */}
        {callState.isActive && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            <span>Messaging is disabled during calls</span>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showProfileModal && channelUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={channelUser}
          onStartCall={(callType) => {
            setShowProfileModal(false);
            handleStartCall(callType);
          }}
          onSendMessage={() => {
            setShowProfileModal(false);
            inputRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
