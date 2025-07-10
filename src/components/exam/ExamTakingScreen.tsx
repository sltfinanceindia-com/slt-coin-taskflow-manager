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

  // Debug log to see answers state
  useEffect(() => {
    console.log('Current answers state in ExamTakingScreen:', answers);
    console.log('Answered questions count:', answeredQuestions);
  }, [answers, answeredQuestions]);

  const handleAnswerChange = (optionIndex: number) => {
    console.log(`Answer selected for question ${currentQuestionIndex}: option ${optionIndex}`);
    onAnswerSelect(currentQuestionIndex, optionIndex);
  };

  const handleCompleteExam = () => {
    console.log('Submitting exam with answers:', answers);
    console.log('Total answers to submit:', Object.keys(answers).length);
    onSubmitExam({
      attemptId: attempt.id,
      answers
    });
    setShowConfirmSubmit(false);
  };

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full h-full max-h-full m-0 p-0 rounded-none md:max-w-[90vw] md:max-h-[90vh] md:m-6 md:rounded-lg" aria-describedby="exam-taking-description">
        <ExamHeader 
          examTitle={exam.title}
          timeLeft={timeLeft}
          formatTime={formatTime}
          onSubmitClick={() => setShowConfirmSubmit(true)}
          isSubmitting={isSubmitting}
        />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4" id="exam-taking-description">
          <ExamProgressBar 
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={exam.questions.length}
            answeredQuestions={answeredQuestions}
          />

          <div className="flex flex-col space-y-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:space-y-0">
            <div className="order-2 lg:order-1 lg:col-span-1">
              <QuestionNavigation 
                totalQuestions={exam.questions.length}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                onQuestionSelect={setCurrentQuestionIndex}
              />
            </div>

            <div className="order-1 lg:order-2 lg:col-span-3">
              <QuestionContent 
                question={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                selectedAnswer={answers[currentQuestionIndex]}
                onAnswerChange={handleAnswerChange}
              />
              
              <div className="mt-4">
                <NavigationButtons 
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={exam.questions.length}
                  onPrevious={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                    }
                  }}
                  onNext={() => {
                    if (currentQuestionIndex < exam.questions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    }
                  }}
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
