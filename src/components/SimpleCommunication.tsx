import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Star, Pin, Users, Hash, Phone, Video, Info, MoreHorizontal } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  sender_name?: string;
  created_at: string;
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

  useEffect(() => {
    if (profile?.id) {
      console.log('Profile loaded, fetching data for:', profile);
      fetchChannels();
      fetchTeamMembers();
      
      // Create or find a general channel if none exists
      createGeneralChannelIfNeeded();
    } else {
      console.log('No profile available, profile state:', profile);
      setTeamMembers([]);
      setChannels([]);
      setLoading(false);
    }
  }, [profile]);

  const createGeneralChannelIfNeeded = async () => {
    if (!profile?.id) return;
    
    try {
      // Check if general channel exists
      const { data: existingChannels } = await supabase
        .from('communication_channels')
        .select('*')
        .eq('name', 'General')
        .eq('type', 'public')
        .limit(1);

      if (!existingChannels || existingChannels.length === 0) {
        // Create general channel
        const { data: newChannel, error } = await supabase
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

        if (error) throw error;

        // Add current user to the channel
        if (newChannel) {
          await supabase
            .from('channel_members')
            .insert([{
              channel_id: newChannel.id,
              user_id: profile.id,
              role: 'member'
            }]);
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
    if (!profile?.id) {
      console.log('No profile ID available for fetching channels');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select(`
          *,
          channel_members!inner(
            user_id,
            profiles(
              id,
              full_name,
              avatar_url,
              role
            )
          )
        `)
        .eq('channel_members.user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched channels for profile ID:', profile.id, 'Data:', data);
      setChannels(data || []);
      
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchTeamMembers = async () => {
    if (!profile?.id) {
      console.log('No profile ID available for fetching team members');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, role, email, department, bio')
        .neq('id', profile.id)
        .order('full_name');

      if (error) throw error;
      console.log('Fetched team members for profile ID:', profile.id, 'Count:', data?.length, 'Data:', data);
      setTeamMembers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
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
            // Try to find profile by sender_id first
            let senderProfile = null;
            if (msg.sender_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .eq('id', msg.sender_id)
                .maybeSingle();
              
              senderProfile = profileData;
            }
            
            // If no profile found by id, try by user_id
            if (!senderProfile && msg.sender_id) {
              const { data: userProfileData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .eq('user_id', msg.sender_id)
                .maybeSingle();
              
              senderProfile = userProfileData;
            }
            
            return {
              ...msg,
              sender_profile: senderProfile || { 
                id: msg.sender_id,
                full_name: msg.sender_name || 'Unknown User',
                avatar_url: null,
                role: 'unknown'
              }
            };
          } catch (error) {
            console.error('Error processing message:', msg.id, error);
            return {
              ...msg,
              sender_profile: { 
                id: msg.sender_id,
                full_name: msg.sender_name || 'Unknown User',
                avatar_url: null,
                role: 'unknown'
              }
            };
          }
        })
      );
      
      console.log('Fetched messages with profiles:', messagesWithProfiles);
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createDirectMessageChannel = async (targetUserId: string) => {
    if (!profile?.id) return null;
    try {
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        user1_id: profile.id,
        user2_id: targetUserId
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating DM channel:', error);
      return null;
    }
  };

  const startDirectMessage = async (member: Profile) => {
    const channelId = await createDirectMessageChannel(member.id);
    if (channelId) {
      setSelectedChannel(channelId);
      setSelectedMember(member);
      await fetchChannels();
      setShowProfileModal(false);
      // Switch to chats tab when starting a DM
      setActiveTab('chats');
    }
  };

  const showUserProfile = (member: Profile) => {
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
        message_type: 'text',
        sender_name: profile.full_name,
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;
      
      setNewMessage('');
      fetchMessages(selectedChannel);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const getChannelDisplayName = (channel: Channel) => {
    if (channel.is_direct_message) {
      const otherMember = channel.channel_members?.find(member => 
        member.user_id !== profile?.id
      );
      return otherMember?.profiles?.full_name || selectedMember?.full_name || 'Direct Message';
    }
    return channel.name || 'General';
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.is_direct_message) {
      return <Users className="h-5 w-5 text-muted-foreground" />;
    }
    return channel.type === 'private' 
      ? <Hash className="h-5 w-5 text-orange-500" />
      : <Hash className="h-5 w-5 text-muted-foreground" />;
  };

  const getCurrentChannel = () => {
    return channels.find(c => c.id === selectedChannel);
  };

  const getOtherParticipant = (channel: Channel) => {
    if (!channel.is_direct_message) return null;
    return channel.channel_members?.find(member => 
      member.user_id !== profile?.id
    )?.profiles;
  };

  if (authLoading || loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading communication...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access the communication system.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentChannel = getCurrentChannel();
  const otherParticipant = currentChannel ? getOtherParticipant(currentChannel) : null;

  return (
    <div className="h-[calc(100vh-6rem)] flex bg-background overflow-hidden">
      {/* Sidebar - Fixed width 320px */}
      <div className="w-80 shrink-0 border-r bg-card/50 backdrop-blur-sm">
        <CommunicationSidebar
          profile={profile}
          channels={channels}
          teamMembers={teamMembers}
          selectedChannel={selectedChannel}
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSelectedChannel={setSelectedChannel}
          setActiveTab={setActiveTab}
          setSearchQuery={setSearchQuery}
          startDirectMessage={startDirectMessage}
          showUserProfile={showUserProfile}
          getChannelDisplayName={getChannelDisplayName}
        />
      </div>

      {/* Main Chat Area - Flex grow to fill remaining space */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {selectedChannel && currentChannel ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-6 py-3 border-b bg-background/95 backdrop-blur-sm shrink-0">
              <div className="flex items-center justify-between h-full">
                {/* Left side - Channel info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {currentChannel.is_direct_message && otherParticipant ? (
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={otherParticipant.avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {otherParticipant.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                    ) : (
                      getChannelIcon(currentChannel)
                    )}
                    
                    <div className="min-w-0">
                      <h1 className="text-lg font-semibold truncate">
                        {getChannelDisplayName(currentChannel)}
                      </h1>
                      {currentChannel.is_direct_message && otherParticipant ? (
                        <p className="text-xs text-muted-foreground">
                          {otherParticipant.role} • Online
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {messages.length} messages
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {currentChannel.is_pinned && <Pin className="h-4 w-4 text-blue-600" />}
                </div>

                {/* Right side - Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <EnhancedCallControls
                    recipientName={currentChannel.is_direct_message ? getChannelDisplayName(currentChannel) : undefined}
                    onStartCall={() => console.log('Audio call started')}
                    onStartVideoCall={() => console.log('Video call started')}
                    onEndCall={() => console.log('Call ended')}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (currentChannel.is_direct_message && otherParticipant) {
                        const memberProfile: Profile = {
                          id: otherParticipant.id,
                          full_name: otherParticipant.full_name,
                          avatar_url: otherParticipant.avatar_url,
                          role: otherParticipant.role,
                          user_id: otherParticipant.id,
                          department: undefined,
                          email: undefined,
                          bio: undefined
                        };
                        showUserProfile(memberProfile);
                      }
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-background">
              <MessageList 
                messages={messages} 
                currentUserId={profile?.id}
              />
            </div>

            {/* Message Input */}
            <div className="shrink-0 border-t bg-background/95 backdrop-blur-sm">
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSendMessage}
                mentions={teamMembers.map(member => ({ 
                  id: member.id, 
                  name: member.full_name 
                }))}
                disabled={!selectedChannel}
                placeholder={`Message ${currentChannel.is_direct_message 
                  ? getChannelDisplayName(currentChannel) 
                  : `#${currentChannel.name}`
                }...`}
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/10 to-transparent">
            <div className="text-center space-y-6 p-8 max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <MessageSquare className="relative h-24 w-24 text-primary mx-auto" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Welcome to SLT Finance Chat
                </h3>
                <p className="text-muted-foreground">
                  Connect with your team members, share ideas, and collaborate in real-time. 
                  {activeTab === 'team' 
                    ? ' Click on a team member to start chatting!' 
                    : ' Select a conversation to continue.'
                  }
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('team')}
                  className={cn(activeTab === 'team' && "bg-muted")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Browse Team
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setActiveTab('chats')}
                  className={cn(activeTab === 'chats' && "bg-primary/90")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Recent Chats
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={profileModalUser}
        isOpen={showProfileModal}
        onClose={closeProfileModal}
        onStartMessage={() => profileModalUser && startDirectMessage(profileModalUser)}
        onStartCall={() => {
          toast({
            title: 'Audio Call',
            description: `Calling ${profileModalUser?.full_name}...`,
          });
        }}
        onStartVideoCall={() => {
          toast({
            title: 'Video Call',
            description: `Video calling ${profileModalUser?.full_name}...`,
          });
        }}
        currentUserId={profile?.id}
      />
    </div>
  );
}