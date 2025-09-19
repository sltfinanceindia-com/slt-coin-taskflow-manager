import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Menu, 
  MessageSquare, 
  Users, 
  Phone, 
  Video, 
  ArrowLeft,
  MoreVertical,
  Search,
  Hash,
  X,
  Settings,
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PresenceIndicator } from './PresenceIndicator';
import { cn } from '@/lib/utils';

interface EnhancedMobileLayoutProps {
  children: React.ReactNode;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  selectedChannel?: string | null;
  teamMembers: any[];
  channels: any[];
  onChannelSelect: (channelId: string) => void;
  onMemberSelect: (member: any) => void;
  onStartCall: (type: 'audio' | 'video', member?: any) => void;
  getChannelDisplayName: (channel: any) => string;
  getChannelIcon: (channel: any) => React.ReactNode;
  currentChannelName?: string;
}

export function EnhancedMobileLayout({
  children,
  showSidebar,
  onToggleSidebar,
  selectedChannel,
  teamMembers,
  channels,
  onChannelSelect,
  onMemberSelect,
  onStartCall,
  getChannelDisplayName,
  getChannelIcon,
  currentChannelName = 'Communication'
}: EnhancedMobileLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredChannels = channels.filter(channel =>
    getChannelDisplayName(channel).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (channel.description && channel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r">
        <EnhancedSidebarContent 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredChannels={filteredChannels}
          filteredMembers={filteredMembers}
          selectedChannel={selectedChannel}
          onChannelSelect={onChannelSelect}
          onMemberSelect={onMemberSelect}
          onStartCall={onStartCall}
          getChannelDisplayName={getChannelDisplayName}
          getChannelIcon={getChannelIcon}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col flex-1 lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex items-center space-x-3">
            <Sheet open={showSidebar} onOpenChange={onToggleSidebar}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-80 p-0">
                <EnhancedSidebarContent 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredChannels={filteredChannels}
                  filteredMembers={filteredMembers}
                  selectedChannel={selectedChannel}
                  onChannelSelect={(channelId) => {
                    onChannelSelect(channelId);
                    onToggleSidebar();
                  }}
                  onMemberSelect={(member) => {
                    onMemberSelect(member);
                    onToggleSidebar();
                  }}
                  onStartCall={(type, member) => {
                    onStartCall(type, member);
                    onToggleSidebar();
                  }}
                  getChannelDisplayName={getChannelDisplayName}
                  getChannelIcon={getChannelIcon}
                  isMobile
                />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold truncate">{currentChannelName}</h1>
              {selectedChannel && (
                <Badge variant="secondary" className="text-xs">
                  {channels.find(c => c.id === selectedChannel)?.is_direct_message ? 'DM' : 'Channel'}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedChannel && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onStartCall('video')}>
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onStartCall('audio')}>
                  <Phone className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Desktop Content */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col">
        {/* Desktop Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">{currentChannelName}</h1>
            {selectedChannel && (
              <Badge variant="secondary">
                {channels.find(c => c.id === selectedChannel)?.is_direct_message ? 'Direct Message' : 'Channel'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedChannel && (
              <>
                <Button variant="outline" size="sm" onClick={() => onStartCall('video')}>
                  <Video className="h-4 w-4 mr-2" />
                  Video Call
                </Button>
                <Button variant="outline" size="sm" onClick={() => onStartCall('audio')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Audio Call
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function EnhancedSidebarContent({
  searchQuery,
  setSearchQuery,
  filteredChannels,
  filteredMembers,
  selectedChannel,
  onChannelSelect,
  onMemberSelect,
  onStartCall,
  getChannelDisplayName,
  getChannelIcon,
  isMobile = false
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredChannels: any[];
  filteredMembers: any[];
  selectedChannel?: string | null;
  onChannelSelect: (channelId: string) => void;
  onMemberSelect: (member: any) => void;
  onStartCall: (type: 'audio' | 'video', member?: any) => void;
  getChannelDisplayName: (channel: any) => string;
  getChannelIcon: (channel: any) => React.ReactNode;
  isMobile?: boolean;
}) {
  return (
    <div className="flex flex-col h-full bg-card/50">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Communication</h2>
        <p className="text-sm text-muted-foreground">Stay connected with your team</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="chats" className="h-full">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="chats" className="text-sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chats ({filteredChannels.length})
            </TabsTrigger>
            <TabsTrigger value="team" className="text-sm">
              <Users className="h-4 w-4 mr-2" />
              Team ({filteredMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="m-0 h-[calc(100%-3rem)] overflow-y-auto">
            <div className="p-4 space-y-1">
              {filteredChannels.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No channels found' : 'No channels yet'}
                  </p>
                </div>
              ) : (
                filteredChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start h-auto p-3 relative overflow-hidden"
                    onClick={() => onChannelSelect(channel.id)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getChannelIcon(channel)}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-sm truncate">
                          {getChannelDisplayName(channel)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {channel.is_direct_message ? 'Direct message' : channel.description || 'Team channel'}
                        </p>
                      </div>
                      {channel.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 text-xs flex-shrink-0">
                          {channel.unread_count}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="team" className="m-0 h-[calc(100%-3rem)] overflow-y-auto">
            <div className="p-4 space-y-2">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No team members found' : 'No team members yet'}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div key={member.id} className="p-3 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <PresenceIndicator userId={member.id} size="sm" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.full_name}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {member.role}
                            </Badge>
                            {member.department && (
                              <span className="text-xs text-muted-foreground">• {member.department}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onStartCall('video', member)}
                          title="Start video call"
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onStartCall('audio', member)}
                          title="Start audio call"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onMemberSelect(member)}
                          title="Send message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}