import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Reply, 
  MoreVertical,
  Pin,
  Star,
  Share,
  Flag,
  Edit,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Reply {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

interface ThreadMessage {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  timestamp: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
  replies?: Reply[];
  isPinned?: boolean;
  isStarred?: boolean;
}

interface ThreadedConversationProps {
  messages: ThreadMessage[];
  onReply?: (messageId: string, content: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export function ThreadedConversation({ 
  messages, 
  onReply, 
  onReact, 
  onPin, 
  onStar, 
  onEdit, 
  onDelete 
}: ThreadedConversationProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const toggleThread = (messageId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedThreads(newExpanded);
  };

  const handleReply = (messageId: string) => {
    if (replyContent.trim() && onReply) {
      onReply(messageId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="group">
            {/* Main Message */}
            <div className={`flex gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors ${
              message.isPinned ? 'bg-blue-50 border border-blue-200' : ''
            }`}>
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={message.author.avatar} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                  {message.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{message.author.name}</span>
                  {message.author.role && (
                    <Badge variant="outline" className="text-xs">
                      {message.author.role}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                  {message.isPinned && (
                    <Pin className="h-3 w-3 text-blue-600" />
                  )}
                  {message.isStarred && (
                    <Star className="h-3 w-3 text-yellow-600" />
                  )}
                </div>
                
                <div className="text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {message.reactions.map((reaction, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onReact?.(message.id, reaction.emoji)}
                      >
                        {reaction.emoji} {reaction.count}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {/* Reaction Quick Actions */}
                  <div className="flex gap-1">
                    {commonReactions.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onReact?.(message.id, emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => setReplyingTo(message.id)}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => onPin?.(message.id)}
                  >
                    <Pin className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => onStar?.(message.id)}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                  >
                    <Share className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Reply Input */}
            {replyingTo === message.id && (
              <div className="ml-11 mt-2 p-3 bg-muted/30 rounded-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Reply to this message..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-md"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleReply(message.id);
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleReply(message.id)}
                    disabled={!replyContent.trim()}
                  >
                    Reply
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Thread Replies */}
            {message.replies && message.replies.length > 0 && (
              <div className="ml-11 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleThread(message.id)}
                  className="text-xs text-primary"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {expandedThreads.has(message.id) ? 'Hide' : 'Show'} {message.replies.length} replies
                </Button>
                
                {expandedThreads.has(message.id) && (
                  <div className="mt-2 space-y-2 pl-4 border-l-2 border-muted">
                    {message.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2 p-2 rounded hover:bg-muted/30">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.author.avatar} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {reply.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs">{reply.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="text-xs mt-1">{reply.content}</div>
                          
                          {reply.reactions && reply.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {reply.reactions.map((reaction, index) => (
                                <span key={index} className="text-xs bg-muted px-1 rounded">
                                  {reaction.emoji} {reaction.count}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}