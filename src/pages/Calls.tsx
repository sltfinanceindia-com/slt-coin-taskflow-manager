import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff as VideoOffIcon,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  Clock,
  Users
} from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useChatUsers } from '@/hooks/useChatUsers';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import IncomingCallModal from '@/components/communication/IncomingCallModal';
import CalendarIntegration from '@/components/CalendarIntegration';
import { cn } from '@/lib/utils';

export default function Calls() {
  const { profile } = useAuth();
  const { 
    callState, 
    startVoiceCall, 
    startVideoCall, 
    endCall, 
    answerCall,
    declineCall,
    toggleMute, 
    toggleVideo,
    localVideoRef 
  } = useWebRTC();
  
  const { callHistory, isLoading: historyLoading, getMissedCalls } = useCallHistory();
  const { chatUsers } = useChatUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [missedCalls, setMissedCalls] = useState<any[]>([]);

  // Load missed calls
  useEffect(() => {
    const loadMissedCalls = async () => {
      const missed = await getMissedCalls();
      setMissedCalls(missed || []);
    };
    loadMissedCalls();
  }, [callHistory]);

  const filteredUsers = chatUsers.filter(user => 
    user.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    user.id !== profile?.id
  );

  const handleStartCall = async (userId: string, userName: string, callType: 'voice' | 'video') => {
    try {
      if (callType === 'video') {
        await startVideoCall(userId, userName);
      } else {
        await startVoiceCall(userId, userName);
      }
      setSelectedUserId(userId);
    } catch (error) {
      toast.error('Failed to start call');
      console.error(error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <PhoneOutgoing className="h-4 w-4 text-green-500" />;
      case 'no_answer':
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case 'declined':
        return <PhoneOff className="h-4 w-4 text-orange-500" />;
      default:
        return <PhoneIncoming className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Incoming Call Modal */}
      <IncomingCallModal
        isOpen={callState.isIncoming}
        callerName={callState.incomingCallData?.callerName || 'Unknown'}
        callerAvatar={callState.incomingCallData?.callerAvatar}
        callType={callState.incomingCallData?.callType || 'voice'}
        onAccept={answerCall}
        onDecline={declineCall}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calls</h1>
        {callState.isActive && (
          <Badge variant="default" className="animate-pulse">
            <Phone className="h-3 w-3 mr-1" />
            Call Active
          </Badge>
        )}
      </div>

      {/* Active Call Interface */}
      {callState.isActive && (
        <Card className="border-2 border-primary">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Video Display */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={cn(
                    "w-full h-full object-cover",
                    !callState.isVideoEnabled && "hidden"
                  )}
                />
                {!callState.isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                          {callState.participants[0]?.name.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-lg font-medium">
                        {callState.participants[0]?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Call Duration Overlay */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(callState.duration)}
                  </Badge>
                </div>

                {/* Mute Indicator */}
                {callState.isMuted && (
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="destructive">
                      <MicOff className="h-3 w-3 mr-1" />
                      Muted
                    </Badge>
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={callState.isMuted ? 'destructive' : 'secondary'}
                  size="lg"
                  onClick={toggleMute}
                  className="h-14 w-14 rounded-full"
                >
                  {callState.isMuted ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>

                {callState.callType === 'video' && (
                  <Button
                    variant={!callState.isVideoEnabled ? 'destructive' : 'secondary'}
                    size="lg"
                    onClick={toggleVideo}
                    className="h-14 w-14 rounded-full"
                  >
                    {callState.isVideoEnabled ? (
                      <Video className="h-6 w-6" />
                    ) : (
                      <VideoOffIcon className="h-6 w-6" />
                    )}
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                  className="h-14 w-14 rounded-full"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="missed">
            <PhoneMissed className="h-4 w-4 mr-2" />
            Missed ({missedCalls.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Clock className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.profile.avatar_url || ''} />
                          <AvatarFallback>
                            {user.profile.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.profile.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {user.status || 'offline'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartCall(user.id, user.profile.full_name || 'Unknown', 'voice')}
                          disabled={callState.isActive}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartCall(user.id, user.profile.full_name || 'Unknown', 'video')}
                          disabled={callState.isActive}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No contacts found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Calls Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {callHistory.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getCallStatusIcon(call.status || '')}
                        <div>
                          <p className="font-medium">
                            {call.caller_id === profile?.user_id 
                              ? call.receiver_name 
                              : call.caller_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {call.call_type === 'video' ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <Phone className="h-3 w-3" />
                            )}
                            <span>
                              {call.created_at && formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                            </span>
                            {call.duration_seconds && (
                              <span>• {formatDuration(call.duration_seconds)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const userId = call.caller_id === profile?.user_id 
                            ? call.receiver_id 
                            : call.caller_id;
                          const userName = call.caller_id === profile?.user_id 
                            ? call.receiver_name 
                            : call.caller_name;
                          if (userId && userName) {
                            handleStartCall(userId, userName, call.call_type as 'voice' | 'video');
                          }
                        }}
                        disabled={callState.isActive}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {callHistory.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No call history</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Missed Calls Tab */}
        <TabsContent value="missed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missed Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {missedCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20"
                    >
                      <div className="flex items-center gap-3">
                        <PhoneMissed className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">{call.caller_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {call.call_type === 'video' ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <Phone className="h-3 w-3" />
                            )}
                            <span>
                              {call.created_at && formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (call.caller_id && call.caller_name) {
                            handleStartCall(call.caller_id, call.caller_name, call.call_type as 'voice' | 'video');
                          }
                        }}
                        disabled={callState.isActive}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Back
                      </Button>
                    </div>
                  ))}
                  {missedCalls.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <PhoneMissed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No missed calls</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <CalendarIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}