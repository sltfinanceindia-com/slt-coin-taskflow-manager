import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Users, 
  Pin, 
  FileText, 
  Image, 
  Calendar,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Star,
  Search,
  Phone,
  Video,
  Mail,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Channel, TeamMember } from '@/hooks/useCommunication';

interface DetailsPanelProps {
  channel: Channel;
  members: TeamMember[];
  onClose: () => void;
}

export default function DetailsPanel({ channel, members, onClose }: DetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('members');
  const [isNotificationMuted, setIsNotificationMuted] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getMemberRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Channel Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Channel Info */}
      <div className="p-4 border-b border-border">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {channel.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{channel.name}</h3>
              <p className="text-sm text-muted-foreground">
                {channel.type} channel • {members.length} members
              </p>
            </div>
          </div>
          
          {channel.description && (
            <p className="text-sm text-muted-foreground">
              {channel.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button 
              variant={isNotificationMuted ? "outline" : "default"} 
              size="sm"
              onClick={() => setIsNotificationMuted(!isNotificationMuted)}
            >
              {isNotificationMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isNotificationMuted ? "Unmute" : "Mute"}
            </Button>
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="members" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="files" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="pinned" className="flex-1">
            <Pin className="h-4 w-4 mr-2" />
            Pinned
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {/* Members Tab */}
          <TabsContent value="members" className="h-full m-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Members ({members.length})</h4>
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="group p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback className="text-sm">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                            getStatusColor(member.activity_status)
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {member.full_name}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {getMemberRole(member.role)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.status_message || member.email}
                          </p>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="h-full m-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Shared Files</h4>
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No files shared yet</h3>
                <p className="text-sm text-muted-foreground">
                  Files shared in this channel will appear here
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pinned Tab */}
          <TabsContent value="pinned" className="h-full m-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Pinned Messages</h4>
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center py-12">
                <Pin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No pinned messages</h3>
                <p className="text-sm text-muted-foreground">
                  Pin important messages to find them quickly
                </p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="justify-start">
            <Phone className="h-4 w-4 mr-2" />
            Start Call
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}