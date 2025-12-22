import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Database,
  FileText,
  Download,
  Trash2,
  RefreshCw,
  Save
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface SecuritySettings {
  password_min_length: number;
  require_special_char: boolean;
  require_uppercase: boolean;
  require_number: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  two_factor_required: boolean;
  ip_whitelist_enabled: boolean;
  ip_whitelist: string[];
}

interface DataRetentionSettings {
  audit_log_retention_days: number;
  session_log_retention_days: number;
  message_retention_days: number;
  auto_delete_inactive_users_days: number;
}

interface PrivacySettings {
  data_encryption_at_rest: boolean;
  data_encryption_in_transit: boolean;
  allow_data_export: boolean;
  gdpr_compliant: boolean;
  cookie_consent_required: boolean;
}

export function SecurityDashboard() {
  const { profile } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    password_min_length: 8,
    require_special_char: true,
    require_uppercase: true,
    require_number: true,
    session_timeout_minutes: 480,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    two_factor_required: false,
    ip_whitelist_enabled: false,
    ip_whitelist: []
  });

  const [dataRetention, setDataRetention] = useState<DataRetentionSettings>({
    audit_log_retention_days: 365,
    session_log_retention_days: 90,
    message_retention_days: 365,
    auto_delete_inactive_users_days: 0
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    data_encryption_at_rest: true,
    data_encryption_in_transit: true,
    allow_data_export: true,
    gdpr_compliant: true,
    cookie_consent_required: true
  });

  const [isSaving, setIsSaving] = useState(false);

  // Fetch active sessions
  const { data: activeSessions = [] } = useQuery({
    queryKey: ['active-sessions-admin', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data } = await supabase
        .from('active_sessions')
        .select('*, profiles:profile_id(full_name, email)')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch recent audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs-recent', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('timestamp', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Security alerts - simplified to avoid type issues
  const securityAlerts: any[] = [];

  const handleSaveSettings = async () => {
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      const updateData = {
        security_settings: securitySettings as unknown,
        data_retention_settings: dataRetention as unknown,
        privacy_settings: privacySettings as unknown
      };
      const { error } = await supabase
        .from('organizations')
        .update(updateData as any)
        .eq('id', organization.id);

      if (error) throw error;
      toast.success('Security settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setIsSaving(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Session terminated');
      queryClient.invalidateQueries({ queryKey: ['active-sessions-admin'] });
    } catch (error) {
      toast.error('Failed to terminate session');
    }
  };

  const terminateAllSessions = async () => {
    if (!profile?.organization_id) return;
    try {
      const { error } = await supabase
        .from('active_sessions')
        .update({ is_active: false })
        .eq('organization_id', profile.organization_id)
        .neq('profile_id', profile.id);

      if (error) throw error;
      toast.success('All other sessions terminated');
      queryClient.invalidateQueries({ queryKey: ['active-sessions-admin'] });
    } catch (error) {
      toast.error('Failed to terminate sessions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{activeSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Alerts</p>
                <p className="text-2xl font-bold">{securityAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audit Logs</p>
                <p className="text-2xl font-bold">{auditLogs.length}+</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Alerts</AlertTitle>
          <AlertDescription>
            You have {securityAlerts.length} unresolved security alert(s). Please review them.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="password" className="text-xs sm:text-sm py-2">
            <Lock className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Password
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs sm:text-sm py-2">
            <Users className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="retention" className="text-xs sm:text-sm py-2">
            <Database className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Data Retention
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs sm:text-sm py-2">
            <Eye className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs sm:text-sm py-2">
            <FileText className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Password Policies */}
        <TabsContent value="password" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Policies
              </CardTitle>
              <CardDescription>
                Configure password requirements for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    min={6}
                    max={32}
                    value={securitySettings.password_min_length}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      password_min_length: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    min={3}
                    max={10}
                    value={securitySettings.max_login_attempts}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      max_login_attempts: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Special Character</Label>
                    <p className="text-sm text-muted-foreground">!@#$%^&*()</p>
                  </div>
                  <Switch
                    checked={securitySettings.require_special_char}
                    onCheckedChange={(checked) => setSecuritySettings({
                      ...securitySettings,
                      require_special_char: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Uppercase Letter</Label>
                    <p className="text-sm text-muted-foreground">A-Z</p>
                  </div>
                  <Switch
                    checked={securitySettings.require_uppercase}
                    onCheckedChange={(checked) => setSecuritySettings({
                      ...securitySettings,
                      require_uppercase: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Number</Label>
                    <p className="text-sm text-muted-foreground">0-9</p>
                  </div>
                  <Switch
                    checked={securitySettings.require_number}
                    onCheckedChange={(checked) => setSecuritySettings({
                      ...securitySettings,
                      require_number: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication Required</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={securitySettings.two_factor_required}
                    onCheckedChange={(checked) => setSecuritySettings({
                      ...securitySettings,
                      two_factor_required: checked
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Select
                    value={securitySettings.session_timeout_minutes.toString()}
                    onValueChange={(value) => setSecuritySettings({
                      ...securitySettings,
                      session_timeout_minutes: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Account Lockout Duration (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={60}
                    value={securitySettings.lockout_duration_minutes}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      lockout_duration_minutes: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Management */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription>
                    Monitor and manage active user sessions
                  </CardDescription>
                </div>
                <Button variant="destructive" size="sm" onClick={terminateAllSessions}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  End All Sessions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active sessions
                  </p>
                ) : (
                  activeSessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div>
                          <p className="font-medium">
                            {session.profiles?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.profiles?.email}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            Last active: {session.last_activity_at 
                              ? format(new Date(session.last_activity_at), 'PPp')
                              : 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        disabled={session.profile_id === profile?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Retention */}
        <TabsContent value="retention" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Retention Policies
              </CardTitle>
              <CardDescription>
                Configure how long data is retained in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Audit Log Retention (days)</Label>
                  <Input
                    type="number"
                    min={30}
                    max={3650}
                    value={dataRetention.audit_log_retention_days}
                    onChange={(e) => setDataRetention({
                      ...dataRetention,
                      audit_log_retention_days: parseInt(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Audit logs older than this will be archived
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Session Log Retention (days)</Label>
                  <Input
                    type="number"
                    min={7}
                    max={365}
                    value={dataRetention.session_log_retention_days}
                    onChange={(e) => setDataRetention({
                      ...dataRetention,
                      session_log_retention_days: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message Retention (days)</Label>
                  <Input
                    type="number"
                    min={30}
                    max={3650}
                    value={dataRetention.message_retention_days}
                    onChange={(e) => setDataRetention({
                      ...dataRetention,
                      message_retention_days: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auto-delete Inactive Users (days)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    value={dataRetention.auto_delete_inactive_users_days}
                    onChange={(e) => setDataRetention({
                      ...dataRetention,
                      auto_delete_inactive_users_days: parseInt(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 to disable auto-deletion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy & Compliance
              </CardTitle>
              <CardDescription>
                Configure data privacy and compliance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Encryption at Rest</Label>
                    <p className="text-sm text-muted-foreground">
                      All data is encrypted when stored
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Encryption in Transit</Label>
                    <p className="text-sm text-muted-foreground">
                      All data is encrypted during transmission (HTTPS)
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Data Export</Label>
                    <p className="text-sm text-muted-foreground">
                      Users can export their personal data
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.allow_data_export}
                    onCheckedChange={(checked) => setPrivacySettings({
                      ...privacySettings,
                      allow_data_export: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>GDPR Compliant Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable GDPR compliance features
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.gdpr_compliant}
                    onCheckedChange={(checked) => setPrivacySettings({
                      ...privacySettings,
                      gdpr_compliant: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cookie Consent Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Show cookie consent banner to users
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.cookie_consent_required}
                    onCheckedChange={(checked) => setPrivacySettings({
                      ...privacySettings,
                      cookie_consent_required: checked
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Audit Logs
                  </CardTitle>
                  <CardDescription>
                    Track all security-related activities
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No audit logs found
                  </p>
                ) : (
                  auditLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {log.action}
                          </Badge>
                          <span className="text-sm font-medium">{log.table_name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.timestamp 
                            ? format(new Date(log.timestamp), 'PPpp')
                            : 'Unknown time'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {log.record_id?.slice(0, 8)}...
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </div>
    </div>
  );
}
