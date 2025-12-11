import React, { useState } from 'react';
import { useCommunication } from '@/hooks/useCommunication';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageCircle } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import EnhancedChatList from './communication/EnhancedChatList';
import EnhancedMessageArea from './communication/EnhancedMessageArea';

export default function ModernCommunication() {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const communication = useCommunication();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

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

  if (communication.isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading communication...</p>
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
                  <h3 className="text-2xl font-semibold">Welcome to Chat</h3>
                  <p className="text-muted-foreground">
                    Select a conversation from the left panel to start chatting, or create a new conversation with a team member.
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
