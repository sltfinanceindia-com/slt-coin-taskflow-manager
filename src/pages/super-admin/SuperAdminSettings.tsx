import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database,
  Mail,
  Globe,
  Lock,
  Save,
  RefreshCw
} from 'lucide-react';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import { toast } from 'sonner';

export default function SuperAdminSettings() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    // General
    platformName: 'SLT Work Hub',
    supportEmail: 'support@sltworkhub.com',
    maxOrganizations: 100,
    // Security
    enforceStrongPasswords: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorRequired: false,
    // Email
    emailNotifications: true,
    welcomeEmails: true,
    weeklyReports: false,
    // Maintenance
    maintenanceMode: false,
    debugMode: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Platform Settings
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Configure global platform settings and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4 gap-1">
              <TabsTrigger value="general" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-3">
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-3">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-3">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-3">
                <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                System
              </TabsTrigger>
            </TabsList>
          </div>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Basic platform configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => setSettings(s => ({ ...s, platformName: e.target.value }))}
                    className="max-w-md min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                    className="max-w-md min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOrgs">Maximum Organizations</Label>
                  <Input
                    id="maxOrgs"
                    type="number"
                    value={settings.maxOrganizations}
                    onChange={(e) => setSettings(s => ({ ...s, maxOrganizations: parseInt(e.target.value) || 0 }))}
                    className="max-w-[200px] min-h-[44px]"
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of organizations allowed on the platform</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Enforce Strong Passwords</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Require passwords to meet complexity requirements
                    </p>
                  </div>
                  <Switch
                    checked={settings.enforceStrongPasswords}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, enforceStrongPasswords: checked }))}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication Required</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorRequired}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, twoFactorRequired: checked }))}
                  />
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings(s => ({ ...s, sessionTimeout: parseInt(e.target.value) || 60 }))}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings(s => ({ ...s, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Email & Notifications
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configure email and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Enable system email notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Welcome Emails</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Send welcome emails to new users
                    </p>
                  </div>
                  <Switch
                    checked={settings.welcomeEmails}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, welcomeEmails: checked }))}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Weekly Reports</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Send weekly activity reports to admins
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, weeklyReports: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System & Maintenance
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  System maintenance and debugging options
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <div className="space-y-1">
                    <Label className="text-amber-800 dark:text-amber-200">Maintenance Mode</Label>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                      Enable maintenance mode to restrict access
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, maintenanceMode: checked }))}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Debug Mode</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Enable verbose logging for debugging
                    </p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, debugMode: checked }))}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Danger Zone</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                      Clear Cache
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Reset All Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
}
