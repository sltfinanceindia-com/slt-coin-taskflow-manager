import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  Video, 
  PhoneOff, 
  Mic, 
  MicOff, 
  VideoOff,
  Volume2,
  VolumeX,
  Clock,
  PhoneCall
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CallData {
  id: string;
  type: 'audio' | 'video';
  status: 'incoming' | 'outgoing' | 'active' | 'ended';
  participant: {
    id: string;
    name: string;
    avatar?: string;
  };
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

interface CallManagerProps {
  onCallStart?: (type: 'audio' | 'video') => void;
  onCallEnd?: () => void;
}

export function CallManager({ onCallStart, onCallEnd }: CallManagerProps) {
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [callHistory, setCallHistory] = useState<CallData[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const callTimerRef = useRef<NodeJS.Timeout>();
  const ringtonRef = useRef<HTMLAudioElement>();
  const notificationSoundRef = useRef<HTMLAudioElement>();

  // Initialize audio elements
  useEffect(() => {
    // Create notification sounds
    ringtonRef.current = new Audio();
    ringtonRef.current.loop = true;
    ringtonRef.current.volume = 0.7;
    
    notificationSoundRef.current = new Audio();
    notificationSoundRef.current.volume = 0.5;
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Call timer
  useEffect(() => {
    if (currentCall?.status === 'active') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [currentCall?.status]);

  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0;
      notificationSoundRef.current.play().catch(console.error);
    }
  };

  const playRingtone = () => {
    if (ringtonRef.current) {
      ringtonRef.current.currentTime = 0;
      ringtonRef.current.play().catch(console.error);
    }
  };

  const stopRingtone = () => {
    if (ringtonRef.current) {
      ringtonRef.current.pause();
      ringtonRef.current.currentTime = 0;
    }
  };

  const startCall = (type: 'audio' | 'video', participant: { id: string; name: string; avatar?: string }) => {
    const call: CallData = {
      id: Date.now().toString(),
      type,
      status: 'outgoing',
      participant,
      startTime: new Date(),
    };

    setCurrentCall(call);
    setIsVideoOff(type === 'audio');
    playRingtone();
    
    // Simulate call connection after 3 seconds
    setTimeout(() => {
      setCurrentCall(prev => prev ? { ...prev, status: 'active' } : null);
      stopRingtone();
      playNotificationSound();
    }, 3000);

    onCallStart?.(type);
    
    toast({
      title: `${type === 'video' ? 'Video' : 'Audio'} Call`,
      description: `Calling ${participant.name}...`,
    });
  };

  const endCall = () => {
    if (currentCall) {
      const endedCall: CallData = {
        ...currentCall,
        status: 'ended',
        endTime: new Date(),
        duration: callDuration,
      };

      setCallHistory(prev => [endedCall, ...prev.slice(0, 9)]); // Keep last 10 calls
      setCurrentCall(null);
      setIsMuted(false);
      setIsVideoOff(false);
      setIsSpeakerOn(false);
      setCallDuration(0);
      
      stopRingtone();
      playNotificationSound();
      
      onCallEnd?.();
      
      toast({
        title: "Call Ended",
        description: `Call duration: ${formatDuration(callDuration)}`,
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "Microphone on" : "Microphone off",
    });
  };

  const toggleVideo = () => {
    if (currentCall?.type === 'video') {
      setIsVideoOff(!isVideoOff);
      toast({
        title: isVideoOff ? "Video On" : "Video Off",
        description: isVideoOff ? "Camera enabled" : "Camera disabled",
      });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast({
      title: isSpeakerOn ? "Speaker Off" : "Speaker On",
      description: isSpeakerOn ? "Using earpiece" : "Using speaker",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'ended': return 'bg-gray-500';
      case 'incoming': return 'bg-blue-500';
      case 'outgoing': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Active Call Overlay */}
      {currentCall && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentCall.participant.avatar} />
                  <AvatarFallback className="text-2xl">
                    {currentCall.participant.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{currentCall.participant.name}</h2>
                  <p className="text-muted-foreground">
                    {currentCall.status === 'active' ? formatDuration(callDuration) : 
                     currentCall.status === 'outgoing' ? 'Calling...' : 'Incoming call'}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {currentCall.type === 'video' ? 'Video Call' : 'Audio Call'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center space-x-4">
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "secondary"}
                  onClick={toggleMute}
                  className="rounded-full p-4"
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                
                {currentCall.type === 'video' && (
                  <Button
                    size="lg"
                    variant={isVideoOff ? "destructive" : "secondary"}
                    onClick={toggleVideo}
                    className="rounded-full p-4"
                  >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                  </Button>
                )}
                
                <Button
                  size="lg"
                  variant={isSpeakerOn ? "default" : "secondary"}
                  onClick={toggleSpeaker}
                  className="rounded-full p-4"
                >
                  {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                </Button>
                
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={endCall}
                  className="rounded-full p-4"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call History */}
      {!currentCall && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Recent Calls
            </h3>
          </div>
          
          <ScrollArea className="h-64">
            {callHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PhoneCall className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent calls</p>
              </div>
            ) : (
              <div className="space-y-2">
                {callHistory.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={call.participant.avatar} />
                        <AvatarFallback>
                          {call.participant.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{call.participant.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className={cn("w-2 h-2 rounded-full", getCallStatusColor(call.status))} />
                          <span>{call.status}</span>
                          {call.type === 'video' && <Video className="h-3 w-3" />}
                          {call.duration && (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(call.duration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCallTime(call.startTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </>
  );
}

export default CallManager;