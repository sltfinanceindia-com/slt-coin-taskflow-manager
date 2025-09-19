import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Star, Pin, Users, Hash, Phone, Video, Info, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CommunicationSidebar } from './communication/CommunicationSidebar';
import { EnhancedCallControls } from './communication/EnhancedCallControls';
import { MessageList } from './communication/MessageList';
import { MessageInput } from './communication/MessageInput';
import { UserProfileModal } from './communication/UserProfileModal';
import { WebRTCCall } from './communication/WebRTCCall';
import { PresenceIndicator } from './communication/PresenceIndicator';
import { AdvancedFeatures } from './communication/AdvancedFeatures';
import { EnhancedMobileLayout } from './communication/EnhancedMobileLayout';
import { TypingIndicator } from './communication/TypingIndicator';
import { VoiceMessage } from './communication/VoiceMessage';
import { FileUploadModal } from './communication/FileUploadModal';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  sender_name?: string;
  created_at: string;
  message_type: "text" | "system" | "file";
  sender_profile?: {
    id?: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

interface Channel {
  id: string;
  name: string;
  type: string;
  is_direct_message?: boolean;
  participant_ids?: string[];
  created_at: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  is_muted?: boolean;
  is_pinned?: boolean;
  description?: string;
  member_count?: number;
  channel_members?: {
    user_id: string;
    profiles?: {
      id: string;
      full_name: string;
      avatar_url?: string;
      role: string;
    };
  }[];
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
  department?: string;
  email?: string;
  bio?: string;
}

export function SimpleCommunication() {
  const { profile, user, loading: authLoading } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [callMinimized, setCallMinimized] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [activeCallRecipient, setActiveCallRecipient] = useState<Profile | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Initialize presence
  const presence = usePresence();

  useEffect(() => {
    if (profile?.id) {
      initializeData();
    } else if (!authLoading) {
      setTeamMembers([]);
      setChannels([]);
      setLoading(false);
    }
  }, [profile, authLoading]);

  const initializeData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      await Promise.all([
        fetchChannels(),
        fetchTeamMembers(),
        createGeneralChannelIfNeeded()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      setError('Failed to load communication data');
    }
  };

  const createGeneralChannelIfNeeded = async () => {
    if (!profile?.id) return;
    
    try {
      const { data: existingChannels } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members!inner(user_id)
        `)
        .eq('name', 'General')
        .eq('type', 'public')
        .eq('channel_members.user_id', profile.id);

      if (!existingChannels || existingChannels.length === 0) {
        const { data: newChannel, error: channelError } = await supabase
          .from('communication_channels')
          .insert([{
            name: 'General',
            description: 'General team discussion',
            type: 'public',
            is_direct_message: false,
            created_by: profile.id,
            member_count: 1
          }])
          .select()
          .single();

        if (channelError) throw channelError;

        if (newChannel) {
          const { error: memberError } = await supabase
            .from('channel_members')
            .insert([{
              channel_id: newChannel.id,
              user_id: profile.id,
              role: 'member'
            }]);
            
          if (memberError) throw memberError;
        }
      }
    } catch (error) {
      console.error('Error creating general channel:', error);
    }
  };

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
      
      const messageSubscription = supabase
        .channel(`messages_${selectedChannel}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${selectedChannel}`
          },
          () => {
            fetchMessages(selectedChannel);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageSubscription);
      };
    }
  }, [selectedChannel]);

  const fetchChannels = async () => {
    if (!profile?.id) return;
    
    try {
      // First get channels where user is a member
      const { data: channelData, error: channelError } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members!inner(user_id)
        `)
        .eq('channel_members.user_id', profile.id)
        .order('created_at', { ascending: false });

      if (channelError) throw channelError;

      // Then get all channel members for these channels
      const channelsWithMembers = await Promise.all(
        (channelData || []).map(async (channel) => {
          const { data: membersData } = await supabase
            .from('channel_members')
            .select(`
              user_id,
              profiles!inner(
                id,
                user_id,
                full_name,
                avatar_url,
                role
              )
            `)
            .eq('channel_id', channel.id);

          return {
            ...channel,
            channel_members: membersData || []
          };
        })
      );

      setChannels(channelsWithMembers || []);
      
      if (channelsWithMembers && channelsWithMembers.length > 0 && !selectedChannel) {
        setSelectedChannel(channelsWithMembers[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load channels',
        variant: 'destructive',
      });
    }
  };

  const fetchTeamMembers = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching team members for profile:', profile.id, 'role:', profile.role);
      
      // Get all profiles except current user - both admin and employee should see everyone
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, role, email, department, bio')
        .neq('id', profile.id)
        .order('full_name');

      if (error) {
        console.error('Supabase error fetching team members:', error);
        throw error;
      }

      console.log('✅ Team members loaded successfully:', data?.length || 0, 'members');
      console.log('Team members data:', data);
      setTeamMembers(data || []);
    } catch (error) {
      console.error('❌ Error fetching team members:', error);
      setTeamMembers([]);
      toast({
        title: 'Error',
        description: 'Failed to load team members. Please check your permissions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    if (!channelId) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          channel_id,
          sender_name,
          created_at,
          message_type
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg) => {
          try {
            // Try to find sender profile by both id and user_id
            let senderProfile = null;
            
            const { data: profileById } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, role')
              .eq('id', msg.sender_id)
              .maybeSingle();
            
            if (profileById) {
              senderProfile = profileById;
            } else {
              // Try finding by user_id if sender_id doesn't match
              const { data: profileByUserId } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .eq('user_id', msg.sender_id)
                .maybeSingle();
              
              if (profileByUserId) {
                senderProfile = profileByUserId;
              }
            }
            
            return {
              ...msg,
              message_type: (msg.message_type as "text" | "system" | "file") || 'text',
              sender_profile: senderProfile || { 
                id: msg.sender_id,
                full_name: msg.sender_name || 'Unknown User',
                avatar_url: undefined,
                role: 'user'
              }
            };
          } catch (error) {
            console.error('Error processing message:', msg.id, error);
            return {
              ...msg,
              message_type: (msg.message_type as "text" | "system" | "file") || 'text',
              sender_profile: { 
                id: msg.sender_id,
                full_name: msg.sender_name || 'Unknown User',
                avatar_url: undefined,
                role: 'user'
              }
            };
          }
        })
      );
      
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const createDirectMessageChannel = async (targetProfileId: string) => {
    if (!profile?.id) return null;
    
    try {
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        user1_id: profile.id,
        user2_id: targetProfileId
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating DM channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to create direct message',
        variant: 'destructive',
      });
      return null;
    }
  };

  const startDirectMessage = async (member: Profile) => {
    try {
      setSelectedMember(member); // Set this first for immediate UI update
      const channelId = await createDirectMessageChannel(member.id);
      if (channelId) {
        setSelectedChannel(channelId);
        await fetchChannels(); // Refresh channels to get updated member data
        setShowProfileModal(false);
        setActiveTab('chats');
      }
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: 'Error',
        description: 'Failed to start direct message',
        variant: 'destructive',
      });
    }
  };

  const showUserProfileFunc = (member: Profile) => {
    setProfileModalUser(member);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setProfileModalUser(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile?.id) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        sender_id: profile.id,
        channel_id: selectedChannel,
        message_type: 'text' as const,
        sender_name: profile.full_name || 'Unknown User',
      };

      console.log('Sending message:', messageData);
      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) {
        console.error('Error inserting message:', error);
        throw error;
      }
      
      console.log('✅ Message sent successfully');
      setNewMessage('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getChannelDisplayName = (channel: Channel) => {
    if (!channel) return 'Unknown Channel';
    
    if (channel.is_direct_message) {
      // Find the other participant in the DM - improved logic
      const otherMember = channel.channel_members?.find(member => {
        // Check user_id to handle data inconsistencies
        return member.user_id !== profile?.id;
      });
      
      if (otherMember?.profiles) {
        return otherMember.profiles.full_name;
      }
      
      // Fallback: Try to find from participant_ids array
      const participantId = channel.participant_ids?.find(id => id !== profile?.id);
      if (participantId) {
        // Search in teamMembers by both id and user_id
        const memberFromTeam = teamMembers.find(m => 
          m.id === participantId || 
          m.user_id === participantId
        );
        if (memberFromTeam?.full_name) {
          return memberFromTeam.full_name;
        }
      }
      
      // Last resort: use selectedMember if available
      if (selectedMember?.full_name) {
        return selectedMember.full_name;
      }
      
      return 'Direct Message';
    }
    return channel.name || 'General';
  };

  const getChannelIcon = (channel: Channel) => {
    if (!channel) return <Hash className="h-5 w-5 text-muted-foreground" />;
    
    if (channel.is_direct_message) {
      return <Users className="h-5 w-5 text-muted-foreground" />;
    }
    return channel.type === 'private' 
      ? <Hash className="h-5 w-5 text-orange-500" />
      : <Hash className="h-5 w-5 text-muted-foreground" />;
  };

  // Enhanced call handlers with proper recipient detection
  const handleVideoCall = (recipient?: Profile) => {
    const callRecipient = recipient || getCallRecipient();
    if (callRecipient) {
      setActiveCallRecipient(callRecipient);
      setActiveCallId(`call_${Date.now()}`);
      setShowVideoCall(true);
      setCallMinimized(false);
    } else {
      toast({
        title: 'Error',
        description: 'Please select a team member to call',
        variant: 'destructive',
      });
    }
  };

  const handleAudioCall = (recipient?: Profile) => {
    const callRecipient = recipient || getCallRecipient();
    if (callRecipient) {
      setActiveCallRecipient(callRecipient);
      setActiveCallId(`call_${Date.now()}`);
      setShowAudioCall(true);
      setCallMinimized(false);
    } else {
      toast({
        title: 'Error',
        description: 'Please select a team member to call',
        variant: 'destructive',
      });
    }
  };

  const handleStartCall = (type: 'audio' | 'video', member?: Profile) => {
    if (type === 'video') {
      handleVideoCall(member);
    } else {
      handleAudioCall(member);
    }
  };

  const getCallRecipient = (): Profile | null => {
    if (selectedMember) return selectedMember;
    
    // If in a DM channel, find the other participant
    const currentChannel = channels.find(c => c.id === selectedChannel);
    if (currentChannel?.is_direct_message) {
      const otherMember = currentChannel.channel_members?.find(member => 
        member.user_id !== profile?.id
      );
      
      if (otherMember?.profiles) {
        return {
          id: otherMember.profiles.id,
          full_name: otherMember.profiles.full_name,
          avatar_url: otherMember.profiles.avatar_url,
          role: otherMember.profiles.role,
          user_id: otherMember.user_id,
        } as Profile;
      }
    }
    
    return null;
  };

  const handleEndCall = () => {
    setShowVideoCall(false);
    setShowAudioCall(false);
    setCallMinimized(false);
    setActiveCallId(null);
    setActiveCallRecipient(null);
  };

  const handleMinimizeCall = () => {
    setCallMinimized(true);
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);

  if (loading && authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading communication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Error: {error}</p>
          <Button onClick={initializeData} size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EnhancedMobileLayout
      showSidebar={showSidebar}
      onToggleSidebar={() => setShowSidebar(!showSidebar)}
      selectedChannel={selectedChannel}
      teamMembers={teamMembers}
      channels={channels}
      onChannelSelect={setSelectedChannel}
      onMemberSelect={startDirectMessage}
      onStartCall={handleStartCall}
      getChannelDisplayName={getChannelDisplayName}
      getChannelIcon={getChannelIcon}
      currentChannelName={currentChannel ? getChannelDisplayName(currentChannel) : 'Communication'}
    >
      {/* Messages */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChannel ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.sender_profile?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {message.sender_profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <PresenceIndicator userId={message.sender_id} size="sm" className="absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender_profile?.full_name || 'Unknown User'}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {message.sender_profile?.role || 'user'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-muted rounded-lg p-3 max-w-md">
                        <p className="text-sm text-foreground break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Enhanced Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Textarea
                    placeholder={`Message ${currentChannel ? getChannelDisplayName(currentChannel) : 'channel'}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-0 resize-none bg-background border-input"
                    rows={2}
                    disabled={!selectedChannel}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (newMessage.trim() && selectedChannel) {
                          handleSendMessage();
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  type="submit" 
                  size="sm"
                  disabled={!newMessage.trim() || !selectedChannel}
                  onClick={(e) => {
                    e.preventDefault();
                    if (newMessage.trim() && selectedChannel) {
                      handleSendMessage();
                    }
                  }}
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a chat from the sidebar to start messaging.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProfileModal && profileModalUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          user={profileModalUser}
          onClose={closeProfileModal}
          onStartMessage={() => startDirectMessage(profileModalUser)}
        />
      )}

      {/* WebRTC Calls */}
      {(showVideoCall || showAudioCall) && activeCallRecipient && activeCallId && (
        <WebRTCCall
          isOpen={true}
          onClose={handleEndCall}
          callType={showVideoCall ? 'video' : 'audio'}
          recipient={{
            id: activeCallRecipient.id,
            name: activeCallRecipient.full_name,
            avatar: activeCallRecipient.avatar_url
          }}
          onMinimize={handleMinimizeCall}
        />
      )}
    </EnhancedMobileLayout>
  );
}