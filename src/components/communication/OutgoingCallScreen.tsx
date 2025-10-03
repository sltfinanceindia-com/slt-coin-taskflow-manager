import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff,
  Users, 
  Loader2,
  Mic,
  MicOff,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebRTC } from '@/hooks/useWebRTC';

interface OutgoingCallScreenProps {
  recipientId?: string;
  recipientName: string;
  recipientAvatar?: string;
  callType: 'voice' | 'video';
  onCancel: () => void;
  onSwitchToVideo?: () => void;
  onAddParticipant?: () => void;
  className?: string;
}

export default function OutgoingCallScreen({
  recipientId,
  recipientName,
  recipientAvatar,
  callType,
  onCancel,
  onSwitchToVideo,
  onAddParticipant,
  className
}: OutgoingCallScreenProps) {
  const { 
    callState, 
    toggleMute, 
    toggleVideo, 
    endCall,
    localStream,
    localVideoRef
  } = useWebRTC();
  
  const [ringingWaves, setRingingWaves] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'ringing' | 'failed'>('connecting');
  const [callDuration, setCallDuration] = useState(0);

  // Ringing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRingingWaves(prev => (prev + 1) % 3);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Connection status updates
  useEffect(() => {
    if (callState.isOutgoing) {
      const statusTimer = setTimeout(() => {
        setConnectionStatus('ringing');
      }, 2000);

      // Simulate call timeout after 45 seconds
      const timeoutTimer = setTimeout(() => {
        setConnectionStatus('failed');
      }, 45000);

      return () => {
        clearTimeout(statusTimer);
        clearTimeout(timeoutTimer);
      };
    }
  }, [callState.isOutgoing]);

  // Track call duration for outgoing calls
  useEffect(() => {
    if (callState.isOutgoing && callState.isActive) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callState.isOutgoing, callState.isActive]);

  // Handle call cancellation
  const handleCancel = () => {
    endCall();
    onCancel();
  };

  // Handle switch to video
  const handleSwitchToVideo = () => {
    toggleVideo();
    onSwitchToVideo?.();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'failed':
        return 'Connection failed';
      default:
        return 'Calling...';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'ringing':
        return <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />;
      case 'failed':
        return <WifiOff className="h-4 w-4 text-destructive" />;
      default:
        return <Wifi className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-sm",
      className
    )}>
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
                {getConnectionIcon()}
                {getConnectionStatusText()}
                {callDuration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(callDuration)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {connectionStatus === 'failed' && (
                <Badge variant="destructive" className="text-xs">
                  No answer
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-8 max-w-md">
            {/* Video Preview for Video Calls */}
            {callType === 'video' && callState.isVideoEnabled && (
              <div className="relative mb-6">
                <div className="w-48 h-36 bg-gray-900 rounded-lg overflow-hidden mx-auto">
                  <video 
                    ref={localVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {callState.isMuted && (
                    <div className="absolute bottom-2 right-2 bg-red-500 rounded p-1">
                      <MicOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary" className="text-xs bg-black/50 text-white">
                    Your video
                  </Badge>
                </div>
              </div>
            )}

            {/* Recipient Avatar with Ringing Animation */}
            <div className="relative">
              {/* Ringing waves - only show when actually ringing */}
              {connectionStatus === 'ringing' && [0, 1, 2].map((index) => (
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
              
              {/* Connection failed indication */}
              {connectionStatus === 'failed' && (
                <div className="absolute inset-0 rounded-full border-2 border-destructive/50 animate-pulse"
                     style={{ padding: '20px' }} />
              )}
              
              <Avatar className={cn(
                "w-32 h-32 mx-auto ring-4 shadow-elegant transition-all duration-300",
                connectionStatus === 'failed' 
                  ? "ring-destructive/20 grayscale" 
                  : "ring-primary/20"
              )}>
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback className={cn(
                  "text-3xl font-semibold",
                  connectionStatus === 'failed' 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-primary/10 text-primary"
                )}>
                  {getInitials(recipientName)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Call Info */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">
                {recipientName}
              </h2>
              <p className={cn(
                "text-muted-foreground",
                connectionStatus === 'failed' && "text-destructive"
              )}>
                {connectionStatus === 'failed' 
                  ? 'No answer - please try again' 
                  : callType === 'video' 
                    ? 'Starting video call...' 
                    : 'Calling...'
                }
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {getConnectionIcon()}
                <span className={connectionStatus === 'failed' ? 'text-destructive' : ''}>
                  {getConnectionStatusText()}
                </span>
              </div>
            </div>

            {/* Connection Status Card */}
            <Card className={cn(
              "border-muted transition-all duration-300",
              connectionStatus === 'failed' 
                ? "bg-destructive/5 border-destructive/20" 
                : "bg-muted/30"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-3">
                  {connectionStatus !== 'failed' ? (
                    <>
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
                        {callType === 'video' ? 'Connecting video & audio...' : 'Connecting audio...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        Connection timed out
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Retry button for failed calls */}
            {connectionStatus === 'failed' && (
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Try Again
              </Button>
            )}
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
              disabled={connectionStatus === 'failed'}
            >
              {callState.isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Video Toggle (for video calls) */}
            {callType === 'video' && (
              <Button
                variant={!callState.isVideoEnabled ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                disabled={connectionStatus === 'failed'}
              >
                {callState.isVideoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Switch to Video (for voice calls) */}
            {callType === 'voice' && onSwitchToVideo && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleSwitchToVideo}
                className="h-12 w-12 rounded-full bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                disabled={connectionStatus === 'failed'}
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
                disabled={connectionStatus === 'failed'}
              >
                <Users className="h-5 w-5" />
              </Button>
            )}

            {/* Cancel Call */}
            <Button
              variant="destructive"
              size="lg"
              onClick={handleCancel}
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Action Labels */}
          <div className="flex items-center justify-center gap-8 mt-4 text-xs text-muted-foreground">
            <span>Mute</span>
            {callType === 'video' && <span>Video</span>}
            {callType === 'voice' && onSwitchToVideo && <span>Switch to Video</span>}
            {onAddParticipant && <span>Add</span>}
            <span>Cancel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
