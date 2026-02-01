/**
 * Platform Settings Component for Super Admin
 * Global platform configuration
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Mail, Shield, Globe, Bell, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PlatformSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    platformName: 'TeneXA',
    supportEmail: 'support@tenexa.com',
    maintenanceMode: false,
    allowNewSignups: true,
    requireEmailVerification: true,
    defaultPlan: 'starter',
    maxOrgsPerUser: 3,
    sessionTimeout: 24,
    enableAuditLog: true,
    dataRetentionDays: 365,
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Platform settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Settings</h2>
          <p className="text-muted-foreground">
            Configure global platform settings and policies
          </p>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data & Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>
                Basic platform configuration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) =>
                      setSettings({ ...settings, platformName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, supportEmail: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultPlan">Default Plan for New Orgs</Label>
                <Select
                  value={settings.defaultPlan}
                  onValueChange={(value) =>
                    setSettings({ ...settings, defaultPlan: value })
                  }
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter (Trial)</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
              <CardDescription>
                Control platform availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable access for all users
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow New Signups</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new organizations to register
                  </p>
                </div>
                <Switch
                  checked={settings.allowNewSignups}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowNewSignups: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure user authentication policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify email before accessing platform
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireEmailVerification: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sessionTimeout: parseInt(e.target.value),
                    })
                  }
                  className="max-w-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrgs">Max Organizations per User</Label>
                <Input
                  id="maxOrgs"
                  type="number"
                  value={settings.maxOrgsPerUser}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxOrgsPerUser: parseInt(e.target.value),
                    })
                  }
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit & Logging</CardTitle>
              <CardDescription>
                Configure audit trail settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Track all user actions for compliance
                  </p>
                </div>
                <Switch
                  checked={settings.enableAuditLog}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableAuditLog: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure platform email settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Email notifications are configured via Supabase Edge Functions.
                Contact engineering for SMTP changes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>
                Configure data retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retention">Data Retention Period (days)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dataRetentionDays: parseInt(e.target.value),
                    })
                  }
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  How long to retain deleted organization data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
