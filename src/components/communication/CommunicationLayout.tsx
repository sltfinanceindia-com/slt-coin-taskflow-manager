import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Menu, X, Video, Phone, Settings, Users, Search } from 'lucide-react';
import { useCommunication } from '@/hooks/useCommunication';
import { useWebRTC } from '@/hooks/useWebRTC';
import CommunicationSidebar from './CommunicationSidebar';
import MessageArea from './MessageArea';
import DetailsPanel from './DetailsPanel';
import CallInterface from './CallInterface';
import MeetingRooms from './MeetingRooms';
import { useAuth } from '@/hooks/useAuth';

export default function CommunicationLayout() {
  const { profile } = useAuth();
  const communication = useCommunication();
  const webrtc = useWebRTC();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'meetings' | 'files'>('chat');
  const [callMinimized, setCallMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChannelSelect = (channel: any) => {
    communication.selectChannel(channel);
    setActiveView('chat');
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const handleMemberSelect = async (member: any) => {
    const dmChannel = await communication.createDirectMessage(member.id);
    setActiveView('chat');
    if (dmChannel && isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const handleStartCall = (memberId: string, isVideo: boolean = false) => {
    if (isVideo) {
      webrtc.startVideoCall(memberId);
    } else {
      webrtc.startVoiceCall(memberId);
    }
  };

  if (communication.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading communication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-background flex flex-col">
      {/* Header */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="lg:hidden"
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
              {activeView === 'meetings' ? 'Meeting Rooms' : 
               activeView === 'files' ? 'File Sharing' :
               communication.selectedChannel?.name || 'Team Communication'}
            </h1>
            {communication.selectedChannel && activeView === 'chat' && (
              <span className="text-xs text-muted-foreground">
                {communication.selectedChannel.member_count} members
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center gap-1 mr-4">
            <Button 
              variant={activeView === 'chat' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveView('chat')}
            >
              Chat
            </Button>
            <Button 
              variant={activeView === 'meetings' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveView('meetings')}
            >
              Meetings
            </Button>
            <Button 
              variant={activeView === 'files' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveView('files')}
            >
              Files
            </Button>
          </div>

          {activeView === 'chat' && communication.selectedChannel && !communication.selectedChannel.is_direct_message && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleStartCall('group', true)}>
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleStartCall('group', false)}>
                <Phone className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDetailsPanelOpen(!detailsPanelOpen)}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out bg-card border-r border-border",
          sidebarCollapsed ? "w-0 lg:w-16" : "w-80",
          isMobile && !sidebarCollapsed && "absolute inset-0 z-40"
        )}>
          <CommunicationSidebar
            channels={communication.channels}
            teamMembers={communication.teamMembers}
            selectedChannel={communication.selectedChannel}
            onChannelSelect={handleChannelSelect}
            onMemberSelect={handleMemberSelect}
            collapsed={sidebarCollapsed}
            searchQuery={communication.searchQuery}
            onSearchChange={communication.setSearchQuery}
          />
        </div>

        {/* Mobile Overlay */}
        {isMobile && !sidebarCollapsed && (
          <div 
            className="absolute inset-0 bg-black/50 z-30"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeView === 'chat' ? (
            communication.selectedChannel ? (
              <MessageArea
                channel={communication.selectedChannel}
                messages={communication.messages}
                isLoading={communication.isLoadingMessages}
                onSendMessage={(content) => communication.sendMessage(content, communication.selectedChannel?.id)}
                currentUser={profile}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-background/50">
                <div className="text-center space-y-4 max-w-md mx-auto p-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Welcome to Team Communication</h3>
                  <p className="text-muted-foreground">
                    Select a channel from the sidebar to start messaging, or click on a team member to start a direct conversation.
                  </p>
                  <div className="flex flex-col gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setSidebarCollapsed(false)}
                      className="w-full"
                    >
                      <Menu className="h-4 w-4 mr-2" />
                      Open Channels
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : activeView === 'meetings' ? (
            <div className="flex-1 overflow-auto p-6">
              <MeetingRooms />
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">File Sharing</h3>
                <p className="text-muted-foreground">Enhanced file sharing coming soon!</p>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel */}
        {detailsPanelOpen && communication.selectedChannel && activeView === 'chat' && (
          <div className="w-80 bg-card border-l border-border">
            <DetailsPanel
              channel={communication.selectedChannel}
              members={communication.teamMembers.filter(member => 
                communication.selectedChannel?.participant_ids?.includes(member.id)
              )}
              onClose={() => setDetailsPanelOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Call Interface Overlay */}
      <CallInterface 
        onMinimize={() => setCallMinimized(true)}
        onMaximize={() => setCallMinimized(false)}
        isMinimized={callMinimized}
      />
    </div>
  );
}