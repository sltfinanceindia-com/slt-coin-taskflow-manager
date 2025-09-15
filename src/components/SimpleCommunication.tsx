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

      setChannels(data || []);
      
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
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
      // Get all profiles except current user - same logic for both admin and employee
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, role, email, department, bio')
        .neq('id', profile.id)
        .order('full_name');

      if (error) throw error;

      console.log('Team members loaded:', data?.length || 0);
      setTeamMembers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
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
      const channelId = await createDirectMessageChannel(member.id);
      if (channelId) {
        setSelectedChannel(channelId);
        setSelectedMember(member);
        await fetchChannels();
        setShowProfileModal(false);
        setActiveTab('chats');
      }
    } catch (error) {
      console.error('Error starting direct message:', error);
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

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;
      
      setNewMessage('');
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
    if (!channel) return 'Unknown Channel';
    
    if (channel.is_direct_message) {
      const otherMember = channel.channel_members?.find(member => 
        member.user_id !== profile?.id
      );
      return otherMember?.profiles?.full_name || selectedMember?.full_name || 'Direct Message';
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

  const getCurrentChannel = () => {
    return channels.find(c => c.id === selectedChannel);
  };

  const getOtherParticipant = (channel: Channel) => {
    if (!channel?.is_direct_message) return null;
    return channel.channel_members?.find(member => 
      member.user_id !== profile?.id
    )?.profiles;
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Authentication error state
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

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading communication...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <MessageSquare className="h-12 w-12 mx-auto text-destructive" />
          <div>
            <h2 className="text-xl font-semibold">Error Loading Communication</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={initializeData} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentChannel = getCurrentChannel();
  const otherParticipant = currentChannel ? getOtherParticipant(currentChannel) : null;

  return (
    <div className="h-[calc(100vh-6rem)] flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-4">Communication</h2>
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === 'chats' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab('chats')}
            >
              Chats
            </Button>
            <Button
              variant={activeTab === 'team' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab('team')}
            >
              Team ({teamMembers.length})
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' ? (
            <div className="p-2">
              {channels.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No channels yet</p>
                </div>
              ) : (
                channels.map((channel) => {
                  const isSelected = selectedChannel === channel.id;
                  return (
                    <div
                      key={channel.id}
                      className={cn(
                        "flex items-center p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mb-1",
                        isSelected && "bg-primary/10 border border-primary/20"
                      )}
                      onClick={() => setSelectedChannel(channel.id)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {getChannelIcon(channel)}
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {getChannelDisplayName(channel)}
                          </div>
                          {channel.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {channel.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-2">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No team members found</p>
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center p-3 rounded-lg hover:bg-muted/50 cursor-pointer mb-1"
                    onClick={() => showUserProfileFunc(member)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {member.full_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background flex items-center justify-between">
              <div className="flex items-center min-w-0">
                {currentChannel && getChannelIcon(currentChannel)}
                <div className="ml-3 min-w-0">
                  <h3 className="font-semibold truncate">
                    {currentChannel && getChannelDisplayName(currentChannel)}
                  </h3>
                  {currentChannel?.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {currentChannel.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center justify-center h-10 w-10 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    console.log('Starting video call...');
                    setShowVideoCall(true);
                  }}
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center justify-center h-10 w-10 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-colors"
                  onClick={() => {
                    console.log('Starting audio call...');
                    setShowAudioCall(true);
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    console.log('Opening user profile...');
                    setShowUserProfile(true);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => console.log('More options clicked')}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

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
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender_profile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {message.sender_profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender_profile?.full_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 min-h-0 resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        handleSendMessage();
                      }
                    }
                  }}
                />
                <Button
                  type="submit" 
                  size="sm"
                  disabled={!newMessage.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      handleSendMessage();
                    }
                  }}
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

      {/* Call Modals */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Video Call</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Video calling feature is coming soon!
            </p>
            <Button onClick={() => setShowVideoCall(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      {showAudioCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Audio Call</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Audio calling feature is coming soon!
            </p>
            <Button onClick={() => setShowAudioCall(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}