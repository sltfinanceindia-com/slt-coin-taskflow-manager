import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2,
  Sparkles, HelpCircle, FileText, Calendar, Users, Clock, Palmtree,
  Home, CheckSquare, Target, Heart, Receipt, Zap, Trash2, Copy, 
  RotateCcw, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'up' | 'down';
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  action: () => void;
  color: string;
}

const chatQuickActions = [
  { label: 'Leave Policy', icon: Calendar, prompt: 'What is the company leave policy?' },
  { label: 'Benefits Info', icon: FileText, prompt: 'Tell me about employee benefits' },
  { label: 'HR Contact', icon: Users, prompt: 'How do I contact HR?' },
  { label: 'My Tasks', icon: CheckSquare, prompt: 'Show me my current tasks and their status' },
  { label: 'Team Info', icon: Users, prompt: 'Who are the members of my team?' },
  { label: 'Help', icon: HelpCircle, prompt: 'What can you help me with?' },
];

const followUpSuggestions = [
  'Tell me more',
  'Can you clarify?',
  'What else should I know?',
];

export function UnifiedAssistant() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'actions'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current && activeTab === 'chat') {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized, activeTab]);

  const navigateToTab = (tab: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: tab }));
    setIsOpen(false);
  };

  const quickActions: QuickAction[] = [
    {
      icon: CheckSquare,
      label: 'New Task',
      action: () => navigateToTab('tasks'),
      color: 'text-blue-500',
    },
    {
      icon: Clock,
      label: 'Log Time',
      action: () => navigateToTab('time'),
      color: 'text-green-500',
    },
    {
      icon: Palmtree,
      label: 'Request Leave',
      action: () => navigateToTab('leave'),
      color: 'text-yellow-500',
    },
    {
      icon: Home,
      label: 'Request WFH',
      action: () => navigateToTab('wfh'),
      color: 'text-purple-500',
    },
    {
      icon: Receipt,
      label: 'Add Expense',
      action: () => navigateToTab('expenses'),
      color: 'text-orange-500',
    },
    {
      icon: Heart,
      label: 'Give Kudos',
      action: () => navigateToTab('kudos'),
      color: 'text-pink-500',
    },
    {
      icon: Target,
      label: 'Add Goal',
      action: () => navigateToTab('my-goals'),
      color: 'text-cyan-500',
    },
    {
      icon: MessageCircle,
      label: 'Send Message',
      action: () => navigateToTab('communication'),
      color: 'text-indigo-500',
    },
  ];

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://orybzmkhccrqmjuvioln.supabase.co'}/functions/v1/ai-hr-chatbot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = assistantContent;
                  }
                  return newMessages;
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact HR directly.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 h-14 w-14 rounded-full shadow-2xl",
          "bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:to-accent/80",
          "bottom-20 right-4 sm:bottom-8 sm:right-6",
          "hover:scale-110 transition-all duration-300 animate-pulse-ring"
        )}
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed z-50 shadow-2xl transition-all duration-300 flex flex-col",
      isMinimized 
        ? "bottom-4 right-4 w-72" 
        : cn(
          // Mobile: full width with padding, above bottom nav
          "bottom-20 right-4 left-4 sm:bottom-4 sm:left-auto",
          // Desktop: fixed width
          "sm:w-96",
          // Height - use fixed height on mobile for proper scrolling
          "h-[60vh] sm:h-[500px]"
        )
    )}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="h-6 w-6" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 rounded-full border-2 border-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">TeneXA AI</CardTitle>
            {!isMinimized && (
              <p className="text-xs opacity-80">Your intelligent work assistant</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && !isMinimized && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => { setMessages([]); toast.success('Chat cleared'); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Clear chat</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'actions')} className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b shrink-0">
              <TabsTrigger value="chat" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="actions" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Zap className="h-4 w-4 mr-2" />
                Quick Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0 min-h-0 data-[state=inactive]:hidden">
              <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">How can I help you?</h3>
                      <p className="text-sm text-muted-foreground">
                        Ask about your tasks, team, policies, or anything work-related.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {chatQuickActions.map((action) => (
                        <Button
                          key={action.label}
                          variant="outline"
                          size="sm"
                          className="h-auto py-2 px-2 flex flex-col items-center gap-1 text-xs"
                          onClick={() => handleQuickAction(action.prompt)}
                        >
                          <action.icon className="h-4 w-4" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex gap-3 group",
                          message.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Sparkles className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col gap-1 max-w-[80%]">
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2 text-sm",
                              message.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.content === '' && message.role === 'assistant' && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                          {/* Action buttons for assistant messages */}
                          {message.role === 'assistant' && message.content && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content);
                                  toast.success('Copied!');
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-6 w-6", message.feedback === 'up' && "text-green-500")}
                                onClick={() => {
                                  setMessages(prev => prev.map((m, i) => i === index ? { ...m, feedback: 'up' } : m));
                                }}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-6 w-6", message.feedback === 'down' && "text-destructive")}
                                onClick={() => {
                                  setMessages(prev => prev.map((m, i) => i === index ? { ...m, feedback: 'down' } : m));
                                }}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const prevUserMsg = messages.slice(0, index).reverse().find(m => m.role === 'user');
                                  if (prevUserMsg) sendMessage(prevUserMsg.content);
                                }}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={profile?.avatar_url || ''} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {/* Follow-up suggestions after last assistant message */}
                    {!isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {followUpSuggestions.map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs rounded-full"
                            onClick={() => sendMessage(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-3 border-t shrink-0 bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="actions" className="flex-1 m-0 overflow-auto p-4 data-[state=inactive]:hidden">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted"
                      onClick={action.action}
                    >
                      <div className={cn("p-2 rounded-full bg-muted", action.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
