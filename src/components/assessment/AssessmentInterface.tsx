
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessments, AssessmentQuestion, AssessmentAttempt } from '@/hooks/useAssessments';
import { AssessmentInstructions } from './AssessmentInstructions';
import { AssessmentTaking } from './AssessmentTaking';
import { AssessmentResults } from './AssessmentResults';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AssessmentInterfaceProps {
  assessmentId: string;
}

export function AssessmentInterface({ assessmentId }: AssessmentInterfaceProps) {
  const navigate = useNavigate();
  const { assessments, getAssessmentQuestions, startAssessment, submitAnswer, submitAssessment, isStarting, isSubmitting } = useAssessments();
  const [phase, setPhase] = useState<'instructions' | 'taking' | 'results'>('instructions');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<AssessmentAttempt | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [loading, setLoading] = useState(true);

  const assessment = assessments.find(a => a.id === assessmentId);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!assessment) return;
      
      try {
        const questionsData = await getAssessmentQuestions(assessmentId);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [assessmentId, assessment, getAssessmentQuestions]);

  const handleStartAssessment = async () => {
    try {
      const attempt = await startAssessment(assessmentId);
      setCurrentAttempt(attempt);
      setPhase('taking');
    } catch (error) {
      console.error('Error starting assessment:', error);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (currentAttempt) {
      submitAnswer({ attemptId: currentAttempt.id, questionId, selectedAnswer: answer });
    }
  };

  const handleSubmitAssessment = async () => {
    if (!currentAttempt) return;
    
    try {
      const result = await submitAssessment(currentAttempt.id);
      setCurrentAttempt(result);
      setPhase('results');
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  const handleReturnToTraining = () => {
    navigate('/training');
  };

  if (loading || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'instructions') {
    return (
      <AssessmentInstructions
        assessment={assessment}
        onStart={handleStartAssessment}
        isStarting={isStarting}
      />
    );
  }

  if (phase === 'taking' && currentAttempt) {
    return (
      <AssessmentTaking
        assessment={assessment}
        questions={questions}
        attempt={currentAttempt}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={handleSubmitAssessment}
        isSubmitting={isSubmitting}
        selectedAnswers={selectedAnswers}
      />
    );
  }

  if (phase === 'results' && currentAttempt) {
    return (
      <AssessmentResults
        assessment={assessment}
        attempt={currentAttempt}
        onReturnToTraining={handleReturnToTraining}
      />
    );
  }

  return null;
}
