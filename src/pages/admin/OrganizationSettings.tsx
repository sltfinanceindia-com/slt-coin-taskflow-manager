import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export default function OrganizationSettings() {
  const navigate = useNavigate();
  const { organization, userCount, refreshOrganization, isLoading: orgLoading } = useOrganization();
  const { profile, loading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading: roleLoading } = useUserRole();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    primary_color: '#10b981',
    secondary_color: '#059669',
  });
  
  const [isSaving, setIsSaving] = useState(false);

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
      });
    }
  }, [organization]);

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
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Organization settings have been updated successfully.',
      });
      
      refreshOrganization();
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

  // Only admins can access this page (but not super admins - they use the super admin panel)
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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Organization Settings</h1>
          <p className="text-muted-foreground text-xs sm:text-sm truncate">Manage your organization's profile and preferences</p>
        </div>
      </div>

      {/* Company Profile */}
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

      {/* Branding */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
            Branding
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Customize your organization's appearance</CardDescription>
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
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-12 h-10 sm:w-16 sm:h-11 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-12 h-10 sm:w-16 sm:h-11 p-1 cursor-pointer"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#059669"
                  className="flex-1 h-10 sm:h-11"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 sm:p-4 rounded-lg border">
            <p className="text-xs sm:text-sm font-medium mb-3">Preview</p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button 
                size="sm"
                style={{ backgroundColor: formData.primary_color }}
                className="text-white text-xs sm:text-sm"
              >
                Primary
              </Button>
              <Button 
                size="sm"
                style={{ backgroundColor: formData.secondary_color }}
                className="text-white text-xs sm:text-sm"
              >
                Secondary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
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
            {usagePercentage >= 80 && organization.max_users !== -1 && (
              <p className="text-xs sm:text-sm text-amber-600">
                You're approaching your user limit. Consider upgrading your plan.
              </p>
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

      {/* Save Button */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto min-w-[120px]">
          {isSaving ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
