import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CallState {
  callId: string | null;
  isActive: boolean;
  isIncoming: boolean;
  callType: 'voice' | 'video';
  participants: CallParticipant[];
  localStream: MediaStream | null;
  remoteStreams: { [userId: string]: MediaStream };
}

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

export const useWebRTCCall = () => {
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    isActive: false,
    isIncoming: false,
    callType: 'voice',
    participants: [],
    localStream: null,
    remoteStreams: {}
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const channelRef = useRef<any>(null);

  // Initialize WebRTC peer connection
  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:numb.viagenie.ca',
          username: 'webrtc@live.com',
          credential: 'muazkh'
        }
      ],
      iceCandidatePoolSize: 10
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        sendSignalingMessage('ice-candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received:', event.track.kind);
      const [remoteStream] = event.streams;
      
      setCallState(prev => ({
        ...prev,
        remoteStreams: {
          ...prev.remoteStreams,
          remote: remoteStream
        }
      }));
      
      toast.success('Connected!');
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'failed') {
        toast.error('Connection failed. Check your network.');
        endCall();
      } else if (pc.iceConnectionState === 'disconnected') {
        toast.warning('Connection interrupted');
      } else if (pc.iceConnectionState === 'connected') {
        console.log('Peer connection established');
      }
    };

    pc.onsignalingstatechange = () => {
      console.log('Signaling State:', pc.signalingState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection State:', pc.connectionState);
    };

    peerConnectionRef.current = pc;
  };

  // Send signaling message via Supabase Realtime Broadcast
  const sendSignalingMessage = async (type: string, data: any) => {
    try {
      if (!channelRef.current || !callState.callId) {
        console.warn('Channel or callId not ready for signaling');
        return;
      }

      await channelRef.current.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          signal_type: type,
          signal_data: data,
          sender_id: user?.id,
          timestamp: Date.now()
        }
      });
      
      console.log(`✓ Sent ${type} signal`);
    } catch (error) {
      console.error('Error sending signaling message:', error);
    }
  };

  // Handle remote offer (receiver side)
  const handleRemoteOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      console.log('Handling remote offer');
      
      if (!peerConnectionRef.current) {
        initializePeerConnection();
      }

      await peerConnectionRef.current?.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      console.log('✓ Remote offer set');

      // Get user media
      const stream = await getUserMedia(callState.callType === 'video');
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind);
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Create and send answer
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      console.log('✓ Local answer created');
      
      await sendSignalingMessage('answer', answer);
      console.log('✓ Answer sent to caller');
      
      // Update call status
      if (callState.callId) {
        await supabase
          .from('call_history')
          .update({ status: 'active' })
          .eq('id', callState.callId);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      toast.error('Failed to process incoming call');
      await endCall();
    }
  };

  // Handle remote answer (caller side)
  const handleRemoteAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      console.log('Handling remote answer');
      
      if (!peerConnectionRef.current) {
        console.error('No peer connection available');
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log('✓ Remote answer set - connection establishing');
      
      // Update call status
      if (callState.callId) {
        await supabase
          .from('call_history')
          .update({ status: 'active' })
          .eq('id', callState.callId);
      }
    } catch (error) {
      console.error('Error setting remote answer:', error);
      toast.error('Failed to establish connection');
    }
  };

  // Handle remote ICE candidate
  const handleRemoteIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      if (!peerConnectionRef.current) {
        console.warn('Peer connection not ready for ICE candidate');
        return;
      }

      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
      console.log('✓ ICE candidate added');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  // Get user media
  const getUserMedia = async (video: boolean = false) => {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✓ Media stream acquired:', stream.getTracks().map(t => t.kind));

      setCallState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error: any) {
      console.error('getUserMedia error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone permission denied. Please enable in browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect an audio device.');
      } else {
        toast.error('Could not access camera/microphone');
      }
      throw error;
    }
  };

  // Start call (caller side)
  const startCall = async (recipientId: string, callType: 'voice' | 'video') => {
    try {
      console.log('Starting call:', { recipientId, callType });
      
      // Get media permissions FIRST
      const stream = await getUserMedia(callType === 'video');
      
      // Generate unique call ID
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Call ID:', callId);
      
      // Update state with callId BEFORE initializing peer connection
      setCallState(prev => ({ 
        ...prev, 
        callId,
        callType,
        localStream: stream,
        isActive: true
      }));
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Initialize peer connection
      initializePeerConnection();
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding local track:', track.kind);
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnectionRef.current?.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      });
      
      if (!offer) {
        throw new Error('Failed to create offer');
      }

      await peerConnectionRef.current?.setLocalDescription(offer);
      console.log('✓ Local offer created');

      // Save call to database
      const { error: dbError } = await supabase
        .from('call_history')
        .insert({
          id: callId,
          caller_id: user?.id,
          receiver_id: recipientId,
          call_type: callType,
          status: 'ringing',
          started_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      // Initialize signaling channel
      const channel = supabase.channel(`call_${callId}`);
      await channel.subscribe();
      channelRef.current = channel;

      // Send offer via signaling
      await sendSignalingMessage('offer', offer);

      setCallState(prev => ({
        ...prev,
        participants: [
          {
            id: user?.id || '',
            name: 'You',
            isLocal: true,
            isAudioEnabled: true,
            isVideoEnabled: callType === 'video',
            isScreenSharing: false,
            connectionQuality: 'excellent',
            isSpeaking: false,
            audioLevel: 0
          }
        ]
      }));

      toast.success('Calling...');
      console.log('✓ Call initiated successfully');
    } catch (error: any) {
      console.error('Failed to start call:', error);
      toast.error(error.message || 'Failed to start call');
      await endCall();
    }
  };

  // Answer call (receiver side)
  const answerCall = async () => {
    try {
      console.log('Answering call');
      
      // Initialize peer connection if not already done
      if (!peerConnectionRef.current) {
        initializePeerConnection();
      }

      setCallState(prev => ({ 
        ...prev, 
        isIncoming: false,
        isActive: true 
      }));
      
      toast.success('Answering call...');
      console.log('✓ Call answer initiated');
    } catch (error) {
      console.error('Failed to answer call:', error);
      toast.error('Failed to answer call');
      await endCall();
    }
  };

  // End call
  const endCall = async () => {
    try {
      console.log('Ending call');
      
      // Stop all local tracks
      if (callState.localStream) {
        callState.localStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.oniceconnectionstatechange = null;
        peerConnectionRef.current.onsignalingstatechange = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
        console.log('✓ Peer connection closed');
      }

      // Remove signaling channel
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log('✓ Signaling channel closed');
      }

      // Update call history
      if (callState.callId) {
        await supabase
          .from('call_history')
          .update({ 
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', callState.callId);
      }

      // Reset state
      setCallState({
        callId: null,
        isActive: false,
        isIncoming: false,
        callType: 'voice',
        participants: [],
        localStream: null,
        remoteStreams: {}
      });

      toast.success('Call ended');
      console.log('✓ Call cleanup complete');
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call properly');
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('Audio toggled:', audioTrack.enabled);
        
        setCallState(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.isLocal ? { ...p, isAudioEnabled: audioTrack.enabled } : p
          )
        }));
        
        toast.success(audioTrack.enabled ? 'Microphone on' : 'Microphone off');
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('Video toggled:', videoTrack.enabled);
        
        setCallState(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.isLocal ? { ...p, isVideoEnabled: videoTrack.enabled } : p
          )
        }));
        
        toast.success(videoTrack.enabled ? 'Camera on' : 'Camera off');
      }
    }
  };

  // Listen for incoming calls via Supabase realtime
  useEffect(() => {
    if (!user) return;

    const callsChannel = supabase
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
          const call = payload.new;
          console.log('Incoming call detected:', call);
          
          if (call.status === 'ringing') {
            setCallState(prev => ({
              ...prev,
              callId: call.id,
              isIncoming: true,
              callType: call.call_type,
              isActive: true
            }));
            
            toast.info('Incoming call...', {
              duration: 30000,
              action: {
                label: 'Answer',
                onClick: answerCall
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callsChannel);
    };
  }, [user]);

  // Listen for WebRTC signaling messages
  useEffect(() => {
    if (!callState.callId || !user) return;

    console.log('Setting up signaling listener for call:', callState.callId);

    const channel = supabase
      .channel(`call_${callState.callId}`)
      .on('broadcast', { event: 'webrtc-signal' }, async (payload) => {
        const { signal_type, signal_data, sender_id } = payload.payload;
        
        // Ignore own messages
        if (sender_id === user.id) return;

        console.log('← Received signal:', signal_type);

        try {
          switch (signal_type) {
            case 'offer':
              await handleRemoteOffer(signal_data);
              break;
            case 'answer':
              await handleRemoteAnswer(signal_data);
              break;
            case 'ice-candidate':
              await handleRemoteIceCandidate(signal_data);
              break;
            default:
              console.warn('Unknown signal type:', signal_type);
          }
        } catch (error) {
          console.error('Error handling signal:', error);
        }
      })
      .subscribe((status) => {
        console.log('Signaling channel status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [callState.callId, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callState.isActive) {
        endCall();
      }
    };
  }, []);

  return {
    callState,
    startCall,
    answerCall,
    endCall,
    toggleAudio,
    toggleVideo,
    localVideoRef
  };
};
