
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UIUXExam, UIUXExamAttempt } from '@/hooks/useUIUXExams';
import { ExamHeader } from './ExamHeader';
import { ExamProgressBar } from './ExamProgressBar';
import { QuestionNavigation } from './QuestionNavigation';
import { QuestionContent } from './QuestionContent';
import { NavigationButtons } from './NavigationButtons';
import { SubmitConfirmDialog } from './SubmitConfirmDialog';

interface ExamTakingScreenProps {
  exam: UIUXExam;
  attempt: UIUXExamAttempt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitExam: (data: { attemptId: string; answers: { [key: number]: number } }) => void;
  isSubmitting: boolean;
  answers: { [key: number]: number };
  onAnswerSelect: (questionIndex: number, optionIndex: number) => void;
  timeLeft: number | null;
  formatTime: (seconds: number) => string;
}

export function ExamTakingScreen({ 
  exam, 
  attempt, 
  open,
  onOpenChange,
  onSubmitExam, 
  isSubmitting,
  answers,
  onAnswerSelect,
  timeLeft,
  formatTime
}: ExamTakingScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  // Debug logging for answer tracking
  useEffect(() => {
    console.log('=== EXAM TAKING SCREEN STATE ===');
    console.log('Current question index:', currentQuestionIndex + 1);
    console.log('Current answers state:', answers);
    console.log('Answered questions count:', answeredQuestions);
    console.log('Total questions:', exam.questions.length);
    console.log('Progress:', Math.round(progress) + '%');
    console.log('================================');
  }, [answers, answeredQuestions, currentQuestionIndex, exam.questions.length, progress]);

  const handleAnswerChange = (optionIndex: number) => {
    console.log(`=== ANSWER SELECTION ===`);
    console.log(`Question: ${currentQuestionIndex + 1}`);
    console.log(`Selected option: ${String.fromCharCode(65 + optionIndex)} (index: ${optionIndex})`);
    console.log(`========================`);
    
    onAnswerSelect(currentQuestionIndex, optionIndex);
  };

  const handleCompleteExam = () => {
    console.log('=== EXAM SUBMISSION ===');
    console.log('Final answers to submit:', answers);
    console.log('Total answers being submitted:', Object.keys(answers).length);
    console.log('Attempt ID:', attempt.id);
    
    // Validate answers before submission
    const validAnswers = Object.keys(answers).reduce((acc, key) => {
      const questionIndex = parseInt(key);
      const answerIndex = answers[questionIndex];
      if (answerIndex >= 0 && questionIndex >= 0) {
        acc[questionIndex] = answerIndex;
      }
      return acc;
    }, {} as { [key: number]: number });
    
    console.log('Validated answers for submission:', validAnswers);
    console.log('======================');

    onSubmitExam({
      attemptId: attempt.id,
      answers: validAnswers
    });
    setShowConfirmSubmit(false);
  };

  const handleNavigateToQuestion = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (!currentQuestion) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-md">
          <div className="text-center p-4">Loading question...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full h-full max-h-full m-0 p-0 rounded-none md:max-w-[95vw] md:max-h-[95vh] md:m-4 md:rounded-lg" aria-describedby="exam-taking-description">
        <ExamHeader 
          examTitle={exam.title}
          timeLeft={timeLeft}
          formatTime={formatTime}
          onSubmitClick={() => setShowConfirmSubmit(true)}
          isSubmitting={isSubmitting}
        />
        
        <div className="flex-1 overflow-y-auto" id="exam-taking-description">
          <div className="p-4 md:p-6 space-y-6">
            <ExamProgressBar 
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={exam.questions.length}
              answeredQuestions={answeredQuestions}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Navigation - Left sidebar on desktop, top on mobile */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <QuestionNavigation 
                  totalQuestions={exam.questions.length}
                  currentQuestionIndex={currentQuestionIndex}
                  answers={answers}
                  onQuestionSelect={handleNavigateToQuestion}
                />
              </div>

              {/* Question Content - Main area */}
              <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
                <QuestionContent 
                  question={currentQuestion}
                  currentQuestionIndex={currentQuestionIndex}
                  selectedAnswer={answers[currentQuestionIndex]}
                  onAnswerChange={handleAnswerChange}
                />
                
                <NavigationButtons 
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={exam.questions.length}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <SubmitConfirmDialog 
        isOpen={showConfirmSubmit}
        answeredQuestions={answeredQuestions}
        totalQuestions={exam.questions.length}
        isSubmitting={isSubmitting}
        onCancel={() => setShowConfirmSubmit(false)}
        onConfirm={handleCompleteExam}
      />
    </Dialog>
  );
}
