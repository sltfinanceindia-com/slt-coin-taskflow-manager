import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
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

  // Check WebRTC support and permissions
  const checkWebRTCSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('WebRTC is not supported in this browser');
      return false;
    }

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      toast.error('WebRTC requires HTTPS or localhost');
      return false;
    }

    return true;
  }, []);

  // Check media permissions
  const checkPermissions = useCallback(async () => {
    try {
      const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('Microphone permission:', permissions.state);
      
      if (permissions.state === 'denied') {
        toast.error('Microphone access denied. Please enable in browser settings.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('Permission check failed:', error);
      return true; // Continue anyway for browsers that don't support permissions query
    }
  }, []);

  // Initialize WebRTC Peer Connection
  const initializePeerConnection = useCallback((userId: string) => {
    if (peerConnections.current.has(userId)) {
      return peerConnections.current.get(userId)!;
    }

    console.log('Creating peer connection for:', userId);
    const peerConnection = new RTCPeerConnection(RTC_CONFIG);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', userId);
        sendSignalingMessage('ice-candidate', event.candidate, userId);
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log('Received remote stream from:', userId);
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
          toast.success('Call connected');
          break;
        case 'connecting':
          quality = 'good';
          break;
        case 'disconnected':
        case 'failed':
          quality = 'poor';
          toast.error('Connection lost');
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

  // Initialize media devices with better error handling
  const initializeMedia = useCallback(async (video: boolean = false, audio: boolean = true) => {
    try {
      console.log('=== Initializing Media ===');
      console.log('Video requested:', video);
      console.log('Audio requested:', audio);

      if (!checkWebRTCSupport()) {
        throw new Error('WebRTC not supported');
      }

      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Media permissions denied');
      }

      // Start with basic constraints
      const basicConstraints = {
        audio: audio ? true : false,
        video: video ? true : false
      };

      console.log('Requesting media with constraints:', basicConstraints);
      const stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      
      console.log('Media stream obtained:', stream);
      console.log('Audio tracks:', stream.getAudioTracks().length);
      console.log('Video tracks:', stream.getVideoTracks().length);

      setLocalStream(stream);
      
      if (localVideoRef.current && video) {
        localVideoRef.current.srcObject = stream;
      }

      // Start audio level monitoring for voice activity detection
      if (audio && stream.getAudioTracks().length > 0) {
        startAudioLevelMonitoring(stream);
      }

      return stream;
    } catch (error) {
      console.error('=== Media Access Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      
      let errorMessage = "Could not access camera/microphone";
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = "Camera/microphone access denied. Please allow permissions and refresh the page.";
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = "No camera or microphone found. Please connect devices and try again.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Camera/microphone is busy. Please close other applications and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, [checkWebRTCSupport, checkPermissions]);

  // Audio level monitoring for voice activity detection
  const startAudioLevelMonitoring = useCallback((stream: MediaStream) => {
    try {
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
    } catch (error) {
      console.error('Error setting up audio level monitoring:', error);
    }
  }, []);

  // Start voice call with comprehensive error handling
  const startVoiceCall = useCallback(async (userId: string, userName: string) => {
    try {
      console.log('=== Starting Voice Call ===');
      console.log('User ID:', userId);
      console.log('User Name:', userName);
      console.log('Current profile ID:', profile?.id);
      console.log('Profile:', profile?.full_name);

      const callId = `call_${Date.now()}_${profile?.id}_${userId}`;
      currentCallId.current = callId;
      console.log('Generated Call ID:', callId);
      
      // Create call record in database using profile IDs
      console.log('Creating call record...');
      const { error: callError } = await supabase
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
        });

      if (callError) {
        console.error('Database error:', callError);
        toast.error('Failed to create call record');
        return;
      }

      console.log('Call record created successfully');

      // Initialize media for voice call
      console.log('Requesting media access...');
      const stream = await initializeMedia(false, true);
      console.log('Media obtained successfully');

      // Initialize peer connection
      console.log('Creating peer connection...');
      const peerConnection = initializePeerConnection(userId);
      
      // Add stream to peer connection
      console.log('Adding tracks to peer connection...');
      stream.getTracks().forEach((track, index) => {
        console.log(`Adding track ${index}:`, track.kind, track.enabled);
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      console.log('Creating offer...');
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      await peerConnection.setLocalDescription(offer);
      console.log('Local description set');

      // Send offer via signaling
      console.log('Sending offer...');
      await sendSignalingMessage('offer', offer, userId);
      
      // Update call state
      setCallState(prev => ({
        ...prev,
        callId,
        isActive: true,
        isOutgoing: true,
        callType: 'voice',
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

      console.log('Call state updated');

      // Play outgoing call sound
      audioNotifications.playOutgoingCall();
      
      // Start call timer
      const startTime = Date.now();
      callTimer.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);

      toast.success(`Calling ${userName}...`);
      console.log('=== Voice call started successfully ===');

    } catch (error) {
      console.error('=== Voice Call Error ===');
      console.error('Error details:', error);
      
      // Clean up call record if it was created
      if (currentCallId.current) {
        await supabase
          .from('call_history')
          .update({ status: 'failed', ended_at: new Date().toISOString() })
          .eq('id', currentCallId.current);
        currentCallId.current = null;
      }
      
      toast.error(`Call failed: ${error.message}`);
    }
  }, [user?.id, profile?.full_name, initializeMedia, initializePeerConnection, sendSignalingMessage]);

  // Start video call
  const startVideoCall = useCallback(async (userId: string, userName: string) => {
    try {
      console.log('=== Starting Video Call ===');
      const callId = `call_${Date.now()}_${profile?.id}_${userId}`;
      currentCallId.current = callId;
      
      // Create call record in database using profile IDs
      const { error } = await supabase
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

      toast.success(`Video calling ${userName}...`);

    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error(`Video call failed: ${error.message}`);
    }
  }, [user?.id, profile?.full_name, initializeMedia, initializePeerConnection, sendSignalingMessage]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (!callState.isIncoming || !callState.incomingCallData) return;

    try {
      console.log('=== Answering Call ===');
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

      toast.success('Call answered');

    } catch (error) {
      console.error('Error answering call:', error);
      toast.error(`Failed to answer call: ${error.message}`);
    }
  }, [callState.isIncoming, callState.incomingCallData, callState.callId, initializeMedia, initializePeerConnection]);

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
    toast.success('Call declined');
  }, [callState.callId]);

  // End call with cleanup
  const endCall = useCallback(async () => {
    try {
      console.log('=== Ending Call ===');
      
      // Stop all streams
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind);
          track.stop();
        });
        setLocalStream(null);
      }

      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }

      // Close all peer connections
      peerConnections.current.forEach((pc, userId) => {
        console.log('Closing peer connection for:', userId);
        pc.close();
      });
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

      const formattedDuration = `${Math.floor(callState.duration / 60)}:${(callState.duration % 60).toString().padStart(2, '0')}`;
      toast.success(`Call ended (${formattedDuration})`);

      console.log('=== Call ended successfully ===');

    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Error ending call');
    }
  }, [localStream, screenStream, callState.callId, callState.duration]);

  // Toggle mute with audio feedback
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const isMuted = !audioTrack.enabled;
        
        setCallState(prev => ({ ...prev, isMuted }));
        audioNotifications.playMuteToggle(isMuted);
        
        toast.success(isMuted ? "Microphone muted" : "Microphone unmuted");
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const isVideoEnabled = videoTrack.enabled;
        
        setCallState(prev => ({ ...prev, isVideoEnabled }));
        toast.success(isVideoEnabled ? "Camera enabled" : "Camera disabled");
      }
    }
  }, [localStream]);

  // Toggle speaker (for voice calls)
  const toggleSpeaker = useCallback(() => {
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
    toast.success(callState.isSpeakerOn ? "Speaker disabled" : "Speaker enabled");
  }, [callState.isSpeakerOn]);

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

      toast.success("Screen sharing started");

    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error("Failed to start screen sharing");
    }
  }, []);

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
      toast.success("Screen sharing stopped");

    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, [screenStream, callState.callType, localStream]);

  // Toggle participants panel
  const toggleParticipants = useCallback(() => {
    setCallState(prev => ({ ...prev, showParticipants: !prev.showParticipants }));
  }, []);

  // Add participant (placeholder for group calls)
  const addParticipant = useCallback(() => {
    // Add a test participant
    const newParticipant: CallParticipant = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Test User ${callState.participants.length + 1}`,
      isMuted: false,
      isVideoEnabled: true,
      isScreenSharing: false,
      isSpeaking: false,
      connectionQuality: 'good',
      audioLevel: 0
    };

    setCallState(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));

    toast.success(`Added ${newParticipant.name} to call`);
  }, [callState.participants.length]);

  // Take snapshot
  const takeSnapshot = useCallback(() => {
    if (!localVideoRef.current || !callState.isVideoEnabled) {
      toast.error('Video not available for snapshot');
      return;
    }

    const canvas = document.createElement('canvas');
    const video = localVideoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `call-snapshot-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Snapshot saved');
        }
      }, 'image/png');
    }
  }, [callState.isVideoEnabled]);

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

    toast.info(`Incoming ${callType} call from ${callerName}`);
  }, [user?.id]);

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
  }, [profile?.id, sendSignalingMessage, initializePeerConnection]);

  // Meeting room functions (simplified for now)
  const createMeetingRoom = useCallback(async (title: string, description?: string) => {
    toast.success(`Meeting "${title}" scheduled`);
    return { id: 'demo-meeting', title, description };
  }, []);

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

  // Check WebRTC support on mount
  useEffect(() => {
    checkWebRTCSupport();
  }, [checkWebRTCSupport]);

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
