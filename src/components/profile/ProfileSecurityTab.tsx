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
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Smartphone, Monitor, LogOut, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileSecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  // Mock active sessions data
  const activeSessions = [
    { id: '1', device: 'Chrome on Windows', location: 'Mumbai, India', lastActive: 'Now', current: true },
    { id: '2', device: 'Safari on iPhone', location: 'Mumbai, India', lastActive: '2 hours ago', current: false },
  ];

  // Mock login history
  const loginHistory = [
    { id: '1', date: new Date().toISOString(), device: 'Chrome on Windows', location: 'Mumbai, India', status: 'success' },
    { id: '2', date: new Date(Date.now() - 86400000).toISOString(), device: 'Safari on iPhone', location: 'Mumbai, India', status: 'success' },
    { id: '3', date: new Date(Date.now() - 172800000).toISOString(), device: 'Firefox on Mac', location: 'Unknown', status: 'failed' },
  ];

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
          {activeSessions.map((session) => (
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
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-1" />
                  End
                </Button>
              )}
            </div>
          ))}
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
          {loginHistory.map((login) => (
            <div
              key={login.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {login.status === 'failed' ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <Shield className="h-5 w-5 text-primary" />
                )}
                <div>
                  <p className="font-medium">{login.device}</p>
                  <p className="text-sm text-muted-foreground">
                    {login.location} • {new Date(login.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant={login.status === 'failed' ? 'destructive' : 'secondary'}>
                {login.status === 'failed' ? 'Failed' : 'Success'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
