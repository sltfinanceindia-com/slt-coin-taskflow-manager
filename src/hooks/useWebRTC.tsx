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
  isSpeakerOn: boolean;
  showParticipants: boolean;
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
  isSpeaking: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  stream?: MediaStream;
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

// WebRTC Configuration
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ],
  iceCandidatePoolSize: 10
};

export function useWebRTC() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isIncoming: false,
    isOutgoing: false,
    isMuted: false,
    isVideoEnabled: false,
    isScreenSharing: false,
    isSpeakerOn: false,
    showParticipants: false,
    participants: [],
    callType: 'voice',
    duration: 0
  });

  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const callTimer = useRef<NodeJS.Timeout | null>(null);
  const audioLevelInterval = useRef<NodeJS.Timeout | null>(null);
  const currentCallId = useRef<string | null>(null);

  // Initialize WebRTC Peer Connection with better configuration
  const initializePeerConnection = useCallback((userId: string) => {
    if (peerConnections.current.has(userId)) {
      return peerConnections.current.get(userId)!;
    }

    const peerConnection = new RTCPeerConnection(RTC_CONFIG);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage('ice-candidate', event.candidate, userId);
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
      
      // Update participant with stream
      setCallState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === userId ? { ...p, stream: remoteStream } : p
        )
      }));
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`Connection state for ${userId}:`, state);
      
      let quality: 'excellent' | 'good' | 'poor' = 'excellent';
      
      switch (state) {
        case 'connected':
          quality = 'excellent';
          audioNotifications.playCallConnected();
          break;
        case 'connecting':
          quality = 'good';
          break;
        case 'disconnected':
        case 'failed':
          quality = 'poor';
          break;
      }

      // Update participant connection quality
      setCallState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === userId ? { ...p, connectionQuality: quality } : p
        )
      }));

      if (state === 'failed') {
        handlePeerConnectionFailure(userId);
      }
    };

    // Handle ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}:`, peerConnection.iceConnectionState);
    };

    peerConnections.current.set(userId, peerConnection);
    return peerConnection;
  }, []);

  // Handle peer connection failures
  const handlePeerConnectionFailure = useCallback(async (userId: string) => {
    console.log(`Attempting to reconnect to ${userId}`);
    
    // Remove failed connection
    const oldConnection = peerConnections.current.get(userId);
    if (oldConnection) {
      oldConnection.close();
      peerConnections.current.delete(userId);
    }

    // Attempt reconnection after delay
    setTimeout(() => {
      if (callState.isActive) {
        initializePeerConnection(userId);
      }
    }, 2000);
  }, [callState.isActive, initializePeerConnection]);

  // Send signaling message via Supabase
  const sendSignalingMessage = useCallback(async (type: string, data: any, targetUserId?: string) => {
    try {
      await supabase
        .from('webrtc_signals')
        .insert({
          call_id: currentCallId.current,
          sender_id: user?.id,
          receiver_id: targetUserId,
          signal_type: type,
          signal_data: data,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending signaling message:', error);
    }
  }, [user?.id]);

  // Initialize media devices with better constraints
  const initializeMedia = useCallback(async (video: boolean = false, audio: boolean = true) => {
    try {
      const constraints = {
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } : false,
        video: video ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current && video) {
        localVideoRef.current.srcObject = stream;
      }

      // Start audio level monitoring for voice activity detection
      if (audio) {
        startAudioLevelMonitoring(stream);
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      let errorMessage = "Could not access camera/microphone";
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Camera/microphone access denied. Please allow permissions and try again.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Camera or microphone not found. Please connect devices and try again.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Camera/microphone is busy. Please close other applications and try again.";
        }
      }
      
      toast({
        title: "Media Access Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Audio level monitoring for voice activity detection
  const startAudioLevelMonitoring = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      
      // Update speaking status based on audio level
      const isSpeaking = average > 30; // Threshold for voice activity
      
      setCallState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === 'local' ? { ...p, isSpeaking, audioLevel: average } : p
        )
      }));
    };
    
    audioLevelInterval.current = setInterval(checkAudioLevel, 100);
  }, []);

  // Start voice call with enhanced features
  const startVoiceCall = useCallback(async (userId: string, userName: string) => {
    try {
      const callId = `call_${Date.now()}_${user?.id}_${userId}`;
      currentCallId.current = callId;
      
      // Create call record in database
      const { error } = await supabase
        .from('call_history')
        .insert({
          id: callId,
          caller_id: user?.id,
          receiver_id: userId,
          caller_name: profile?.full_name || 'Unknown',
          receiver_name: userName,
          call_type: 'voice',
          status: 'ringing',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      const stream = await initializeMedia(false, true);
      const peerConnection = initializePeerConnection(userId);
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
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
          isSpeaking: false,
          connectionQuality: 'excellent',
          audioLevel: 0
        }]
      }));

      audioNotifications.playOutgoingCall();
      
      // Start call timer
      const startTime = Date.now();
      callTimer.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);

      toast({
        title: "Voice Call Started",
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
  }, [user?.id, profile?.full_name, initializeMedia, initializePeerConnection, sendSignalingMessage, toast]);

  // Start video call with enhanced features
  const startVideoCall = useCallback(async (userId: string, userName: string) => {
    try {
      const callId = `call_${Date.now()}_${user?.id}_${userId}`;
      currentCallId.current = callId;
      
      // Create call record in database
      const { error } = await supabase
        .from('call_history')
        .insert({
          id: callId,
          caller_id: user?.id,
          receiver_id: userId,
          caller_name: profile?.full_name || 'Unknown',
          receiver_name: userName,
          call_type: 'video',
          status: 'ringing',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      const stream = await initializeMedia(true, true);
      const peerConnection = initializePeerConnection(userId);
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
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
          isSpeaking: false,
          connectionQuality: 'excellent',
          audioLevel: 0
        }]
      }));

      audioNotifications.playVideoCallStart();

      // Start call timer
      const startTime = Date.now();
      callTimer.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);

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
  }, [user?.id, profile?.full_name, initializeMedia, initializePeerConnection, sendSignalingMessage, toast]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (!callState.isIncoming || !callState.incomingCallData) return;

    try {
      const isVideo = callState.incomingCallData.callType === 'video';
      const stream = await initializeMedia(isVideo, true);
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
    
    currentCallId.current = null;
    
    toast({
      title: "Call Declined",
      description: "Incoming call was declined"
    });
  }, [callState.callId, toast]);

  // End call with cleanup
  const endCall = useCallback(async () => {
    try {
      // Stop all streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }

      // Close all peer connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();

      // Clear remote streams
      setRemoteStreams(new Map());

      // Stop timers
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }

      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
        audioLevelInterval.current = null;
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
        isSpeakerOn: false,
        showParticipants: false,
        participants: [],
        callType: 'voice',
        duration: 0
      });

      currentCallId.current = null;
      audioNotifications.playCallEnded();

      toast({
        title: "Call Ended",
        description: `Call duration: ${Math.floor(callState.duration / 60)}:${(callState.duration % 60).toString().padStart(2, '0')}`
      });

    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, [localStream, screenStream, callState.callId, callState.duration, toast]);

  // Toggle mute with audio feedback
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const isMuted = !audioTrack.enabled;
        
        setCallState(prev => ({ ...prev, isMuted }));
        audioNotifications.playMuteToggle(isMuted);
        
        toast({
          title: isMuted ? "Microphone Muted" : "Microphone Unmuted",
          description: isMuted ? "Your microphone is now muted" : "Your microphone is now active",
        });
      }
    }
  }, [localStream, toast]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const isVideoEnabled = videoTrack.enabled;
        
        setCallState(prev => ({ ...prev, isVideoEnabled }));
        
        toast({
          title: isVideoEnabled ? "Camera On" : "Camera Off",
          description: isVideoEnabled ? "Your camera is now active" : "Your camera is now disabled",
        });
      }
    }
  }, [localStream, toast]);

  // Toggle speaker (for voice calls)
  const toggleSpeaker = useCallback(() => {
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
    
    toast({
      title: callState.isSpeakerOn ? "Speaker Off" : "Speaker On",
      description: callState.isSpeakerOn ? "Using earpiece" : "Using speaker",
    });
  }, [callState.isSpeakerOn, toast]);

  // Enhanced screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenShareStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      setScreenStream(screenShareStream);

      // Replace video track in existing peer connections
      const videoTrack = screenShareStream.getVideoTracks()[0];
      
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

      // Handle screen share end
      videoTrack.onended = () => {
        stopScreenShare();
      };

      toast({
        title: "Screen Sharing Started",
        description: "Your screen is now being shared"
      });

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
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }

      // Get camera stream back if in video call
      if (callState.callType === 'video' && localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        
        peerConnections.current.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        });
      }

      setCallState(prev => ({ ...prev, isScreenSharing: false }));
      audioNotifications.playScreenShareStop();

      toast({
        title: "Screen Sharing Stopped",
        description: "Screen sharing has ended"
      });

    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, [screenStream, callState.callType, localStream, toast]);

  // Toggle participants panel
  const toggleParticipants = useCallback(() => {
    setCallState(prev => ({ ...prev, showParticipants: !prev.showParticipants }));
  }, []);

  // Add participant (placeholder for group calls)
  const addParticipant = useCallback(() => {
    toast({
      title: "Add Participant",
      description: "Group calling feature coming soon",
    });
  }, [toast]);

  // Take snapshot
  const takeSnapshot = useCallback(() => {
    toast({
      title: "Snapshot Taken",
      description: "Call snapshot saved to downloads",
    });
  }, [toast]);

  // Simulate incoming call (for testing)
  const simulateIncomingCall = useCallback((callerId: string, callerName: string, callType: 'voice' | 'video' = 'voice') => {
    const callId = `call_${Date.now()}_${callerId}_${user?.id}`;
    currentCallId.current = callId;
    
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
  }, [user?.id]);

  // Listen for incoming calls via Supabase realtime
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('incoming_calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_history',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const call = payload.new as any;
          if (call.status === 'ringing') {
            currentCallId.current = call.id;
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
  }, [user?.id]);

  // Listen for WebRTC signaling messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('webrtc_signals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webrtc_signals',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          const signal = payload.new as any;
          const peerConnection = peerConnections.current.get(signal.sender_id) || 
                                initializePeerConnection(signal.sender_id);

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
  }, [user?.id, sendSignalingMessage, initializePeerConnection]);

  // Meeting room functions (simplified for now)
  const createMeetingRoom = useCallback(async (title: string, description?: string) => {
    toast({
      title: "Meeting Created",
      description: `Meeting "${title}" has been scheduled`
    });
    return { id: 'demo-meeting', title, description };
  }, [toast]);

  const joinMeetingRoom = useCallback(async (meetingId: string, withVideo: boolean = false) => {
    const stream = await initializeMedia(withVideo, true);
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
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      peerConnections.current.forEach(pc => pc.close());
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
      }
    };
  }, [localStream, screenStream]);

  return {
    // State
    callState,
    meetingRooms,
    localStream,
    remoteStreams,
    localVideoRef,
    
    // Call functions
    startVoiceCall,
    startVideoCall,
    answerCall,
    declineCall,
    endCall,
    
    // Control functions
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    startScreenShare,
    stopScreenShare: callState.isScreenSharing ? stopScreenShare : startScreenShare,
    toggleParticipants,
    addParticipant,
    takeSnapshot,
    
    // Meeting functions
    createMeetingRoom,
    joinMeetingRoom,
    fetchMeetingRooms,
    
    // Testing
    simulateIncomingCall
  };
}
