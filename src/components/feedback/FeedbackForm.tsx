import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FeedbackFormData, ScratchCard } from '@/types/feedback';
import ProgressBar from './ProgressBar';
import ScratchCardComponent from './ScratchCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Star, ArrowLeft, ArrowRight, Send } from 'lucide-react';

const TOTAL_SECTIONS = 12;

interface FeedbackFormProps {
  userEmail?: string;
  userName?: string;
}

export default function FeedbackForm({ userEmail, userName }: FeedbackFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<Partial<FeedbackFormData>>({
    features: {
      tasks: {},
      coins: {},
      communication: {},
      workforce: {},
      performance: {},
      training: {},
      analytics: {},
      admin: {}
    },
    email: userEmail || '',
    name: userName || ''
  });
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [scratchCard, setScratchCard] = useState<ScratchCard | null>(null);
  const [startTime] = useState(Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Check for existing submission on mount
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (!userEmail) {
        setCheckingExisting(false);
        return;
      }

      try {
        // Check if user already submitted feedback
        const { data: existingFeedback, error: feedbackError } = await supabase
          .from('feedback_responses')
          .select('id')
          .eq('user_email', userEmail)
          .limit(1)
          .maybeSingle();

        if (feedbackError) {
          console.error('Error checking existing feedback:', feedbackError);
          setCheckingExisting(false);
          return;
        }

        if (existingFeedback) {
          // User already submitted, check for their scratch card
          const { data: existingCard, error: cardError } = await supabase
            .from('scratch_cards')
            .select('*')
            .eq('feedback_response_id', existingFeedback.id)
            .maybeSingle();

          if (cardError) {
            console.error('Error fetching scratch card:', cardError);
          }

          if (existingCard) {
            setScratchCard(existingCard);
            setSubmitted(true);
            localStorage.removeItem('slt_feedback_draft');
            toast.info('You have already submitted feedback. Here is your scratch card!');
          }
        }
      } catch (error) {
        console.error('Error checking existing submission:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingSubmission();
  }, [userEmail]);

  // Auto-save to localStorage (only if not already submitted)
  useEffect(() => {
    if (submitted || checkingExisting) return;
    
    const saved = localStorage.getItem('slt_feedback_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore section progress
        if (parsed.currentSection && parsed.currentSection > 1) {
          setCurrentSection(parsed.currentSection);
        }
        setFormData(parsed.formData || parsed);
        toast.info('Draft restored - continue where you left off');
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [submitted, checkingExisting]);

  useEffect(() => {
    if (submitted || checkingExisting) return;
    
    if (Object.keys(formData).length > 0) {
      // Save both form data and current section
      localStorage.setItem('slt_feedback_draft', JSON.stringify({
        formData,
        currentSection
      }));
    }
  }, [formData, currentSection, submitted, checkingExisting]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateFeatureField = (category: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [category]: {
          ...prev.features?.[category],
          [field]: value
        }
      }
    }));
  };

  const validateSection = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentSection) {
      case 1:
        if (!formData.role) newErrors.role = 'Please select your role';
        if (!formData.companySize) newErrors.companySize = 'Please select company size';
        if (!formData.industry) newErrors.industry = 'Please select industry';
        if (!formData.usageDuration) newErrors.usageDuration = 'Please select usage duration';
        break;
      case 2:
        if (!formData.overall_satisfaction) newErrors.overall_satisfaction = 'Please rate your satisfaction';
        if (formData.nps_score === undefined) newErrors.nps_score = 'Please provide NPS score';
        break;
      case 12:
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.name) newErrors.name = 'Name is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextSection = () => {
    if (!validateSection()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (currentSection < TOTAL_SECTIONS) {
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submitFeedback = async () => {
    if (!validateSection()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const completionTime = Math.floor((Date.now() - startTime) / 1000);

      // Submit feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_responses')
        .insert({
          user_email: formData.email as string,
          user_name: formData.name as string,
          user_phone: formData.phone || null,
          response_data: formData as any,
          completion_time_seconds: completionTime,
          referral_source: formData.referral_source || null,
          referred_by_name: formData.referred_by_name || null,
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;

      // Generate scratch card
      const { data: cardData, error: cardError } = await supabase
        .rpc('generate_scratch_card', {
          p_feedback_response_id: feedbackData.id,
          p_user_email: formData.email!,
          p_user_name: formData.name!,
          p_user_phone: formData.phone || null,
        })
        .single();

      if (cardError) throw cardError;

      // Fetch full card details
      const { data: fullCard } = await supabase
        .from('scratch_cards')
        .select('*')
        .eq('id', cardData.card_id)
        .single();

      setScratchCard(fullCard);
      setSubmitted(true);
      localStorage.removeItem('slt_feedback_draft');

      toast.success('Feedback submitted successfully! 🎉');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Failed to submit: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking for existing submission
  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600" />
          <p className="text-lg text-muted-foreground">Checking your submission status...</p>
        </div>
      </div>
    );
  }

  if (submitted && scratchCard) {
    return <ScratchCardComponent card={scratchCard} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-muted/30 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressBar current={currentSection} total={TOTAL_SECTIONS} />

        <Card className="mt-4 sm:mt-8 shadow-xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400">
              SLT Work Hub Feedback Survey
            </CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
              Section {currentSection} of {TOTAL_SECTIONS} • Estimated time: ~15 minutes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
            {renderSection()}

            <div className="flex flex-col sm:flex-row justify-between pt-4 sm:pt-6 border-t gap-3 sm:gap-4">
              {currentSection > 1 && (
                <Button variant="outline" onClick={prevSection} className="w-full sm:flex-1 sm:max-w-[200px] order-2 sm:order-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentSection < TOTAL_SECTIONS ? (
                <Button onClick={nextSection} className="w-full sm:flex-1 sm:max-w-[200px] sm:ml-auto order-1 sm:order-2">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={submitFeedback} 
                  disabled={loading}
                  className="w-full sm:flex-1 sm:max-w-[200px] sm:ml-auto bg-green-600 hover:bg-green-700 order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Submit & Claim Reward</span>
                      <span className="sm:hidden">Submit</span>
                      <Send className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  function renderSection() {
    switch (currentSection) {
      case 1: return renderUserProfile();
      case 2: return renderOverallExperience();
      case 3: return renderOnboarding();
      case 4: return renderFeatureRatings();
      case 5: return renderUsability();
      case 6: return renderPainPoints();
      case 7: return renderFeatureRequests();
      case 8: return renderComparison();
      case 9: return renderPricing();
      case 10: return renderFinalThoughts();
      case 11: return renderReferralSource();
      case 12: return renderFollowUp();
      default: return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 1: USER PROFILE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderUserProfile() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">About You</h3>

        <div className="space-y-2">
          <Label>What is your role? *</Label>
          <RadioGroup value={formData.role} onValueChange={(v) => updateField('role', v)}>
            {[
              { value: 'super_admin', label: 'Super Admin / Platform Owner' },
              { value: 'org_admin', label: 'Organization Admin' },
              { value: 'manager', label: 'Manager / Team Lead' },
              { value: 'employee', label: 'Employee / Team Member' },
              { value: 'intern', label: 'Intern' }
            ].map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
        </div>

        <div className="space-y-2">
          <Label>Company Size *</Label>
          <RadioGroup value={formData.companySize} onValueChange={(v) => updateField('companySize', v)}>
            {['1-10', '11-50', '51-200', '201-500', '500+'].map(size => (
              <div key={size} className="flex items-center space-x-2">
                <RadioGroupItem value={size} id={`size-${size}`} />
                <Label htmlFor={`size-${size}`} className="cursor-pointer">{size} employees</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.companySize && <p className="text-sm text-red-600">{errors.companySize}</p>}
        </div>

        <div className="space-y-2">
          <Label>Industry *</Label>
          <RadioGroup value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
            {[
              'Technology / IT',
              'Finance / Accounting',
              'Education / Training',
              'Healthcare',
              'Manufacturing',
              'Retail / E-commerce',
              'Consulting / Services',
              'Other'
            ].map(industry => (
              <div key={industry} className="flex items-center space-x-2">
                <RadioGroupItem value={industry} id={`industry-${industry}`} />
                <Label htmlFor={`industry-${industry}`} className="cursor-pointer">{industry}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.industry && <p className="text-sm text-red-600">{errors.industry}</p>}
        </div>

        <div className="space-y-2">
          <Label>How long have you been using SLT Work Hub? *</Label>
          <RadioGroup value={formData.usageDuration} onValueChange={(v) => updateField('usageDuration', v)}>
            {[
              'Less than 1 week',
              '1-2 weeks',
              '2-4 weeks',
              'More than 1 month'
            ].map(duration => (
              <div key={duration} className="flex items-center space-x-2">
                <RadioGroupItem value={duration} id={`duration-${duration}`} />
                <Label htmlFor={`duration-${duration}`} className="cursor-pointer">{duration}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.usageDuration && <p className="text-sm text-red-600">{errors.usageDuration}</p>}
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 2: OVERALL EXPERIENCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderOverallExperience() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Overall Experience</h3>

        <div className="space-y-2">
          <Label>Overall, how satisfied are you with SLT Work Hub? *</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => updateField('overall_satisfaction', rating)}
                className={`text-4xl transition-all ${
                  formData.overall_satisfaction && formData.overall_satisfaction >= rating
                    ? 'text-yellow-400 scale-110'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">1 = Very Unsatisfied, 5 = Very Satisfied</p>
          {errors.overall_satisfaction && <p className="text-sm text-red-600">{errors.overall_satisfaction}</p>}
        </div>

        <div className="space-y-2">
          <Label>How likely are you to recommend SLT Work Hub to other companies? *</Label>
          <p className="text-xs text-muted-foreground mb-2">0 = Not Likely, 10 = Extremely Likely</p>
          <div className="flex gap-1 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
              <button
                key={score}
                type="button"
                onClick={() => updateField('nps_score', score)}
                className={`w-10 h-10 rounded border font-semibold transition-all ${
                  formData.nps_score === score
                    ? 'bg-indigo-600 text-white border-indigo-600 scale-110'
                    : 'bg-card text-foreground border-border hover:border-indigo-400'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
          {errors.nps_score && <p className="text-sm text-red-600">{errors.nps_score}</p>}
        </div>

        <div className="space-y-2">
          <Label>Compared to other tools you've used, SLT Work Hub is:</Label>
          <RadioGroup value={formData.comparison} onValueChange={(v) => updateField('comparison', v)}>
            {[
              'Much better',
              'Somewhat better',
              'About the same',
              'Somewhat worse',
              'Much worse',
              'This is my first tool of this type'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`comparison-${option}`} />
                <Label htmlFor={`comparison-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>What was your first impression when you logged in?</Label>
          <RadioGroup value={formData.first_impression} onValueChange={(v) => updateField('first_impression', v)}>
            {[
              'Excited and eager to explore',
              'Confused, didn\'t know where to start',
              'Overwhelmed by too many features',
              'Clean and easy to understand',
              'Professional and trustworthy'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`impression-${option}`} />
                <Label htmlFor={`impression-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 3: ONBOARDING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderOnboarding() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Onboarding & Setup</h3>

        <div className="space-y-2">
          <Label>How easy was it to sign up and create your organization?</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => updateField('signup_ease', rating)}
                className={`text-4xl transition-all ${
                  formData.signup_ease && formData.signup_ease >= rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">1 = Very Difficult, 5 = Very Easy</p>
        </div>

        <div className="space-y-2">
          <Label>Did you complete the onboarding wizard?</Label>
          <RadioGroup value={formData.wizard_completion} onValueChange={(v) => updateField('wizard_completion', v)}>
            {[
              'Yes, it was helpful',
              'Yes, but I skipped most steps',
              'No, I closed it immediately',
              'There was no onboarding wizard'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`wizard-${option}`} />
                <Label htmlFor={`wizard-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>How long did it take you to add your first employee/create your first task?</Label>
          <RadioGroup value={formData.time_to_first_action} onValueChange={(v) => updateField('time_to_first_action', v)}>
            {[
              'Less than 5 minutes',
              '5-15 minutes',
              '15-30 minutes',
              'More than 30 minutes',
              'Haven\'t done this yet'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`time-${option}`} />
                <Label htmlFor={`time-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>What would have made onboarding easier?</Label>
          <Textarea
            placeholder="Share your thoughts..."
            value={formData.onboarding_feedback || ''}
            onChange={(e) => updateField('onboarding_feedback', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.onboarding_feedback || '').length}/500
          </p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 4: FEATURE RATINGS (THE BIG ONE)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderFeatureRatings() {
    const StarRating = ({ value, onChange, label }: any) => (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm text-foreground font-medium">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              className={`text-2xl ${
                value && value >= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'
              }`}
            >
              ★
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange(-1)}
            className="ml-2 text-xs text-muted-foreground hover:text-foreground"
          >
            N/A
          </button>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Feature Ratings</h3>
        <p className="text-sm text-muted-foreground">
          Rate the features you've used. Select N/A if you haven't tried it yet.
        </p>

        {/* A. TASK MANAGEMENT */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">📋 Task Management</h4>
          <StarRating
            label="Kanban Board (drag & drop)"
            value={formData.features?.tasks?.kanban}
            onChange={(v: number) => updateFeatureField('tasks', 'kanban', v)}
          />
          <StarRating
            label="Task Creation & Assignment"
            value={formData.features?.tasks?.creation}
            onChange={(v: number) => updateFeatureField('tasks', 'creation', v)}
          />
          <StarRating
            label="Task Priority & Status Tracking"
            value={formData.features?.tasks?.priority}
            onChange={(v: number) => updateFeatureField('tasks', 'priority', v)}
          />
          <StarRating
            label="Task Comments & Collaboration"
            value={formData.features?.tasks?.comments}
            onChange={(v: number) => updateFeatureField('tasks', 'comments', v)}
          />
          <StarRating
            label="Time Logging on Tasks"
            value={formData.features?.tasks?.timeLog}
            onChange={(v: number) => updateFeatureField('tasks', 'timeLog', v)}
          />
          <div className="mt-3">
            <Label className="text-sm">What would make task management better?</Label>
            <Textarea
              placeholder="Your suggestions..."
              value={formData.features?.tasks?.feedback || ''}
              onChange={(e) => updateFeatureField('tasks', 'feedback', e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>

        {/* B. COIN SYSTEM */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">🪙 SLT Coin System</h4>
          <StarRating
            label="Earning coins for completed tasks"
            value={formData.features?.coins?.earning}
            onChange={(v: number) => updateFeatureField('coins', 'earning', v)}
          />
          <StarRating
            label="Leaderboard & Rankings"
            value={formData.features?.coins?.leaderboard}
            onChange={(v: number) => updateFeatureField('coins', 'leaderboard', v)}
          />
          <StarRating
            label="Understanding coin value/conversion"
            value={formData.features?.coins?.value}
            onChange={(v: number) => updateFeatureField('coins', 'value', v)}
          />
          <div className="mt-3 space-y-2">
            <Label>Does the coin system motivate you?</Label>
            <RadioGroup 
              value={formData.features?.coins?.motivation} 
              onValueChange={(v) => updateFeatureField('coins', 'motivation', v)}
            >
              {['Yes, very motivating', 'Somewhat motivating', 'Neutral', 'Not really motivating', 'Makes no difference'].map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`coin-mot-${opt}`} />
                  <Label htmlFor={`coin-mot-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-3">
            <Label className="text-sm">Coin system improvements?</Label>
            <Textarea
              placeholder="Your suggestions..."
              value={formData.features?.coins?.feedback || ''}
              onChange={(e) => updateFeatureField('coins', 'feedback', e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>

        {/* C. COMMUNICATION */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">💬 Team Communication</h4>
          <StarRating
            label="Direct Messaging"
            value={formData.features?.communication?.directMessage}
            onChange={(v: number) => updateFeatureField('communication', 'directMessage', v)}
          />
          <StarRating
            label="Channel-based Conversations"
            value={formData.features?.communication?.channels}
            onChange={(v: number) => updateFeatureField('communication', 'channels', v)}
          />
          <StarRating
            label="Online/Offline Status"
            value={formData.features?.communication?.status}
            onChange={(v: number) => updateFeatureField('communication', 'status', v)}
          />
          <StarRating
            label="File Sharing in Messages"
            value={formData.features?.communication?.fileSharing}
            onChange={(v: number) => updateFeatureField('communication', 'fileSharing', v)}
          />
          <div className="mt-3 space-y-2">
            <Label>Do you prefer SLT chat over WhatsApp/Slack for work?</Label>
            <RadioGroup 
              value={formData.features?.communication?.preference} 
              onValueChange={(v) => updateFeatureField('communication', 'preference', v)}
            >
              {['Yes, definitely', 'Sometimes', 'No, still using WhatsApp/Slack', 'Haven\'t tried the chat yet'].map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`comm-pref-${opt}`} />
                  <Label htmlFor={`comm-pref-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-3">
            <Label className="text-sm">Communication improvements?</Label>
            <Textarea
              placeholder="Your suggestions..."
              value={formData.features?.communication?.feedback || ''}
              onChange={(e) => updateFeatureField('communication', 'feedback', e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>

        {/* D. WORKFORCE MANAGEMENT */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">👥 Workforce Management</h4>
          <StarRating
            label="Attendance (Clock in/out with geo-fencing)"
            value={formData.features?.workforce?.attendance}
            onChange={(v: number) => updateFeatureField('workforce', 'attendance', v)}
          />
          <StarRating
            label="Leave Management (Requests & Approvals)"
            value={formData.features?.workforce?.leave}
            onChange={(v: number) => updateFeatureField('workforce', 'leave', v)}
          />
          <StarRating
            label="Shift Scheduling"
            value={formData.features?.workforce?.shifts}
            onChange={(v: number) => updateFeatureField('workforce', 'shifts', v)}
          />
          <StarRating
            label="WFH (Work From Home) Tracking"
            value={formData.features?.workforce?.wfh}
            onChange={(v: number) => updateFeatureField('workforce', 'wfh', v)}
          />
          <div className="mt-3 space-y-2">
            <Label>Which workforce feature is most valuable to you?</Label>
            <RadioGroup 
              value={formData.features?.workforce?.mostValuable} 
              onValueChange={(v) => updateFeatureField('workforce', 'mostValuable', v)}
            >
              {['Attendance', 'Leave Management', 'Shift Scheduling', 'WFH Tracking', 'None of them'].map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`workforce-val-${opt}`} />
                  <Label htmlFor={`workforce-val-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-3">
            <Label className="text-sm">What's missing in workforce management?</Label>
            <Textarea
              placeholder="Your suggestions..."
              value={formData.features?.workforce?.feedback || ''}
              onChange={(e) => updateFeatureField('workforce', 'feedback', e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>

        {/* E. PERFORMANCE MANAGEMENT */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">📊 Performance Management</h4>
          <StarRating
            label="OKR (Objectives & Key Results) Tracking"
            value={formData.features?.performance?.okr}
            onChange={(v: number) => updateFeatureField('performance', 'okr', v)}
          />
          <StarRating
            label="360° Feedback & Peer Reviews"
            value={formData.features?.performance?.feedback360}
            onChange={(v: number) => updateFeatureField('performance', 'feedback360', v)}
          />
          <StarRating
            label="One-on-One Meetings"
            value={formData.features?.performance?.oneOnOne}
            onChange={(v: number) => updateFeatureField('performance', 'oneOnOne', v)}
          />
          <StarRating
            label="Performance Improvement Plans (PIP)"
            value={formData.features?.performance?.pip}
            onChange={(v: number) => updateFeatureField('performance', 'pip', v)}
          />
          <div className="mt-3 space-y-2">
            <Label>Are performance features helping you manage your team better?</Label>
            <RadioGroup 
              value={formData.features?.performance?.helpfulness} 
              onValueChange={(v) => updateFeatureField('performance', 'helpfulness', v)}
            >
              {['Yes, significantly', 'Yes, somewhat', 'Not really', 'Haven\'t used them yet'].map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`perf-help-${opt}`} />
                  <Label htmlFor={`perf-help-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-3">
            <Label className="text-sm">Performance management improvements?</Label>
            <Textarea
              placeholder="Your suggestions..."
              value={formData.features?.performance?.feedback || ''}
              onChange={(e) => updateFeatureField('performance', 'feedback', e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>

        {/* F. TRAINING CENTER */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">🎓 Training Center</h4>
          <StarRating
            label="Course Creation & Management"
            value={formData.features?.training?.courseManagement}
            onChange={(v: number) => updateFeatureField('training', 'courseManagement', v)}
          />
          <StarRating
            label="Video Training Modules"
            value={formData.features?.training?.videoModules}
            onChange={(v: number) => updateFeatureField('training', 'videoModules', v)}
          />
          <StarRating
            label="Assessments & Quizzes"
            value={formData.features?.training?.assessments}
            onChange={(v: number) => updateFeatureField('training', 'assessments', v)}
          />
          <StarRating
            label="Progress Tracking & Certificates"
            value={formData.features?.training?.progress}
            onChange={(v: number) => updateFeatureField('training', 'progress', v)}
          />
          <div className="mt-3 space-y-2">
            <Label>Would you use SLT Work Hub as your primary training platform?</Label>
            <RadioGroup 
              value={formData.features?.training?.primaryPlatform} 
              onValueChange={(v) => updateFeatureField('training', 'primaryPlatform', v)}
            >
              {['Yes, definitely', 'Yes, for some training', 'No, we use other platforms', 'Haven\'t explored training yet'].map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`train-prim-${opt}`} />
                  <Label htmlFor={`train-prim-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-3">
            <Label className="text-sm">Missing training features?</Label>
            <Textarea
              placeholder="Your suggestions..."
              value={formData.features?.training?.feedback || ''}
              onChange={(e) => updateFeatureField('training', 'feedback', e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>

        {/* G. ANALYTICS & REPORTING */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">📈 Analytics & Reporting</h4>
          <StarRating
            label="Dashboard Widgets & Metrics"
            value={formData.features?.analytics?.dashboard}
            onChange={(v: number) => updateFeatureField('analytics', 'dashboard', v)}
          />
          <StarRating
            label="Task Analytics"
            value={formData.features?.analytics?.taskAnalytics}
            onChange={(v: number) => updateFeatureField('analytics', 'taskAnalytics', v)}
          />
          <StarRating
            label="Time Tracking Insights"
            value={formData.features?.analytics?.timeTracking}
            onChange={(v: number) => updateFeatureField('analytics', 'timeTracking', v)}
          />
          <div className="mt-3 space-y-2">
            <Label>Are the reports giving you useful insights?</Label>
            <RadioGroup 
              value={formData.features?.analytics?.usefulness} 
              onValueChange={(v) => updateFeatureField('analytics', 'usefulness', v)}
            >
              {['Yes, very useful', 'Somewhat useful', 'Not really useful', 'Haven\'t checked reports yet'].map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`analytics-use-${opt}`} />
                  <Label htmlFor={`analytics-use-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-3">
            <Label className="text-sm">Missing reports or analytics?</Label>
            <Textarea
              placeholder="Your suggestions..."
              value={formData.features?.analytics?.feedback || ''}
              onChange={(e) => updateFeatureField('analytics', 'feedback', e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>

        {/* H. ADMIN FEATURES */}
        {(formData.role === 'super_admin' || formData.role === 'org_admin' || formData.role === 'manager') && (
          <div className="border border-border rounded-lg p-4 bg-muted/50">
            <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">⚙️ Admin Features</h4>
            <StarRating
              label="Employee Management"
              value={formData.features?.admin?.employeeManagement}
              onChange={(v: number) => updateFeatureField('admin', 'employeeManagement', v)}
            />
            <StarRating
              label="Announcements"
              value={formData.features?.admin?.announcements}
              onChange={(v: number) => updateFeatureField('admin', 'announcements', v)}
            />
            <StarRating
              label="User Role Management"
              value={formData.features?.admin?.roleManagement}
              onChange={(v: number) => updateFeatureField('admin', 'roleManagement', v)}
            />
            <StarRating
              label="Organization Settings"
              value={formData.features?.admin?.orgSettings}
              onChange={(v: number) => updateFeatureField('admin', 'orgSettings', v)}
            />
            {formData.role === 'super_admin' && (
              <StarRating
                label="Multi-Organization Management"
                value={formData.features?.admin?.multiOrg}
                onChange={(v: number) => updateFeatureField('admin', 'multiOrg', v)}
              />
            )}
            <div className="mt-3">
              <Label className="text-sm">What admin features would make your job easier?</Label>
              <Textarea
                placeholder="Your suggestions..."
                value={formData.features?.admin?.feedback || ''}
                onChange={(e) => updateFeatureField('admin', 'feedback', e.target.value)}
                rows={2}
                maxLength={300}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 5: USABILITY & DESIGN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderUsability() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Usability & Design</h3>

        <div className="space-y-2">
          <Label>How easy is it to navigate SLT Work Hub?</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => updateField('navigation_ease', rating)}
                className={`text-4xl ${
                  formData.navigation_ease && formData.navigation_ease >= rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">1 = Very Confusing, 5 = Very Intuitive</p>
        </div>

        <div className="space-y-2">
          <Label>How do you feel about the overall design/look?</Label>
          <RadioGroup value={formData.design_feeling} onValueChange={(v) => updateField('design_feeling', v)}>
            {[
              'Love it, modern and clean',
              'Like it, professional',
              'Neutral, it\'s fine',
              'Needs improvement',
              'Don\'t like it, feels outdated'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`design-${option}`} />
                <Label htmlFor={`design-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Mobile Experience (if you've used on phone/tablet)</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => updateField('mobile_experience', rating)}
                className={`text-4xl ${
                  formData.mobile_experience && formData.mobile_experience >= rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ★
              </button>
            ))}
            <button
              type="button"
              onClick={() => updateField('mobile_experience', -1)}
              className="ml-2 text-sm text-muted-foreground hover:text-gray-700"
            >
              N/A
            </button>
          </div>
          <p className="text-xs text-muted-foreground">1 = Very Poor, 5 = Excellent</p>
        </div>

        <div className="space-y-2">
          <Label>Page Load Speed</Label>
          <RadioGroup value={formData.load_speed} onValueChange={(v) => updateField('load_speed', v)}>
            {[
              'Very fast',
              'Fast enough',
              'Acceptable',
              'Sometimes slow',
              'Often slow/frustrating'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`speed-${option}`} />
                <Label htmlFor={`speed-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Which part of the interface is most confusing?</Label>
          <Textarea
            placeholder="Tell us what confused you..."
            value={formData.confusing_parts || ''}
            onChange={(e) => updateField('confusing_parts', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.confusing_parts || '').length}/500
          </p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 6: PAIN POINTS & BUGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderPainPoints() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Pain Points & Bugs</h3>

        <div className="space-y-2">
          <Label>Have you encountered any bugs or errors?</Label>
          <RadioGroup value={formData.encountered_bugs} onValueChange={(v) => updateField('encountered_bugs', v)}>
            {[
              'Yes, many',
              'Yes, a few',
              'One or two minor issues',
              'No bugs'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`bugs-${option}`} />
                <Label htmlFor={`bugs-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.encountered_bugs && formData.encountered_bugs !== 'No bugs' && (
          <div className="space-y-2">
            <Label>Please describe the bug(s) you encountered</Label>
            <Textarea
              placeholder="What were you doing? What happened? What did you expect to happen?"
              value={formData.bug_description || ''}
              onChange={(e) => updateField('bug_description', e.target.value)}
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(formData.bug_description || '').length}/1000
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Was there anything that frustrated you?</Label>
          <Textarea
            placeholder="Share your frustrations..."
            value={formData.frustrations || ''}
            onChange={(e) => updateField('frustrations', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.frustrations || '').length}/500
          </p>
        </div>

        <div className="space-y-2">
          <Label>Did you get stuck or confused at any point?</Label>
          <RadioGroup 
            value={formData.got_stuck?.toString()} 
            onValueChange={(v) => updateField('got_stuck', v === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="stuck-yes" />
              <Label htmlFor="stuck-yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="stuck-no" />
              <Label htmlFor="stuck-no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.got_stuck && (
          <div className="space-y-2">
            <Label>Where did you get stuck?</Label>
            <Textarea
              placeholder="Describe where and why you got stuck..."
              value={formData.stuck_where || ''}
              onChange={(e) => updateField('stuck_where', e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>
        )}
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 7: FEATURE REQUESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderFeatureRequests() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Feature Requests</h3>

        <div className="space-y-2">
          <Label>What feature is SLT Work Hub missing that you need?</Label>
          <Textarea
            placeholder="Describe the missing feature(s)..."
            value={formData.missing_features || ''}
            onChange={(e) => updateField('missing_features', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.missing_features || '').length}/500
          </p>
        </div>

        <div className="space-y-2">
          <Label>If you could add ONE feature right now, what would it be? *</Label>
          <Textarea
            placeholder="Your #1 feature request..."
            value={formData.one_feature || ''}
            onChange={(e) => updateField('one_feature', e.target.value)}
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.one_feature || '').length}/300
          </p>
        </div>

        <div className="space-y-2">
          <Label>Which existing feature should we prioritize improving?</Label>
          <Textarea
            placeholder="Which feature needs the most improvement?"
            value={formData.priority_improvement || ''}
            onChange={(e) => updateField('priority_improvement', e.target.value)}
            rows={3}
            maxLength={300}
          />
        </div>

        <div className="space-y-2">
          <Label>Are there any features you DON'T use and probably won't use?</Label>
          <Textarea
            placeholder="Tell us about unused features..."
            value={formData.unused_features || ''}
            onChange={(e) => updateField('unused_features', e.target.value)}
            rows={3}
            maxLength={300}
          />
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 8: COMPARISON & VALUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderComparison() {
    const tools = [
      'Excel/Google Sheets',
      'Trello/Asana/Monday.com',
      'Slack/Microsoft Teams',
      'HR software (BambooHR, Zoho People, etc.)',
      'Custom in-house solution',
      'No formal tools',
      'Other'
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Comparison & Value</h3>

        <div className="space-y-2">
          <Label>What tools were you using before SLT Work Hub? (Select all that apply)</Label>
          <div className="space-y-2">
            {tools.map(tool => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={`tool-${tool}`}
                  checked={formData.previous_tools?.includes(tool)}
                  onCheckedChange={(checked) => {
                    const current = formData.previous_tools || [];
                    updateField(
                      'previous_tools',
                      checked
                        ? [...current, tool]
                        : current.filter(t => t !== tool)
                    );
                  }}
                />
                <Label htmlFor={`tool-${tool}`} className="cursor-pointer">{tool}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Has SLT Work Hub replaced any of those tools?</Label>
          <RadioGroup value={formData.replaced_tools} onValueChange={(v) => updateField('replaced_tools', v)}>
            {[
              'Yes, completely replaced them',
              'Partially, still using some others',
              'No, we\'re using both',
              'Too early to tell'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`replaced-${option}`} />
                <Label htmlFor={`replaced-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>What does SLT Work Hub do BETTER than other tools? *</Label>
          <Textarea
            placeholder="What are our strengths?"
            value={formData.does_better || ''}
            onChange={(e) => updateField('does_better', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.does_better || '').length}/500
          </p>
        </div>

        <div className="space-y-2">
          <Label>What do other tools do BETTER than SLT Work Hub? *</Label>
          <Textarea
            placeholder="Where can we improve?"
            value={formData.others_do_better || ''}
            onChange={(e) => updateField('others_do_better', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.others_do_better || '').length}/500
          </p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 9: PRICING & BUSINESS DECISION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderPricing() {
    const upgradeOptions = [
      'More users',
      'Advanced analytics',
      'Integrations (Slack, Google, etc.)',
      'Priority support',
      'Custom branding',
      'Data export',
      'API access',
      'None of the above'
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Pricing & Business Decision</h3>

        <div className="space-y-2">
          <Label>Would your organization pay for SLT Work Hub?</Label>
          <RadioGroup value={formData.would_pay} onValueChange={(v) => updateField('would_pay', v)}>
            {[
              'Yes, definitely',
              'Yes, if priced right',
              'Maybe',
              'Probably not',
              'No'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`pay-${option}`} />
                <Label htmlFor={`pay-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>What would be a fair monthly price per user?</Label>
          <RadioGroup value={formData.fair_price} onValueChange={(v) => updateField('fair_price', v)}>
            {[
              '₹100-200 per user',
              '₹200-400 per user',
              '₹400-600 per user',
              '₹600-1000 per user',
              'Prefer one-time payment',
              'Should be free'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`price-${option}`} />
                <Label htmlFor={`price-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Which pricing model would you prefer?</Label>
          <RadioGroup value={formData.pricing_model} onValueChange={(v) => updateField('pricing_model', v)}>
            {[
              'Per user per month',
              'Flat fee for unlimited users',
              'Freemium (free tier + paid features)',
              'One-time purchase',
              'Pay based on company size'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`model-${option}`} />
                <Label htmlFor={`model-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Would you upgrade to a paid plan for: (Select all that apply)</Label>
          <div className="space-y-2">
            {upgradeOptions.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`upgrade-${option}`}
                  checked={formData.upgrade_for?.includes(option)}
                  onCheckedChange={(checked) => {
                    const current = formData.upgrade_for || [];
                    updateField(
                      'upgrade_for',
                      checked
                        ? [...current, option]
                        : current.filter(o => o !== option)
                    );
                  }}
                />
                <Label htmlFor={`upgrade-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 10: FINAL THOUGHTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderFinalThoughts() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Final Thoughts</h3>

        <div className="space-y-2">
          <Label>What do you LOVE most about SLT Work Hub? *</Label>
          <Textarea
            placeholder="What's your favorite thing?"
            value={formData.love_most || ''}
            onChange={(e) => updateField('love_most', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.love_most || '').length}/500
          </p>
        </div>

        <div className="space-y-2">
          <Label>What is your BIGGEST complaint? *</Label>
          <Textarea
            placeholder="What frustrates you the most?"
            value={formData.biggest_complaint || ''}
            onChange={(e) => updateField('biggest_complaint', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.biggest_complaint || '').length}/500
          </p>
        </div>

        <div className="space-y-2">
          <Label>Complete this sentence: "I would use SLT Work Hub every day if it could..." *</Label>
          <Textarea
            placeholder="Finish the sentence..."
            value={formData.would_use_if || ''}
            onChange={(e) => updateField('would_use_if', e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.would_use_if || '').length}/500
          </p>
        </div>

        <div className="space-y-2">
          <Label>Any other feedback, suggestions, or comments?</Label>
          <Textarea
            placeholder="Anything else you'd like to share..."
            value={formData.other_feedback || ''}
            onChange={(e) => updateField('other_feedback', e.target.value)}
            rows={6}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.other_feedback || '').length}/1000
          </p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 11: HOW DID YOU HEAR ABOUT US
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderReferralSource() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">How Did You Hear About Us?</h3>

        <div className="space-y-2">
          <Label>How did you hear about SLT Work Hub? *</Label>
          <RadioGroup value={formData.referral_source} onValueChange={(v) => updateField('referral_source', v)}>
            {[
              'Friend or colleague referral',
              'Social media (LinkedIn, Facebook, Twitter, Instagram)',
              'Google search',
              'Product Hunt / App listing',
              'Email marketing',
              'Blog or article',
              'YouTube / Video',
              'Advertisement',
              'Event or conference',
              'Other'
            ].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`referral-${option}`} />
                <Label htmlFor={`referral-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.referral_source === 'Friend or colleague referral' && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription>
              <div className="space-y-2">
                <Label>Please mention your friend's name</Label>
                <Input
                  placeholder="Enter your friend's full name"
                  value={formData.referred_by_name || ''}
                  onChange={(e) => updateField('referred_by_name', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  💡 This helps us thank them and may give you both special rewards!
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECTION 12: FOLLOW-UP & CONTACT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function renderFollowUp() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">Contact Information</h3>
        <p className="text-sm text-muted-foreground">
          We need your contact info to send you the scratch card reward! 🎁
        </p>

        <div className="space-y-2">
          <Label>Your Name *</Label>
          <Input
            placeholder="Full Name"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            required
            readOnly={!!userName}
            className={userName ? 'bg-muted' : ''}
          />
          {userName && <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>}
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label>Your Email *</Label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            required
            readOnly={!!userEmail}
            className={userEmail ? 'bg-muted' : ''}
          />
          {userEmail && <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>}
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label>Your Phone (Optional)</Label>
          <Input
            type="tel"
            placeholder="+91 9876543210"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            We may contact you on WhatsApp for scratch card verification
          </p>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="interview"
              checked={formData.allow_interview}
              onCheckedChange={(checked) => updateField('allow_interview', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="interview" className="cursor-pointer">
                I'm willing to participate in a 15-minute follow-up interview
              </Label>
              <p className="text-xs text-muted-foreground">
                Help us improve SLT Work Hub and get early access to new features!
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="notify"
              checked={formData.notify_features}
              onCheckedChange={(checked) => updateField('notify_features', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="notify" className="cursor-pointer">
                Notify me about new features and updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Stay updated with the latest improvements and releases
              </p>
            </div>
          </div>
        </div>

        <Alert className="bg-green-50 border-green-200">
          <AlertDescription>
            <p className="font-semibold text-green-800 mb-2">🎁 Almost there!</p>
            <p className="text-sm text-green-700">
              After submitting, you'll instantly receive a scratch card worth ₹10-₹500! 
              Share with friends to claim your reward.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
