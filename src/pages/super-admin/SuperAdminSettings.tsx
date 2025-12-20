import { useState, useEffect } from 'react';
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
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  maxOrganizations: number;
  enforceStrongPasswords: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorRequired: boolean;
  emailNotifications: boolean;
  welcomeEmails: boolean;
  weeklyReports: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
}

export default function SuperAdminSettings() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading, profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'SLT Work Hub',
    supportEmail: 'support@sltworkhub.com',
    maxOrganizations: 100,
    enforceStrongPasswords: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorRequired: false,
    emailNotifications: true,
    welcomeEmails: true,
    weeklyReports: false,
    maintenanceMode: false,
    debugMode: false,
  });

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isSuperAdmin) return;
      
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('key, value');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const settingsMap: Record<string, any> = {};
          data.forEach((item: { key: string; value: any }) => {
            // Convert snake_case to camelCase
            const camelKey = item.key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            settingsMap[camelKey] = item.value;
          });
          
          setSettings(prev => ({
            ...prev,
            platformName: settingsMap.platformName || prev.platformName,
            supportEmail: settingsMap.supportEmail || prev.supportEmail,
            maxOrganizations: settingsMap.maxOrganizations || prev.maxOrganizations,
            enforceStrongPasswords: settingsMap.enforceStrongPasswords ?? prev.enforceStrongPasswords,
            sessionTimeout: settingsMap.sessionTimeout || prev.sessionTimeout,
            maxLoginAttempts: settingsMap.maxLoginAttempts || prev.maxLoginAttempts,
            twoFactorRequired: settingsMap.twoFactorRequired ?? prev.twoFactorRequired,
            emailNotifications: settingsMap.emailNotifications ?? prev.emailNotifications,
            welcomeEmails: settingsMap.welcomeEmails ?? prev.welcomeEmails,
            weeklyReports: settingsMap.weeklyReports ?? prev.weeklyReports,
            maintenanceMode: settingsMap.maintenanceMode ?? prev.maintenanceMode,
            debugMode: settingsMap.debugMode ?? prev.debugMode,
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [isSuperAdmin]);

  const handleSettingChange = (key: keyof PlatformSettings, value: any) => {
    setSettings(s => ({ ...s, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert settings to database format
      const settingsToSave = [
        { key: 'platform_name', value: settings.platformName, category: 'general' },
        { key: 'support_email', value: settings.supportEmail, category: 'general' },
        { key: 'max_organizations', value: settings.maxOrganizations, category: 'general' },
        { key: 'enforce_strong_passwords', value: settings.enforceStrongPasswords, category: 'security' },
        { key: 'session_timeout', value: settings.sessionTimeout, category: 'security' },
        { key: 'max_login_attempts', value: settings.maxLoginAttempts, category: 'security' },
        { key: 'two_factor_required', value: settings.twoFactorRequired, category: 'security' },
        { key: 'email_notifications', value: settings.emailNotifications, category: 'email' },
        { key: 'welcome_emails', value: settings.welcomeEmails, category: 'email' },
        { key: 'weekly_reports', value: settings.weeklyReports, category: 'email' },
        { key: 'maintenance_mode', value: settings.maintenanceMode, category: 'system' },
        { key: 'debug_mode', value: settings.debugMode, category: 'system' },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            category: setting.category,
            updated_by: profile?.id,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        
        if (error) throw error;
      }

      // Log the action
      await supabase.from('super_admin_audit_log').insert({
        action: 'update_settings',
        entity_type: 'platform_settings',
        details: { settings: settingsToSave.map(s => s.key) },
        performed_by: profile?.id,
      });

      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || roleLoading || isLoading) {
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
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="w-full sm:w-auto">
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
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
                    onChange={(e) => handleSettingChange('platformName', e.target.value)}
                    className="max-w-md min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                    className="max-w-md min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOrgs">Maximum Organizations</Label>
                  <Input
                    id="maxOrgs"
                    type="number"
                    value={settings.maxOrganizations}
                    onChange={(e) => handleSettingChange('maxOrganizations', parseInt(e.target.value) || 0)}
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
                    onCheckedChange={(checked) => handleSettingChange('enforceStrongPasswords', checked)}
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
                    onCheckedChange={(checked) => handleSettingChange('twoFactorRequired', checked)}
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
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 60)}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
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
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
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
                    onCheckedChange={(checked) => handleSettingChange('welcomeEmails', checked)}
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
                    onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
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
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
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
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
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
