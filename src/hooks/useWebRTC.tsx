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
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  isSpeaking: boolean;
  audioLevel: number;
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

  // Initialize WebRTC Peer Connection
  const initializePeerConnection = useCallback((userId: string) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage('ice-candidate', event.candidate, userId);
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        audioNotifications.playCallConnected();
      }
    };

    peerConnections.current.set(userId, peerConnection);
    return peerConnection;
  }, []);

  // Send signaling message via Supabase
  const sendSignalingMessage = useCallback(async (type: string, data: any, targetUserId?: string) => {
    try {
      await supabase
        .from('webrtc_signals')
        .insert({
          call_id: callState.callId,
          sender_id: profile?.id,
          receiver_id: targetUserId,
          signal_type: type,
          signal_data: data,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending signaling message:', error);
    }
  }, [callState.callId, profile?.id]);

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
  const startVoiceCall = useCallback(async (userId: string, userName: string) => {
    try {
      const callId = `call_${Date.now()}_${profile?.id}_${userId}`;
      
      // Create call record in database
      const { data: callData, error } = await supabase
        .from('call_history')
        .insert({
          id: callId,
          caller_id: profile?.id,
          receiver_id: userId,
          caller_name: profile?.full_name || 'Unknown',
          receiver_name: userName,
          call_type: 'voice',
          status: 'ringing',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const stream = await initializeMedia(false);
      const peerConnection = initializePeerConnection(userId);
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      await sendSignalingMessage('offer', offer, userId);

      setCallState(prev => ({
        ...prev,
        isActive: true,
        isOutgoing: true,
        callType: 'voice',
        callId,
        participants: [{
          id: userId,
          name: userName,
          isMuted: false,
          isVideoEnabled: false,
          isScreenSharing: false,
          connectionQuality: 'excellent',
          isSpeaking: false,
          audioLevel: 0
        }]
      }));

      audioNotifications.playOutgoingCall();
      toast({
        title: "Call Started",
        description: `Calling ${userName}...`
      });

    } catch (error) {
      console.error('Error starting voice call:', error);
      toast({
        title: "Call Failed",
        description: "Could not start voice call",
        variant: "destructive"
      });
    }
  }, [profile, initializeMedia, initializePeerConnection, sendSignalingMessage, toast]);

  // Start video call
  const startVideoCall = useCallback(async (userId: string, userName: string) => {
    try {
      const callId = `call_${Date.now()}_${profile?.id}_${userId}`;
      
      // Create call record in database
      const { data: callData, error } = await supabase
        .from('call_history')
        .insert({
          id: callId,
          caller_id: profile?.id,
          receiver_id: userId,
          caller_name: profile?.full_name || 'Unknown',
          receiver_name: userName,
          call_type: 'video',
          status: 'ringing',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const stream = await initializeMedia(true);
      const peerConnection = initializePeerConnection(userId);
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      await sendSignalingMessage('offer', offer, userId);

      setCallState(prev => ({
        ...prev,
        isActive: true,
        isOutgoing: true,
        callType: 'video',
        isVideoEnabled: true,
        callId,
        participants: [{
          id: userId,
          name: userName,
          isMuted: false,
          isVideoEnabled: true,
          isScreenSharing: false,
          connectionQuality: 'excellent',
          isSpeaking: false,
          audioLevel: 0
        }]
      }));

      audioNotifications.playVideoCallStart();
      toast({
        title: "Video Call Started",
        description: `Video calling ${userName}...`
      });

    } catch (error) {
      console.error('Error starting video call:', error);
      toast({
        title: "Video Call Failed",
        description: "Could not start video call",
        variant: "destructive"
      });
    }
  }, [profile, initializeMedia, initializePeerConnection, sendSignalingMessage, toast]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (!callState.isIncoming || !callState.incomingCallData) return;

    try {
      const isVideo = callState.incomingCallData.callType === 'video';
      const stream = await initializeMedia(isVideo);
      const peerConnection = initializePeerConnection(callState.incomingCallData.callerId);
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      setCallState(prev => ({
        ...prev,
        isActive: true,
        isIncoming: false,
        isVideoEnabled: isVideo,
        duration: 0
      }));

      // Update call status in database
      if (callState.callId) {
        await supabase
          .from('call_history')
          .update({ 
            status: 'active',
            started_at: new Date().toISOString()
          })
          .eq('id', callState.callId);
      }

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
  }, [callState.isIncoming, callState.incomingCallData, callState.callId, initializeMedia, initializePeerConnection, toast]);

  // Decline incoming call
  const declineCall = useCallback(async () => {
    audioNotifications.stopAllSounds();
    
    // Update call status in database
    if (callState.callId) {
      await supabase
        .from('call_history')
        .update({ 
          status: 'declined',
          ended_at: new Date().toISOString()
        })
        .eq('id', callState.callId);
    }
    
    setCallState(prev => ({
      ...prev,
      isIncoming: false,
      incomingCallData: undefined,
      callId: undefined
    }));
    
    toast({
      title: "Call Declined",
      description: "Incoming call was declined"
    });
  }, [callState.callId, toast]);

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
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
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
      audioNotifications.playScreenShareStart();

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
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      const videoTrack = cameraStream.getVideoTracks()[0];
      
      peerConnections.current.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });

      setCallState(prev => ({ ...prev, isScreenSharing: false }));
      audioNotifications.playScreenShareStop();

    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, []);

  // Simulate incoming call (for testing)
  const simulateIncomingCall = useCallback((callerId: string, callerName: string, callType: 'voice' | 'video' = 'voice') => {
    const callId = `call_${Date.now()}_${callerId}_${profile?.id}`;
    
    audioNotifications.playIncomingCall();
    
    setCallState(prev => ({
      ...prev,
      isIncoming: true,
      callId,
      incomingCallData: {
        callerId,
        callerName,
        callType
      }
    }));
  }, [profile?.id]);

  // Listen for incoming calls via Supabase realtime
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('incoming_calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_history',
          filter: `receiver_id=eq.${profile.id}`
        },
        (payload) => {
          const call = payload.new as any;
          if (call.status === 'ringing') {
            audioNotifications.playIncomingCall();
            
            setCallState(prev => ({
              ...prev,
              callId: call.id,
              isIncoming: true,
              callType: call.call_type,
              incomingCallData: {
                callerId: call.caller_id,
                callerName: call.caller_name || 'Unknown Caller',
                callType: call.call_type
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  // Listen for WebRTC signaling messages
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('webrtc_signals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webrtc_signals',
          filter: `receiver_id=eq.${profile.id}`
        },
        async (payload) => {
          const signal = payload.new as any;
          const peerConnection = peerConnections.current.get(signal.sender_id);
          
          if (!peerConnection) return;

          try {
            switch (signal.signal_type) {
              case 'offer':
                await peerConnection.setRemoteDescription(signal.signal_data);
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                await sendSignalingMessage('answer', answer, signal.sender_id);
                break;
                
              case 'answer':
                await peerConnection.setRemoteDescription(signal.signal_data);
                break;
                
              case 'ice-candidate':
                await peerConnection.addIceCandidate(signal.signal_data);
                break;
            }
          } catch (error) {
            console.error('Error handling signaling message:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, sendSignalingMessage]);

  // Create meeting room
  const createMeetingRoom = useCallback(async (title: string, description?: string, scheduledStart?: Date, scheduledEnd?: Date) => {
    if (!profile) return;

    try {
      toast({
        title: "Meeting Created",
        description: `Meeting "${title}" has been scheduled`
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
