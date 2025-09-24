import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  Users, 
  Loader2,
  Mic,
  MicOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebRTC } from '@/hooks/useWebRTC';
import { audioNotifications } from '@/utils/audioNotifications';

interface OutgoingCallScreenProps {
  recipientName: string;
  recipientAvatar?: string;
  callType: 'voice' | 'video';
  onCancel: () => void;
  onSwitchToVideo?: () => void;
  onAddParticipant?: () => void;
}

export default function OutgoingCallScreen({
  recipientName,
  recipientAvatar,
  callType,
  onCancel,
  onSwitchToVideo,
  onAddParticipant
}: OutgoingCallScreenProps) {
  const { callState, toggleMute } = useWebRTC();
  const [ringingWaves, setRingingWaves] = useState(0);

  useEffect(() => {
    // Start ringing animation
    const interval = setInterval(() => {
      setRingingWaves(prev => (prev + 1) % 3);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 bg-card/95 backdrop-blur border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={callType === 'video' ? 'default' : 'secondary'} className="shadow-sm">
                {callType === 'video' ? (
                  <Video className="h-3 w-3 mr-1" />
                ) : (
                  <Phone className="h-3 w-3 mr-1" />
                )}
                {callType} call
              </Badge>
              
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Calling...
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-8 max-w-md">
            {/* Recipient Avatar with Ringing Animation */}
            <div className="relative">
              {/* Ringing waves */}
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute inset-0 rounded-full border-2 border-primary/30",
                    ringingWaves === index && "animate-ping"
                  )}
                  style={{
                    padding: `${20 + (index * 12)}px`,
                    animationDelay: `${index * 0.3}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
              
              <Avatar className="w-32 h-32 mx-auto ring-4 ring-primary/20 shadow-elegant">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                  {getInitials(recipientName)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Call Info */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">
                {recipientName}
              </h2>
              <p className="text-muted-foreground">
                {callType === 'video' ? 'Starting video call...' : 'Calling...'}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Ringing</span>
              </div>
            </div>

            {/* Connection Status */}
            <Card className="bg-muted/30 border-muted">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="w-1 h-4 bg-primary/60 rounded-full animate-pulse"
                        style={{
                          animationDelay: `${index * 0.2}s`,
                          animationDuration: '1s'
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Connecting audio...
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-card/95 backdrop-blur border-t">
          <div className="flex items-center justify-center gap-6">
            {/* Mute Toggle */}
            <Button
              variant={callState.isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              {callState.isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Switch to Video (for voice calls) */}
            {callType === 'voice' && onSwitchToVideo && (
              <Button
                variant="outline"
                size="lg"
                onClick={onSwitchToVideo}
                className="h-12 w-12 rounded-full bg-info/10 border-info/20 hover:bg-info/20 text-info shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Video className="h-5 w-5" />
              </Button>
            )}

            {/* Add Participant */}
            {onAddParticipant && (
              <Button
                variant="outline"
                size="lg"
                onClick={onAddParticipant}
                className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Users className="h-5 w-5" />
              </Button>
            )}

            {/* Cancel Call */}
            <Button
              variant="destructive"
              size="lg"
              onClick={onCancel}
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Action Labels */}
          <div className="flex items-center justify-center gap-8 mt-4 text-xs text-muted-foreground">
            <span>Mute</span>
            {callType === 'voice' && onSwitchToVideo && <span>Video</span>}
            {onAddParticipant && <span>Add</span>}
            <span>Cancel</span>
          </div>
        </div>
      </div>
    </div>
  );
}