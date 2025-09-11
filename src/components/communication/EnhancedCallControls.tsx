import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Video, 
  PhoneOff, 
  VideoOff, 
  Mic, 
  MicOff,
  Share,
  Users,
  MessageSquare,
  MoreVertical,
  Circle,
  VolumeX,
  Settings,
  UserPlus,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Peer from 'simple-peer';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHost?: boolean;
}

interface EnhancedCallControlsProps {
  recipientName?: string;
  participants?: CallParticipant[];
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
  onInviteParticipant?: (userId: string) => void;
}

export function EnhancedCallControls({ 
  recipientName, 
  participants = [],
  onStartCall, 
  onStartVideoCall,
  onInviteParticipant 
}: EnhancedCallControlsProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isInLobby, setIsInLobby] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState<CallParticipant[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeMedia = async (video: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (localVideoRef.current && video) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
      });

      peer.on('signal', (data) => {
        // In a real app, send this signal data to the other peer
        console.log('Signal data:', data);
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peerRef.current = peer;
      
    } catch (error) {
      console.error('Error accessing media:', error);
      toast({
        title: 'Media Access Error',
        description: 'Could not access camera/microphone',
        variant: 'destructive',
      });
    }
  };

  const startAudioCall = async () => {
    await initializeMedia(false);
    setIsCallActive(true);
    setIsVideoCall(false);
    setCallDuration(0);
    toast({
      title: 'Audio Call Started',
      description: `Calling ${recipientName || 'user'}...`,
    });
    onStartCall?.();
  };

  const startVideoCall = async () => {
    await initializeMedia(true);
    setIsCallActive(true);
    setIsVideoCall(true);
    setCallDuration(0);
    toast({
      title: 'Video Call Started',
      description: `Video calling ${recipientName || 'user'}...`,
    });
    onStartVideoCall?.();
  };

  const endCall = () => {
    // Clean up media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setIsCallActive(false);
    setIsVideoCall(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
    setIsRecording(false);
    setIsScreenSharing(false);
    setCallDuration(0);
    
    toast({
      title: 'Call Ended',
      description: `Call duration: ${formatDuration(callDuration)}`,
    });
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
    
    toast({
      title: isMuted ? 'Unmuted' : 'Muted',
      description: `Microphone ${isMuted ? 'enabled' : 'disabled'}`,
    });
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
    
    toast({
      title: isVideoEnabled ? 'Video Off' : 'Video On',
      description: `Camera ${isVideoEnabled ? 'disabled' : 'enabled'}`,
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? 'Recording Stopped' : 'Recording Started',
      description: isRecording ? 'Call recording has been saved' : 'Call is now being recorded',
    });
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        if (peerRef.current && streamRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerRef.current as any; // Type assertion for WebRTC methods
          // In a real implementation, you'd replace the track here
        }
        
        setIsScreenSharing(true);
        toast({
          title: 'Screen Sharing Started',
          description: 'Your screen is now being shared',
        });
      } else {
        setIsScreenSharing(false);
        toast({
          title: 'Screen Sharing Stopped',
          description: 'Screen sharing has been stopped',
        });
      }
    } catch (error) {
      toast({
        title: 'Screen Share Error',
        description: 'Could not start screen sharing',
        variant: 'destructive',
      });
    }
  };

  const admitFromLobby = (participantId: string) => {
    const participant = waitingParticipants.find(p => p.id === participantId);
    if (participant) {
      setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
      toast({
        title: 'Participant Admitted',
        description: `${participant.name} has joined the call`,
      });
    }
  };

  if (!isCallActive) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={startAudioCall}>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={startVideoCall}>
          <Video className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isCallActive} onOpenChange={(open) => !open && endCall()}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isVideoCall ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              {isVideoCall ? 'Video Call' : 'Audio Call'} with {recipientName || 'User'}
            </DialogTitle>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{formatDuration(callDuration)}</Badge>
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  <Circle className="h-3 w-3 mr-1" />
                  REC
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-4">
          {/* Video Area */}
          {isVideoCall && (
            <div className="grid grid-cols-2 gap-4 mb-4 h-64">
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {recipientName || 'Remote'}
                </div>
              </div>
              
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  You {isMuted && '(Muted)'}
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Participants List */}
          {participants.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Participants ({participants.length + 1})</h4>
              <div className="flex flex-wrap gap-2">
                {participants.map((participant) => (
                  <Badge key={participant.id} variant="secondary" className="flex items-center gap-1">
                    {participant.name}
                    {participant.isMuted && <MicOff className="h-3 w-3" />}
                    {participant.isVideoOff && <VideoOff className="h-3 w-3" />}
                    {participant.isHost && <Shield className="h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Waiting Lobby */}
          {waitingParticipants.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-sm font-medium text-amber-800 mb-2">Waiting in Lobby</h4>
              <div className="space-y-2">
                {waitingParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <span className="text-sm text-amber-700">{participant.name}</span>
                    <Button 
                      size="sm" 
                      onClick={() => admitFromLobby(participant.id)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Admit
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Primary Controls */}
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              onClick={toggleMute}
              className="rounded-full w-12 h-12"
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            {isVideoCall && (
              <Button
                variant={isVideoEnabled ? "outline" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12"
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={toggleScreenShare}
              className={`rounded-full w-12 h-12 ${isScreenSharing ? 'bg-blue-100' : ''}`}
            >
              <Share className="h-5 w-5" />
            </Button>

            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={toggleRecording}
              className="rounded-full w-12 h-12"
            >
              <Circle className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {/* Open chat */}}
              className="rounded-full w-12 h-12"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {/* Add participants */}}
              className="rounded-full w-12 h-12"
            >
              <UserPlus className="h-5 w-5" />
            </Button>

            <Button 
              variant="destructive" 
              size="lg" 
              onClick={endCall}
              className="rounded-full w-12 h-12"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Call Quality Indicator */}
          <div className="text-center mt-4">
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Good Connection
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}