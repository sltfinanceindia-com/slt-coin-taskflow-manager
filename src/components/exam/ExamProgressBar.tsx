import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ExamProgressBarProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
}

export function ExamProgressBar({ 
  currentQuestionIndex, 
  totalQuestions, 
  answeredQuestions 
}: ExamProgressBarProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1 md:flex-row md:justify-between md:items-center">
        <p className="text-muted-foreground text-sm">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
        <div className="flex justify-between text-sm text-muted-foreground md:space-x-4">
          <span>Progress: {Math.round(progress)}%</span>
          <span>Answered: {answeredQuestions}/{totalQuestions}</span>
        </div>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}