
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { UIUXExam, UIUXExamAttempt } from '@/hooks/useUIUXExams';

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

  const handleAnswerChange = (optionIndex: number) => {
    onAnswerSelect(currentQuestionIndex, optionIndex);
  };

  const handleCompleteExam = () => {
    onSubmitExam({
      attemptId: attempt.id,
      answers
    });
    setShowConfirmSubmit(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] overflow-y-auto" aria-describedby="exam-taking-description">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{exam.title}</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className={`font-mono text-lg ${timeLeft && timeLeft < 300 ? 'text-red-500' : ''}`}>
                  {timeLeft ? formatTime(timeLeft) : '00:00'}
                </span>
              </div>
              <Button 
                onClick={() => setShowConfirmSubmit(true)}
                variant="outline"
                disabled={isSubmitting}
              >
                Submit Exam
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6" id="exam-taking-description">
          <div>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Answered: {answeredQuestions}/{exam.questions.length}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Question Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {exam.questions.map((_, index) => (
                      <Button
                        key={index}
                        variant={index === currentQuestionIndex ? "default" : answers[index] !== undefined ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => goToQuestion(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {currentQuestion.question_number}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg leading-relaxed">{currentQuestion.question_text}</p>
                  
                  <RadioGroup
                    value={answers[currentQuestionIndex]?.toString() || ''}
                    onValueChange={(value) => handleAnswerChange(parseInt(value))}
                    className="space-y-4"
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option.option_text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={nextQuestion}
                      disabled={currentQuestionIndex === exam.questions.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Confirm Submit Dialog */}
          {showConfirmSubmit && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Submit Exam?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    You have answered {answeredQuestions} out of {exam.questions.length} questions.
                    {answeredQuestions < exam.questions.length && (
                      <span className="text-yellow-600 block mt-2">
                        Warning: You have {exam.questions.length - answeredQuestions} unanswered questions.
                      </span>
                    )}
                  </p>
                  <p>Are you sure you want to submit your exam? This action cannot be undone.</p>
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmSubmit(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCompleteExam}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
