import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Clock, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageReminder {
  id: string;
  message_id: string;
  message_content: string;
  sender_name: string;
  reminder_time: string;
  status: 'pending' | 'sent' | 'dismissed';
  created_at: string;
}

interface MessageRemindersProps {
  onSetReminder: (messageId: string, reminderTime: Date) => void;
}

export default function MessageReminders({ onSetReminder }: MessageRemindersProps) {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<MessageReminder[]>([
    {
      id: '1',
      message_id: 'msg1',
      message_content: 'Please review the quarterly report and send feedback',
      sender_name: 'John Smith',
      reminder_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      status: 'pending',
      created_at: new Date().toISOString()
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{ id: string; content: string; sender: string } | null>(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const handleSetReminder = () => {
    if (!selectedMessage || !reminderDate || !reminderTime) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
    
    if (reminderDateTime <= new Date()) {
      toast({
        title: "Error",
        description: "Reminder time must be in the future",
        variant: "destructive"
      });
      return;
    }

    const reminder: MessageReminder = {
      id: Date.now().toString(),
      message_id: selectedMessage.id,
      message_content: selectedMessage.content,
      sender_name: selectedMessage.sender,
      reminder_time: reminderDateTime.toISOString(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setReminders(prev => [...prev, reminder]);
    onSetReminder(selectedMessage.id, reminderDateTime);
    
    toast({ 
      title: "Reminder set successfully",
      description: `You'll be reminded on ${reminderDateTime.toLocaleDateString()} at ${reminderDateTime.toLocaleTimeString()}`
    });

    setIsDialogOpen(false);
    setSelectedMessage(null);
    setReminderDate('');
    setReminderTime('');
  };

  const handleDismissReminder = (reminderId: string) => {
    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, status: 'dismissed' as const } : r
    ));
    toast({ title: "Reminder dismissed" });
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    toast({ title: "Reminder deleted" });
  };

  const formatReminderTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMinutes = Math.round((date.getTime() - now.getTime()) / (1000 * 60));
      return `In ${diffMinutes} minutes`;
    } else if (diffHours < 24) {
      return `In ${Math.round(diffHours)} hours`;
    } else if (diffHours < 48) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const quickReminderOptions = [
    { label: '15 minutes', minutes: 15 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 },
    { label: 'Tomorrow 9 AM', custom: true }
  ];

  const setQuickReminder = (minutes?: number, custom?: boolean) => {
    if (!selectedMessage) return;

    let reminderDateTime: Date;
    
    if (custom) {
      // Tomorrow at 9 AM
      reminderDateTime = new Date();
      reminderDateTime.setDate(reminderDateTime.getDate() + 1);
      reminderDateTime.setHours(9, 0, 0, 0);
    } else if (minutes) {
      reminderDateTime = new Date(Date.now() + minutes * 60000);
    } else {
      return;
    }

    const reminder: MessageReminder = {
      id: Date.now().toString(),
      message_id: selectedMessage.id,
      message_content: selectedMessage.content,
      sender_name: selectedMessage.sender,
      reminder_time: reminderDateTime.toISOString(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setReminders(prev => [...prev, reminder]);
    onSetReminder(selectedMessage.id, reminderDateTime);
    
    toast({ 
      title: "Reminder set successfully",
      description: `You'll be reminded ${formatReminderTime(reminderDateTime.toISOString())}`
    });

    setIsDialogOpen(false);
    setSelectedMessage(null);
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Message Reminders
          {pendingReminders.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {pendingReminders.length}
            </span>
          )}
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => {
              // In a real app, this would get the currently selected message
              setSelectedMessage({
                id: 'demo-msg',
                content: 'This is a demo message for setting reminders',
                sender: 'Demo User'
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Message Reminder</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedMessage.sender}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedMessage.content}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Quick options:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickReminderOptions.map((option) => (
                      <Button
                        key={option.label}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickReminder(option.minutes, option.custom)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Custom time:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSetReminder} className="flex-1">
                    Set Reminder
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No message reminders set</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className={reminder.status === 'dismissed' ? 'opacity-50' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatReminderTime(reminder.reminder_time)}
                  </CardTitle>
                  <div className="flex gap-1">
                    {reminder.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismissReminder(reminder.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Bell className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{reminder.sender_name}</p>
                  <p className="text-sm line-clamp-2">{reminder.message_content}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    reminder.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    reminder.status === 'sent' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reminder.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}