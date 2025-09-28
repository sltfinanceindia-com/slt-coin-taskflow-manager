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

  // Initialize WebRTC
  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    peerConnectionRef.current = new RTCPeerConnection(configuration);

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer via Supabase
        sendSignalingMessage('ice-candidate', event.candidate);
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      // Handle remote stream
      setCallState(prev => ({
        ...prev,
        remoteStreams: {
          ...prev.remoteStreams,
          [callState.callId || 'remote']: remoteStream
        }
      }));
    };
  };

  // Send signaling message via Supabase
  const sendSignalingMessage = async (type: string, data: any) => {
    try {
      await supabase
        .from('webrtc_signals')
        .insert({
          call_id: callState.callId,
          sender_id: user?.id,
          signal_type: type,
          signal_data: data
        });
    } catch (error) {
      console.error('Error sending signaling message:', error);
    }
  };

  // Get user media
  const getUserMedia = async (video: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video
      });

      setCallState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      toast.error('Could not access camera/microphone');
      throw error;
    }
  };

  // Start call
  const startCall = async (recipientId: string, callType: 'voice' | 'video') => {
    try {
      const callId = `call_${Date.now()}`;
      
      initializePeerConnection();
      const stream = await getUserMedia(callType === 'video');
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnectionRef.current?.createOffer();
      await peerConnectionRef.current?.setLocalDescription(offer);

      // Save call to database
      await supabase
        .from('call_history')
        .insert({
          caller_id: user?.id,
          receiver_id: recipientId,
          call_type: callType,
          status: 'ringing'
        });

      // Send offer via signaling
      await sendSignalingMessage('offer', offer);

      setCallState(prev => ({
        ...prev,
        callId,
        isActive: true,
        callType,
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
    } catch (error) {
      toast.error('Failed to start call');
    }
  };

  // Answer call
  const answerCall = async () => {
    try {
      initializePeerConnection();
      const stream = await getUserMedia(callState.callType === 'video');
      
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // This would handle the incoming offer and create answer
      // Implementation depends on how offers are received via Supabase
      
      setCallState(prev => ({ ...prev, isIncoming: false }));
      toast.success('Call answered');
    } catch (error) {
      toast.error('Failed to answer call');
    }
  };

  // End call
  const endCall = async () => {
    try {
      // Clean up streams
      if (callState.localStream) {
        callState.localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
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
    } catch (error) {
      toast.error('Failed to end call');
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.isLocal ? { ...p, isAudioEnabled: audioTrack.enabled } : p
          )
        }));
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.isLocal ? { ...p, isVideoEnabled: videoTrack.enabled } : p
          )
        }));
      }
    }
  };

  // Listen for incoming calls via Supabase realtime
  useEffect(() => {
    if (!user) return;

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
          const call = payload.new;
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
      supabase.removeChannel(channel);
    };
  }, [user]);

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