import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  MoreHorizontal,
  Users,
  MessageSquare,
  Monitor,
  Maximize,
  Minimize
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isLocal: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  isSpeaking: boolean;
  audioLevel: number;
}

interface CallInterfaceProps {
  callId: string;
  callType: 'voice' | 'video';
  participants: CallParticipant[];
  duration: number;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare?: () => void;
  onAddParticipant?: () => void;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

export default function CallInterface({
  callId,
  callType,
  participants,
  duration,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onAddParticipant,
  onOpenChat,
  onOpenSettings,
  className
}: CallInterfaceProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'speaker' | 'sidebar'>('grid');

  const localParticipant = participants.find(p => p.isLocal);
  const remoteParticipants = participants.filter(p => !p.isLocal);
  const speakingParticipant = participants.find(p => p.isSpeaking && !p.isLocal) || participants[0];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    if (isFullscreen) {
      document.addEventListener('mousemove', handleMouseMove);
      timeout = setTimeout(() => setShowControls(false), 3000);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionQualityColor = (quality: CallParticipant['connectionQuality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'fair': return 'text-orange-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const ParticipantVideo = ({ participant }: { participant: CallParticipant }) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
      {participant.isVideoEnabled ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <span className="text-white text-lg">Video Feed</span>
        </div>
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={participant.avatar} />
            <AvatarFallback className="text-2xl">
              {participant.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Participant Info Overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge 
            variant={participant.isLocal ? "default" : "secondary"}
            className="text-xs"
          >
            {participant.isLocal ? 'You' : participant.name}
          </Badge>
          {participant.isSpeaking && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!participant.isAudioEnabled && (
            <MicOff className="h-4 w-4 text-red-500" />
          )}
          {!participant.isVideoEnabled && callType === 'video' && (
            <VideoOff className="h-4 w-4 text-red-500" />
          )}
          {participant.isScreenSharing && (
            <Monitor className="h-4 w-4 text-blue-500" />
          )}
          <div className={cn("w-2 h-2 rounded-full", getConnectionQualityColor(participant.connectionQuality))} />
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn(
      "h-full flex flex-col bg-gray-900 text-white border-gray-700",
      isFullscreen && "fixed inset-0 z-50 rounded-none",
      className
    )}>
      {/* Header */}
      <CardHeader className={cn(
        "border-b border-gray-700 transition-all duration-300",
        isFullscreen && !showControls && "opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {callType === 'video' ? (
                <Video className="h-5 w-5 text-blue-500" />
              ) : (
                <Phone className="h-5 w-5 text-green-500" />
              )}
              <CardTitle className="text-lg">
                {callType === 'video' ? 'Video Call' : 'Voice Call'}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              {formatDuration(duration)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{participants.length} participants</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Video Grid */}
      <CardContent className="flex-1 p-4 overflow-hidden">
        {callType === 'video' ? (
          <div className={cn(
            "h-full grid gap-4",
            participants.length === 1 && "grid-cols-1",
            participants.length === 2 && "grid-cols-1 md:grid-cols-2",
            participants.length <= 4 && "grid-cols-1 md:grid-cols-2",
            participants.length > 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {participants.map(participant => (
              <ParticipantVideo key={participant.id} participant={participant} />
            ))}
          </div>
        ) : (
          // Voice call interface
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="flex justify-center -space-x-4">
                {participants.slice(0, 3).map((participant, index) => (
                  <Avatar 
                    key={participant.id} 
                    className={cn(
                      "h-24 w-24 border-4 border-gray-900",
                      participant.isSpeaking && "ring-4 ring-green-500"
                    )}
                    style={{ zIndex: participants.length - index }}
                  >
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="text-xl">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {participants.length === 2 
                    ? `Call with ${remoteParticipants[0]?.name || 'Unknown'}`
                    : `Group call (${participants.length} participants)`
                  }
                </h3>
                <p className="text-gray-400">{formatDuration(duration)}</p>
              </div>

              {/* Audio visualization */}
              <div className="flex justify-center items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 bg-green-500 rounded-full transition-all duration-150",
                      participants.some(p => p.isSpeaking) 
                        ? "animate-pulse"
                        : "opacity-30"
                    )}
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Controls */}
      <div className={cn(
        "p-4 border-t border-gray-700 bg-gray-800/50 transition-all duration-300",
        isFullscreen && !showControls && "opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <Button
            variant={localParticipant?.isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            className="h-12 w-12 rounded-full"
            onClick={onToggleAudio}
          >
            {localParticipant?.isAudioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <Button
              variant={localParticipant?.isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              className="h-12 w-12 rounded-full"
              onClick={onToggleVideo}
            >
              {localParticipant?.isVideoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Screen Share */}
          {callType === 'video' && onToggleScreenShare && (
            <Button
              variant={localParticipant?.isScreenSharing ? "default" : "secondary"}
              size="lg"
              className="h-12 w-12 rounded-full"
              onClick={onToggleScreenShare}
            >
              <Monitor className="h-5 w-5" />
            </Button>
          )}

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700"
            onClick={onEndCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>

          {/* Additional Controls */}
          <div className="flex items-center gap-2 ml-4">
            {onAddParticipant && (
              <Button variant="secondary" size="sm" onClick={onAddParticipant}>
                <Users className="h-4 w-4 mr-2" />
                Add
              </Button>
            )}
            
            {onOpenChat && (
              <Button variant="secondary" size="sm" onClick={onOpenChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
            )}
            
            {onOpenSettings && (
              <Button variant="secondary" size="sm" onClick={onOpenSettings}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}