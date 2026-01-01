import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Building2, ArrowLeft, Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  max_users: number;
}

// Check if plan is enterprise level
const isEnterprisePlan = (code: string) => code === 'enterprise';

// Password strength checker
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-red-500' };
  if (score === 2) return { score: 40, label: 'Fair', color: 'bg-orange-500' };
  if (score === 3) return { score: 60, label: 'Good', color: 'bg-yellow-500' };
  if (score === 4) return { score: 80, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 100, label: 'Very Strong', color: 'bg-emerald-600' };
};

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: '',
    contact_email: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    planId: '',
    maxUsers: 5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch subscription plans - Fixed: use useEffect instead of useState
  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('subscription_plans')
        .select('id, name, code, max_users')
        .eq('is_active', true)
        .order('price_monthly');
      
      if (data) {
        setPlans(data);
        // Set default to free plan
        const freePlan = data.find(p => p.code === 'free');
        if (freePlan) {
          setFormData(prev => ({ ...prev, planId: freePlan.id, maxUsers: freePlan.max_users }));
        }
      }
    };
    fetchPlans();
  }, []);

  const passwordStrength = getPasswordStrength(formData.adminPassword);

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      subdomain: generateSubdomain(value),
    }));
  };

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    setFormData(prev => ({
      ...prev,
      planId,
      maxUsers: plan?.max_users || 5,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const selectedPlan = plans.find(p => p.id === formData.planId);
    const isEnterprise = selectedPlan && isEnterprisePlan(selectedPlan.code);

    if (!formData.name.trim()) newErrors.name = 'Organization name is required';
    
    // Only validate subdomain for enterprise plans
    if (isEnterprise) {
      if (!formData.subdomain.trim()) newErrors.subdomain = 'Subdomain is required';
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(formData.subdomain) && formData.subdomain.length > 2) {
        newErrors.subdomain = 'Subdomain must contain only lowercase letters, numbers, and hyphens';
      }
    }
    
    if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email address';
    }
    if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = 'Password must be at least 8 characters';
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Check if subdomain is available
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', formData.subdomain)
        .maybeSingle();

      if (existingOrg) {
        setErrors({ subdomain: 'This subdomain is already taken' });
        setIsSubmitting(false);
        return;
      }

      // Create organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          subdomain: formData.subdomain,
          description: formData.description || null,
          contact_email: formData.contact_email || formData.adminEmail,
          subscription_plan_id: formData.planId || null,
          max_users: formData.maxUsers,
          status: 'active',
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create admin user using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          data: {
            full_name: formData.adminName,
            role: 'admin',
            organization_id: newOrg.id,
          },
        },
      });

      if (authError) throw authError;

      // Update the profile with organization_id (handle race condition with trigger)
      if (authData.user) {
        // Wait a bit for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            organization_id: newOrg.id,
            role: 'admin',
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // Update user_roles
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ organization_id: newOrg.id })
          .eq('user_id', authData.user.id);

        if (roleError) {
          console.error('Error updating user role:', roleError);
        }
      }

      toast.success('Organization created successfully!');
      navigate(`/super-admin/organizations/${newOrg.id}`);
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error(error.message || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/super-admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Organization</h1>
            <p className="text-muted-foreground">Set up a new organization on the platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic details about the organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Corporation"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Subdomain field - only show for enterprise plans */}
              {isEnterprisePlan(plans.find(p => p.id === formData.planId)?.code || '') && (
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="subdomain"
                      value={formData.subdomain}
                      onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase() }))}
                      placeholder="acme"
                    />
                    <span className="text-muted-foreground whitespace-nowrap">.tenexa.com</span>
                  </div>
                  {errors.subdomain && <p className="text-sm text-destructive">{errors.subdomain}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the organization..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="contact@company.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Account */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>Create the first administrator for this organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Full Name *</Label>
                <Input
                  id="adminName"
                  value={formData.adminName}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                  placeholder="John Doe"
                />
                {errors.adminName && <p className="text-sm text-destructive">{errors.adminName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                  placeholder="admin@company.com"
                />
                {errors.adminEmail && <p className="text-sm text-destructive">{errors.adminEmail}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password *</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    placeholder="Min 8 characters"
                    className="min-h-[44px]"
                  />
                  {formData.adminPassword && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={`font-medium ${passwordStrength.score >= 60 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={passwordStrength.score} className={`h-1.5 ${passwordStrength.color}`} />
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          {formData.adminPassword.length >= 8 ? <Check className="h-3 w-3 text-emerald-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                          8+ characters
                        </div>
                        <div className="flex items-center gap-1">
                          {/[A-Z]/.test(formData.adminPassword) ? <Check className="h-3 w-3 text-emerald-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                          Uppercase
                        </div>
                        <div className="flex items-center gap-1">
                          {/[a-z]/.test(formData.adminPassword) ? <Check className="h-3 w-3 text-emerald-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                          Lowercase
                        </div>
                        <div className="flex items-center gap-1">
                          {/\d/.test(formData.adminPassword) ? <Check className="h-3 w-3 text-emerald-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                          Number
                        </div>
                      </div>
                    </div>
                  )}
                  {errors.adminPassword && <p className="text-sm text-destructive">{errors.adminPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                    className="min-h-[44px]"
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Choose a plan for this organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select value={formData.planId} onValueChange={handlePlanChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} ({plan.max_users === -1 ? 'Unlimited' : plan.max_users} users)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Maximum Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 5 }))}
                    min={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/super-admin')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Organization
            </Button>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
}
