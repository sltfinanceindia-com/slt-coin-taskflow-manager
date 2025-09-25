import React, { useState } from 'react';
import { useCommunication } from '@/hooks/useCommunication';
import { useWebRTC } from '@/hooks/useWebRTC';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageCircle } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import TeamsNavigation from './TeamsNavigation';
import EnhancedChatList from './EnhancedChatList';
import EnhancedMessageArea from './EnhancedMessageArea';
import EnhancedCallHistory from './EnhancedCallHistory';
import CallInterface from './CallInterface';
import IncomingCallModal from './IncomingCallModal';
import OutgoingCallScreen from './OutgoingCallScreen';
import ConnectedCallScreen from './ConnectedCallScreen';
import NotificationBanner from './NotificationBanner';
import { FullLayoutSkeleton } from './SkeletonLoaders';

export default function CommunicationLayout() {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const communication = useCommunication();
  const webrtc = useWebRTC();
  const { presenceList, setBusyStatus, clearBusyStatus } = usePresence();
  const notifications = useNotifications();
  const [activeView, setActiveView] = useState<'chats' | 'calls' | 'calendar' | 'files' | 'teams'>('chats');
  const [callMinimized, setCallMinimized] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const handleChannelSelect = (channel: any) => {
    communication.selectChannel(channel);
    setActiveView('chats');
  };

  const handleMemberSelect = async (member: any) => {
    const dmChannel = await communication.createDirectMessage(member.id);
    setActiveView('chats');
  };

  const handleStartCall = async (memberId: string, callType: 'voice' | 'video') => {
    try {
      // Set busy status during call
      await setBusyStatus();
      
      if (callType === 'video') {
        webrtc.startVideoCall(memberId);
      } else {
        webrtc.startVoiceCall(memberId);
      }
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      webrtc.endCall();
      // Clear busy status after call
      await clearBusyStatus();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  // Helper function to get user from team members
  const getChannelUser = (channel: any) => {
    if (!channel?.is_direct_message || !channel?.participant_ids) return null;
    const otherUserId = channel.participant_ids.find((id: string) => id !== profile?.id);
    return communication.teamMembers.find(member => member.id === otherUserId) || null;
  };

  if (communication.isLoading) {
    return <FullLayoutSkeleton />;
  }

  // Calculate unread counts
  const totalUnreadCount = communication.channels.reduce((acc, channel) => acc + channel.unread_count, 0);
  const missedCallsCount = 0; // Would come from call history

  const renderMainContent = () => {
    switch (activeView) {
      case 'chats':
        return isMobile ? (
          // Mobile: Single panel view
          showSidebar || !communication.selectedChannel ? (
            <EnhancedChatList
              channels={communication.channels}
              teamMembers={communication.teamMembers}
              selectedChannel={communication.selectedChannel}
              onChannelSelect={(channel) => {
                handleChannelSelect(channel);
                setShowSidebar(false);
              }}
              onMemberSelect={handleMemberSelect}
              onStartCall={handleStartCall}
              searchQuery={communication.searchQuery}
              onSearchChange={communication.setSearchQuery}
            />
          ) : (
            <EnhancedMessageArea
              channel={communication.selectedChannel}
              messages={communication.messages}
              teamMembers={communication.teamMembers}
              currentUser={profile}
              isLoading={communication.isLoadingMessages}
              onSendMessage={(content) => communication.sendMessage(content, communication.selectedChannel?.id)}
              onStartCall={(callType) => {
                const channelUser = getChannelUser(communication.selectedChannel);
                if (channelUser) handleStartCall(channelUser.id, callType);
              }}
              onBack={() => setShowSidebar(true)}
              isMobile={true}
            />
          )
        ) : (
          // Desktop: Resizable panels
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Chat List Panel */}
            <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
              <EnhancedChatList
                channels={communication.channels}
                teamMembers={communication.teamMembers}
                selectedChannel={communication.selectedChannel}
                onChannelSelect={handleChannelSelect}
                onMemberSelect={handleMemberSelect}
                onStartCall={handleStartCall}
                searchQuery={communication.searchQuery}
                onSearchChange={communication.setSearchQuery}
              />
            </ResizablePanel>

            <ResizableHandle className="w-1 bg-border/50 hover:bg-border transition-colors" />

            {/* Message Area Panel */}
            <ResizablePanel defaultSize={70} minSize={60}>
              {communication.selectedChannel ? (
                <EnhancedMessageArea
                  channel={communication.selectedChannel}
                  messages={communication.messages}
                  teamMembers={communication.teamMembers}
                  currentUser={profile}
                  isLoading={communication.isLoadingMessages}
                  onSendMessage={(content) => communication.sendMessage(content, communication.selectedChannel?.id)}
                  onStartCall={(callType) => {
                    const channelUser = getChannelUser(communication.selectedChannel);
                    if (channelUser) handleStartCall(channelUser.id, callType);
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-background">
                  <div className="text-center space-y-6 max-w-md mx-auto p-6">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-semibold">Welcome to Chat</h3>
                    <p className="text-muted-foreground">
                      Select a conversation from the left panel to start chatting, or create a new conversation with a team member.
                    </p>
                  </div>
                </div>
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        );

      case 'calls':
        return (
          <div className="h-full">
            <EnhancedCallHistory
              onCallBack={handleStartCall}
              onMessage={(participantId) => {
                const member = communication.teamMembers.find(m => m.id === participantId);
                if (member) handleMemberSelect(member);
              }}
            />
          </div>
        );

      case 'calendar':
        return (
          <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-2xl font-semibold">Calendar</h3>
              <p className="text-muted-foreground">Calendar integration coming soon!</p>
            </div>
          </div>
        );

      case 'files':
        return (
          <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="text-2xl font-semibold">Files</h3>
              <p className="text-muted-foreground">File sharing coming soon!</p>
            </div>
          </div>
        );

      case 'teams':
        return (
          <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-2xl font-semibold">Teams</h3>
              <p className="text-muted-foreground">Team management coming soon!</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="h-screen flex bg-background overflow-hidden">
        {/* Teams Navigation */}
        <TeamsNavigation
          activeView={activeView}
          onViewChange={setActiveView}
          unreadCount={totalUnreadCount}
          missedCallsCount={missedCallsCount}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

      {/* Call Interface Overlay */}
      <CallInterface 
        onMinimize={() => setCallMinimized(true)}
        onMaximize={() => setCallMinimized(false)}
        isMinimized={callMinimized}
      />

      {/* Call Screens */}
      {webrtc.callState.isOutgoing && !webrtc.callState.isActive && (
        <OutgoingCallScreen
          recipientName={webrtc.callState.participants[0]?.name || 'Connecting...'}
          recipientAvatar={webrtc.callState.participants[0]?.avatar}
          callType={webrtc.callState.callType}
          onCancel={handleEndCall}
          onSwitchToVideo={() => webrtc.toggleVideo()}
        />
      )}

      {webrtc.callState.isActive && !callMinimized && (
        <ConnectedCallScreen
          callType={webrtc.callState.callType}
          participants={webrtc.callState.participants}
          duration={webrtc.callState.duration}
          onEndCall={handleEndCall}
          onMinimize={() => setCallMinimized(true)}
        />
      )}

      {/* Incoming Call Modal */}
      {webrtc.callState.incomingCallData && !webrtc.callState.isActive && (
        <IncomingCallModal
          isOpen={true}
          callerName={webrtc.callState.incomingCallData.callerName}
          callerAvatar={webrtc.callState.incomingCallData.callerAvatar}
          callType={webrtc.callState.incomingCallData.callType}
          onAccept={() => webrtc.answerCall()}
          onDecline={() => webrtc.declineCall()}
          onAcceptWithVideo={() => {
            webrtc.answerCall();
            if (webrtc.callState.incomingCallData?.callType === 'voice') {
              webrtc.toggleVideo();
            }
          }}
        />
      )}

      {/* Notification Banner */}
      <NotificationBanner
        notifications={notifications.notifications}
        position="top-right"
        maxVisible={3}
        autoDismiss={5}
        onDismiss={notifications.dismissNotification}
        onAction={(notificationId, actionIndex) => {
          // Handle notification actions
          notifications.markAsRead(notificationId);
        }}
      />
    </>
  );
}