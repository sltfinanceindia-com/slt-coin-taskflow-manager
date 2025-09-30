import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Volume2,
  VolumeX,
  UserPlus,
  Monitor,
  Camera,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  hasVideo: boolean;
  isSpeaking: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  stream?: MediaStream; // Added stream property
}

interface OngoingCallScreenProps {
  callType: 'voice' | 'video';
  participants: Participant[];
  duration: number;
  isMuted: boolean;
  hasVideo: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  showParticipants: boolean;
  localStream: MediaStream | null; // Added local stream
  remoteStreams: Map<string, MediaStream>; // Added remote streams
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onToggleScreenShare: () => void;
  onAddParticipant: () => void;
  onToggleParticipants: () => void;
  onEndCall: () => void;
  onTakeSnapshot?: () => void; // Added snapshot callback
  className?: string;
}

export default function OngoingCallScreen({
  callType,
  participants,
  duration,
  isMuted,
  hasVideo,
  isSpeakerOn,
  isScreenSharing,
  showParticipants,
  localStream,
  remoteStreams,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onToggleScreenShare,
  onAddParticipant,
  onToggleParticipants,
  onEndCall,
  onTakeSnapshot,
  className
}: OngoingCallScreenProps) {
  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream && callType === 'video') {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(console.error);
    }
  }, [localStream, callType]);

  // Set up remote video streams
  useEffect(() => {
    remoteStreams.forEach((stream, participantId) => {
      const videoElement = remoteVideoRefs.current.get(participantId);
      if (videoElement && callType === 'video') {
        videoElement.srcObject = stream;
        videoElement.play().catch(console.error);
      }
    });
  }, [remoteStreams, callType]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  // Register video element refs for remote streams
  const setRemoteVideoRef = useCallback((participantId: string, element: HTMLVideoElement | null) => {
    if (element) {
      remoteVideoRefs.current.set(participantId, element);
    } else {
      remoteVideoRefs.current.delete(participantId);
    }
  }, []);

  // Take snapshot function
  const handleTakeSnapshot = useCallback(() => {
    if (callType === 'video' && localVideoRef.current) {
      const canvas = document.createElement('canvas');
      const video = localVideoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `call-snapshot-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      }
    }
    
    onTakeSnapshot?.();
  }, [callType, onTakeSnapshot]);

  const renderVoiceCallView = () => (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
      {participants.length === 1 ? (
        // 1:1 Voice Call
        <div className="text-center space-y-6">
          <div className="relative">
            <Avatar className="w-32 h-32 ring-4 ring-primary/20">
              <AvatarImage src={participants[0].avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {getInitials(participants[0].name)}
              </AvatarFallback>
            </Avatar>
            {participants[0].isSpeaking && (
              <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-green-500 animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{participants[0].name}</h2>
            <p className="text-muted-foreground">Voice Call</p>
          </div>
        </div>
      ) : (
        // Group Voice Call
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {participants.map((participant) => (
            <div key={participant.id} className="text-center space-y-3">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
                {participant.isSpeaking && (
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-green-500 animate-pulse" />
                )}
                {participant.isMuted && (
                  <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                    <MicOff className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium truncate">{participant.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVideoCallView = () => (
    <div className="flex-1 relative">
      {participants.length === 1 ? (
        // 1:1 Video Call
        <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
          {/* Remote participant video */}
          <video 
            ref={(el) => setRemoteVideoRef(participants[0].id, el)}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={false} // Remote audio should not be muted [web:79]
          />
          
          {/* Participant info overlay */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {participants[0].name}
            </Badge>
            {participants[0].isMuted && (
              <div className="bg-red-500 rounded p-1">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
            {getQualityIcon(participants[0].connectionQuality)}
          </div>
          
          {/* Local video (picture-in-picture) */}
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
            <video 
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted // Local video should always be muted to prevent feedback [web:75]
            />
            {isMuted && (
              <div className="absolute bottom-1 right-1 bg-red-500 rounded p-1">
                <MicOff className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
        </div>
      ) : (
        // Group Video Call - Grid Layout
        <div className={cn(
          "grid gap-2 h-full",
          participants.length <= 2 && "grid-cols-1 md:grid-cols-2",
          participants.length <= 4 && participants.length > 2 && "grid-cols-2",
          participants.length > 4 && "grid-cols-2 md:grid-cols-3"
        )}>
          {participants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video 
                ref={(el) => setRemoteVideoRef(participant.id, el)}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={false}
              />
              <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                  {participant.name}
                </Badge>
                {participant.isMuted && (
                  <div className="bg-red-500 rounded p-1">
                    <MicOff className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2">
                {getQualityIcon(participant.connectionQuality)}
              </div>
            </div>
          ))}
          
          {/* Local video in grid */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden border-2 border-primary/20">
            <video 
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                You
              </Badge>
            </div>
            {isMuted && (
              <div className="absolute bottom-2 right-2 bg-red-500 rounded p-1">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("fixed inset-0 bg-background z-50 flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-lg font-semibold">
              {participants.length === 1 ? participants[0].name : `Group Call (${participants.length + 1})`}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{formatDuration(duration)}</span>
              <span>•</span>
              {getQualityIcon(networkQuality)}
              <span className="capitalize">{callType} call</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {participants.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleParticipants}
              className={cn(
                "text-muted-foreground hover:text-foreground",
                showParticipants && "text-primary"
              )}
            >
              <Users className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Call Content */}
      <div className="flex-1 flex">
        {/* Main Call Area */}
        <div className="flex-1 p-4">
          {callType === 'video' ? renderVideoCallView() : renderVoiceCallView()}
        </div>

        {/* Participants Sidebar */}
        {showParticipants && participants.length > 1 && (
          <div className="w-80 border-l border-border p-4 space-y-4">
            <h3 className="font-semibold">Participants ({participants.length + 1})</h3>
            <div className="space-y-3">
              {/* You (local user) */}
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-primary/5">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">You</p>
                  <div className="flex items-center space-x-2">
                    {isMuted ? (
                      <MicOff className="h-3 w-3 text-red-500" />
                    ) : (
                      <Mic className="h-3 w-3 text-green-500" />
                    )}
                    {callType === 'video' && (
                      hasVideo ? (
                        <Video className="h-3 w-3 text-green-500" />
                      ) : (
                        <VideoOff className="h-3 w-3 text-red-500" />
                      )
                    )}
                    {getQualityIcon(networkQuality)}
                  </div>
                </div>
              </div>
              
              {/* Other participants */}
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{participant.name}</p>
                    <div className="flex items-center space-x-2">
                      {participant.isMuted ? (
                        <MicOff className="h-3 w-3 text-red-500" />
                      ) : (
                        <Mic className="h-3 w-3 text-green-500" />
                      )}
                      {callType === 'video' && (
                        participant.hasVideo ? (
                          <Video className="h-3 w-3 text-green-500" />
                        ) : (
                          <VideoOff className="h-3 w-3 text-red-500" />
                        )
                      )}
                      {getQualityIcon(participant.connectionQuality)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="flex items-center justify-center p-6 border-t border-border bg-background/50 backdrop-blur">
        <div className="flex items-center space-x-4">
          {/* Mute/Unmute */}
          <Button
            variant={isMuted ? "default" : "outline"}
            size="lg"
            onClick={onToggleMute}
            className={cn(
              "w-12 h-12 rounded-full",
              isMuted && "bg-red-500 hover:bg-red-600 text-white border-red-500"
            )}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Video Toggle (for video calls) */}
          {callType === 'video' && (
            <Button
              variant={!hasVideo ? "default" : "outline"}
              size="lg"
              onClick={onToggleVideo}
              className={cn(
                "w-12 h-12 rounded-full",
                !hasVideo && "bg-red-500 hover:bg-red-600 text-white border-red-500"
              )}
            >
              {hasVideo ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          )}

          {/* Speaker Toggle (for voice calls) */}
          {callType === 'voice' && (
            <Button
              variant="outline"
              size="lg"
              onClick={onToggleSpeaker}
              className="w-12 h-12 rounded-full"
            >
              {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          )}

          {/* Screen Share */}
          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={onToggleScreenShare}
            className={cn(
              "w-12 h-12 rounded-full",
              isScreenSharing && "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
            )}
          >
            <Monitor className="h-5 w-5" />
          </Button>

          {/* Add Participant */}
          <Button
            variant="outline"
            size="lg"
            onClick={onAddParticipant}
            className="w-12 h-12 rounded-full"
          >
            <UserPlus className="h-5 w-5" />
          </Button>

          {/* Take Snapshot (for video calls) */}
          {callType === 'video' && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleTakeSnapshot}
              className="w-12 h-12 rounded-full"
            >
              <Camera className="h-5 w-5" />
            </Button>
          )}

          {/* End Call */}
          <Button
            size="lg"
            onClick={onEndCall}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white border-red-500"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
