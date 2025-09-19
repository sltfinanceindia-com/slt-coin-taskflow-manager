import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, 
  MessageSquare, 
  Users, 
  Phone, 
  Video, 
  ArrowLeft,
  MoreVertical,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  selectedChannel?: string | null;
  teamMembers: any[];
  channels: any[];
  onChannelSelect: (channelId: string) => void;
  onMemberSelect: (member: any) => void;
  onStartCall: (type: 'audio' | 'video', member?: any) => void;
}

export function MobileLayout({
  children,
  showSidebar,
  onToggleSidebar,
  selectedChannel,
  teamMembers,
  channels,
  onChannelSelect,
  onMemberSelect,
  onStartCall
}: MobileLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'members'>('chats');

  const filteredMembers = teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card lg:hidden">
        <div className="flex items-center space-x-3">
          <Sheet open={showSidebar} onOpenChange={onToggleSidebar}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Sidebar Header */}
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Communication</h2>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                  <Button
                    variant={activeTab === 'chats' ? 'default' : 'ghost'}
                    className="flex-1 rounded-none"
                    onClick={() => setActiveTab('chats')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chats
                  </Button>
                  <Button
                    variant={activeTab === 'members' ? 'default' : 'ghost'}
                    className="flex-1 rounded-none"
                    onClick={() => setActiveTab('members')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Team
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'chats' && (
                    <div className="p-2 space-y-1">
                      {filteredChannels.map((channel) => (
                        <Button
                          key={channel.id}
                          variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-auto p-3"
                          onClick={() => {
                            onChannelSelect(channel.id);
                            onToggleSidebar();
                          }}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-medium text-sm truncate">
                                {channel.name}
                              </p>
                              {channel.last_message && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {channel.last_message}
                                </p>
                              )}
                            </div>
                            {channel.unread_count > 0 && (
                              <Badge variant="destructive" className="ml-auto">
                                {channel.unread_count}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'members' && (
                    <div className="p-2 space-y-1">
                      {filteredMembers.map((member) => (
                        <div key={member.id} className="p-3 rounded-lg hover:bg-accent">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar_url} />
                                <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{member.full_name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  onStartCall('video', member);
                                  onToggleSidebar();
                                }}
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  onStartCall('audio', member);
                                  onToggleSidebar();
                                }}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  onMemberSelect(member);
                                  onToggleSidebar();
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-semibold">
            {selectedChannel ? 'Chat' : 'Communication'}
          </h1>
        </div>
        
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop/Mobile Content */}
      <div className="flex-1 flex">
        {children}
      </div>
    </div>
  );
}