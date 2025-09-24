import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Monitor, 
  MonitorOff,
  Users,
  Volume2,
  VolumeX,
  Settings,
  Minimize2,
  Camera,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebRTC } from '@/hooks/useWebRTC';

interface ConnectedCallScreenProps {
  callType: 'voice' | 'video';
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    isVideoEnabled: boolean;
    isMuted: boolean;
  }>;
  duration: number;
  onEndCall: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

export default function ConnectedCallScreen({
  callType,
  participants,
  duration,
  onEndCall,
  onMinimize,
  isMinimized = false
}: ConnectedCallScreenProps) {
  const {
    callState,
    localVideoRef,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  } = useWebRTC();

  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [micActivity, setMicActivity] = useState(false);

  // Simulate mic activity for speaking animation
  useEffect(() => {
    if (!callState.isMuted) {
      const interval = setInterval(() => {
        setMicActivity(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState.isMuted]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 bg-card/95 backdrop-blur border shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participants[0]?.avatar} />
                    <AvatarFallback className="text-sm">
                      {participants[0] ? getInitials(participants[0].name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Speaking indicator */}
                  {!participants[0]?.isMuted && micActivity && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-success rounded-full animate-pulse flex items-center justify-center">
                      <div className="h-2 w-2 bg-success-foreground rounded-full" />
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium">
                    {participants[0]?.name || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="h-4 px-1 text-xs">
                      {callType}
                    </Badge>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0">
                  {callState.isMuted ? (
                    <MicOff className="h-3 w-3 text-destructive" />
                  ) : (
                    <Mic className="h-3 w-3 text-success" />
                  )}
                </Button>
                
                {callType === 'video' && (
                  <Button variant="ghost" size="sm" onClick={toggleVideo} className="h-8 w-8 p-0">
                    {callState.isVideoEnabled ? (
                      <Video className="h-3 w-3 text-success" />
                    ) : (
                      <VideoOff className="h-3 w-3 text-destructive" />
                    )}
                  </Button>
                )}
                
                <Button variant="destructive" size="sm" onClick={onEndCall} className="h-8 w-8 p-0">
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 bg-card/95 backdrop-blur border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant={callType === 'video' ? 'default' : 'secondary'} className="shadow-sm">
              {callType === 'video' ? (
                <Video className="h-3 w-3 mr-1" />
              ) : (
                <Mic className="h-3 w-3 mr-1" />
              )}
              {callType} call
            </Badge>
            
            <div className="text-sm font-medium">
              {formatDuration(duration)}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>Connected</span>
            </div>
            
            {participants.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{participants.length + 1} participants</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)}>
              <Users className="h-4 w-4" />
            </Button>
            {onMinimize && (
              <Button variant="ghost" size="sm" onClick={onMinimize}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex bg-gray-900">
          {/* Video/Audio Area */}
          <div className="flex-1 relative">
            {callType === 'video' ? (
              /* Video Call Interface */
              <>
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
                    {participants.length > 0 ? (
                      <div className="text-center text-white">
                        <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-white/20">
                          <AvatarImage src={participants[0].avatar} />
                          <AvatarFallback className="text-4xl bg-primary">
                            {getInitials(participants[0].name)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-2xl font-semibold mb-2">{participants[0].name}</h3>
                        <p className="text-gray-300 flex items-center justify-center gap-2">
                          {participants[0].isVideoEnabled ? (
                            <>
                              <Video className="h-4 w-4 text-success" />
                              Video enabled
                            </>
                          ) : (
                            <>
                              <VideoOff className="h-4 w-4 text-destructive" />
                              Video disabled
                            </>
                          )}
                        </p>
                        {/* Speaking indicator */}
                        {!participants[0].isMuted && micActivity && (
                          <div className="mt-4">
                            <div className="w-16 h-1 bg-success/30 rounded-full mx-auto overflow-hidden">
                              <div className="h-full bg-success rounded-full animate-pulse" style={{ width: '60%' }} />
                            </div>
                            <p className="text-xs text-success mt-2">Speaking...</p>
                          </div>
                        )}
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
                  <div className="absolute bottom-20 right-4 w-48 h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
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
                    {callState.isMuted && (
                      <div className="absolute top-2 right-2">
                        <MicOff className="h-4 w-4 text-destructive" />
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Audio Call Interface */
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-white">
                  {participants.length > 0 ? (
                    <>
                      <div className="relative">
                        <Avatar className="h-40 w-40 mx-auto mb-6 ring-4 ring-white/20">
                          <AvatarImage src={participants[0].avatar} />
                          <AvatarFallback className="text-5xl bg-primary">
                            {getInitials(participants[0].name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Voice activity indicator */}
                        {!participants[0].isMuted && micActivity && (
                          <>
                            <div className="absolute inset-0 rounded-full border-4 border-success/30 animate-ping" />
                            <div className="absolute inset-0 rounded-full border-2 border-success/50 animate-pulse" />
                          </>
                        )}
                      </div>
                      
                      <h2 className="text-3xl font-semibold mb-2">{participants[0].name}</h2>
                      <p className="text-gray-300 mb-2">Voice call • {formatDuration(duration)}</p>
                      
                      {/* Audio status */}
                      <div className="flex items-center justify-center gap-2 text-sm">
                        {participants[0].isMuted ? (
                          <>
                            <MicOff className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">Muted</span>
                          </>
                        ) : micActivity ? (
                          <>
                            <Mic className="h-4 w-4 text-success animate-pulse" />
                            <span className="text-success">Speaking</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">Listening</span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Mic className="h-24 w-24 mx-auto mb-6 text-gray-400" />
                      <h2 className="text-2xl font-semibold mb-2">Connecting...</h2>
                      <p className="text-gray-300">Setting up your call</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Participants Sidebar */}
          {showParticipants && participants.length > 0 && (
            <div className="w-80 bg-card/95 backdrop-blur border-l">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Participants ({participants.length + 1})</h3>
                
                {/* Current User */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">You</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">You</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {callState.isMuted ? (
                        <MicOff className="h-3 w-3 text-destructive" />
                      ) : (
                        <Mic className="h-3 w-3 text-success" />
                      )}
                      {callState.isVideoEnabled ? (
                        <Video className="h-3 w-3 text-success" />
                      ) : (
                        <VideoOff className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Other Participants */}
                {participants.map((participant) => (
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
                          <MicOff className="h-3 w-3 text-destructive" />
                        ) : (
                          <Mic className="h-3 w-3 text-success" />
                        )}
                        {participant.isVideoEnabled ? (
                          <Video className="h-3 w-3 text-success" />
                        ) : (
                          <VideoOff className="h-3 w-3 text-destructive" />
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

        {/* Controls */}
        <div className="p-6 bg-card/95 backdrop-blur border-t">
          <div className="flex items-center justify-center gap-4">
            {/* Mute */}
            <Button
              variant={callState.isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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
                variant={callState.isVideoEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {callState.isVideoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Screen Share */}
            <Button
              variant={callState.isScreenSharing ? "default" : "secondary"}
              size="lg"
              onClick={callState.isScreenSharing ? stopScreenShare : startScreenShare}
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              {speakerEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            {/* Snapshot (for video calls) */}
            {callType === 'video' && (
              <Button
                variant="outline"
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Camera className="h-5 w-5" />
              </Button>
            )}

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              onClick={onEndCall}
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Control Labels */}
          <div className="flex items-center justify-center gap-8 mt-3 text-xs text-muted-foreground">
            <span>Mute</span>
            {callType === 'video' && <span>Video</span>}
            <span>Share</span>
            <span>Speaker</span>
            {callType === 'video' && <span>Photo</span>}
            <span>End</span>
          </div>
        </div>
      </div>
    </div>
  );
}
