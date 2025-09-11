import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CommunicationSidebar } from './communication/CommunicationSidebar';
import { EnhancedCallControls } from './communication/EnhancedCallControls';
import { MessageList } from './communication/MessageList';
import { MessageInput } from './communication/MessageInput';

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
}

export function SimpleCommunication() {
  const { profile } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile) {
      fetchChannels();
      fetchTeamMembers();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
      
      // Set up real-time subscription for messages
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
        .eq('channel_members.user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched channels:', data);
      setChannels(data || []);
      
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, role, email')
        .neq('user_id', profile?.user_id) // Use user_id instead of id for comparison
        .order('full_name');

      if (error) throw error;
      console.log('Fetched team members:', data);
      setTeamMembers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
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
      
      // Fetch sender profiles separately to avoid foreign key issues
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('id', msg.sender_id)
            .single();
          
          return {
            ...msg,
            sender_profile: senderProfile || { 
              id: msg.sender_id,
              full_name: msg.sender_name || 'Unknown User' 
            }
          };
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
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !profile) return;

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
      // Refetch messages to show the new one
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

  const filteredMembers = teamMembers.filter(member => 
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChannelDisplayName = (channel: Channel) => {
    if (channel.is_direct_message) {
      // For direct messages, find the other participant from channel members
      const otherMember = channel.channel_members?.find(member => 
        member.user_id !== profile?.id
      );
      return otherMember?.profiles?.full_name || selectedMember?.full_name || 'Direct Message';
    }
    return channel.name;
  };

  const getChannelParticipants = (channel: Channel) => {
    if (channel.is_direct_message) {
      const otherMember = channel.channel_members?.find(member => 
        member.user_id !== profile?.id
      );
      return otherMember ? [otherMember.profiles] : [];
    }
    return [];
  };

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading communication...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-2rem)] max-h-[800px]">
      {/* Sidebar */}
      <div className="col-span-4 lg:col-span-3">
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
          getChannelDisplayName={getChannelDisplayName}
        />
      </div>

      {/* Main Chat Area */}
      <div className="col-span-8 lg:col-span-9">
        <Card className="h-full flex flex-col">
          {selectedChannel ? (
            <>
              <CardHeader className="pb-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {(() => {
                        const channel = channels.find(c => c.id === selectedChannel);
                        return channel ? getChannelDisplayName(channel) : 'Chat';
                      })()}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {messages.length} messages
                    </p>
                  </div>
                  <EnhancedCallControls 
                    recipientName={(() => {
                      const channel = channels.find(c => c.id === selectedChannel);
                      return channel ? getChannelDisplayName(channel) : undefined;
                    })()}
                  />
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <MessageList 
                  messages={messages} 
                  currentUserId={profile?.id}
                />

                <MessageInput
                  value={newMessage}
                  onChange={setNewMessage}
                  onSend={handleSendMessage}
                  mentions={teamMembers.map(member => ({ id: member.id, name: member.full_name }))}
                  disabled={!selectedChannel}
                />
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a team member to chat</h3>
                <p className="text-muted-foreground">
                  Choose someone from your team to start a conversation
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}