import React, { useState } from 'react';
import { useCommunication } from '@/hooks/useCommunication';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedChatList from './communication/EnhancedChatList';
import EnhancedMessageArea from './communication/EnhancedMessageArea';

export default function ModernCommunication() {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const communication = useCommunication();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 ModernCommunication render:', {
      hasProfile: !!profile,
      profileId: profile?.id,
      organizationId: profile?.organization_id,
      isLoading: communication.isLoading,
      error: communication.error,
      channelsCount: communication.channels.length,
      teamMembersCount: communication.teamMembers.length
    });
  }, [profile, communication.isLoading, communication.error, communication.channels.length, communication.teamMembers.length]);

  // Update sidebar visibility when screen size changes
  React.useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const handleChannelSelect = (channel: any) => {
    communication.selectChannel(channel);
  };

  const handleMemberSelect = async (member: any) => {
    await communication.createDirectMessage(member.id);
  };

  // Error state with retry
  if (communication.error) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold">Failed to Load Communication</h3>
          <p className="text-muted-foreground text-sm">{communication.error}</p>
          <Button onClick={() => communication.refresh()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Loading state with skeleton
  if (communication.isLoading) {
    return (
      <div className="h-[500px] flex">
        <div className="w-80 border-r p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading communication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no profile or organization
  if (!profile?.organization_id) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="p-4 rounded-full bg-muted w-fit mx-auto">
            <MessageCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Communication Unavailable</h3>
          <p className="text-muted-foreground">
            Please ensure you're part of an organization to access communication features.
          </p>
        </div>
      </div>
    );
  }

  // Show welcome state when no channels and no channel selected
  const showWelcomeState = communication.channels.length === 0 && !communication.selectedChannel;

  return (
    <div className="h-full flex bg-background">
      {isMobile ? (
        // Mobile: Relative positioned panels with proper overflow handling
        <div className="relative w-full h-full overflow-hidden bg-background">
          {/* Chat List Panel */}
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-out bg-background overflow-y-auto ${
              showSidebar || !communication.selectedChannel ? 'translate-x-0' : '-translate-x-full pointer-events-none'
            }`}
          >
            <EnhancedChatList
              channels={communication.channels}
              teamMembers={communication.teamMembers}
              selectedChannel={communication.selectedChannel}
              onChannelSelect={(channel) => {
                handleChannelSelect(channel);
                setShowSidebar(false);
              }}
              onMemberSelect={handleMemberSelect}
              searchQuery={communication.searchQuery}
              onSearchChange={communication.setSearchQuery}
            />
          </div>
          {/* Message Area Panel */}
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-out bg-background ${
              !showSidebar && communication.selectedChannel ? 'translate-x-0' : 'translate-x-full pointer-events-none'
            }`}
          >
            {communication.selectedChannel && (
              <EnhancedMessageArea
                channel={communication.selectedChannel}
                messages={communication.messages}
                teamMembers={communication.teamMembers}
                currentUser={profile}
                isLoading={communication.isLoadingMessages}
                onSendMessage={(content) => communication.sendMessage(content, communication.selectedChannel?.id)}
                onBack={() => setShowSidebar(true)}
                isMobile={true}
              />
            )}
          </div>
        </div>
      ) : (
        // Desktop: Resizable panels
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Chat List Panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <EnhancedChatList
              channels={communication.channels}
              teamMembers={communication.teamMembers}
              selectedChannel={communication.selectedChannel}
              onChannelSelect={handleChannelSelect}
              onMemberSelect={handleMemberSelect}
              searchQuery={communication.searchQuery}
              onSearchChange={communication.setSearchQuery}
            />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border/50 hover:bg-border transition-colors" />

          {/* Message Area Panel */}
          <ResizablePanel defaultSize={70} minSize={50}>
            {communication.selectedChannel ? (
              <EnhancedMessageArea
                channel={communication.selectedChannel}
                messages={communication.messages}
                teamMembers={communication.teamMembers}
                currentUser={profile}
                isLoading={communication.isLoadingMessages}
                onSendMessage={(content) => communication.sendMessage(content, communication.selectedChannel?.id)}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center space-y-6 max-w-md mx-auto p-6">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                    <MessageCircle className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold">
                    {showWelcomeState ? 'Start a Conversation' : 'Welcome to Chat'}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {showWelcomeState 
                      ? 'Click on a team member in the sidebar to start a direct message conversation.'
                      : 'Select a conversation from the left panel to start chatting, or create a new conversation with a team member.'
                    }
                  </p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
