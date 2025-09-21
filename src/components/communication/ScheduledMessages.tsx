import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Send, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduledMessage {
  id: string;
  content: string;
  recipient: string;
  channel_id?: string;
  scheduled_for: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

interface ScheduledMessagesProps {
  onScheduleMessage: (content: string, scheduledFor: Date, channelId?: string) => void;
}

export default function ScheduledMessages({ onScheduleMessage }: ScheduledMessagesProps) {
  const { toast } = useToast();
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([
    {
      id: '1',
      content: 'Don\'t forget about our team meeting at 2 PM today!',
      recipient: 'Team Channel',
      scheduled_for: new Date(Date.now() + 3600000).toISOString(),
      status: 'pending',
      created_at: new Date().toISOString()
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    content: '',
    date: '',
    time: '',
    recipient: 'current_channel'
  });

  const handleScheduleMessage = () => {
    if (!newMessage.content.trim() || !newMessage.date || !newMessage.time) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const scheduledFor = new Date(`${newMessage.date}T${newMessage.time}`);
    
    if (scheduledFor <= new Date()) {
      toast({
        title: "Error",
        description: "Scheduled time must be in the future",
        variant: "destructive"
      });
      return;
    }

    const message: ScheduledMessage = {
      id: Date.now().toString(),
      content: newMessage.content,
      recipient: newMessage.recipient === 'current_channel' ? 'Current Channel' : 'Direct Message',
      scheduled_for: scheduledFor.toISOString(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setScheduledMessages(prev => [...prev, message]);
    onScheduleMessage(newMessage.content, scheduledFor);
    
    toast({ 
      title: "Message scheduled successfully",
      description: `Will be sent on ${scheduledFor.toLocaleDateString()} at ${scheduledFor.toLocaleTimeString()}`
    });

    setIsDialogOpen(false);
    setNewMessage({ content: '', date: '', time: '', recipient: 'current_channel' });
  };

  const handleCancelMessage = (messageId: string) => {
    setScheduledMessages(prev => prev.filter(m => m.id !== messageId));
    toast({ title: "Scheduled message cancelled" });
  };

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Messages
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Message content"
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newMessage.date}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={newMessage.time}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Send to</label>
                <select
                  className="w-full p-2 border rounded-md mt-1"
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, recipient: e.target.value }))}
                >
                  <option value="current_channel">Current Channel</option>
                  <option value="direct_message">Direct Message</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleScheduleMessage} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {scheduledMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No scheduled messages</p>
          </div>
        ) : (
          scheduledMessages.map((message) => (
            <Card key={message.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatScheduledTime(message.scheduled_for)}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelMessage(message.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>To: {message.recipient}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      message.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      message.status === 'sent' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {message.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}