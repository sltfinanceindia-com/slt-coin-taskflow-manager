import React from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import IncomingCallModal from './IncomingCallModal';
import { toast } from 'sonner';

/**
 * Global handler for incoming calls
 * Shows IncomingCallModal when a call is received
 */
export default function IncomingCallHandler() {
  const {
    callState,
    answerCall,
    declineCall,
    startVideoCall
  } = useWebRTC();

  // Only show modal when there's an incoming call and it's not active yet
  const showIncomingModal = callState.isIncoming && !callState.isActive;

  /**
   * Handle accept call
   */
  const handleAccept = async () => {
    try {
      console.log('=== User clicked Accept ===');
      console.log('Call ID:', callState.callId);
      console.log('Caller:', callState.incomingCallData?.callerName);
      
      await answerCall();
      
      console.log('✅ Call answered successfully');
      toast.success('Call connected');
    } catch (error: any) {
      console.error('❌ Error accepting call:', error);
      toast.error(`Failed to accept call: ${error.message}`);
    }
  };

  /**
   * Handle decline call
   */
  const handleDecline = async () => {
    try {
      console.log('=== User clicked Decline ===');
      console.log('Call ID:', callState.callId);
      
      await declineCall();
      
      console.log('✅ Call declined successfully');
      toast.info('Call declined');
    } catch (error: any) {
      console.error('❌ Error declining call:', error);
      toast.error('Failed to decline call');
    }
  };

  /**
   * Handle accept with video (for voice calls)
   */
  const handleAcceptWithVideo = async () => {
    try {
      console.log('=== User clicked Accept with Video ===');
      
      if (!callState.incomingCallData?.callerId || !callState.incomingCallData?.callerName) {
        throw new Error('Missing caller information');
      }

      // First decline the voice call
      console.log('Declining voice call...');
      await declineCall();
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then start a video call back
      console.log('Starting video call...');
      await startVideoCall(
        callState.incomingCallData.callerId,
        callState.incomingCallData.callerName
      );
      
      console.log('✅ Upgraded to video call');
      toast.success('Upgraded to video call');
    } catch (error: any) {
      console.error('❌ Error accepting with video:', error);
      toast.error(`Failed to start video call: ${error.message}`);
    }
  };

  // Don't render anything if no incoming call
  if (!showIncomingModal || !callState.incomingCallData) {
    return null;
  }

  console.log('📱 Rendering IncomingCallModal');
  console.log('Caller:', callState.incomingCallData.callerName);
  console.log('Call Type:', callState.incomingCallData.callType);

  return (
    <IncomingCallModal
      isOpen={showIncomingModal}
      callerName={callState.incomingCallData.callerName}
      callerAvatar={callState.incomingCallData.callerAvatar}
      callType={callState.incomingCallData.callType}
      onAccept={handleAccept}
      onDecline={handleDecline}
      onAcceptWithVideo={callState.incomingCallData.callType === 'voice' ? handleAcceptWithVideo : undefined}
    />
  );
}
