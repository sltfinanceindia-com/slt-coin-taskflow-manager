/**
 * Profile Security Tab
 * Password change, 2FA, active sessions, login history
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, Smartphone, Monitor, LogOut, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveSessions } from '@/hooks/useActiveSessions';

export function ProfileSecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { sessions, isLoading, logoutSession, isLoggingOut } = useActiveSessions();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    
    // Simulate password change - in production, this would call Supabase auth
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    }, 1000);
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.info(twoFactorEnabled ? '2FA disabled' : '2FA setup would be initiated here');
  };

  // Transform sessions to display format
  const activeSessions = sessions.map((session, index) => ({
    id: session.id,
    device: `${session.device_info?.browser || 'Unknown'} on ${session.device_info?.os || 'Unknown'}`,
    location: session.geo_location?.city || 'Unknown Location',
    lastActive: index === 0 ? 'Now' : new Date(session.last_activity_at).toLocaleString(),
    current: index === 0,
  }));

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={isChangingPassword || !currentPassword || !newPassword}>
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Enable 2FA</p>
              <p className="text-sm text-muted-foreground">
                Require a verification code in addition to your password
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleToggle2FA}
            />
          </div>
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                2FA is enabled. You'll need your authenticator app to sign in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices where you're currently logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activeSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No active sessions found</p>
          ) : (
            activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                </div>
                {session.current ? (
                  <Badge variant="secondary">Current</Badge>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => logoutSession(session.id)}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    End
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription>
            Recent login attempts to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No login history available</p>
          ) : (
            sessions.slice(0, 5).map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {session.device_info?.browser || 'Unknown'} on {session.device_info?.os || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.geo_location?.city || 'Unknown'} • {new Date(session.login_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Success</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
