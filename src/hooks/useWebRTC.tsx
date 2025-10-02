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

// WebRTC Configuration with multiple STUN servers for reliability
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
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
  const realtimeChannel = useRef<any>(null);
  const signalChannel = useRef<any>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // Check WebRTC support and permissions
  const checkWebRTCSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('WebRTC is not supported in this browser');
      return false;
    }

    if (!window.RTCPeerConnection) {
      toast.error('RTCPeerConnection is not supported');
      return false;
    }

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      toast.error('WebRTC requires HTTPS or localhost');
      return false;
    }

    return true;
  }, []);

  // Check media permissions
  const checkPermissions = useCallback(async (audio: boolean = true, video: boolean = false) => {
    try {
      if ('permissions' in navigator) {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log('Microphone permission:', micPermission.state);
        
        if (micPermission.state === 'denied') {
          toast.error('Microphone access denied. Please enable in browser settings.');
          return false;
        }

        if (video) {
          try {
            const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
            console.log('Camera permission:', cameraPermission.state);
            
            if (cameraPermission.state === 'denied') {
              toast.error('Camera access denied. Please enable in browser settings.');
              return false;
            }
          } catch (e) {
            // Camera permission query not supported on all browsers
            console.log('Camera permission query not supported');
          }
        }
      }
      
      return true;
    } catch (error) {
      console.log('Permission check not supported:', error);
      return true; // Continue anyway for browsers that don't support permissions query
    }
  }, []);

  // Initialize WebRTC Peer Connection with proper error handling
  const initializePeerConnection = useCallback((userId: string) => {
    // Check if connection already exists and is usable
    const existingConnection = peerConnections.current.get(userId);
    if (existingConnection && 
        existingConnection.connectionState !== 'failed' && 
        existingConnection.connectionState !== 'closed') {
      console.log('Reusing existing peer connection for:', userId);
      return existingConnection;
    }

    // Close existing connection if it's in a bad state
    if (existingConnection) {
      console.log('Closing existing connection in state:', existingConnection.connectionState);
      existingConnection.close();
      peerConnections.current.delete(userId);
    }

    console.log('Creating new peer connection for:', userId);
    const peerConnection = new RTCPeerConnection(RTC_CONFIG);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', userId);
        sendSignalingMessage('ice-candidate', event.candidate, userId).catch(err => {
          console.error('Failed to send ICE candidate:', err);
        });
      } else {
        console.log('All ICE candidates have been sent');
      }
    };

    // Handle ICE gathering state changes
    peerConnection.onicegatheringstatechange = () => {
      console.log(`ICE gathering state for ${userId}:`, peerConnection.iceGatheringState);
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log('Received remote stream from:', userId, 'tracks:', remoteStream.getTracks().length);
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, remoteStream);
        return newMap;
      });
      
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
          quality = 'poor';
          toast.warning('Connection interrupted');
          break;
        case 'failed':
          quality = 'poor';
          toast.error('Connection failed');
          handlePeerConnectionFailure(userId);
          break;
        case 'closed':
          console.log('Connection closed for:', userId);
          peerConnections.current.delete(userId);
          break;
      }

      // Update participant connection quality
      setCallState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === userId ? { ...p, connectionQuality: quality } : p
        )
      }));
    };

    // Handle ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}:`, peerConnection.iceConnectionState);
      
      if (peerConnection.iceConnectionState === 'failed') {
        console.log('ICE connection failed, attempting restart');
        peerConnection.restartIce();
      }
    };

    // Handle negotiation needed
    peerConnection.onnegotiationneeded = async () => {
      console.log('Negotiation needed for:', userId);
      // Only create offer if we're the caller
      if (callState.isOutgoing) {
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          await sendSignalingMessage('offer', offer, userId);
        } catch (error) {
          console.error('Error during negotiation:', error);
        }
      }
    };

    peerConnections.current.set(userId, peerConnection);
    return peerConnection;
  }, [callState.isOutgoing]);

  // Handle peer connection failures with retry logic
  const handlePeerConnectionFailure = useCallback(async (userId: string) => {
    console.log(`Handling connection failure for ${userId}`);
    
    // Remove failed connection
    const oldConnection = peerConnections.current.get(userId);
    if (oldConnection) {
      oldConnection.close();
      peerConnections.current.delete(userId);
    }

    // Clear pending candidates
    pendingCandidates.current.delete(userId);

    // Attempt reconnection after delay if call is still active
    setTimeout(() => {
      if (callState.isActive) {
        console.log(`Attempting to reconnect to ${userId}`);
        toast.info('Reconnecting...');
        const newConnection = initializePeerConnection(userId);
        
        // Re-add local stream if available
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            newConnection.addTrack(track, localStream);
          });
        }
      }
    }, 2000);
  }, [callState.isActive, localStream, initializePeerConnection]);

  // Send signaling message via Supabase with retry
  const sendSignalingMessage = useCallback(async (
    type: string, 
    data: any, 
    targetUserId?: string,
    retries = 3
  ) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`Sending signaling message (attempt ${attempt + 1}):`, type, 'to:', targetUserId);
        
        const { error } = await supabase
          .from('webrtc_signals')
          .insert({
            call_id: currentCallId.current,
            sender_id: profile?.id,
            receiver_id: targetUserId,
            signal_type: type,
            signal_data: data,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        
        console.log('Signaling message sent successfully');
        return;
      } catch (error) {
        console.error(`Error sending signaling message (attempt ${attempt + 1}):`, error);
        
        if (attempt === retries - 1) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }, [profile?.id]);

  // Initialize media devices with comprehensive error handling
  const initializeMedia = useCallback(async (video: boolean = false, audio: boolean = true) => {
    try {
      console.log('=== Initializing Media ===');
      console.log('Video requested:', video);
      console.log('Audio requested:', audio);

      if (!checkWebRTCSupport()) {
        throw new Error('WebRTC not supported');
      }

      const hasPermission = await checkPermissions(audio, video);
      if (!hasPermission) {
        throw new Error('Media permissions denied');
      }

      // Enhanced constraints for better quality
      const constraints: MediaStreamConstraints = {
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } : false,
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      console.log('Requesting media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Media stream obtained:', stream.id);
      console.log('Audio tracks:', stream.getAudioTracks().length);
      console.log('Video tracks:', stream.getVideoTracks().length);

      // Log track details
      stream.getTracks().forEach((track, index) => {
        console.log(`Track ${index}:`, {
          kind: track.kind,
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        });
      });

      setLocalStream(stream);
      
      if (localVideoRef.current && video) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Prevent echo
      }

      // Start audio level monitoring for voice activity detection
      if (audio && stream.getAudioTracks().length > 0) {
        startAudioLevelMonitoring(stream);
      }

      return stream;
    } catch (error: any) {
      console.error('=== Media Access Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      
      let errorMessage = "Could not access camera/microphone";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Camera/microphone access denied. Please allow permissions and refresh the page.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "No camera or microphone found. Please connect devices and try again.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = "Camera/microphone is busy. Please close other applications using them and try again.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = "Requested media constraints cannot be satisfied. Please try again with different settings.";
      } else if (error.name === 'TypeError') {
        errorMessage = "Invalid media constraints. Please check your browser settings.";
      } else {
        errorMessage = error.message || "Unknown media error occurred";
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, [checkWebRTCSupport, checkPermissions]);

  // Audio level monitoring for voice activity detection
  const startAudioLevelMonitoring = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        
        // Update speaking status based on audio level (threshold for voice activity)
        const isSpeaking = average > 30;
        
        setCallState(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.id === 'local' || p.id === profile?.id 
              ? { ...p, isSpeaking, audioLevel: average } 
              : p
          )
        }));
      };
      
      audioLevelInterval.current = setInterval(checkAudioLevel, 100);
    } catch (error) {
      console.error('Error setting up audio level monitoring:', error);
    }
  }, [profile?.id]);

  // Start voice call with comprehensive error handling and profile verification
const startVoiceCall = useCallback(async (userId: string, userName: string) => {
  try {
    console.log('=== Starting Voice Call ===');
    console.log('Target User ID:', userId);
    console.log('Target User Name:', userName);
    console.log('Caller Profile ID:', profile?.id);
    console.log('Caller Profile Name:', profile?.full_name);

    // ✅ Critical validation checks
    if (!profile?.id) {
      console.error('Profile not loaded');
      throw new Error('User profile not loaded. Please refresh the page.');
    }

    // ✅ Verify profile ID matches authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.error('Auth verification failed:', authError);
      throw new Error('Authentication failed. Please log in again.');
    }

    console.log('Auth User ID:', authUser.id);
    console.log('Profile ID:', profile.id);
    
    // ✅ Critical check: Profile ID must match Auth ID for RLS
    if (authUser.id !== profile.id) {
      console.error('❌ Profile ID mismatch!');
      console.error('Auth ID:', authUser.id);
      console.error('Profile ID:', profile.id);
      throw new Error('Profile authentication mismatch. Please log out and log back in.');
    }

    console.log('✅ Profile ID matches Auth ID');

    // ✅ Validate receiver ID
    if (!userId || userId === profile.id) {
      throw new Error('Invalid recipient for call');
    }

    const callId = `call_${Date.now()}_${profile.id}_${userId}`;
    currentCallId.current = callId;
    console.log('Generated Call ID:', callId);
    
    // ✅ Create call record in database with proper error handling
    console.log('Creating call record...');
    console.log('Insert data:', {
      id: callId,
      caller_id: profile.id,
      receiver_id: userId,
      caller_name: profile.full_name || 'Unknown',
      receiver_name: userName,
      call_type: 'voice',
      status: 'ringing'
    });

    const { data: callData, error: callError } = await supabase
      .from('call_history')
      .insert({
        id: callId,
        caller_id: profile.id,     // ✅ Must match auth.uid()
        receiver_id: userId,
        caller_name: profile.full_name || 'Unknown',
        receiver_name: userName,
        call_type: 'voice',
        status: 'ringing',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (callError) {
      console.error('❌ Database error:', callError);
      console.error('Error code:', callError.code);
      console.error('Error message:', callError.message);
      console.error('Error details:', callError.details);
      console.error('Error hint:', callError.hint);
      
      // ✅ Provide specific error messages based on error type
      if (callError.code === '42501') {
        throw new Error('Permission denied: Please check your account permissions.');
      } else if (callError.message?.includes('row-level security')) {
        throw new Error('Database security error: Unable to create call record. Please contact support.');
      } else {
        throw new Error(`Failed to create call record: ${callError.message}`);
      }
    }

    console.log('✅ Call record created successfully:', callData);

    // ✅ Initialize media for voice call
    console.log('Requesting media access...');
    let stream: MediaStream;
    
    try {
      stream = await initializeMedia(false, true);
      console.log('✅ Media obtained successfully, stream ID:', stream.id);
    } catch (mediaError: any) {
      console.error('❌ Media access error:', mediaError);
      
      // Clean up call record on media error
      await supabase
        .from('call_history')
        .update({ status: 'failed', ended_at: new Date().toISOString() })
        .eq('id', callId);
      
      throw new Error(`Media access failed: ${mediaError.message}`);
    }

    // ✅ Initialize peer connection
    console.log('Creating peer connection...');
    const peerConnection = initializePeerConnection(userId);
    
    if (!peerConnection) {
      throw new Error('Failed to create peer connection');
    }

    // ✅ Add stream to peer connection
    console.log('Adding tracks to peer connection...');
    stream.getTracks().forEach((track, index) => {
      console.log(`Adding track ${index}:`, track.kind, track.id, track.enabled);
      peerConnection.addTrack(track, stream);
    });

    // ✅ Create offer
    console.log('Creating offer...');
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false
    });
    
    console.log('✅ Offer created:', offer.type);
    await peerConnection.setLocalDescription(offer);
    console.log('✅ Local description set');

    // ✅ Send offer via signaling
    console.log('Sending offer to receiver...');
    try {
      await sendSignalingMessage('offer', offer, userId);
      console.log('✅ Offer sent successfully');
    } catch (signalError: any) {
      console.error('❌ Signaling error:', signalError);
      throw new Error(`Failed to send call signal: ${signalError.message}`);
    }
    
    // ✅ Update call state
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

    console.log('✅ Call state updated');

    // ✅ Play outgoing call sound
    try {
      audioNotifications.playOutgoingCall();
    } catch (audioError) {
      console.warn('Audio notification failed:', audioError);
    }
    
    // ✅ Start call timer
    const startTime = Date.now();
    callTimer.current = setInterval(() => {
      setCallState(prev => ({
        ...prev,
        duration: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);

    toast.success(`Calling ${userName}...`);
    console.log('=== Voice call started successfully ===');

  } catch (error: any) {
    console.error('=== Voice Call Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // ✅ Comprehensive cleanup on error
    try {
      // Clean up call record if it was created
      if (currentCallId.current) {
        console.log('Cleaning up call record:', currentCallId.current);
        await supabase
          .from('call_history')
          .update({ 
            status: 'failed', 
            ended_at: new Date().toISOString(),
            error_message: error.message 
          })
          .eq('id', currentCallId.current);
        currentCallId.current = null;
      }

      // Clean up media if acquired
      if (localStream) {
        console.log('Stopping local stream tracks');
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Reset call state
      setCallState(prev => ({
        ...prev,
        isActive: false,
        isOutgoing: false,
        participants: []
      }));
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    // ✅ User-friendly error messages
    let userMessage = 'Failed to start call';
    
    if (error.message?.includes('profile not loaded')) {
      userMessage = 'Your profile is not loaded. Please refresh the page.';
    } else if (error.message?.includes('permission') || error.message?.includes('denied')) {
      userMessage = 'Camera/microphone access denied. Please enable permissions in your browser settings.';
    } else if (error.message?.includes('not found')) {
      userMessage = 'No camera or microphone found. Please connect devices and try again.';
    } else if (error.message?.includes('busy') || error.message?.includes('readable')) {
      userMessage = 'Camera/microphone is busy. Please close other apps and try again.';
    } else if (error.message?.includes('security') || error.message?.includes('RLS')) {
      userMessage = 'Database security error. Please contact support.';
    } else if (error.message?.includes('authentication') || error.message?.includes('mismatch')) {
      userMessage = 'Authentication error. Please log out and log back in.';
    } else if (error.message) {
      userMessage = error.message;
    }
    
    toast.error(userMessage);
  }
}, [profile, initializeMedia, initializePeerConnection, sendSignalingMessage, localStream]);
  // Start video call
  const startVideoCall = useCallback(async (userId: string, userName: string) => {
    try {
      console.log('=== Starting Video Call ===');
      
      if (!profile?.id) {
        throw new Error('User profile not loaded');
      }

      const callId = `call_${Date.now()}_${profile.id}_${userId}`;
      currentCallId.current = callId;
      
      // Create call record in database
      const { data: callData, error } = await supabase
        .from('call_history')
        .insert({
          id: callId,
          caller_id: profile.id,
          receiver_id: userId,
          caller_name: profile.full_name || 'Unknown',
          receiver_name: userName,
          call_type: 'video',
          status: 'ringing',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create call record: ${error.message}`);

      console.log('Video call record created:', callData);

      const stream = await initializeMedia(true, true);
      const peerConnection = initializePeerConnection(userId);
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding video call track:', track.kind, track.id);
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
      console.log('=== Video call started successfully ===');

    } catch (error: any) {
      console.error('Error starting video call:', error);
      
      // Clean up
      if (currentCallId.current) {
        await supabase
          .from('call_history')
          .update({ status: 'failed', ended_at: new Date().toISOString() })
          .eq('id', currentCallId.current);
        currentCallId.current = null;
      }

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      toast.error(`Video call failed: ${error.message}`);
    }
  }, [profile, initializeMedia, initializePeerConnection, sendSignalingMessage, localStream]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (!callState.isIncoming || !callState.incomingCallData) {
      console.error('No incoming call to answer');
      return;
    }

    try {
      console.log('=== Answering Call ===');
      const isVideo = callState.incomingCallData.callType === 'video';
      
      // Initialize media
      const stream = await initializeMedia(isVideo, true);
      const peerConnection = initializePeerConnection(callState.incomingCallData.callerId);
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track to answer:', track.kind, track.id);
        peerConnection.addTrack(track, stream);
      });

      // Apply any pending ICE candidates
      const pending = pendingCandidates.current.get(callState.incomingCallData.callerId);
      if (pending && pending.length > 0) {
        console.log('Applying pending ICE candidates:', pending.length);
        for (const candidate of pending) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error('Error adding pending ICE candidate:', error);
          }
        }
        pendingCandidates.current.delete(callState.incomingCallData.callerId);
      }
      
      setCallState(prev => ({
        ...prev,
        isActive: true,
        isIncoming: false,
        isVideoEnabled: isVideo,
        duration: 0
      }));

      // Update call status in database
      if (callState.callId) {
        const { error } = await supabase
          .from('call_history')
          .update({ 
            status: 'active',
            started_at: new Date().toISOString()
          })
          .eq('id', callState.callId);

        if (error) {
          console.error('Error updating call status:', error);
        }
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
      console.log('=== Call answered successfully ===');

    } catch (error: any) {
      console.error('Error answering call:', error);
      toast.error(`Failed to answer call: ${error.message}`);
      
      // Cleanup on error
      setCallState(prev => ({
        ...prev,
        isIncoming: false,
        incomingCallData: undefined
      }));
    }
  }, [callState.isIncoming, callState.incomingCallData, callState.callId, initializeMedia, initializePeerConnection]);

  // Decline incoming call
  const declineCall = useCallback(async () => {
    console.log('=== Declining Call ===');
    audioNotifications.stopAllSounds();
    
    // Update call status in database
    if (callState.callId) {
      const { error } = await supabase
        .from('call_history')
        .update({ 
          status: 'declined',
          ended_at: new Date().toISOString()
        })
        .eq('id', callState.callId);

      if (error) {
        console.error('Error updating call status:', error);
      }
    }

    // Send decline signal to caller
    if (callState.incomingCallData?.callerId) {
      await sendSignalingMessage('call-declined', {}, callState.incomingCallData.callerId);
    }
    
    setCallState(prev => ({
      ...prev,
      isIncoming: false,
      incomingCallData: undefined,
      callId: undefined
    }));
    
    currentCallId.current = null;
    toast.success('Call declined');
    console.log('=== Call declined successfully ===');
  }, [callState.callId, callState.incomingCallData, sendSignalingMessage]);

  // End call with comprehensive cleanup
  const endCall = useCallback(async () => {
    try {
      console.log('=== Ending Call ===');
      
      // Stop all streams
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind, track.id);
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

      // Clear pending candidates
      pendingCandidates.current.clear();

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
        const { error } = await supabase
          .from('call_history')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: callState.duration,
            status: 'completed'
          })
          .eq('id', callState.callId);

        if (error) {
          console.error('Error updating call history:', error);
        }
      }

      // Send end call signal to other participants
      callState.participants.forEach(participant => {
        sendSignalingMessage('call-ended', {}, participant.id).catch(err => {
          console.error('Error sending call-ended signal:', err);
        });
      });

      const duration = callState.duration;

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

      const formattedDuration = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
      toast.success(`Call ended (${formattedDuration})`);

      console.log('=== Call ended successfully ===');

    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Error ending call');
    }
  }, [localStream, screenStream, callState.callId, callState.duration, callState.participants, sendSignalingMessage]);

  // Toggle mute with audio feedback
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const isMuted = !audioTrack.enabled;
        
        console.log('Audio track muted:', isMuted);
        
        setCallState(prev => ({ ...prev, isMuted }));
        audioNotifications.playMuteToggle(isMuted);
        
        toast.success(isMuted ? "Microphone muted" : "Microphone unmuted");
      } else {
        toast.error('No audio track available');
      }
    } else {
      toast.error('No media stream available');
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const isVideoEnabled = videoTrack.enabled;
        
        console.log('Video track enabled:', isVideoEnabled);
        
        setCallState(prev => ({ ...prev, isVideoEnabled }));
        toast.success(isVideoEnabled ? "Camera enabled" : "Camera disabled");
      } else {
        toast.error('No video track available');
      }
    } else {
      toast.error('No media stream available');
    }
  }, [localStream]);

  // Toggle speaker (for voice calls)
  const toggleSpeaker = useCallback(() => {
    setCallState(prev => {
      const newSpeakerState = !prev.isSpeakerOn;
      toast.success(newSpeakerState ? "Speaker enabled" : "Speaker disabled");
      return { ...prev, isSpeakerOn: newSpeakerState };
    });
  }, []);

  // Enhanced screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      console.log('Starting screen share...');
      
      const screenShareStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor"
        } as any,
        audio: false
      });

      console.log('Screen share stream obtained:', screenShareStream.id);
      setScreenStream(screenShareStream);

      // Replace video track in existing peer connections
      const videoTrack = screenShareStream.getVideoTracks()[0];
      
      peerConnections.current.forEach(async (pc, userId) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          console.log('Replacing video track for screen share:', userId);
          await sender.replaceTrack(videoTrack);
        }
      });

      setCallState(prev => ({ ...prev, isScreenSharing: true }));
      audioNotifications.playScreenShareStart();

      // Handle screen share end
      videoTrack.onended = () => {
        console.log('Screen share ended by user');
        stopScreenShare();
      };

      toast.success("Screen sharing started");

    } catch (error: any) {
      console.error('Error starting screen share:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error("Screen sharing permission denied");
      } else {
        toast.error("Failed to start screen sharing");
      }
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      console.log('Stopping screen share...');
      
      if (screenStream) {
        screenStream.getTracks().forEach(track => {
          console.log('Stopping screen share track:', track.id);
          track.stop();
        });
        setScreenStream(null);
      }

      // Get camera stream back if in video call
      if (callState.callType === 'video' && localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        
        if (videoTrack) {
          peerConnections.current.forEach(async (pc, userId) => {
            const sender = pc.getSenders().find(s => 
              s.track && s.track.kind === 'video'
            );
            if (sender) {
              console.log('Restoring camera track:', userId);
              await sender.replaceTrack(videoTrack);
            }
          });
        }
      }

      setCallState(prev => ({ ...prev, isScreenSharing: false }));
      audioNotifications.playScreenShareStop();
      toast.success("Screen sharing stopped");

    } catch (error) {
      console.error('Error stopping screen share:', error);
      toast.error("Error stopping screen share");
    }
  }, [screenStream, callState.callType, localStream]);

  // Toggle participants panel
  const toggleParticipants = useCallback(() => {
    setCallState(prev => ({ ...prev, showParticipants: !prev.showParticipants }));
  }, []);

  // Add participant (placeholder for group calls)
  const addParticipant = useCallback(() => {
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

    try {
      const canvas = document.createElement('canvas');
      const video = localVideoRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast.error('Video not ready for snapshot');
        return;
      }

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
          } else {
            toast.error('Failed to create snapshot');
          }
        }, 'image/png');
      }
    } catch (error) {
      console.error('Error taking snapshot:', error);
      toast.error('Error taking snapshot');
    }
  }, [callState.isVideoEnabled]);

  // Simulate incoming call (for testing)
  const simulateIncomingCall = useCallback((callerId: string, callerName: string, callType: 'voice' | 'video' = 'voice') => {
    const callId = `call_${Date.now()}_${callerId}_${profile?.id}`;
    currentCallId.current = callId;
    
    audioNotifications.playIncomingCall();
    
    setCallState(prev => ({
      ...prev,
      isIncoming: true,
      callId,
      callType,
      incomingCallData: {
        callerId,
        callerName,
        callType
      }
    }));

    toast.info(`Incoming ${callType} call from ${callerName}`);
  }, [profile?.id]);

  // Listen for incoming calls via Supabase realtime
  useEffect(() => {
    if (!profile?.id) {
      console.log('Profile not loaded, skipping realtime subscription');
      return;
    }

    console.log('Setting up realtime subscription for incoming calls, profile ID:', profile.id);

    realtimeChannel.current = supabase
      .channel(`incoming_calls_${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_history',
          filter: `receiver_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('Received incoming call notification:', payload);
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
                callerAvatar: call.caller_avatar,
                callType: call.call_type
              }
            }));

            toast.info(`Incoming ${call.call_type} call from ${call.caller_name}`);
          }
        }
      )
      .subscribe((status) => {
        console.log('Incoming calls subscription status:', status);
      });

    return () => {
      console.log('Cleaning up incoming calls subscription');
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
        realtimeChannel.current = null;
      }
    };
  }, [profile?.id]);

  // Listen for WebRTC signaling messages
  useEffect(() => {
    if (!profile?.id) {
      console.log('Profile not loaded, skipping signaling subscription');
      return;
    }

    console.log('Setting up realtime subscription for WebRTC signals, profile ID:', profile.id);

    signalChannel.current = supabase
      .channel(`webrtc_signals_${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webrtc_signals',
          filter: `receiver_id=eq.${profile.id}`
        },
        async (payload) => {
          console.log('Received WebRTC signal:', payload);
          const signal = payload.new as any;
          
          try {
            const peerConnection = peerConnections.current.get(signal.sender_id) || 
                                  initializePeerConnection(signal.sender_id);

            switch (signal.signal_type) {
              case 'offer':
                console.log('Processing offer from:', signal.sender_id);
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.signal_data));
                
                // Add local stream if available
                if (localStream) {
                  localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, localStream);
                  });
                }
                
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                await sendSignalingMessage('answer', answer, signal.sender_id);
                console.log('Answer sent to:', signal.sender_id);
                break;
                
              case 'answer':
                console.log('Processing answer from:', signal.sender_id);
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.signal_data));
                break;
                
              case 'ice-candidate':
                console.log('Processing ICE candidate from:', signal.sender_id);
                
                // If remote description is set, add candidate immediately
                if (peerConnection.remoteDescription) {
                  await peerConnection.addIceCandidate(new RTCIceCandidate(signal.signal_data));
                } else {
                  // Otherwise, queue it for later
                  console.log('Queueing ICE candidate for later');
                  const pending = pendingCandidates.current.get(signal.sender_id) || [];
                  pending.push(signal.signal_data);
                  pendingCandidates.current.set(signal.sender_id, pending);
                }
                break;

              case 'call-declined':
                console.log('Call declined by:', signal.sender_id);
                toast.info('Call declined');
                endCall();
                break;

              case 'call-ended':
                console.log('Call ended by:', signal.sender_id);
                toast.info('Call ended by other party');
                endCall();
                break;
            }
          } catch (error) {
            console.error('Error handling signaling message:', error);
            toast.error('Error processing call signal');
          }
        }
      )
      .subscribe((status) => {
        console.log('WebRTC signals subscription status:', status);
      });

    return () => {
      console.log('Cleaning up WebRTC signals subscription');
      if (signalChannel.current) {
        supabase.removeChannel(signalChannel.current);
        signalChannel.current = null;
      }
    };
  }, [profile?.id, sendSignalingMessage, initializePeerConnection, localStream, endCall]);

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
      console.log('useWebRTC cleanup on unmount');
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
      }

      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
      if (signalChannel.current) {
        supabase.removeChannel(signalChannel.current);
      }
    };
  }, []);

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
