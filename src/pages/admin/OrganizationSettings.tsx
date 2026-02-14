import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, 
  Palette, 
  Users, 
  CreditCard, 
  Save,
  Sparkles,
  Coins,
  Settings,
  Bell,
  Shield,
  ToggleLeft,
  Globe,
  Check
} from 'lucide-react';
import { AdminSessionViewer } from '@/components/AdminSessionViewer';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

// Theme presets
const themePresets = [
  { name: 'Classic Green', primary: '#10b981', secondary: '#059669', icon: '🌿' },
  { name: 'Ocean Blue', primary: '#3b82f6', secondary: '#1d4ed8', icon: '🌊' },
  { name: 'Purple Premium', primary: '#8b5cf6', secondary: '#7c3aed', icon: '💜' },
  { name: 'Sunset Orange', primary: '#f97316', secondary: '#ea580c', icon: '🌅' },
  { name: 'Rose Pink', primary: '#f43f5e', secondary: '#e11d48', icon: '🌸' },
  { name: 'Slate Professional', primary: '#475569', secondary: '#334155', icon: '💼' },
  { name: 'Teal Fresh', primary: '#14b8a6', secondary: '#0d9488', icon: '🌴' },
  { name: 'Amber Gold', primary: '#f59e0b', secondary: '#d97706', icon: '✨' },
];

const timezones = [
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const currencies = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'GBP', label: '£ British Pound (GBP)' },
  { value: 'AUD', label: '$ Australian Dollar (AUD)' },
];

interface EnabledFeatures {
  training: boolean;
  leave_management: boolean;
  attendance: boolean;
  projects: boolean;
  communication: boolean;
  assessments: boolean;
  coin_rewards: boolean;
}

interface NotificationSettings {
  email_notifications: boolean;
  daily_digest: boolean;
  task_reminders: boolean;
  announcement_alerts: boolean;
}

interface SecuritySettings {
  password_min_length: number;
  require_special_char: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
}

export default function OrganizationSettings() {
  const { organization, userCount, refreshOrganization, isLoading: orgLoading } = useOrganization();
  const { loading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    primary_color: '#10b981',
    secondary_color: '#059669',
    coin_name: 'Coins',
    timezone: 'Asia/Kolkata',
    date_format: 'DD/MM/YYYY',
    currency: 'INR',
    first_day_of_week: 1,
  });

  const [enabledFeatures, setEnabledFeatures] = useState<EnabledFeatures>({
    training: true,
    leave_management: true,
    attendance: true,
    projects: true,
    communication: true,
    assessments: true,
    coin_rewards: true,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    daily_digest: true,
    task_reminders: true,
    announcement_alerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    password_min_length: 8,
    require_special_char: true,
    session_timeout_minutes: 480,
    max_login_attempts: 5,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Update form data when organization loads
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        contact_email: organization.contact_email || '',
        contact_phone: organization.contact_phone || '',
        address: organization.address || '',
        primary_color: organization.primary_color || '#10b981',
        secondary_color: organization.secondary_color || '#059669',
        coin_name: organization.coin_name || 'Coins',
        timezone: (organization as any).timezone || 'Asia/Kolkata',
        date_format: (organization as any).date_format || 'DD/MM/YYYY',
        currency: (organization as any).currency || 'INR',
        first_day_of_week: (organization as any).first_day_of_week || 1,
      });

      if ((organization as any).enabled_features) {
        setEnabledFeatures((organization as any).enabled_features);
      }
      if ((organization as any).notification_settings) {
        setNotificationSettings((organization as any).notification_settings);
      }
      if ((organization as any).security_settings) {
        setSecuritySettings((organization as any).security_settings);
      }
    }
  }, [organization]);

  const handlePresetSelect = (preset: typeof themePresets[0]) => {
    setSelectedPreset(preset.name);
    setFormData(prev => ({
      ...prev,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
    }));
  };

  const handleSave = async () => {
    if (!organization?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          address: formData.address,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          coin_name: formData.coin_name,
          timezone: formData.timezone,
          date_format: formData.date_format,
          currency: formData.currency,
          first_day_of_week: formData.first_day_of_week,
          enabled_features: enabledFeatures,
          notification_settings: notificationSettings,
          security_settings: securitySettings,
        } as any)
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Organization settings have been updated successfully. Theme changes will apply immediately.',
      });
      
      await refreshOrganization();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const usagePercentage = organization?.max_users 
    ? Math.round((userCount / organization.max_users) * 100)
    : 0;

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'professional': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'starter': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isLoading = orgLoading || authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin || isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Organization Found</h2>
            <p className="text-muted-foreground">You are not associated with any organization.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab="settings" onTabChange={() => {}} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Organization Settings</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm truncate">Manage your organization's profile and preferences</p>
                </div>
              </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="general" className="text-xs sm:text-sm py-2">
            <Building2 className="h-4 w-4 mr-1.5 hidden sm:inline" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs sm:text-sm py-2">
            <Palette className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs sm:text-sm py-2">
            <Globe className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="features" className="text-xs sm:text-sm py-2">
            <ToggleLeft className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Features
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2">
            <Bell className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm py-2">
            <Shield className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Company Profile
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your company name"
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain" className="text-sm">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={organization.subdomain}
                    disabled
                    className="bg-muted h-10 sm:h-11"
                  />
                  <p className="text-xs text-muted-foreground">Subdomain cannot be changed</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your organization"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email" className="text-sm">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contact@company.com"
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone" className="text-sm">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Company address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Subscription
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your current plan and usage</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm sm:text-base">Current Plan</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge className={getPlanBadgeColor(organization.subscription_plan?.code)}>
                      <Sparkles className="h-3 w-3 mr-1" />
                      {organization.subscription_plan?.name || 'Free'}
                    </Badge>
                    <Badge variant={organization.status === 'active' ? 'default' : 'secondary'}>
                      {organization.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" disabled className="w-full sm:w-auto">
                  Upgrade Plan
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm sm:text-base">User Limit</span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {userCount} / {organization.max_users === -1 ? '∞' : organization.max_users} users
                  </span>
                </div>
                {organization.max_users !== -1 && (
                  <Progress value={usagePercentage} className="h-2" />
                )}
              </div>

              {organization.trial_ends_at && (
                <>
                  <Separator />
                  <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">Trial Period</p>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                      Your trial ends on {new Date(organization.trial_ends_at).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                Theme Presets
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Choose a pre-designed color theme or customize your own</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedPreset === preset.name || 
                      (formData.primary_color === preset.primary && formData.secondary_color === preset.secondary)
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {(selectedPreset === preset.name || 
                      (formData.primary_color === preset.primary && formData.secondary_color === preset.secondary)) && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="flex gap-1 mb-2">
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <p className="text-xs font-medium text-center">
                      {preset.icon} {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                Custom Colors
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Fine-tune your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_color" className="text-sm">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => {
                        setFormData({ ...formData, primary_color: e.target.value });
                        setSelectedPreset(null);
                      }}
                      className="w-12 h-10 sm:w-16 sm:h-11 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => {
                        setFormData({ ...formData, primary_color: e.target.value });
                        setSelectedPreset(null);
                      }}
                      placeholder="#10b981"
                      className="flex-1 h-10 sm:h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color" className="text-sm">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => {
                        setFormData({ ...formData, secondary_color: e.target.value });
                        setSelectedPreset(null);
                      }}
                      className="w-12 h-10 sm:w-16 sm:h-11 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => {
                        setFormData({ ...formData, secondary_color: e.target.value });
                        setSelectedPreset(null);
                      }}
                      placeholder="#059669"
                      className="flex-1 h-10 sm:h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium mb-3">Live Preview</p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="sm"
                    style={{ backgroundColor: formData.primary_color }}
                    className="text-white"
                  >
                    Primary Button
                  </Button>
                  <Button 
                    size="sm"
                    style={{ backgroundColor: formData.secondary_color }}
                    className="text-white"
                  >
                    Secondary Button
                  </Button>
                  <Badge style={{ backgroundColor: formData.primary_color, color: 'white' }}>
                    Status Badge
                  </Badge>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label htmlFor="coin_name" className="text-sm flex items-center gap-2">
                  <Coins className="h-4 w-4 text-coin-gold" />
                  Coin Name
                </Label>
                <Input
                  id="coin_name"
                  value={formData.coin_name}
                  onChange={(e) => setFormData({ ...formData, coin_name: e.target.value })}
                  placeholder="Coins"
                  className="h-10 sm:h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Custom name for your organization's reward coins (e.g., "Star Points", "Company Coins")
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure timezone, date format, and currency</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Timezone</Label>
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Date Format</Label>
                  <Select 
                    value={formData.date_format} 
                    onValueChange={(value) => setFormData({ ...formData, date_format: value })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormats.map((df) => (
                        <SelectItem key={df.value} value={df.value}>
                          {df.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">First Day of Week</Label>
                  <Select 
                    value={formData.first_day_of_week.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, first_day_of_week: parseInt(value) })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select first day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ToggleLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Enable or disable features for your organization</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              {[
                { key: 'training' as keyof EnabledFeatures, label: 'Training Center', description: 'Training modules and courses for employees' },
                { key: 'leave_management' as keyof EnabledFeatures, label: 'Leave Management', description: 'Leave requests and approvals' },
                { key: 'attendance' as keyof EnabledFeatures, label: 'Attendance Tracking', description: 'Clock-in/out and attendance records' },
                { key: 'projects' as keyof EnabledFeatures, label: 'Project Management', description: 'Project and task management features' },
                { key: 'communication' as keyof EnabledFeatures, label: 'Team Communication', description: 'Internal messaging and channels' },
                { key: 'assessments' as keyof EnabledFeatures, label: 'Assessments', description: 'Employee assessments and quizzes' },
                { key: 'coin_rewards' as keyof EnabledFeatures, label: 'Coin Rewards', description: 'Gamification and coin-based rewards' },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch
                    checked={enabledFeatures[feature.key]}
                    onCheckedChange={(checked) => 
                      setEnabledFeatures({ ...enabledFeatures, [feature.key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure default notification settings for your organization</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              {[
                { key: 'email_notifications' as keyof NotificationSettings, label: 'Email Notifications', description: 'Send email notifications to users' },
                { key: 'daily_digest' as keyof NotificationSettings, label: 'Daily Digest', description: 'Send daily summary emails' },
                { key: 'task_reminders' as keyof NotificationSettings, label: 'Task Reminders', description: 'Send reminders for upcoming task deadlines' },
                { key: 'announcement_alerts' as keyof NotificationSettings, label: 'Announcement Alerts', description: 'Send alerts for new announcements' },
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{notification.label}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                  </div>
                  <Switch
                    checked={notificationSettings[notification.key]}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, [notification.key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure security policies for your organization</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Minimum Password Length</Label>
                  <Select 
                    value={securitySettings.password_min_length.toString()} 
                    onValueChange={(value) => setSecuritySettings({ ...securitySettings, password_min_length: parseInt(value) })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select minimum length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="10">10 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Session Timeout</Label>
                  <Select 
                    value={securitySettings.session_timeout_minutes.toString()} 
                    onValueChange={(value) => setSecuritySettings({ ...securitySettings, session_timeout_minutes: parseInt(value) })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Max Login Attempts</Label>
                  <Select 
                    value={securitySettings.max_login_attempts.toString()} 
                    onValueChange={(value) => setSecuritySettings({ ...securitySettings, max_login_attempts: parseInt(value) })}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select max attempts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-sm">Require Special Characters</p>
                  <p className="text-xs text-muted-foreground">Passwords must contain special characters</p>
                </div>
                <Switch
                  checked={securitySettings.require_special_char}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, require_special_char: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* User Sessions Viewer */}
          <AdminSessionViewer />
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto min-w-[140px]">
          {isSaving ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
            </div>
          </main>
          {isMobile && <BottomNavigation variant="private" activeTab="settings" onTabChange={() => {}} />}
        </div>
      </div>
    </SidebarProvider>
  );
}
