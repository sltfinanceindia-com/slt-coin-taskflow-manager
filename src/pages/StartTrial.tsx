import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Sparkles,
  User,
  Building2,
  Settings,
  Rocket,
  Shield,
  Clock,
  CreditCard,
  Headphones
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';

const steps = [
  { id: 1, title: 'Your Info', icon: User },
  { id: 2, title: 'Company', icon: Building2 },
  { id: 3, title: 'Preferences', icon: Settings }
];

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' }
];

const industries = [
  { value: 'bpo', label: 'BPO / Call Center' },
  { value: 'it', label: 'IT / Software' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail / E-commerce' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance / Banking' },
  { value: 'education', label: 'Education' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' }
];

const modules = [
  { id: 'hr', label: 'HR Management', description: 'Employee directory, org chart, documents' },
  { id: 'attendance', label: 'Attendance Tracking', description: 'GPS check-in, shifts, overtime' },
  { id: 'projects', label: 'Project Management', description: 'Kanban, sprints, task tracking' },
  { id: 'payroll', label: 'Payroll Processing', description: 'Salary, tax, compliance' },
  { id: 'performance', label: 'Performance & OKRs', description: 'Goals, reviews, feedback' },
  { id: 'training', label: 'Training & Learning', description: 'Courses, assessments, certs' }
];

const trustBadges = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Clock, text: '14-day full access' },
  { icon: Headphones, text: 'Free onboarding session' },
  { icon: Shield, text: 'Cancel anytime' }
];

export default function StartTrial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    companySize: '',
    industry: '',
    selectedModules: ['hr', 'attendance'] as string[],
    agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.companySize) newErrors.companySize = 'Please select company size';
      if (!formData.industry) newErrors.industry = 'Please select industry';
    }

    if (step === 3) {
      if (formData.selectedModules.length === 0) newErrors.modules = 'Please select at least one module';
      if (!formData.agreeTerms) newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    
    try {
      // Save trial signup to database
      const { error } = await supabase
        .from('trial_signups')
        .insert({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          company_name: formData.companyName.trim(),
          company_size: formData.companySize,
          industry: formData.industry,
          selected_modules: formData.selectedModules,
          source: 'website',
          status: 'pending'
        });

      if (error) {
        console.error('Trial signup error:', error);
        throw new Error('Failed to submit trial signup');
      }
      
      // Trigger confetti on success
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Welcome to TeneXA! Your trial has been activated.');
      
      // Redirect to signup with email pre-filled
      setTimeout(() => {
        navigate(`/signup?email=${encodeURIComponent(formData.email)}`);
      }, 2000);
    } catch (error) {
      console.error('Trial submission error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  };

  const progress = (currentStep / 3) * 100;

  return (
    <>
      <SEOHead 
        title="Start Free Trial - Tenexa | 14-Day Full Access"
        description="Start your free 14-day TeneXA trial. No credit card required. Full access to all features including HR, attendance, projects, and payroll."
        keywords="free trial, TeneXA trial, HR software trial, workforce management trial"
        canonical="https://sltwork.lovable.app/start-trial"
      />
      <div className="min-h-screen bg-background">
        <PublicHeader />

        <main className="py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  14-Day Free Trial
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  Experience TeneXA{' '}
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Risk-Free
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Get started in minutes. No credit card required. Full access to all features.
                </p>
              </motion.div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                    >
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                        ${currentStep >= step.id 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-muted-foreground/30 text-muted-foreground'
                        }
                      `}>
                        {currentStep > step.id ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </span>
                      {index < steps.length - 1 && (
                        <div className="flex-1 mx-4 h-0.5 bg-muted">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Card */}
              <Card className="border-2">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl">
                    {currentStep === 1 && 'Tell Us About Yourself'}
                    {currentStep === 2 && 'About Your Company'}
                    {currentStep === 3 && 'Choose Your Modules'}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 && "We'll use this to set up your account"}
                    {currentStep === 2 && 'Help us customize your experience'}
                    {currentStep === 3 && 'Select the modules you want to start with'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Personal Info */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className={errors.fullName ? 'border-red-500' : ''}
                          />
                          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Work Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={errors.phone ? 'border-red-500' : ''}
                          />
                          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Company Info */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            placeholder="Acme Corporation"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className={errors.companyName ? 'border-red-500' : ''}
                          />
                          {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Company Size *</Label>
                          <Select
                            value={formData.companySize}
                            onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                          >
                            <SelectTrigger className={errors.companySize ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent>
                              {companySizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.companySize && <p className="text-sm text-red-500">{errors.companySize}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Industry *</Label>
                          <Select
                            value={formData.industry}
                            onValueChange={(value) => setFormData({ ...formData, industry: value })}
                          >
                            <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry.value} value={industry.value}>
                                  {industry.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Module Selection */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {modules.map((module) => (
                            <div
                              key={module.id}
                              onClick={() => toggleModule(module.id)}
                              className={`
                                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                ${formData.selectedModules.includes(module.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                                }
                              `}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={formData.selectedModules.includes(module.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <p className="font-medium">{module.label}</p>
                                  <p className="text-sm text-muted-foreground">{module.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {errors.modules && <p className="text-sm text-red-500">{errors.modules}</p>}

                        <div className="flex items-start gap-3 pt-4 border-t">
                          <Checkbox
                            id="terms"
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                          />
                        <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
                            I agree to the{' '}
                            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                          </Label>
                        </div>
                        {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className={currentStep === 1 ? 'invisible' : ''}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    {currentStep < 3 ? (
                      <Button onClick={handleNext}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Creating account...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            Start Free Trial
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <motion.div 
                className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {trustBadges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <badge.icon className="h-4 w-4 text-green-600" />
                    </div>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Already have an account */}
              <p className="text-center mt-8 text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
