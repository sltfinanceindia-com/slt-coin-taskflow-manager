import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Search,
  Settings,
  Circle,
  User,
  Globe
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  user_id: string;
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

interface CommunicationSidebarProps {
  profile: any;
  channels: Channel[];
  teamMembers: Profile[];
  selectedChannel: string | null;
  activeTab: string;
  searchQuery: string;
  setSelectedChannel: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  startDirectMessage: (member: Profile) => void;
  getChannelDisplayName: (channel: Channel) => string;
}

export function CommunicationSidebar({
  profile,
  channels,
  teamMembers,
  selectedChannel,
  activeTab,
  searchQuery,
  setSelectedChannel,
  setActiveTab,
  setSearchQuery,
  startDirectMessage,
  getChannelDisplayName
}: CommunicationSidebarProps) {
  const filteredMembers = teamMembers.filter(member => 
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChannels = channels.filter(channel => 
    getChannelDisplayName(channel).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Communications</CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* My Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{profile?.full_name}</div>
            <div className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex border-b shrink-0">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chats')}
            className="flex-1 rounded-none"
          >
            Chats
          </Button>
          <Button
            variant={activeTab === 'team' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('team')}
            className="flex-1 rounded-none"
          >
            Team ({teamMembers.length})
          </Button>
        </div>

        <div className="p-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={activeTab === 'chats' ? 'Search chats...' : 'Search team...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 px-4 pb-4">
            {activeTab === 'chats' ? (
              filteredChannels.length > 0 ? (
                filteredChannels.map(channel => (
                  <div
                    key={channel.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedChannel === channel.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedChannel(channel.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {channel.is_direct_message ? (
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">
                        {getChannelDisplayName(channel)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No chats found</p>
                </div>
              )
            ) : (
              filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => startDirectMessage(member)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {member.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background bg-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{member.full_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{member.role}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        startDirectMessage(member);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No team members found</p>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}