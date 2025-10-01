import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Search,
  Settings,
  Bell,
  Filter,
  MoreHorizontal,
  MessageSquare,
  Phone,
  Video,
  Hash,
  Users,
  Plus,
  Archive,
  Star,
  Pin
} from 'lucide-react';

// Import our enhanced components
import EnhancedChatList from './EnhancedChatList';
import EnhancedMessageArea from './EnhancedMessageArea';
import PresenceIndicator from './PresenceIndicator';
import ModernThreePanel from './ModernThreePanel';
import MissedCallNotifications from './MissedCallNotifications';

// Import hooks
import { useCommunication } from '@/hooks/useCommunication';
import { useChatUsers } from '@/hooks/useChatUsers';
import { useAuth } from '@/hooks/useAuth';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { toast } from 'sonner';

export default function EnhancedCommunication() {
  const { profile } = useAuth();
  const { 
    channels, 
    messages, 
    teamMembers, 
    selectedChannel, 
    isLoading,
    sendMessage,
    createDirectMessage,
    selectChannel
  } = useCommunication();
  
  const { chatUsers, updateUserStatus } = useChatUsers();
  const { callState, startCall, endCall } = useWebRTCCall();
  const { addReaction, removeReaction } = useMessageReactions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Update user status to online when component mounts
  useEffect(() => {
    if (profile) {
      updateUserStatus('online');
    }
  }, [profile, updateUserStatus]);

  const handleChannelSelect = (channel: any) => {
    selectChannel(channel);
    setShowRightPanel(false); // Hide right panel on mobile when selecting channel
  };

  const handleMemberSelect = async (member: any) => {
    try {
      await createDirectMessage(member.id);
      toast.success(`Started conversation with ${member.full_name}`);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleStartCall = async (memberId: string, callType: 'voice' | 'video') => {
    try {
      await startCall(memberId, callType);
      toast.success(`Starting ${callType} call...`);
    } catch (error) {
      toast.error(`Failed to start ${callType} call`);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChannel) return;
    
    try {
      await sendMessage(content);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  // Left Panel Content
  const leftPanelContent = (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-hidden">
        <EnhancedChatList
          channels={channels}
          teamMembers={teamMembers}
          selectedChannel={selectedChannel}
          onChannelSelect={handleChannelSelect}
          onMemberSelect={handleMemberSelect}
          onStartCall={handleStartCall}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* User Status Footer */}
      {profile && (
        <div className="p-4 border-t border-border">
          <PresenceIndicator
            userId={profile.id}
            onPresenceChange={(presence) => {
              updateUserStatus(presence.status);
            }}
            showSettings={false}
          />
        </div>
      )}
    </div>
  );

  // Center Panel Content
  const centerPanelContent = selectedChannel ? (
    <EnhancedMessageArea
      channel={selectedChannel}
      messages={messages}
      teamMembers={teamMembers}
      currentUser={profile}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
      onStartCall={(callType) => {
        if (selectedChannel.is_direct_message && selectedChannel.participant_ids) {
          const otherUserId = selectedChannel.participant_ids.find(id => id !== profile?.id);
          if (otherUserId) {
            handleStartCall(otherUserId, callType);
          }
        }
      }}
      onShowDetails={() => setShowRightPanel(!showRightPanel)}
    />
  ) : (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Welcome to Team Communication</h3>
          <p className="text-muted-foreground">
            Select a conversation from the sidebar to start messaging, or create a new conversation with a team member.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Browse Team
          </Button>
        </div>
      </div>
    </div>
  );

  // Right Panel Content
  const rightPanelContent = selectedChannel && (
    <div className="h-full p-4">
      <div className="space-y-6">
        {/* Channel/User Info */}
        {selectedChannel.is_direct_message ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Direct Message</h3>
              <p className="text-sm text-muted-foreground">Private conversation</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Hash className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{selectedChannel.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedChannel.member_count} members
              </p>
            </div>
          </div>
        )}

        {/* Channel Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Pin className="h-4 w-4 mr-2" />
            Pin Messages
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Starred Items
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            View Files
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Notification Settings */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Notifications</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">All messages</span>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <MissedCallNotifications />
      
      <ModernThreePanel
        leftPanel={leftPanelContent}
        centerPanel={centerPanelContent}
        rightPanel={rightPanelContent}
        leftPanelTitle="Conversations"
        centerPanelTitle={selectedChannel?.name || "Messages"}
        rightPanelTitle="Details"
        showRightPanel={showRightPanel}
        onRightPanelToggle={() => setShowRightPanel(!showRightPanel)}
        className="h-full"
      />
    </div>
  );
}