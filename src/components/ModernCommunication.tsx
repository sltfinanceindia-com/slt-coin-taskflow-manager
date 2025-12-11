import React, { useState, useEffect } from 'react';
import { useCommunication } from '@/hooks/useCommunication';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  MessageCircle, 
  AlertCircle, 
  RefreshCw, 
  Users,
  Loader2,
  CheckCircle,
  WifiOff,
  LogIn
} from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import EnhancedChatList from './communication/EnhancedChatList';
import EnhancedMessageArea from './communication/EnhancedMessageArea';

export default function ModernCommunication() {
  const { profile, session } = useAuth();
  const isMobile = useIsMobile();
  const communication = useCommunication();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const handleChannelSelect = (channel: any) => {
    communication.selectChannel(channel);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleMemberSelect = async (member: any) => {
    await communication.createDirectMessage(member.id);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBack = () => {
    setShowSidebar(true);
  };

  // Auth loading state - check if profile is still being fetched
  const isAuthLoading = !session && !profile;

  // Not logged in state
  if (!session) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="p-4 rounded-full bg-muted w-fit mx-auto">
            <LogIn className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">Sign In Required</h3>
          <p className="text-sm text-muted-foreground">
            Please sign in to access team communication.
          </p>
        </div>
      </div>
    );
  }

  // No organization state
  if (!profile?.organization_id) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="p-4 rounded-full bg-muted w-fit mx-auto">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">No Organization</h3>
          <p className="text-sm text-muted-foreground">
            Join an organization to access communication features.
          </p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (communication.status === 'error') {
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
            <WifiOff className="h-10 w-10 sm:h-12 sm:w-12 text-destructive" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">Connection Issue</h3>
          <p className="text-sm text-muted-foreground">
            {communication.error || 'Unable to connect. Please try again.'}
          </p>
          <Button 
            onClick={communication.refresh} 
            className="gap-2 min-h-[44px]"
            size="lg"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Loading state with step indicator
  if (communication.isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Loading Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Team Communication</h2>
              <p className="text-xs text-muted-foreground">Connecting...</p>
            </div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-xs space-y-6">
            <LoadingStep 
              step="validating" 
              label="Validating session" 
              current={communication.loadingStep}
            />
            <LoadingStep 
              step="team" 
              label="Loading team members" 
              current={communication.loadingStep}
            />
            <LoadingStep 
              step="channels" 
              label="Loading conversations" 
              current={communication.loadingStep}
            />
          </div>
        </div>

        {/* Loading Skeleton for Chat List */}
        <div className="border-t border-border p-4">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Welcome state component
  const WelcomeState = () => (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
          <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold">
            {communication.channels.length === 0 ? 'Start a Conversation' : 'Welcome to Chat'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {communication.channels.length === 0 
              ? 'Click on a team member in the sidebar to start a direct message.'
              : 'Select a conversation or click a team member to chat.'
            }
          </p>
        </div>
        {communication.teamMembers.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {communication.teamMembers.length} team member{communication.teamMembers.length !== 1 ? 's' : ''} available
            </span>
          </div>
        )}
        {isMobile && communication.channels.length === 0 && (
          <Button 
            variant="outline" 
            onClick={() => setShowSidebar(true)}
            className="min-h-[44px]"
          >
            View Team Members
          </Button>
        )}
      </div>
    </div>
  );

  // Main UI
  return (
    <div className="h-full flex bg-background overflow-hidden">
      {isMobile ? (
        // Mobile Layout - Sliding panels
        <div className="relative w-full h-full overflow-hidden">
          {/* Chat List Panel */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full transition-transform duration-300 ease-out bg-background z-10",
              showSidebar || !communication.selectedChannel 
                ? 'translate-x-0' 
                : '-translate-x-full pointer-events-none'
            )}
          >
            <EnhancedChatList
              channels={communication.channels}
              teamMembers={communication.teamMembers}
              selectedChannel={communication.selectedChannel}
              onChannelSelect={handleChannelSelect}
              onMemberSelect={handleMemberSelect}
              searchQuery={communication.searchQuery}
              onSearchChange={communication.setSearchQuery}
            />
          </div>

          {/* Message Area Panel */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full transition-transform duration-300 ease-out bg-background",
              !showSidebar && communication.selectedChannel 
                ? 'translate-x-0' 
                : 'translate-x-full pointer-events-none'
            )}
          >
            {communication.selectedChannel ? (
              <EnhancedMessageArea
                channel={communication.selectedChannel}
                messages={communication.messages}
                teamMembers={communication.teamMembers}
                currentUser={profile}
                isLoading={communication.isLoadingMessages}
                onSendMessage={(content) => communication.sendMessage(content, communication.selectedChannel?.id)}
                onBack={handleBack}
                isMobile={true}
              />
            ) : (
              <WelcomeState />
            )}
          </div>
        </div>
      ) : (
        // Desktop Layout - Resizable panels
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <EnhancedChatList
              channels={communication.channels}
              teamMembers={communication.teamMembers}
              selectedChannel={communication.selectedChannel}
              onChannelSelect={handleChannelSelect}
              onMemberSelect={handleMemberSelect}
              searchQuery={communication.searchQuery}
              onSearchChange={communication.setSearchQuery}
            />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border/50 hover:bg-border transition-colors" />

          <ResizablePanel defaultSize={70} minSize={50}>
            {communication.selectedChannel ? (
              <EnhancedMessageArea
                channel={communication.selectedChannel}
                messages={communication.messages}
                teamMembers={communication.teamMembers}
                currentUser={profile}
                isLoading={communication.isLoadingMessages}
                onSendMessage={(content) => communication.sendMessage(content, communication.selectedChannel?.id)}
              />
            ) : (
              <WelcomeState />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}

// Loading step indicator component
function LoadingStep({ 
  step, 
  label, 
  current 
}: { 
  step: string; 
  label: string; 
  current: string | null;
}) {
  const steps = ['validating', 'team', 'channels', 'ready'];
  const stepIndex = steps.indexOf(step);
  const currentIndex = current ? steps.indexOf(current) : -1;
  
  const isComplete = currentIndex > stepIndex;
  const isActive = current === step;

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
        isComplete && "bg-primary text-primary-foreground",
        isActive && "bg-primary/20 text-primary",
        !isComplete && !isActive && "bg-muted text-muted-foreground"
      )}>
        {isComplete ? (
          <CheckCircle className="h-4 w-4" />
        ) : isActive ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>
      <span className={cn(
        "text-sm transition-colors",
        isComplete && "text-primary font-medium",
        isActive && "text-foreground font-medium",
        !isComplete && !isActive && "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
}
