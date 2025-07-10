
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SkipForward, SkipBack } from 'lucide-react';

interface NavigationButtonsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function NavigationButtons({ 
  currentQuestionIndex, 
  totalQuestions, 
  onPrevious, 
  onNext 
}: NavigationButtonsProps) {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className="flex-1 sm:flex-none h-12 px-6"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      
      <div className="flex-1 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <SkipBack className="h-4 w-4" />
        <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        <SkipForward className="h-4 w-4" />
      </div>
      
      <Button
        onClick={onNext}
        disabled={isLastQuestion}
        className="flex-1 sm:flex-none h-12 px-6"
        variant={isLastQuestion ? "outline" : "default"}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
