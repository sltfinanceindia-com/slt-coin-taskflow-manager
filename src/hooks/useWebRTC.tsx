import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { audioNotifications } from '@/utils/audioNotifications';

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  isOutgoing: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  participants: CallParticipant[];
  callType: 'voice' | 'video';
  duration: number;
  callId?: string;
  meetingId?: string;
  incomingCallData?: {
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    callType: 'voice' | 'video';
  };
}

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  stream?: MediaStream;
}

export interface MeetingRoom {
  id: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  participants: string[];
  max_participants: number;
  is_recording: boolean;
  meeting_url?: string;
}

export function useWebRTC() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isIncoming: false,
    isOutgoing: false,
    isMuted: false,
    isVideoEnabled: false,
    isScreenSharing: false,
    participants: [],
    callType: 'voice',
    duration: 0
  });

  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const callTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize media devices
  const initializeMedia = useCallback(async (video: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Media Access Error",
        description: "Could not access camera/microphone. Please check permissions.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Start voice call
  const startVoiceCall = useCallback(async (userId: string) => {
    try {
      // Check for microphone permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const stream = await initializeMedia(false);
      
      setCallState(prev => ({
        ...prev,
        isActive: true,
        isOutgoing: true,
        callType: 'voice',
        participants: [{
          id: userId,
          name: 'Calling...',
          isMuted: false,
          isVideoEnabled: false,
          isScreenSharing: false
        }]
      }));

      // Play outgoing call sound
      audioNotifications.playOutgoingCall();

      // Show success message
      toast({
        title: "Call Started",
        description: "Voice call initiated successfully"
      });

      // Start call timer
      const startTime = Date.now();
      callTimer.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);

    } catch (error) {
      console.error('Error starting voice call:', error);
      let errorMessage = "Could not start voice call";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = "Microphone access denied. Please allow microphone permission and try again.";
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        }
      }
      
      toast({
        title: "Call Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [profile, initializeMedia, toast]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (!callState.isIncoming) return;

    try {
      const isVideo = callState.incomingCallData?.callType === 'video';
      const stream = await initializeMedia(isVideo);
      
      setCallState(prev => ({
        ...prev,
        isActive: true,
        isIncoming: false,
        isVideoEnabled: isVideo,
        duration: 0
      }));

      // Play call connected sound
      audioNotifications.playCallConnected();

      // Start call timer
      const startTime = Date.now();
      callTimer.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);

    } catch (error) {
      console.error('Error answering call:', error);
      toast({
        title: "Call Failed",
        description: "Could not answer the call",
        variant: "destructive"
      });
    }
  }, [callState.isIncoming, callState.incomingCallData, initializeMedia, toast]);

  // Decline incoming call
  const declineCall = useCallback(() => {
    // Stop incoming call sound
    audioNotifications.stopAllSounds();
    
    setCallState(prev => ({
      ...prev,
      isIncoming: false,
      incomingCallData: undefined
    }));
    
    toast({
      title: "Call Declined",
      description: "Incoming call was declined"
    });
  }, [toast]);

  // Simulate incoming call (for demo purposes)
  const simulateIncomingCall = useCallback((callerId: string, callerName: string, callType: 'voice' | 'video' = 'voice') => {
    // Play incoming call sound
    audioNotifications.playIncomingCall();
    
    setCallState(prev => ({
      ...prev,
      isIncoming: true,
      incomingCallData: {
        callerId,
        callerName,
        callType
      }
    }));
  }, []);

  // Start video call
  const startVideoCall = useCallback(async (userId: string) => {
    try {
      // Check for camera and microphone permissions first
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const stream = await initializeMedia(true);
      
      setCallState(prev => ({
        ...prev,
        isActive: true,
        isOutgoing: true,
        callType: 'video',
        isVideoEnabled: true,
        participants: [{
          id: userId,
          name: 'Calling...',
          isMuted: false,
          isVideoEnabled: true,
          isScreenSharing: false
        }]
      }));

      // Play video call start sound
      audioNotifications.playVideoCallStart();

      // Show success message
      toast({
        title: "Video Call Started",
        description: "Video call initiated successfully"
      });

      // Start call timer
      const startTime = Date.now();
      callTimer.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);

    } catch (error) {
      console.error('Error starting video call:', error);
      let errorMessage = "Could not start video call";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = "Camera/microphone access denied. Please allow permissions and try again.";
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = "Camera or microphone not found. Please connect devices and try again.";
        }
      }
      
      toast({
        title: "Video Call Failed", 
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [profile, initializeMedia, toast]);

  // End call
  const endCall = useCallback(async () => {
    try {
      // Stop all streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Close all peer connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();

      // Clear remote streams
      setRemoteStreams(new Map());

      // Stop call timer
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }

      // Update call history
      if (callState.callId) {
        await supabase
          .from('call_history')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: callState.duration,
            status: 'completed'
          })
          .eq('id', callState.callId);
      }

      // Reset call state
      setCallState({
        isActive: false,
        isIncoming: false,
        isOutgoing: false,
        isMuted: false,
        isVideoEnabled: false,
        isScreenSharing: false,
        participants: [],
        callType: 'voice',
        duration: 0
      });

      // Play call ended sound
      audioNotifications.playCallEnded();

      toast({
        title: "Call Ended",
        description: `Call duration: ${Math.floor(callState.duration / 60)}:${(callState.duration % 60).toString().padStart(2, '0')}`
      });

    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, [localStream, callState.callId, callState.duration, toast]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const wasMuted = !audioTrack.enabled;
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
        
        // Play mute/unmute sound
        audioNotifications.playMuteToggle(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in existing peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      
      peerConnections.current.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });

      setCallState(prev => ({ ...prev, isScreenSharing: true }));
      
      // Play screen share start sound
      audioNotifications.playScreenShareStart();

      // Handle screen share end
      videoTrack.onended = () => {
        setCallState(prev => ({ ...prev, isScreenSharing: false }));
        audioNotifications.playScreenShareStop();
      };

    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        title: "Screen Share Failed",
        description: "Could not start screen sharing",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      const videoTrack = cameraStream.getVideoTracks()[0];
      
      // Replace screen share track with camera track
      peerConnections.current.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });

      setCallState(prev => ({ ...prev, isScreenSharing: false }));
      
      // Play screen share stop sound
      audioNotifications.playScreenShareStop();

    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, []);

  // Create meeting room
  const createMeetingRoom = useCallback(async (title: string, description?: string, scheduledStart?: Date, scheduledEnd?: Date) => {
    if (!profile) return;

    try {
      // Mock meeting rooms functionality for now
      toast({
        title: "Meeting Created",
        description: `Meeting "${title}" has been scheduled (demo mode)`
      });
      return { id: 'demo-meeting', title, description };
    } catch (error) {
      console.error('Error creating meeting room:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting room",
        variant: "destructive"
      });
    }
  }, [profile, toast]);

  // Mock functions for now until database migration is complete
  const joinMeetingRoom = useCallback(async (meetingId: string, withVideo: boolean = false) => {
    const stream = await initializeMedia(withVideo);
    setCallState(prev => ({
      ...prev,
      isActive: true,
      callType: withVideo ? 'video' : 'voice',
      isVideoEnabled: withVideo,
      meetingId,
      participants: []
    }));
  }, [initializeMedia]);

  const fetchMeetingRooms = useCallback(async () => {
    // Mock data for demo
    setMeetingRooms([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      peerConnections.current.forEach(pc => pc.close());
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, [localStream]);

  return {
    callState,
    meetingRooms,
    localStream,
    remoteStreams,
    localVideoRef,
    startVoiceCall,
    startVideoCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    createMeetingRoom,
    joinMeetingRoom,
    fetchMeetingRooms,
    simulateIncomingCall
  };
}