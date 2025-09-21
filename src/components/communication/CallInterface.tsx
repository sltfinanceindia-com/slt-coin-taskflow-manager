import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Users,
  Settings,
  MoreVertical,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebRTC } from '@/hooks/useWebRTC';

interface CallInterfaceProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized?: boolean;
}

export default function CallInterface({ onMinimize, onMaximize, isMinimized }: CallInterfaceProps) {
  const {
    callState,
    localStream,
    remoteStreams,
    localVideoRef,
    endCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  } = useWebRTC();

  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!callState.isActive) {
    return null;
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64 bg-card/95 backdrop-blur border shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {callState.participants[0] ? getInitials(callState.participants[0].name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {callState.participants[0]?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(callState.duration)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={toggleMute} className="h-6 w-6 p-0">
                  {callState.isMuted ? (
                    <MicOff className="h-3 w-3 text-red-500" />
                  ) : (
                    <Mic className="h-3 w-3" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={onMaximize} className="h-6 w-6 p-0">
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button variant="destructive" size="sm" onClick={endCall} className="h-6 w-6 p-0">
                  <PhoneOff className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 bg-card/95 backdrop-blur border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={callState.callType === 'video' ? 'default' : 'secondary'}>
                {callState.callType === 'video' ? (
                  <Video className="h-3 w-3 mr-1" />
                ) : (
                  <Phone className="h-3 w-3 mr-1" />
                )}
                {callState.callType} call
              </Badge>
              
              <div className="text-sm text-muted-foreground">
                {formatDuration(callState.duration)}
              </div>
              
              {callState.participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{callState.participants.length + 1} participants</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)}>
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onMinimize}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900">
          {callState.callType === 'video' || callState.isScreenSharing ? (
            <div className="h-full flex">
              {/* Main Video */}
              <div className="flex-1 relative">
                {callState.isScreenSharing ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <Monitor className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">Screen Sharing Active</p>
                      <p className="text-sm text-gray-300">You are sharing your screen</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    {callState.participants.length > 0 ? (
                      <div className="text-center text-white">
                        <Avatar className="h-24 w-24 mx-auto mb-4">
                          <AvatarFallback className="text-2xl bg-primary">
                            {getInitials(callState.participants[0].name)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold">{callState.participants[0].name}</h3>
                        <p className="text-gray-300">
                          {callState.participants[0].isVideoEnabled ? 'Video enabled' : 'Video disabled'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg">Connecting...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Local Video Preview */}
                {callState.isVideoEnabled && !callState.isScreenSharing && (
                  <div className="absolute bottom-4 right-4 w-48 h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                      You
                    </div>
                  </div>
                )}
              </div>

              {/* Participants Sidebar */}
              {showParticipants && (
                <div className="w-80 bg-card/95 backdrop-blur border-l">
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Participants ({callState.participants.length + 1})</h3>
                    
                    {/* Current User */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">You</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">You</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {callState.isMuted ? (
                            <MicOff className="h-3 w-3 text-red-500" />
                          ) : (
                            <Mic className="h-3 w-3 text-green-500" />
                          )}
                          {callState.isVideoEnabled ? (
                            <Video className="h-3 w-3 text-green-500" />
                          ) : (
                            <VideoOff className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Other Participants */}
                    {callState.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(participant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{participant.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {participant.isMuted ? (
                              <MicOff className="h-3 w-3 text-red-500" />
                            ) : (
                              <Mic className="h-3 w-3 text-green-500" />
                            )}
                            {participant.isVideoEnabled ? (
                              <Video className="h-3 w-3 text-green-500" />
                            ) : (
                              <VideoOff className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Audio Call Interface */
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white">
                {callState.participants.length > 0 ? (
                  <>
                    <Avatar className="h-32 w-32 mx-auto mb-6">
                      <AvatarImage src={callState.participants[0].avatar} />
                      <AvatarFallback className="text-4xl bg-primary">
                        {getInitials(callState.participants[0].name)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-semibold mb-2">{callState.participants[0].name}</h2>
                    <p className="text-gray-300 mb-6">Voice call • {formatDuration(callState.duration)}</p>
                  </>
                ) : (
                  <>
                    <Phone className="h-24 w-24 mx-auto mb-6 text-gray-400" />
                    <h2 className="text-2xl font-semibold mb-2">Connecting...</h2>
                    <p className="text-gray-300">Setting up your call</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-card/95 backdrop-blur border-t">
          <div className="flex items-center justify-center gap-4">
            {/* Mute */}
            <Button
              variant={callState.isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="h-12 w-12 rounded-full"
            >
              {callState.isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Video Toggle */}
            <Button
              variant={callState.isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="h-12 w-12 rounded-full"
            >
              {callState.isVideoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            {/* Screen Share */}
            <Button
              variant={callState.isScreenSharing ? "default" : "secondary"}
              size="lg"
              onClick={callState.isScreenSharing ? stopScreenShare : startScreenShare}
              className="h-12 w-12 rounded-full"
            >
              {callState.isScreenSharing ? (
                <MonitorOff className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </Button>

            {/* Speaker */}
            <Button
              variant={speakerEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={() => setSpeakerEnabled(!speakerEnabled)}
              className="h-12 w-12 rounded-full"
            >
              {speakerEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
