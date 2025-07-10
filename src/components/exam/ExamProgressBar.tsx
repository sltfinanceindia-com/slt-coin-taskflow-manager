
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, Circle } from 'lucide-react';

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
  const completionProgress = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="bg-card border rounded-lg p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Circle className="h-5 w-5 text-primary fill-primary" />
            <span className="text-lg font-semibold">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-medium">
              Answered: <span className="text-green-600">{answeredQuestions}</span>/{totalQuestions}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              Progress: {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full h-2" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Completion Progress</span>
          <span>{Math.round(completionProgress)}%</span>
        </div>
        <Progress value={completionProgress} className="w-full h-2" />
      </div>
    </div>
  );
}
