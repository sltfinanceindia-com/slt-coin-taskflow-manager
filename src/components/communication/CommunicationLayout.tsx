import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Menu, X, Video, Phone, Settings, Users, Search, Wrench } from 'lucide-react';
import { useCommunication } from '@/hooks/useCommunication';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useAuth } from '@/hooks/useAuth';
import ModernThreePanel from './ModernThreePanel';
import CommunicationSidebar from './CommunicationSidebar';
import MessageArea from './MessageArea';
import DetailsPanel from './DetailsPanel';
import CallInterface from './CallInterface';
import MeetingRooms from './MeetingRooms';
import ProductivitySidebar from './ProductivitySidebar';
import IncomingCallNotification from './IncomingCallNotification';
import MissedCallNotifications from './MissedCallNotifications';
import CallTestButtons from './CallTestButtons';
import { FullLayoutSkeleton } from './SkeletonLoaders';

export default function CommunicationLayout() {
  const { profile } = useAuth();
  const communication = useCommunication();
  const webrtc = useWebRTC();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [productivitySidebarOpen, setProductivitySidebarOpen] = useState(false);
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

  const handleInsertTemplate = (content: string) => {
    // In a real app, this would insert the template into the message composer
    console.log('Insert template:', content);
  };

  const handleScheduleMessage = (content: string, scheduledFor: Date, channelId?: string) => {
    // In a real app, this would schedule the message
    console.log('Schedule message:', { content, scheduledFor, channelId });
  };

  const handleSetReminder = (messageId: string, reminderTime: Date) => {
    // In a real app, this would set a reminder for the message
    console.log('Set reminder:', { messageId, reminderTime });
  };

  const handleTranslate = async (text: string, targetLang: string): Promise<string> => {
    // In a real app, this would call a translation API
    return `[Translated to ${targetLang}]: ${text}`;
  };

  const handleAdvancedSearch = (filters: any) => {
    // In a real app, this would perform advanced search
    console.log('Advanced search:', filters);
  };

  if (communication.isLoading) {
    return <FullLayoutSkeleton />;
  }

  const leftPanel = (
    <CommunicationSidebar
      channels={communication.channels}
      teamMembers={communication.teamMembers}
      selectedChannel={communication.selectedChannel}
      onChannelSelect={handleChannelSelect}
      onMemberSelect={handleMemberSelect}
      collapsed={false}
      searchQuery={communication.searchQuery}
      onSearchChange={communication.setSearchQuery}
    />
  );

  const centerPanel = activeView === 'chat' ? (
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
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Welcome to Team Communication</h3>
          <p className="text-muted-foreground">
            Select a channel from the sidebar to start messaging, or click on a team member to start a direct conversation.
          </p>
          
          {/* Demo Call Testing */}
          <CallTestButtons />
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
  );

  const rightPanel = detailsPanelOpen && communication.selectedChannel && activeView === 'chat' ? (
    <DetailsPanel
      channel={communication.selectedChannel}
      members={communication.teamMembers.filter(member => 
        communication.selectedChannel?.participant_ids?.includes(member.id)
      )}
      onClose={() => setDetailsPanelOpen(false)}
    />
  ) : null;

  return (
    <>
      <ModernThreePanel
        leftPanel={leftPanel}
        centerPanel={centerPanel}
        rightPanel={rightPanel}
        leftPanelTitle="Channels"
        centerPanelTitle={
          activeView === 'meetings' ? 'Meeting Rooms' : 
          activeView === 'files' ? 'File Sharing' :
          communication.selectedChannel ? communication.getChannelDisplayName(communication.selectedChannel) : 'Team Communication'
        }
        rightPanelTitle="Details"
        showRightPanel={detailsPanelOpen}
        onRightPanelToggle={() => setDetailsPanelOpen(!detailsPanelOpen)}
      />

      {/* Productivity Sidebar */}
      <ProductivitySidebar
        isOpen={productivitySidebarOpen}
        onClose={() => setProductivitySidebarOpen(false)}
        teamMembers={communication.teamMembers}
        channels={communication.channels}
        onInsertTemplate={handleInsertTemplate}
        onScheduleMessage={handleScheduleMessage}
        onSetReminder={handleSetReminder}
        onTranslate={handleTranslate}
        onSearch={handleAdvancedSearch}
      />

      {/* Call Interface Overlay */}
      <CallInterface 
        onMinimize={() => setCallMinimized(true)}
        onMaximize={() => setCallMinimized(false)}
        isMinimized={callMinimized}
      />

      {/* Incoming Call Notification */}
      <IncomingCallNotification />

      {/* Missed Call Notifications */}
      <MissedCallNotifications />
    </>
  );
}