import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Monitor, Smartphone, Tablet, Globe, Clock, 
  LogOut, AlertTriangle, Shield, Loader2 
} from 'lucide-react';
import { useActiveSessions, ActiveSession } from '@/hooks/useActiveSessions';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

function getDeviceIcon(deviceType: string) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-5 w-5" />;
    case 'tablet':
      return <Tablet className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
}

function SessionCard({ 
  session, 
  isCurrentSession,
  onLogout,
  isLoggingOut 
}: { 
  session: ActiveSession; 
  isCurrentSession: boolean;
  onLogout: (id: string) => void;
  isLoggingOut: boolean;
}) {
  const deviceInfo = session.device_info || {};
  const geoLocation = session.geo_location || {};

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all",
      isCurrentSession ? "bg-primary/5 border-primary/20" : "bg-card"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isCurrentSession ? "bg-primary/10 text-primary" : "bg-muted"
          )}>
            {getDeviceIcon(deviceInfo.device_type || 'desktop')}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {deviceInfo.browser || 'Unknown Browser'} on {deviceInfo.os || 'Unknown OS'}
              </span>
              {isCurrentSession && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
              {session.work_mode === 'wfh' && (
                <Badge variant="outline" className="text-xs">WFH</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {geoLocation.city && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {geoLocation.city}, {geoLocation.country}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(session.login_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last active: {format(new Date(session.last_activity_at), 'MMM dd, yyyy h:mm a')}
            </p>
          </div>
        </div>
        
        {!isCurrentSession && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLogout(session.id)}
            disabled={isLoggingOut}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export function SessionManagement() {
  const { 
    sessions, 
    isLoading, 
    logoutSession, 
    logoutAllSessions,
    isLoggingOut 
  } = useActiveSessions();

  // Assume the most recent session is the current one
  const currentSessionId = sessions[0]?.id;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active sessions across all devices
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutAllSessions(currentSessionId)}
              disabled={isLoggingOut}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Logout All Others
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isCurrentSession={session.id === currentSessionId}
                  onLogout={logoutSession}
                  isLoggingOut={isLoggingOut}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <Separator className="my-4" />

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Sessions expire automatically based on work mode (Office: 8 hours, WFH: 2 hours)
          </p>
          <p>If you see any unfamiliar sessions, logout immediately and change your password.</p>
        </div>
      </CardContent>
    </Card>
  );
}
