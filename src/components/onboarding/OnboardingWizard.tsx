import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Plus,
  X,
  Rocket
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { organization, refreshOrganization } = useOrganization();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Company Profile
  const [companyData, setCompanyData] = useState({
    description: organization?.description || '',
    contact_email: organization?.contact_email || '',
    contact_phone: organization?.contact_phone || '',
    address: organization?.address || '',
  });
  
  // Step 2: Departments
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  
  // Step 3: Team Invites
  const [inviteEmails, setInviteEmails] = useState('');

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleSaveCompanyProfile = async () => {
    if (!organization?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          description: companyData.description,
          contact_email: companyData.contact_email,
          contact_phone: companyData.contact_phone,
          address: companyData.address,
        })
        .eq('id', organization.id);

      if (error) throw error;
      
      refreshOrganization();
      setCurrentStep(2);
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save company profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setDepartments(departments.filter(d => d !== dept));
  };

  const handleSendInvites = async () => {
    if (!inviteEmails.trim()) {
      setCurrentStep(4);
      return;
    }
    
    setIsLoading(true);
    try {
      const emails = inviteEmails.split(/[,\n]/).map(e => e.trim()).filter(e => e);
      
      // Create invitations for each email
      for (const email of emails) {
        const { error } = await supabase
          .from('organization_invitations')
          .insert({
            organization_id: organization?.id,
            email,
            role: 'intern',
            invited_by: profile?.id,
          });
          
        if (error && !error.message.includes('duplicate')) {
          console.error('Error inviting:', email, error);
        }
      }
      
      toast({
        title: 'Invitations Sent',
        description: `${emails.length} invitation(s) have been sent.`,
      });
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error sending invites:', error);
      toast({
        title: 'Error',
        description: 'Failed to send some invitations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    toast({
      title: 'Welcome to Tenexa!',
      description: 'Your organization is all set up. Start exploring!',
    });
    onComplete();
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Complete Your Company Profile</h2>
              <p className="text-muted-foreground mt-2">
                Let's add some details about your organization
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  placeholder="Brief description of your organization"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={companyData.contact_email}
                    onChange={(e) => setCompanyData({ ...companyData, contact_email: e.target.value })}
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={companyData.contact_phone}
                    onChange={(e) => setCompanyData({ ...companyData, contact_phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  placeholder="Company address"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => handleComplete()}>
                Skip for now
              </Button>
              <Button onClick={handleSaveCompanyProfile} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Continue'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Set Up Departments</h2>
              <p className="text-muted-foreground mt-2">
                Add the main departments in your organization
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Enter department name"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
                />
                <Button onClick={handleAddDepartment} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 min-h-[60px] p-4 border rounded-lg bg-muted/50">
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <Badge key={dept} variant="secondary" className="px-3 py-1 text-sm">
                      {dept}
                      <button
                        onClick={() => handleRemoveDepartment(dept)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No departments added yet. Try: Sales, Marketing, Engineering, HR
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                  Skip
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Invite Your Team</h2>
              <p className="text-muted-foreground mt-2">
                Add team members by entering their email addresses
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <Textarea
                  id="emails"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="Enter email addresses separated by commas or new lines"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Example: john@company.com, jane@company.com
                </p>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setCurrentStep(4)}>
                  Skip
                </Button>
                <Button onClick={handleSendInvites} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Invites'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <Rocket className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">You're All Set!</h2>
              <p className="text-muted-foreground mt-2">
                Your organization is ready to go. Here's what you can do next:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Manage Team</h4>
                    <p className="text-sm text-muted-foreground">Add and manage your team members</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Create Training</h4>
                    <p className="text-sm text-muted-foreground">Build training modules for your team</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <Button onClick={handleComplete} size="lg" className="mt-6">
              <Check className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">Step {currentStep} of {totalSteps}</Badge>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>
        <CardContent className="pt-4">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}