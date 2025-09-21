import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  Users, 
  Plus,
  Settings
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  participants: string[];
}

export default function WorkingCommunication() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [channels] = useState<Channel[]>([
    { id: '1', name: 'General', type: 'public', participants: [] },
    { id: '2', name: 'Development', type: 'public', participants: [] },
    { id: '3', name: 'Design', type: 'public', participants: [] }
  ]);
  const [messages] = useState<Message[]>([
    { id: '1', content: 'Welcome to the team communication center! 🎉', sender: 'System', timestamp: new Date() },
    { id: '2', content: 'This is a simplified communication interface while we fix the advanced components.', sender: 'System', timestamp: new Date() }
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <Card className="w-80 h-full rounded-none border-r">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Team Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">CHANNELS</h3>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedChannel(channel.id)}
                >
                  # {channel.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold">
                  # {channels.find(c => c.id === selectedChannel)?.name}
                </h2>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{message.sender[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a channel</h3>
              <p className="text-muted-foreground">Choose a channel from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}