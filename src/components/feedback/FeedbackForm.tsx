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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOTAL_SECTIONS = 12;

export default function FeedbackForm() {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<Partial<FeedbackFormData>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scratchCard, setScratchCard] = useState<ScratchCard | null>(null);
  const [startTime] = useState(Date.now());
  const navigate = useNavigate();

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('slt_feedback_draft');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('slt_feedback_draft', JSON.stringify(formData));
    }
  }, [formData]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextSection = () => {
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
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.email || !formData.name) {
        toast.error('Please provide your name and email');
        return;
      }

      const completionTime = Math.floor((Date.now() - startTime) / 1000);

      // Submit feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_responses')
        .insert({
          user_email: formData.email,
          user_name: formData.name,
          user_phone: formData.phone,
          response_data: formData,
          completion_time_seconds: completionTime,
          referral_source: formData.referral_source,
          referred_by_name: formData.referred_by_name,
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

      toast.success('Feedback submitted! 🎉');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Failed to submit feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted && scratchCard) {
    return <ScratchCardComponent card={scratchCard} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressBar current={currentSection} total={TOTAL_SECTIONS} />

        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              SLT Work Hub Feedback
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Section {currentSection} of {TOTAL_SECTIONS}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Estimated time: ~15 minutes
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderSection()}

            <div className="flex justify-between pt-6 border-t">
              {currentSection > 1 && (
                <Button variant="outline" onClick={prevSection}>
                  ← Back
                </Button>
              )}
              
              {currentSection < TOTAL_SECTIONS ? (
                <Button onClick={nextSection} className="ml-auto">
                  Next →
                </Button>
              ) : (
                <Button 
                  onClick={submitFeedback} 
                  disabled={loading}
                  className="ml-auto bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Submitting...' : 'Submit Feedback 🎁'}
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
      case 1:
        return renderUserProfile();
      case 2:
        return renderOverallExperience();
      case 3:
        return renderOnboarding();
      case 4:
        return renderFeatureRatings();
      case 5:
        return renderUsability();
      case 6:
        return renderPainPoints();
      case 7:
        return renderFeatureRequests();
      case 8:
        return renderComparison();
      case 9:
        return renderPricing();
      case 10:
        return renderFinalThoughts();
      case 11:
        return renderReferralSource();
      case 12:
        return renderFollowUp();
      default:
        return null;
    }
  }

  function renderUserProfile() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">About You</h3>

        <div className="space-y-2">
          <Label>What is your role? *</Label>
          <RadioGroup 
            value={formData.role} 
            onValueChange={(v) => updateField('role', v)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="super_admin" id="super_admin" />
              <Label htmlFor="super_admin">Super Admin / Platform Owner</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="org_admin" id="org_admin" />
              <Label htmlFor="org_admin">Organization Admin</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manager" id="manager" />
              <Label htmlFor="manager">Manager / Team Lead</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="employee" id="employee" />
              <Label htmlFor="employee">Employee / Team Member</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intern" id="intern" />
              <Label htmlFor="intern">Intern</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Company Size *</Label>
          <RadioGroup 
            value={formData.companySize} 
            onValueChange={(v) => updateField('companySize', v)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1-10" id="1-10" />
              <Label htmlFor="1-10">1-10 employees</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="11-50" id="11-50" />
              <Label htmlFor="11-50">11-50 employees</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="51-200" id="51-200" />
              <Label htmlFor="51-200">51-200 employees</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="201-500" id="201-500" />
              <Label htmlFor="201-500">201-500 employees</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="500+" id="500+" />
              <Label htmlFor="500+">500+ employees</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Add more fields for industry, usage duration, etc. */}
      </div>
    );
  }

  function renderOverallExperience() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Overall Experience</h3>

        <div className="space-y-2">
          <Label>Overall satisfaction *</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => updateField('overall_satisfaction', rating)}
                className={`text-3xl ${
                  formData.overall_satisfaction && formData.overall_satisfaction >= rating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>How likely are you to recommend SLT Work Hub? (0-10) *</Label>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
              <button
                key={score}
                onClick={() => updateField('nps_score', score)}
                className={`w-10 h-10 rounded border ${
                  formData.nps_score === score
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Add more fields */}
      </div>
    );
  }

  // Implement remaining sections...
  function renderOnboarding() { return <div>Onboarding section</div>; }
  function renderFeatureRatings() { return <div>Feature ratings section</div>; }
  function renderUsability() { return <div>Usability section</div>; }
  function renderPainPoints() { return <div>Pain points section</div>; }
  function renderFeatureRequests() { return <div>Feature requests section</div>; }
  function renderComparison() { return <div>Comparison section</div>; }
  function renderPricing() { return <div>Pricing section</div>; }
  function renderFinalThoughts() { return <div>Final thoughts section</div>; }
  
  function renderReferralSource() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">How Did You Hear About Us?</h3>

        <div className="space-y-2">
          <Label>How did you hear about SLT Work Hub? *</Label>
          <RadioGroup 
            value={formData.referral_source} 
            onValueChange={(v) => updateField('referral_source', v)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="friend" id="friend" />
              <Label htmlFor="friend">Friend or colleague referral</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="social" id="social" />
              <Label htmlFor="social">Social media</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="google" id="google" />
              <Label htmlFor="google">Google search</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.referral_source === 'friend' && (
          <div className="space-y-2">
            <Label>Please mention your friend's name</Label>
            <Input
              placeholder="Enter your friend's full name"
              value={formData.referred_by_name || ''}
              onChange={(e) => updateField('referred_by_name', e.target.value)}
            />
          </div>
        )}
      </div>
    );
  }

  function renderFollowUp() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Contact Information</h3>

        <div className="space-y-2">
          <Label>Your Name *</Label>
          <Input
            placeholder="Full Name"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Your Email *</Label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Your Phone (Optional)</Label>
          <Input
            type="tel"
            placeholder="+91 9876543210"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="interview"
            checked={formData.allow_interview}
            onCheckedChange={(checked) => updateField('allow_interview', checked)}
          />
          <Label htmlFor="interview">
            I'm willing to participate in a 15-minute follow-up interview
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="notify"
            checked={formData.notify_features}
            onCheckedChange={(checked) => updateField('notify_features', checked)}
          />
          <Label htmlFor="notify">
            Notify me about new features and updates
          </Label>
        </div>
      </div>
    );
  }
}
