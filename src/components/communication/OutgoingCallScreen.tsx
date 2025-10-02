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
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from 'sonner';

interface OutgoingCallScreenProps {
  recipientName: string;
  recipientAvatar?: string;
  callType: 'voice' | 'video';
  onCancel: () => void;
  className?: string;
}

export default function OutgoingCallScreen({
  recipientName,
  recipientAvatar,
  callType,
  onCancel,
  className
}: OutgoingCallScreenProps) {
  const { 
    callState, 
    toggleMute, 
    toggleVideo, 
    endCall,
    localVideoRef
  } = useWebRTC();
  
  const [ringingWaves, setRingingWaves] = useState(0);
  const [callDuration, setCallDuration] = useState(0);

  // Debug: Log call state
  useEffect(() => {
    console.log('📞 OutgoingCallScreen - Call State:');
    console.log('  isOutgoing:', callState.isOutgoing);
    console.log('  isActive:', callState.isActive);
    console.log('  isMuted:', callState.isMuted);
    console.log('  isVideoEnabled:', callState.isVideoEnabled);
    console.log('  callType:', callState.callType);
  }, [callState]);

  // Ringing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRingingWaves(prev => (prev + 1) % 3);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Track call duration when call becomes active
  useEffect(() => {
    if (callState.isActive) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [callState.isActive]);

  // Handle call cancellation
  const handleCancel = async () => {
    console.log('🚫 Cancelling outgoing call');
    try {
      await endCall();
      onCancel();
      toast.info('Call cancelled');
    } catch (error) {
      console.error('Error cancelling call:', error);
      toast.error('Failed to cancel call');
    }
  };

  // Handle mute toggle
  const handleToggleMute = async () => {
    console.log('🎤 Toggling mute');
    try {
      await toggleMute();
      toast.success(callState.isMuted ? 'Unmuted' : 'Muted');
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error('Failed to toggle mute');
    }
  };

  // Handle video toggle
  const handleToggleVideo = async () => {
    console.log('📹 Toggling video');
    try {
      await toggleVideo();
      toast.success(callState.isVideoEnabled ? 'Video off' : 'Video on');
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Failed to toggle video');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatus = () => {
    if (callState.isActive) return 'connected';
    if (callState.isOutgoing) return 'ringing';
    return 'connecting';
  };

  const connectionStatus = getConnectionStatus();

  const getConnectionStatusText = () => {
    if (callState.isActive) return 'Connected';
    if (callState.isOutgoing) return 'Ringing...';
    return 'Connecting...';
  };

  const getConnectionIcon = () => {
    if (callState.isActive) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    if (callState.isOutgoing) {
      return <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />;
    }
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
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
                {callState.isActive && callDuration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(callDuration)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {callState.isMuted && (
                <Badge variant="secondary" className="text-xs">
                  <MicOff className="h-3 w-3 mr-1" />
                  Muted
                </Badge>
              )}
              {callType === 'video' && !callState.isVideoEnabled && (
                <Badge variant="secondary" className="text-xs">
                  <VideoOff className="h-3 w-3 mr-1" />
                  Camera off
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
                <div className="w-64 h-48 bg-gray-900 rounded-lg overflow-hidden mx-auto shadow-2xl">
                  <video 
                    ref={localVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {callState.isMuted && (
                    <div className="absolute bottom-2 right-2 bg-red-500 rounded p-2">
                      <MicOff className="h-4 w-4 text-white" />
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
              {/* Ringing waves - show when calling (not connected yet) */}
              {!callState.isActive && callState.isOutgoing && [0, 1, 2].map((index) => (
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
              
              {/* Connected pulse when active */}
              {callState.isActive && (
                <div className="absolute inset-0 rounded-full border-2 border-green-500/50 animate-pulse"
                     style={{ padding: '20px' }} />
              )}
              
              <Avatar className={cn(
                "w-32 h-32 mx-auto ring-4 shadow-elegant transition-all duration-300",
                callState.isActive 
                  ? "ring-green-500/20" 
                  : "ring-primary/20"
              )}>
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
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
                {callState.isActive 
                  ? `${callType} call in progress` 
                  : callType === 'video' 
                    ? 'Starting video call...' 
                    : 'Calling...'
                }
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {getConnectionIcon()}
                <span className={callState.isActive ? 'text-green-500' : ''}>
                  {getConnectionStatusText()}
                </span>
              </div>
            </div>

            {/* Connection Status Card */}
            <Card className="border-muted bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-3">
                  {!callState.isActive ? (
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
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">
                        Call connected • {formatDuration(callDuration)}
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-card/95 backdrop-blur border-t">
          <div className="flex items-center justify-center gap-6">
            {/* Mute Toggle */}
            <div className="text-center">
              <Button
                variant={callState.isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={handleToggleMute}
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {callState.isMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {callState.isMuted ? 'Unmute' : 'Mute'}
              </p>
            </div>

            {/* Video Toggle (for video calls) */}
            {callType === 'video' && (
              <div className="text-center">
                <Button
                  variant={!callState.isVideoEnabled ? "destructive" : "secondary"}
                  size="lg"
                  onClick={handleToggleVideo}
                  className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {callState.isVideoEnabled ? (
                    <Video className="h-6 w-6" />
                  ) : (
                    <VideoOff className="h-6 w-6" />
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {callState.isVideoEnabled ? 'Stop video' : 'Start video'}
                </p>
              </div>
            )}

            {/* End Call */}
            <div className="text-center">
              <Button
                variant="destructive"
                size="lg"
                onClick={handleCancel}
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">End call</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
