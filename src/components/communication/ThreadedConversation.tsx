import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare,
  Reply,
  Send,
  X,
  Clock,
  User,
  Hash,
  Star,
  Pin,
  Archive,
  Forward,
  Copy,
  Edit,
  Trash2,
  Smile,
  Paperclip,
  MoreHorizontal,
  ArrowLeft,
  Users,
  Filter,
  SortAsc,
  SortDesc,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ThreadMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isEdited?: boolean;
  parentId?: string;
  level: number;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

interface Thread {
  id: string;
  title: string;
  channel: string;
  originalMessage: ThreadMessage;
  messages: ThreadMessage[];
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  isActive: boolean;
  lastActivity: Date;
  totalMessages: number;
}

interface ThreadedConversationProps {
  threadId?: string;
  onClose?: () => void;
  onMessageSend?: (content: string, parentId?: string) => void;
  className?: string;
}

export default function ThreadedConversation({
  threadId,
  onClose,
  onMessageSend,
  className
}: ThreadedConversationProps) {
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'mentions'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'replies'>('date');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadId) {
      // Mock thread data
      const mockThread: Thread = {
        id: threadId,
        title: 'Project Timeline Discussion',
        channel: 'general',
        originalMessage: {
          id: 'original',
          content: 'Can we discuss the project timeline for the new feature? I think we need to adjust some deadlines.',
          sender: { id: '1', name: 'John Doe', avatar: '/avatars/john.png' },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          level: 0
        },
        messages: [
          {
            id: '1',
            content: 'I agree, the current timeline seems too aggressive for the scope.',
            sender: { id: '2', name: 'Sarah Wilson', avatar: '/avatars/sarah.png' },
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            parentId: 'original',
            level: 1,
            reactions: [{ emoji: '👍', count: 2, users: ['3', '4'] }]
          },
          {
            id: '2',
            content: 'What specific areas are you concerned about?',
            sender: { id: '3', name: 'Mike Johnson', avatar: '/avatars/mike.png' },
            timestamp: new Date(Date.now() - 1000 * 60 * 45),
            parentId: '1',
            level: 2
          },
          {
            id: '3',
            content: 'Mainly the testing phase and integration work.',
            sender: { id: '2', name: 'Sarah Wilson', avatar: '/avatars/sarah.png' },
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            parentId: '2',
            level: 3
          },
          {
            id: '4',
            content: 'We could extend the timeline by a week to be safe.',
            sender: { id: '1', name: 'John Doe', avatar: '/avatars/john.png' },
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            parentId: 'original',
            level: 1
          }
        ],
        participants: [
          { id: '1', name: 'John Doe', avatar: '/avatars/john.png' },
          { id: '2', name: 'Sarah Wilson', avatar: '/avatars/sarah.png' },
          { id: '3', name: 'Mike Johnson', avatar: '/avatars/mike.png' }
        ],
        isActive: true,
        lastActivity: new Date(),
        totalMessages: 5
      };

      setCurrentThread(mockThread);
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [currentThread?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onMessageSend?.(newMessage.trim(), replyingTo || undefined);
      setNewMessage('');
      setReplyingTo(null);
      toast.success('Message sent');
    }
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
  };

  const toggleExpanded = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const getIndentLevel = (level: number): string => {
    return `ml-${Math.min(level * 4, 16)}`;
  };

  const buildMessageTree = (messages: ThreadMessage[]): ThreadMessage[] => {
    const messageMap = new Map<string, ThreadMessage>();
    const tree: ThreadMessage[] = [];

    // Add original message first
    if (currentThread?.originalMessage) {
      tree.push(currentThread.originalMessage);
      messageMap.set(currentThread.originalMessage.id, currentThread.originalMessage);
    }

    // Sort messages by timestamp
    const sortedMessages = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Build the tree structure
    sortedMessages.forEach(message => {
      messageMap.set(message.id, message);
      tree.push(message);
    });

    return tree;
  };

  const filteredMessages = currentThread ? buildMessageTree(currentThread.messages) : [];

  if (!currentThread) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Thread Selected</h3>
            <p className="text-muted-foreground">Select a thread to view the conversation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {currentThread.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Hash className="h-3 w-3 mr-1" />
              {currentThread.channel}
            </Badge>
            <Badge variant="outline">
              {currentThread.totalMessages} messages
            </Badge>
          </div>
        </div>

        {/* Thread Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{currentThread.participants.length} participants</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Last activity {formatTime(currentThread.lastActivity)}</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in thread..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterBy} onValueChange={(value: typeof filterBy) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="mentions">Mentions</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="replies">By Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Participants:</span>
          <div className="flex -space-x-2">
            {currentThread.participants.map(participant => (
              <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={participant.avatar} />
                <AvatarFallback className="text-xs">
                  {participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 group",
                  message.level > 0 && getIndentLevel(message.level)
                )}
              >
                {/* Thread Line */}
                {message.level > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-6" />
                )}

                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>
                    {message.sender.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.sender.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isEdited && (
                      <Badge variant="outline" className="text-xs">edited</Badge>
                    )}
                    {message.level > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Reply to level {message.level - 1}
                      </Badge>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="text-sm mb-2">
                    {message.content}
                  </div>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {message.reactions.map((reaction, idx) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          {reaction.emoji} {reaction.count}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleReply(message.id)}
                    >
                      <Reply className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Reply Context */}
        {replyingTo && (
          <div className="p-3 bg-muted border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Replying to:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {filteredMessages.find(m => m.id === replyingTo)?.content}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder={replyingTo ? "Reply to message..." : "Type a message..."}
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
      </CardContent>
    </Card>
  );
}