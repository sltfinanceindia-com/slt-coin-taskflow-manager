import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { MessageCircle, CheckCircle, Smile, Meh, Frown, ChevronRight } from 'lucide-react';

interface SurveyQuestion {
  id: string;
  text: string;
  type: 'scale' | 'emoji' | 'text';
}

interface PulseSurvey {
  id: string;
  title: string;
  description: string | null;
  questions: SurveyQuestion[];
}

const SCALE_OPTIONS = [
  { value: '1', label: 'Strongly Disagree' },
  { value: '2', label: 'Disagree' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Agree' },
  { value: '5', label: 'Strongly Agree' },
];

const EMOJI_OPTIONS = [
  { value: '1', icon: Frown, label: 'Unhappy', color: 'text-red-500' },
  { value: '2', icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: '3', icon: Smile, label: 'Happy', color: 'text-green-500' },
];

export function PulseSurveyWidget() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Fetch active survey
  const { data: survey, isLoading } = useQuery({
    queryKey: ['active-pulse-survey'],
    queryFn: async () => {
      const { data: surveys, error } = await supabase
        .from('pulse_surveys')
        .select('id, title, description, questions')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!surveys || surveys.length === 0) return null;

      // Check if user already responded
      const { data: existingResponse } = await supabase
        .from('pulse_responses')
        .select('id')
        .eq('survey_id', surveys[0].id)
        .eq('user_id', profile?.id)
        .single();

      if (existingResponse) return null;

      return {
        ...surveys[0],
        questions: (surveys[0].questions as unknown as SurveyQuestion[]) || [],
      } as PulseSurvey;
    },
    enabled: !!profile?.id,
  });

  // Submit response mutation
  const submitResponse = useMutation({
    mutationFn: async () => {
      // Calculate sentiment score (average of numeric responses)
      const numericResponses = Object.values(responses).map(Number).filter(n => !isNaN(n));
      const sentimentScore = numericResponses.length > 0
        ? numericResponses.reduce((a, b) => a + b, 0) / numericResponses.length / 5
        : null;

      const { error } = await supabase.from('pulse_responses').insert({
        survey_id: survey?.id,
        user_id: profile?.id,
        responses,
        sentiment_score: sentimentScore,
        organization_id: profile?.organization_id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-pulse-survey'] });
      toast.success('Thank you for your feedback!');
    },
    onError: () => {
      toast.error('Failed to submit response');
    },
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!survey || !survey.questions || survey.questions.length === 0) {
    return null;
  }

  const questions = survey.questions;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      submitResponse.mutate();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const renderQuestionInput = () => {
    if (!question) return null;

    if (question.type === 'emoji') {
      return (
        <div className="flex justify-center gap-6 py-4">
          {EMOJI_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setResponses(prev => ({ ...prev, [question.id]: option.value }))}
                className={`p-4 rounded-full transition-all ${
                  responses[question.id] === option.value
                    ? 'bg-primary/20 scale-110'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className={`h-10 w-10 ${option.color}`} />
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <RadioGroup
        value={responses[question.id] || ''}
        onValueChange={(value) => setResponses(prev => ({ ...prev, [question.id]: value }))}
        className="space-y-2"
      >
        {SCALE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-3">
            <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
            <Label 
              htmlFor={`${question.id}-${option.value}`}
              className="flex-1 cursor-pointer py-2"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Quick Pulse Check</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{question?.text}</p>
        
        {renderQuestionInput()}

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!responses[question?.id] || submitResponse.isPending}
            className="gap-2"
          >
            {submitResponse.isPending ? (
              'Submitting...'
            ) : isLastQuestion ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Submit
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
