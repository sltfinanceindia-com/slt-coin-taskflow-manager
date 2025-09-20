import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Info,
  Bell,
  Plus
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

// Custom hook for responsive breakpoints
function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('mobile');

  useEffect(() => {
    const updateBreakpoint = () => {
      if (window.innerWidth >= 1280) setBreakpoint('xl');
      else if (window.innerWidth >= 1024) setBreakpoint('lg');
      else if (window.innerWidth >= 768) setBreakpoint('md');
      else if (window.innerWidth >= 640) setBreakpoint('sm');
      else setBreakpoint('mobile');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
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
  const breakpoint = useBreakpoint();
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl';
  
  const filteredMembers = teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredChannels = channels.filter(channel =>
    getChannelDisplayName(channel).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (channel.description && channel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Desktop Sidebar */}
      {isDesktop && (
        <div className="w-80 xl:w-96 flex flex-col border-r bg-card/50 backdrop-blur-sm">
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
            isDesktop={true}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 sticky top-0 z-40">
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
            {/* Mobile Menu Button */}
            {!isDesktop && (
              <Sheet open={showSidebar} onOpenChange={onToggleSidebar}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80 p-0 border-r-0">
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
                    isMobile={true}
                  />
                </SheetContent>
              </Sheet>
            )}
            
            {/* Channel Info */}
            <div className="flex items-center space-x-2 min-w-0">
              {currentChannel && (
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  {getChannelIcon(currentChannel)}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-semibold truncate">{currentChannelName}</h1>
                {selectedChannel && (
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Badge variant="secondary" className="text-xs h-5">
                      {currentChannel?.is_direct_message ? 'DM' : 'Channel'}
                    </Badge>
                    {currentChannel?.is_direct_message && (
                      <PresenceIndicator userId={currentChannel.other_user_id} size="sm" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
            {selectedChannel && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 hover:bg-primary/10"
                  onClick={() => onStartCall('video')}
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 hover:bg-primary/10"
                  onClick={() => onStartCall('audio')}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-background/50">
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
  isMobile = false,
  isDesktop = false
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
  isDesktop?: boolean;
}) {
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-sm">
      {/* Enhanced Header */}
      <div className="p-4 md:p-6 border-b bg-card/90 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Communication Hub
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Stay connected with your team
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10 bg-background/60 border-muted-foreground/20 focus:border-primary/50 transition-all duration-200"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-2 bg-muted/60">
            <TabsTrigger value="chats" className="text-sm data-[state=active]:bg-background/80">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Chats</span>
              <Badge variant="secondary" className="ml-2 h-4 text-xs">
                {filteredChannels.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="team" className="text-sm data-[state=active]:bg-background/80">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Team</span>
              <Badge variant="secondary" className="ml-2 h-4 text-xs">
                {filteredMembers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100%-4rem)]">
            <TabsContent value="chats" className="m-0">
              <div className="px-4 pb-4 space-y-1">
                {filteredChannels.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No channels found' : 'No channels yet'}
                    </p>
                    {!searchQuery && (
                      <Button variant="outline" size="sm" className="mt-3">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Channel
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredChannels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                      className={cn(
                        "w-full justify-start h-auto p-3 relative overflow-hidden group transition-all duration-200",
                        selectedChannel === channel.id && "bg-primary/10 border-primary/20 shadow-sm"
                      )}
                      onClick={() => onChannelSelect(channel.id)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                          selectedChannel === channel.id 
                            ? "bg-primary/20 text-primary" 
                            : "bg-muted/60 group-hover:bg-primary/10"
                        )}>
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
                          <Badge variant="destructive" className="h-5 text-xs flex-shrink-0 animate-pulse">
                            {channel.unread_count > 99 ? '99+' : channel.unread_count}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="team" className="m-0">
              <div className="px-4 pb-4 space-y-2">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No team members found' : 'No team members yet'}
                    </p>
                    {!searchQuery && (
                      <Button variant="outline" size="sm" className="mt-3">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Members
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-background">
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {member.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <PresenceIndicator userId={member.id} size="sm" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{member.full_name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className="text-xs capitalize h-5 bg-background/60"
                              >
                                {member.role}
                              </Badge>
                              {member.department && (
                                <span className="text-xs text-muted-foreground">• {member.department}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                            onClick={() => onStartCall('video', member)}
                            title="Start video call"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                            onClick={() => onStartCall('audio', member)}
                            title="Start audio call"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
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
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
