import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  Video, 
  X, 
  MessageCircle,
  PhoneCall,
  PhoneMissed 
} from 'lucide-react';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MissedCall {
  id: string;
  caller_id: string;
  caller_name: string;
  call_type: 'voice' | 'video';
  created_at: string;
}

export default function MissedCallNotifications() {
  const { getMissedCalls, callHistory, fetchCallHistory } = useCallHistory();
  const { startVoiceCall, startVideoCall } = useWebRTC();
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const missed = getMissedCalls().filter(call => !dismissed.has(call.id));
    setMissedCalls(missed as MissedCall[]);
  }, [callHistory, dismissed]);

  const handleCallBack = async (call: MissedCall) => {
    try {
      if (call.call_type === 'video') {
        await startVideoCall(call.caller_id, call.caller_name);
      } else {
        await startVoiceCall(call.caller_id, call.caller_name);
      }
      handleDismiss(call.id);
      toast.success(`Calling ${call.caller_name}...`);
    } catch (error) {
      toast.error('Failed to start call');
    }
  };

  const handleMessage = (call: MissedCall) => {
    // Navigate to messages (would integrate with messaging system)
    handleDismiss(call.id);
    toast.success(`Opening chat with ${call.caller_name}`);
  };

  const handleDismiss = (callId: string) => {
    setDismissed(prev => new Set(prev).add(callId));
  };

  const handleDismissAll = () => {
    missedCalls.forEach(call => handleDismiss(call.id));
  };

  if (missedCalls.length === 0) {
    return null;
  }

  return (
    <Card className="fixed top-20 right-4 w-96 shadow-lg border-l-4 border-l-red-500 z-50 animate-in slide-in-from-right">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PhoneMissed className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-sm">
              {missedCalls.length} Missed Call{missedCalls.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="h-7 text-xs"
          >
            Dismiss All
          </Button>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {missedCalls.map((call) => (
              <div
                key={call.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-card",
                  "hover:bg-accent transition-colors"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-red-100 text-red-700">
                    {call.caller_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {call.caller_name}
                    </p>
                    <Badge variant="destructive" className="text-xs">
                      Missed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {call.call_type === 'video' ? (
                      <Video className="h-3 w-3" />
                    ) : (
                      <Phone className="h-3 w-3" />
                    )}
                    <span>
                      {formatDistanceToNow(new Date(call.created_at), { 
                        addSuffix: true 
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCallBack(call)}
                    className="h-8 w-8 p-0"
                    title="Call back"
                  >
                    <PhoneCall className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMessage(call)}
                    className="h-8 w-8 p-0"
                    title="Send message"
                  >
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(call.id)}
                    className="h-8 w-8 p-0"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}